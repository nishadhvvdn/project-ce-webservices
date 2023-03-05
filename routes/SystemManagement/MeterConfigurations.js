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
            var utilityId = saveConfigDetails.UtilityID
            var CircuitId = saveConfigDetails.CircuitID
            var CertificationNumber = saveConfigDetails.CertificationNumber
            var MeterEsn = saveConfigDetails.MeterESN
            let MeterConfigSchema = schema.MeterConfig;
            let data = { deviceId, deviceType, ConfigType, serialNo, saveConfigDetails, utilityId, CircuitId, CertificationNumber, MeterEsn}
            schemaValidation.validateSchema(data, MeterConfigSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmdConfig.createMeterConfigurationJobs(deviceId, deviceType, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            result = result[0];
                            var insertData = {};
                            insertData = {
                                "uti_ID": saveConfigDetails.UtilityID,
                                "cir_ID": saveConfigDetails.CircuitID,
                                "cer_num": saveConfigDetails.CertificationNumber,
                                "esn": saveConfigDetails.MeterESN
                            }
                            insertData.config_time = parseInt(Date.now()/1000);
                            if (result) {
                                if (!result.MessageID) {
                                    result.MessageID = 0;
                                } else if (result.MessageID === 255) {
                                    result.MessageID = 0;
                                } else {
                                    result.MessageID++;
                                }
                                var rev = 0;
                                let ConfigDevice = JSON.parse(JSON.stringify(insertData));
                                ConfigDevice["esn"] = ConfigDevice["esn"].toString();
                                result["rev"] = rev;
                                result.CountryCode = result.CountryCode ? result.CountryCode : 0;
                                var Action = "Configuration_Meter";
                                var Attribute = 'Meter_Config';
                                var purpose = "Configuration_Meter";
                                var data = {
                                    "action": Action,
                                    "attribute": Attribute,
                                    "rev": result.rev,
                                    "messageid": result.MessageID,
                                    "countrycode": result.CountryCode,
                                    "regioncode": result.RegionCode,
                                    "cellid": result.CELLID,
                                    "meterid": deviceId,
                                    "deviceID": result.DeviceID,
                                    "Purpose": purpose
                                }
                                data = Object.assign(data, ConfigDevice);
                                sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Someting went wrong"
                                        });
                                    } else {
                                        if (status == 'Connected') {
                                            dbCmd.onMeterConfig(data,result.JobID, function (err, resp) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": "Someting went wrong"
                                                    });
                                                } else {
                                                    if (resp == "Success") {
                                                        dbCmdConfig.updateMeterConfig(deviceId, ConfigType, insertData, function (err, result) {
                                                            if (err) {
                                                                res.json({
                                                                    "type": false,
                                                                    "Message": "Someting went wrong"
                                                                });
                                                            } else {
                                                                res.json({
                                                                    "type": true,
                                                                    "Message": "Updated Meter Configurations"
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
                                            dbCmdConfig.updateMeterConfig(deviceId, ConfigType, insertData, function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": "Someting went wrong"
                                                    });
                                                } else {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "Updated Meter Configurations But Device Not Connected!!"
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                insertData.config_time = parseInt(Date.now()/1000);
                                dbCmdConfig.updateMeterConfig(deviceId, ConfigType, insertData, function (err, result) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Someting went wrong"
                                        });
                                    } else {
                                        res.json({
                                            "type": true,
                                            "Message": "Updated Meter Configurations"
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