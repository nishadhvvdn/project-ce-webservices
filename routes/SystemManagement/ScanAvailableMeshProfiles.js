var express = require('express');
var router = express.Router();
var dbCmdConfig = require('../../data/dbCommandsConfig.js');
var dbCmd = require('../../data/dbConfig.js');
var sendtoiot = require('../../data/sendToiot.js');
let schemaValidation = require('../../config/Helpers/payloadValidation');
let schema = require('../../config/Helpers/ConfigMgmntSchema');
var _ = require('lodash');

router.post('/', function (req, res) {
    try {
        var deviceId = req.body.deviceId;
        var Action = "METER_FRONTHAUL";
        var rev = 0;
        let MeshscanDeviceSchema = schema.MeshscanDevice;
        let data = { deviceId }
        schemaValidation.validateSchema(data, MeshscanDeviceSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                Attribute = "METER_SCAN";
                deviceId = parseInt(deviceId);
                dbCmdConfig.createMeshScanJobs(deviceId, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message,
                        });
                    } else {
                        if (result.length > 0) {
                            result = result[0];
                            if (result.MessageID === 255) {
                                result.MessageID = 0;
                            } else {
                                result.MessageID++;
                            }
                            result.Action = Action;
                            result.Attribute = Attribute;
                            result.rev = 0;
                            result.Purpose = 'MeshScan';
                            radio_band = 0;
                            scan = 1;
                            var data = {
                                "action": Action,
                                "attribute": Attribute,
                                "rev": result.rev,
                                "messageid": result.MessageID,
                                "countrycode": result.CountryCode,
                                "regioncode": result.RegionCode,
                                "cellid": result.CELLID,
                                "meterid": result.MeterID,
                                "deviceID": result.DeviceID,
                                "radio_band" :radio_band,
                                "scan" : scan,
                                "Purpose": result.Purpose
                            }                            
                            sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": "Something went wrong"
                                    });
                                } else {
                                   if (status == 'Connected') {
                                        dbCmd.onMeshScan(data, result.JobID, function (err, resp) {
                                            if (err) {
                                                res.json({
                                                    "type": false,
                                                    "Message": "Something went wrong",
                                                });
                                            } else {
                                                res.json({
                                                    "type": true,
                                                    "scanList": resp
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
                        }else{
                            res.json({
                                "type": false,
                                "Message": "Device Not Registered"
                            });
                        }
                    }
                });
            }

        });
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;
