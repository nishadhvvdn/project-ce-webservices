var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsReboot.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/remoteReboot')

router.post('/', function (req, res) {
    try {
        var MeterID = req.body.MeterID;
        var Status = req.body.Status;
        var MessageID = req.body.MessageID;
        var Action = req.body.Action;
        var Attribute = req.body.Attribute;
        var CellID = req.body.CellID;
        var DeviceType = req.body.DeviceType;
        let data = { MeterID, Status, MessageID, Action, Attribute, CellID, DeviceType }
        let remoteRebootDeviceSchema = schema.remoteRebootDevice;
        schemaValidation.validateSchema(data, remoteRebootDeviceSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                MeterID = parseInt(MeterID);
                MessageID = parseInt(MessageID);
                CellID = parseInt(CellID);
                if (DeviceType == null) {
                    if (Attribute == "METER_REBOOT") {
                        DeviceType = 'meter';
                    } else if (Attribute == "DL_REBOOT") {
                        DeviceType = 'DeltaLink';
                    } else {
                        DeviceType = "hs";
                    }
                }
                if (Status == "Success") {
                    Status = 3;
                } else if (Status == "Failure") {
                    Status = 2;
                }else{
                    Status = 1;
                }
                if (DeviceType === 'meter') {
                    dbCmd.saveDeviceRebootStatus(MeterID, Status, DeviceType, MessageID, function (err, result) {
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
                } else if (DeviceType == 'DeltaLink') {
                    dbCmd.saveDeviceRebootStatus(MeterID, Status, DeviceType, MessageID, function (err, result) {
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
                } else {
                    dbCmd.saveDeviceRebootStatus(CellID, Status, DeviceType, MessageID, function (err, result) {
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
            }
        })

    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});

module.exports = router;