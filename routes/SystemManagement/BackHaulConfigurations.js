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
        if (_.isEmpty(req.body)) {
            // payload is empty
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            var deviceId = req.body.deviceId;
            var deviceType = req.body.DeviceType;
            var serialNo = req.body.serialNumber;
            var ConfigType = req.body.ConfigType;
            var Type = req.body.Type;
            var saveConfigDetails = req.body.saveConfigDetails;

            let BackhaulSchema = schema.Backhaul;
            let data = { deviceId, deviceType, serialNo ,ConfigType, Type, saveConfigDetails }
            schemaValidation.validateSchema(data, BackhaulSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmdConfig.createBackHaulJobs(deviceId, deviceType,serialNo, ConfigType, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            result = result[0];
                            var insertData = {};
                            if (Type == 'Cellular') {
                                if (saveConfigDetails.Carrier == null)
                                    saveConfigDetails.Carrier = '';
                                insertData = {
                                    "username": saveConfigDetails.UserName,
                                    "password": saveConfigDetails.Password,
                                    "sim_pin": saveConfigDetails.SimPin,
                                    "network_selection": saveConfigDetails.NetworkSelection,
                                    "carrier": saveConfigDetails.Carrier,
                                    "carrierList": saveConfigDetails.CarrierList
                                }
                            } else if (Type == 'Ethernet') {
                                insertData = {
                                    "mode": saveConfigDetails.Mode,
                                    "ip": saveConfigDetails.IP,
                                    "gateway": saveConfigDetails.Gateway,
                                    "subnet": saveConfigDetails.Subnet,
                                    "primary_dns": saveConfigDetails.Primary_DNS,
                                    "secondary_dns": saveConfigDetails.Secondary_DNS
                                }
                            } else if (Type == 'Advanced') {
                                insertData = {
                                    "primary_backhaul": saveConfigDetails.Primary_Backhaul,
                                    "auto_switchover": saveConfigDetails.Auto_Switchover
                                }
                            }
                            insertData.config_time = parseInt(Date.now() / 1000);
                            if (result) {
                                if (!result.MessageID) {
                                    result.MessageID = 0;
                                } else if (result.MessageID === 255) {
                                    result.MessageID = 0;
                                } else {
                                    result.MessageID++;
                                }
                                var rev = 0;
                                result["rev"] = rev;

                                var Action = "BACKHAUL";
                                var Attribute = '';
                                if (Type == 'Cellular') {
                                    Attribute = "CELLULAR";
                                    purpose = "Backhaul_Cellular";
                                } else if (Type == 'Ethernet') {
                                    Attribute = 'ETHERNET';
                                    purpose = "Backhaul_Ethernet";
                                } else {
                                    Attribute = 'ADVANCED';
                                    purpose = "Backhaul_Advanced";
                                }
                                var data = {
                                    "action": Action,
                                    "attribute": Attribute,
                                    "rev": result.rev,
                                    "messageid": result.MessageID,
                                    "countrycode": result.CountryCode,
                                    "regioncode": result.RegionCode,
                                    "cellid": result.CELLID,
                                    "meterid": 0,
                                    "deviceID": result.DeviceID,
                                    "Purpose": purpose
                                }
                                data = Object.assign(data, insertData);



                                sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Something went wrong"
                                        });
                                    } else {
                                        if (status == 'Connected') {
                                            dbCmd.onBackHaul(data, result.JobID, function (err, resp) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": "Something went wrong"
                                                    });
                                                } else {
                                                    if (resp == "Success") {
                                                        dbCmdConfig.updateBackHaul(deviceId, Type, ConfigType, insertData, function (err, result) {
                                                            if (err) {
                                                                res.json({
                                                                    "type": false,
                                                                    "Message": "Something went wrong"
                                                                });
                                                            } else {
                                                                res.json({
                                                                    "type": true,
                                                                    "Message": "Updated Backhaul Configurations"
                                                                });
                                                            }
                                                        });
                                                    } else if (resp == "Failure") {
                                                        res.json({
                                                            "type": true,
                                                            "Message": "Failure Response from Device"
                                                        });
                                                    } else {
                                                        res.json({
                                                            "type": true,
                                                            "Message": "No Response From Device"
                                                        });
                                                    }
                                                }
                                            });
                                        } else {
                                            // res.json({
                                            //     "type": false,
                                            //     "Message": "Device Not Connected"
                                            // });
                                            insertData.config_time = parseInt(Date.now() / 1000);
                                            dbCmdConfig.updateBackHaul(deviceId, Type, ConfigType, insertData, function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": err.message
                                                    });
                                                } else {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "Updated Backhaul Configurations But Device Not Connected!!"
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                insertData.config_time = parseInt(Date.now() / 1000);
                                dbCmdConfig.updateBackHaul(deviceId, Type, ConfigType, insertData, function (err, result) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": err.message
                                        });
                                    } else {
                                        res.json({
                                            "type": true,
                                            "Message": "Updated Backhaul Configurations"
                                        });
                                    }
                                });
                            }


                        }
                    });
                }
            });
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});
module.exports = router;
