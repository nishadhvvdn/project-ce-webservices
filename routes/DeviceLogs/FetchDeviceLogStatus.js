var express = require('express');
var router = express.Router();
const dbCmd = require('../../data/dbCommandsDeviceLogs.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deviceLogSchema')
var _ = require('lodash');


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
            var MeterID = parseInt(req.body.MeterID);
            var Status = req.body.Status;
            var MessageID = parseInt(req.body.MessageID);
            var Action = req.body.Action;
            var Attribute = req.body.Attribute;
            var CellID = parseInt(req.body.CellID);
            var data = { MeterID, Status, MessageID, Action, Attribute, CellID }
            const fetchLogsStatusSchema = schema.fetchLogsStatusSchema;
            schemaValidation.validateSchema(data, fetchLogsStatusSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                }
                else {
                    if (data.Status === "Success") {
                        data.Status1 = "Device Log Fetch Successful";
                    }else if (data.Status === "In Progress") {
                        data.Status1 = "File Uploading is in progress";
                    } else {
                        data.Status1 = "Device Log Fetch Unsuccessful";
                    }
                    dbCmd.saveDeviceFetchLogStatus(data, function (err, result) {
                        if (err) {
                            res.json({
                                "Type": false,
                                "Message": err.message,
                            });
                        } else {
                            res.json({
                                "Type": true,
                                "Output": result,
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