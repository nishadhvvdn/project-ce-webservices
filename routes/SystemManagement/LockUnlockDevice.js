var express = require('express');
var router = express.Router();
var dbCmdLock = require('../../data/dbCommandsLockUnlock.js');
var dbCmd = require('../../data/dbLockUnlock.js');
var sendtoiot = require('../../data/sendToiot.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/lockUnlockDeviceSchema')
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
            var deviceId = req.body.deviceId;
            var serialNumber = req.body.serialNumber;
            var DeviceType = req.body.DeviceType;
            var Action = req.body.Action;
            var rev = 0;
            let lockUnlockDeviceStatusSchema = schema.lockUnlockDeviceStatus;
            let data = { deviceId, DeviceType, Action, serialNumber }
            schemaValidation.validateSchema(data, lockUnlockDeviceStatusSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors":err
                    });
                } else {
                    if (Action == "Lock") {
                        Action = "LOCK";
                        if (DeviceType == 'hs') {
                            Attribute = "HS_LOCK";
                        } else if (DeviceType == 'hh') {
                            Attribute = "HH_LOCK";
                        } else {
                            Attribute = "METER_LOCK";
                        }
                    } else if (Action == "Unlock") {
                        Action = "UNLOCK";
                        if (DeviceType == 'hs') {
                            Attribute = "HS_UNLOCK";
                        } else if (DeviceType == 'hh') {
                            Attribute = "HH_UNLOCK";
                        } else {
                            Attribute = "METER_UNLOCK";
                        }
                    }
                    deviceId = parseInt(deviceId)
                    dbCmdLock.createLockUnlockJobs(deviceId, DeviceType, Action, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            result = result[0];
                            if (DeviceType != "meter")
                                result.MeterID = 0;
                            if (!result.MessageID) {
                                result.MessageID = 0;
                            } else if (result.MessageID === 255) {
                                result.MessageID = 0;
                            } else {
                                result.MessageID++;
                            }
                                sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": err
                                        });
                                    } else {
                                        if (status == 'Connected') {
                                            dbCmd.onLockUnlock(Action, Attribute, rev, result.MessageID, result.CountryCode, result.RegionCode, result.CELLID,
                                                result.MeterID, result.DeviceID, result.SerialNumber, result.JobID, function (err, resp) {
                                                    if (err) {
                                                        res.json({
                                                            "type": false,
                                                            "Message": err
                                                        });
                                                    } else {
                                                        res.json({
                                                            "type": true,
                                                            "Message": resp
                                                        });
                                                    }
                                                });
                                        } else {
                                            res.json({
                                                "type": false,
                                                "Message": "Device Not Connected"
                                            });
                                        }
                                    }
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