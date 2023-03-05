var express = require('express');
var router = express.Router();
var dbCmdReboot = require('../../data/dbCommandsFactoryReset.js');
var dbCmd = require('../../data/dbFactoryReset');
var sendtoiot = require('../../data/sendToiot.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/DeviceFactoryResetSchema')
var sendtoiot = require('../../data/sendToiot.js');

router.post('/', function (req, res) {
    try {
        var deviceId = req.body.deviceId;
        var serialNumber = req.body.serialNumber;
        var DeviceType = req.body.DeviceType; //hs/hh/deltalink/meter
        var factoryResetType = req.body.factoryResetType; //full,shallow
        var Action = "FACTORY_RESET";
        var rev = 0, Attribute, Purpose;
        if (DeviceType == 'HyperSprout' || DeviceType == 'HyperHub') {
            Attribute = factoryResetType == 'full' ? "HS_FULL_FACTORY_RESET" :"HS_SHALLOW_FACTORY_RESET";
            Purpose = "HS_FACTORY_RESET";
        } else if (DeviceType == 'Meter') {
            Attribute =  factoryResetType == 'full' ? "METER_FULL_FACTORY_RESET" : "METER_SHALLOW_FACTORY_RESET";
            Purpose = "METER_FACTORY_RESET";
        } else {
            Attribute = factoryResetType == 'full' ? "DL_FULL_FACTORY_RESET" : "DL_SHALLOW_FACTORY_RESET";
            Purpose = "DL_FACTORY_RESET";
        }
    
        const FactoryResetDetails = schema.FactoryResetDetails;
        const data = { deviceId, serialNumber, DeviceType, factoryResetType }
        schemaValidation.validateSchema(data, FactoryResetDetails, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }else{
                dbCmdReboot.createFactoryResetJobs(deviceId, DeviceType, factoryResetType, serialNumber, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err,
                        });
                    } else {
                        result = result[0];
                        if (result.MessageID === 255) {
                            result.MessageID = 0;
                        } else {
                            result.MessageID++;
                        }
                        sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                            // err = 0;
                            // status = 'Connected';
                            if (err) {
                                res.json({
                                    "type": false,
                                    //"Message": err
                                    "Message": "Something went wrong"
                                });
                            } else {
                                if (status == 'Connected') {
                                    dbCmd.onFactoryReset(Action, Attribute, Purpose, rev, result.MessageID, result.CountryCode, result.RegionCode, result.CELLID,
                                        result.MeterID, result.DeviceID, result.SerialNumber, result.JobID, factoryResetType,DeviceType, function (err, resp) {
                                            if (err) {
                                                res.json({
                                                    "type": false,
                                                    //"Message": err,
                                                    "Message": "Something went wrong"
                                                });
                                            } else {
                                                res.json({
                                                    "type": true,
                                                    "Message": "Successfully sent packet to device for Factory reset"
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
        });
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }

});

module.exports = router;