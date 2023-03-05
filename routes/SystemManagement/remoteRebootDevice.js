var express = require('express');
var router = express.Router();
var dbCmdReboot = require('../../data/dbCommandsReboot.js');
var dbCmd = require('../../data/dbReboot.js');
var sendtoiot = require('../../data/sendToiot.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/remoteReboot')

router.post('/', function (req, res) {
    try {
        var deviceId = req.body.deviceId;
        var serialNumber = req.body.serialNumber;
        var DeviceType = req.body.DeviceType;
        var Action = "REBOOT";
        var rev = 0;
        let remoteRebootDeviceStatusSchema = schema.remoteRebootDeviceStatus;
        let data = { deviceId, DeviceType, Action, serialNumber }
        schemaValidation.validateSchema(data, remoteRebootDeviceStatusSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                if (DeviceType == 'hs') {
                    Attribute = "HS_REBOOT";
                } else if (DeviceType == 'hh') {
                    Attribute = "HH_REBOOT";
                } else if (DeviceType == 'meter') {
                    Attribute = "METER_REBOOT";
                } else {
                    Attribute = "DL_REBOOT";
                }
                deviceId = parseInt(deviceId);
                dbCmdReboot.createRebootJobs(deviceId, DeviceType, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message,
                        });
                    } else {
                        result = result[0];
                        if (result.MessageID === 255) {
                            result.MessageID = 0;
                        } else {
                            result.MessageID++;
                        }
                        sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": "Something went wrong"
                                });
                            } else {
                                if (status == 'Connected') {
                                    dbCmd.onReboot(Action, Attribute, rev, result.MessageID, result.CountryCode, result.RegionCode, result.CELLID,
                                        result.MeterID, result.DeltaLinkID, result.DeviceID, result.SerialNumber, result.JobID, function (err, resp) {
                                            if (err) {
                                                res.json({
                                                    "type": false,
                                                    "Message": "Something went wrong",
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
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;
