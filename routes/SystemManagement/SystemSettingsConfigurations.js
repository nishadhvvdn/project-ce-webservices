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
            var ConfigType = req.body.ConfigType;
            var serialNo = req.body.serialNumber;
            var saveConfigDetails = req.body.saveConfigDetails;
            let SysSettingSchema = schema.SysSetting;
            let data = { deviceId, deviceType, saveConfigDetails }
            schemaValidation.validateSchema(data, SysSettingSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmdConfig.createSystemConfigurationJobs(deviceId, deviceType, ConfigType, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            result = result[0];
                            var insertData = {};

                            insertData = {
                                "sysname": saveConfigDetails.SystemName,
                                "country": saveConfigDetails.Country,
                                "timezone": saveConfigDetails.Timezone
                            }
                            if (result) {
                                insertData.config_time = parseInt(Date.now()/1000);
                                let ConfigDevice = JSON.parse(JSON.stringify(insertData));
                                ConfigDevice.country = ConfigDevice.country.split(" ");

                                for (var i = 0, x = ConfigDevice.country.length; i < x; i++) {
                                    ConfigDevice.country[i] = ConfigDevice.country[i][0].toUpperCase() + ConfigDevice.country[i].substr(1).toLowerCase();;
                                }
                                ConfigDevice.country = ConfigDevice.country.join(" ");
                                if (ConfigDevice.country == "Usa")
                                    ConfigDevice.country = "USA";
                                if (ConfigDevice.timezone == 'Asia/Kolkata - GMT+5:30')
                                    ConfigDevice.timezone = 0;
                                if (ConfigDevice.timezone == 'Asia/Tashkent - GMT+5')
                                    ConfigDevice.timezone = 1;
                                if (ConfigDevice.timezone == 'Asia/Manila - GMT+8')
                                    ConfigDevice.timezone = 2;
                                if (ConfigDevice.timezone == 'Africa/Johannesburg - GMT+2')
                                    ConfigDevice.timezone = 3;
                                if (ConfigDevice.timezone == 'America/Tijuana - UTC --8:00/ -7:00')
                                    ConfigDevice.timezone = 4;
                                if (ConfigDevice.timezone == 'America/Hermosillo - UTC -7')
                                    ConfigDevice.timezone = 5;
                                if (ConfigDevice.timezone == 'America/Mazatlan - UTC -7:00 / -6:00')
                                    ConfigDevice.timezone = 6;
                                if (ConfigDevice.timezone == 'America/Mexico_City- UTC -6:00 / -5:00')
                                    ConfigDevice.timezone = 7;
                                if (ConfigDevice.timezone == 'America/Cancun - UTC -5:00')
                                    ConfigDevice.timezone = 8;
                                if (ConfigDevice.timezone == 'Asia/Singapore - GMT+8')
                                    ConfigDevice.timezone = 9;
                                if (ConfigDevice.timezone == 'Europe/Kaliningrad - UTC+02:00')
                                    ConfigDevice.timezone = 10;
                                if (ConfigDevice.timezone == 'Europe/Moscow - UTC+03:00')
                                    ConfigDevice.timezone = 11;
                                if (ConfigDevice.timezone == 'Europe/Samara - UTC+04:00')
                                    ConfigDevice.timezone = 12;
                                if (ConfigDevice.timezone == 'Asia/Yekaterinburg- UTC+05:00')
                                    ConfigDevice.timezone = 13;
                                if (ConfigDevice.timezone == 'Asia/omsk - UTC+06:00')
                                    ConfigDevice.timezone = 14;
                                if (ConfigDevice.timezone == 'Asia/Krasnoyarsk - UTC+07:00')
                                    ConfigDevice.timezone = 15;
                                if (ConfigDevice.timezone == 'Asia/Irkutsk- UTC+08:00')
                                    ConfigDevice.timezone = 16;
                                if (ConfigDevice.timezone == 'Asia/Yakutsk - UTC+09:00')
                                    ConfigDevice.timezone = 17;
                                if (ConfigDevice.timezone == 'Asia/Vladivostok - UTC+10:00')
                                    ConfigDevice.timezone = 18;
                                if (ConfigDevice.timezone == 'Asia/Magadan - UTC+11:00')
                                    ConfigDevice.timezone = 19;
                                if (ConfigDevice.timezone == 'Asia/Kamchatka - UTC+12:00')
                                    ConfigDevice.timezone = 20;
                                if (ConfigDevice.timezone == 'America/Vancouver - UTC -8:00 / -7:00')
                                    ConfigDevice.timezone = 21;
                                if (ConfigDevice.timezone == 'America/Dawson Creek - UTC -7:00')
                                    ConfigDevice.timezone = 22;
                                if (ConfigDevice.timezone == 'America/Edmonton - UTC -7:00 / -6:00')
                                    ConfigDevice.timezone = 23;
                                if (ConfigDevice.timezone == 'America/Regina - UTC -6:00')
                                    ConfigDevice.timezone = 24;
                                if (ConfigDevice.timezone == 'America/Winnipeg - UTC -6:00 / -5:00')
                                    ConfigDevice.timezone = 25;
                                if (ConfigDevice.timezone == 'America/Atikokan - UTC -5:00')
                                    ConfigDevice.timezone = 26;
                                if (ConfigDevice.timezone == 'America/Toronto - UTC -5:00 / -4:00')
                                    ConfigDevice.timezone = 27;
                                if (ConfigDevice.timezone == 'America/Blanc-Sablon - UTC -4:00')
                                    ConfigDevice.timezone = 28;
                                if (ConfigDevice.timezone == 'America/Halifax - UTC -4:00 / -3:00')
                                    ConfigDevice.timezone = 29;
                                if (ConfigDevice.timezone == 'America/St Johns - UTC -3.30 / -2.30')
                                    ConfigDevice.timezone = 30;
                                if (ConfigDevice.timezone == 'Pacific/Honolulu - UTC -10:00')
                                    ConfigDevice.timezone = 31;
                                if (ConfigDevice.timezone == 'America/Anchorage - UTC -9:00 / -8:00')
                                    ConfigDevice.timezone = 32;
                                if (ConfigDevice.timezone == 'America/Los Angeles - UTC -8:00 / -7:00')
                                    ConfigDevice.timezone = 33;
                                if (ConfigDevice.timezone == 'America/Phoenix - UTC -7:00')
                                    ConfigDevice.timezone = 34;
                                if (ConfigDevice.timezone == 'America/Boise - UTC -7.00/-6.00')
                                    ConfigDevice.timezone = 35;
                                if (ConfigDevice.timezone == 'America/Chicago - UTC -6:00 / -5:00')
                                    ConfigDevice.timezone = 37;
                                if (ConfigDevice.timezone == 'America/New York - UTC -5:00 / -4:00')
                                    ConfigDevice.timezone = 38;


                                if (!result.MessageID) {
                                    result.MessageID = 0;
                                } else if (result.MessageID === 255) {
                                    result.MessageID = 0;
                                } else {
                                    result.MessageID++;
                                }
                                var Action = "System_Settings";
                                if (deviceType == "meter") {
                                    Attribute = "Meter_System_Settings";
                                } else {
                                    Attribute = "HS_System_Settings";
                                }
                                var purpose = "SystemSettings";
                                result.rev = result.rev ? result.rev : 0;
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
                                if (deviceType == "meter")
                                    data.meterid = deviceId;
                                data = Object.assign(data, ConfigDevice);
                                sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Someting went wrong"
                                        });
                                    } else {
                                        if (status == 'Connected') {
                                            dbCmd.onSystemSettingsConfig(data, result.JobID, function (err, resp) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": "Someting went wrong"
                                                    });
                                                } else {
                                                    if (resp == "Success") {
                                                        dbCmdConfig.updateSystemSettings(deviceId, deviceType, ConfigType, insertData, function (err, result) {
                                                            if (err) {
                                                                res.json({
                                                                    "type": false,
                                                                    "Message": "Someting went wrong"
                                                                });
                                                            } else {
                                                                res.json({
                                                                    "type": true,
                                                                    "Message": "Updated System Settings"
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
                                            insertData.config_time = parseInt(Date.now()/1000);
                                            dbCmdConfig.updateSystemSettings(deviceId, deviceType, ConfigType, insertData, function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": "Someting went wrong"
                                                    });
                                                } else {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "Updated System Settings But Device Not Connected!!"
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                insertData.config_time = parseInt(Date.now()/1000);
                                dbCmdConfig.updateSystemSettings(deviceId, deviceType, ConfigType, insertData, function (err, result) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Someting went wrong"
                                        });
                                    } else {
                                        res.json({
                                            "type": true,
                                            "Message": "Updated System Settings"
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
