var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsOnDemand.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MeterBulkOperationSchema')

router.post('/', function (req, res) {
    try {
        var Action = req.body.Action;
        var Attribute = req.body.Attribute;
        var cellID = req.body.CellID;
        var MeterID = req.body.MeterID;
        var MessageID = req.body.Data[0].STATUSCODE;
        let meterID = parseInt(MeterID);
        const data = { Action, Attribute, cellID, MeterID }
        const respConnDisconData = schema.responseConnectDisconnectDetails;
        schemaValidation.validateSchema(data, respConnDisconData, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            }else{
                if ((cellID === null) || (meterID === null) || (meterID === 0) || (MessageID === null) || (Action === null) || (Attribute === null)) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!"
                    });
                }
                else {
                    dbCmd.MeterConnDisconnResponse(meterID, MessageID,Attribute, function (err, MeterConnDisconnResponse) {
                        if (err) {
                            res.json({
                                "Type": false,
                                //"Message": "Failure"
                            });
                        } else {
                            res.json({
                                "Type": true,
                                //"Message": "Success"
                            });
                        }
                    });
                }
            }
        })
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }

});

module.exports = router;