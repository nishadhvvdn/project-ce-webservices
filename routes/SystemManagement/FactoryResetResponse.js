var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsFactoryReset.js');
var sendtoiot = require('../../data/sendToiot.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/DeviceFactoryResetSchema')
var sendtoiot = require('../../data/sendToiot.js');

router.post('/', function (req, res) {
    try {
        var MeterID = req.body.MeterID;
        var Status = req.body.Status;
        var MessageID = req.body.MessageID;
        var Action = req.body.Action;
        var Attribute = req.body.Attribute;
        var CellID = req.body.CellID;
        var data = { MeterID, Status, MessageID, Action, Attribute, CellID}
        const FactoryResetResponseSchema = schema.FactoryResetResponseSchema;
        
        schemaValidation.validateSchema(data, FactoryResetResponseSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }else{
                if (data.Status === "Success") {
                    data.ResetStatus = "Successfully Completed Factory Reset";
                    data.Status = "Success";
                    data.EndTime = new Date();
                } else {
                    data.ResetStatus = "Failed To Complete Factory Reset";
                    data.Status = "Failed";
                    data.EndTime = new Date();
                }
    
                dbCmd.saveFactoryResetResponse(data, function (err, result) {
                    if (err) {
                        res.json({
                            "Type": false,
                            "Message": err.message != undefined ? err.message : err,
                        });
                    } else {
                        res.json({
                            "Type": true,
                            "Output": result,
                        });
                    }
                });
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