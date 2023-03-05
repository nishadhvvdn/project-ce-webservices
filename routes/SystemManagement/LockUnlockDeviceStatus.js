var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsLockUnlock.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/lockUnlockDeviceSchema')


router.post('/', function (req, res) {
    try {
        var MeterID = req.body.MeterID;
        var Status = req.body.Status;
        var MessageID = req.body.MessageID;
        var Action = req.body.Action;
        var Attribute = req.body.Attribute;
        var CellID = req.body.CellID;
        let lockUnlockDeviceSchema = schema.lockUnlockDevice;
        let data = { MeterID, Status, MessageID, Action, Attribute, CellID }
        schemaValidation.validateSchema(data, lockUnlockDeviceSchema, function (err, result) {
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
                if (Action == "LOCK") {
                    Action = "LOCK";
                    if (Attribute == "METER_LOCK") {
                        DeviceType = 'meter';
                    } else {
                        DeviceType = 'hs';
                    }
                    if (Status == 'Success') {
                        flag = 1;
                    } else {
                        flag = 0
                    }
                } else if (Action == "UNLOCK") {
                    if (Attribute == 'METER_UNLOCK') {
                        DeviceType = 'meter';
                    } else {
                        DeviceType = 'hs';
                    }
                    if (Status == 'Success') {
                        flag = 0;
                    } else {
                        flag = 1
                    }
                }
                if (DeviceType === 'meter') {
                    dbCmd.saveDeviceLockStatus(MeterID, Status,flag,Action, DeviceType, MessageID, function (err, result) {
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
                    dbCmd.saveDeviceLockStatus(CellID, Status,flag,Action, DeviceType, MessageID, function (err, result) {
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