var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSystemManagement.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');

router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            // payload is empty 
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            //Parameters Passed from UI - "PartSerialNo"
            var PartSerialNo = req.body.PartSerialNo;
            var Type = req.body.Type;
            const page = parseInt(req.query.Page);
            const limit = parseInt(req.query.Limit);

            let searchByHypersproutSerialNumberOrName = req.query.searchByHypersproutSerialNumberOrName;
            let searchByHypersproutID = req.query.searchByHypersproutID;
            let filter = req.query.filter;
            let search1 = req.query.search1;

            let search = { searchByHypersproutSerialNumberOrName, searchByHypersproutID, search1 }
            let data = { PartSerialNo, Type, page, limit };

            let SMHyperSproutSchema = schema.SMHyperSprout;
            schemaValidation.validateSchema(data, SMHyperSproutSchema, function (err, result) {
                if (err) {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Device Management", function (err, resp) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": err
                        });
                    });
                }
                else {
                    data.search = search;
                    data.filter = filter;
                    dbCmd.getSystemHyperSproutDetails(PartSerialNo, Type, data, function (err, details) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err,
                            });
                        } else {
                            dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Device Management", function (err, resp) {
                                res.json({
                                    "type": true,
                                    "details": details,
                                });
                            });
                        }
                    });
                }
            })
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;