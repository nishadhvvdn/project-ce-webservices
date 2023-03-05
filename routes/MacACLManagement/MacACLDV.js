
var express = require('express');
var router = express.Router();
var fs = require('fs');
var azure = require('azure-storage');
var dbCmdMacAcl = require('../../data/dbCommandsMacAcl.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MacACLMgmtSchema')

router.post('/', function (req, res) {
    try {
        var Rev = req.body.Rev;
        var Count = req.body.Count;
        var MessageID = req.body.MessageID;
        var Action = req.body.Action;
        var Attribute = req.body.Attribute;
        var CountryCode = req.body.CountryCode;
        var RegionCode = req.body.RegionCode;
        var CellID = req.body.CellID;
        var account = process.env.Account;
        var key = process.env.BlobKey;
        var container = process.env.MacAclContainer;
        const MacACLDVMgmtSchema = schema.MacACLDVDetails;
        const data = { Rev, Count, MessageID, Action, Attribute, CountryCode, RegionCode, CellID }
        schemaValidation.validateSchema(data, MacACLDVMgmtSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                if ((Rev == null) || (Count == null) || (MessageID == null) || (Action == null) || (Attribute == null) || (CountryCode == null) ||
                    (RegionCode == null) || (CellID == null)) {
                    res.json({
                        "Type": false,
                        "Status": "Invalid Parameter"
                    });
                }
                else {
                    dbCmdMacAcl.selectMeshDetails(CellID, function (err, output, circuitID) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message != undefined ? err.message : err
                            });
                        } else {
                            dbCmdMacAcl.selectAllEndpointDetails(circuitID, function (err, output1, selfHeal) {

                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": err.message != undefined ? err.message : err
                                    });
                                } else {
                                    if (Object.keys(selfHeal).length > 0)
                                        output = Object.assign(output, selfHeal);
                                    if (Object.keys(output).length > 0) {
                                        var file = fs.createWriteStream(CellID + 'DV.txt');
                                        file.on('error', function (err) { /* error handling */ });
                                        for (const [key, value] of Object.entries(output)) {
                                            file.write(key + '\t' + value + '\n')
                                        };
                                        file.end();
                                        file.on('finish', function () {
                                            var blobService = azure.createBlobService(account, key);
                                            blobService.createBlockBlobFromLocalFile(container, CellID + '/dataVine_mac_acl.accept.txt', CellID + 'DV.txt', function (error, result, response) {
                                                if (!error) {
                                                    fs.stat(CellID + 'DV.txt', function (err, stats) {
                                                        if (err) {
                                                            return console.error(err);
                                                        }
                                                        fs.unlink(CellID + 'DV.txt', function (err) {
                                                            if (err) return console.log(err);
                                                            console.log('file deleted successfully');
                                                        });
                                                    });
                                                    var url = 'https://' + account + '.blob.core.windows.net/' + container + '/' + CellID + '/' + 'dataVine_mac_acl.accept.txt';
                                                    var packetData = {
                                                        "rev": Rev,
                                                        "messageid": MessageID,
                                                        "countrycode": CountryCode,
                                                        "regioncode": RegionCode,
                                                        "cellid": CellID,
                                                        "count": Count,
                                                        "action": Action,
                                                        "attribute": Attribute,
                                                        "meterid": 0,
                                                        "MAC_ACL_DV_URL": url,
                                                        "Purpose": "MacACLDVUrl"
                                                    };
                                                    dbCmdMacAcl.intimateHS(packetData, function (err, details) {
                                                        if (err) {
                                                            res.json({
                                                                "Type": false,
                                                                "Message": err.message != undefined ? err.message : err,
                                                            });
                                                        } else {
                                                            res.json({
                                                                "Type": true,
                                                                "Message": "Success"
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    res.json({
                                                        "Type": false,
                                                        "Message": error.message != undefined ? error.message : error,
                                                    });
                                                }
                                            });
                                        });
                                    } else {
                                        res.json({
                                            "type": false,
                                            "Message": "Transformer/HS is not added to this DTC"
                                        });
                                    }
                                }
                            });
                        }
                    });

                }
            }
        });

    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;