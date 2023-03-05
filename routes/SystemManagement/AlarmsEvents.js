var express = require('express');
var router = express.Router();
var dbCmdConfig = require('../../data/dbCommandsConfig.js');
var dbCmd = require('../../data/dbConfig.js');
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
            var saveConfigDetails = req.body.saveConfigDetails;
            var serialNo = req.body.serialNumber;
            let AlarmEventsSchema = schema.AlarmEvents;
            let data = { deviceId, deviceType, serialNo, saveConfigDetails }
            schemaValidation.validateSchema(data, AlarmEventsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    var insertData = {};

                    if (deviceType == "hs" || deviceType == "hh") {
                        insertData = {
                            "OverVoltage": saveConfigDetails.OverVoltage,
                            "UnderVoltage": saveConfigDetails.UnderVoltage,
                            "OverLoadLine1_MD_Alarm": saveConfigDetails.OverLoadLine1_MD_Alarm,
                            "OverLoadLine2_MD_Alarm": saveConfigDetails.OverLoadLine2_MD_Alarm,
                            "OverLoadLine3_MD_Alarm": saveConfigDetails.OverLoadLine3_MD_Alarm,
                            "OverFrequency": saveConfigDetails.OverFrequency,
                            "UnderFrequency": saveConfigDetails.UnderFrequency,
                            "PowerFailure": saveConfigDetails.PowerFailure,
                            "CTOpen": saveConfigDetails.CTOpen,
                            "PTOpen": saveConfigDetails.PTOpen,
                            "OilLevelSensorFailure": saveConfigDetails.OilLevelSensorFailure,
                            "TamperLid": saveConfigDetails.TamperLid,
                            "TamperBox": saveConfigDetails.TamperBox,
                            "LowOilLevel": saveConfigDetails.LowOilLevel,
                            "HighOilTemperature": saveConfigDetails.HighOilTemperature,
                            "LowBatteryVoltage": saveConfigDetails.LowBatteryVoltage,
                            "BatteryFailure": saveConfigDetails.BatteryFailure,
                            "BatteryRemoved": saveConfigDetails.BatteryRemoved,
                            "PrimaryPowerUp": saveConfigDetails.PrimaryPowerUp,
                            "PrimaryPowerDown": saveConfigDetails.PrimaryPowerDown,
                            "NonTechnicalLoss": saveConfigDetails.NonTechnicalLoss,
                            "MeterConnected": saveConfigDetails.MeterConnected,
                            "MeterDisconnected": saveConfigDetails.MeterDisconnected,
                            "WiFiCommunicationLoss": saveConfigDetails.WiFiCommunicationLoss,
                            "LTECommunicationLoss_3G_4G": saveConfigDetails.LTECommunicationLoss_3G_4G,
                            "Communicationattemptsexceeded": saveConfigDetails.Communicationattemptsexceeded,
                            "UnAuthenticatedConnectionRequest": saveConfigDetails.UnAuthenticatedConnectionRequest
                        }

                    } else if (deviceType == "meter") {
                        insertData = {
                            "VoltageSagLine1": saveConfigDetails.VoltageSagLine1,
                            "VoltageSagLine2": saveConfigDetails.VoltageSagLine2,
                            "VoltageSagLine3": saveConfigDetails.VoltageSagLine3,
                            "VoltageSwellLine1": saveConfigDetails.VoltageSwellLine1,
                            "VoltageSwellLine2": saveConfigDetails.VoltageSwellLine2,
                            "VoltageSwellLine3": saveConfigDetails.VoltageSwellLine3,
                            "VoltageUnbalance": saveConfigDetails.VoltageUnbalance,
                            "VoltageCablelossLine1": saveConfigDetails.VoltageCablelossLine1,
                            "VoltageCablelossLine2": saveConfigDetails.VoltageCablelossLine2,
                            "VoltageCablelossLine3": saveConfigDetails.VoltageCablelossLine3,
                            "VoltageTHDOverLimitLine1": saveConfigDetails.VoltageTHDOverLimitLine1,
                            "VoltageTHDOverLimitLine2": saveConfigDetails.VoltageTHDOverLimitLine2,
                            "VoltageTHDOverLimitLine3": saveConfigDetails.VoltageTHDOverLimitLine3,
                            "CurrentTHDOverLimitLine1": saveConfigDetails.CurrentTHDOverLimitLine1,
                            "CurrentTHDOverLimitLine2": saveConfigDetails.CurrentTHDOverLimitLine2,
                            "CurrentTHDOverLimitLine3": saveConfigDetails.CurrentTHDOverLimitLine3,
                            "PrimaryPowerUp": saveConfigDetails.PrimaryPowerUp,
                            "PrimaryPowerDown": saveConfigDetails.PrimaryPowerDown,
                            "LongOutagedetection": saveConfigDetails.LongOutagedetection,
                            "ShortOutagedetection": saveConfigDetails.ShortOutagedetection,
                            "NonvolatileMemoryFailed": saveConfigDetails.NonvolatileMemoryFailed,
                            "Clockerrordetected": saveConfigDetails.Clockerrordetected,
                            "LowBatteryVoltage": saveConfigDetails.LowBatteryVoltage,
                            "FlashMemoryFailed": saveConfigDetails.FlashMemoryFailed,
                            "Firmwareupgraded": saveConfigDetails.Firmwareupgraded,
                            "Demandreset": saveConfigDetails.Demandreset,
                            "TimeSynchronized": saveConfigDetails.TimeSynchronized,
                            "Historylogcleared": saveConfigDetails.Historylogcleared,
                            "Coverremoval": saveConfigDetails.Coverremoval,
                            "Terminalcoverremoval": saveConfigDetails.Terminalcoverremoval,
                            "MeterDisconnected": saveConfigDetails.MeterDisconnected,
                            "MeterConnected": saveConfigDetails.MeterConnected,
                            "DemandresponseofimportactpwrkWplus": saveConfigDetails.DemandresponseofimportactpwrkWplus,
                            "DemandresponseofexportactpwrkWminus": saveConfigDetails.DemandresponseofexportactpwrkWminus,
                            "DemandresponseofimportreactpwrkVarplus": saveConfigDetails.DemandresponseofimportreactpwrkVarplus,
                            "DemandresponseofexportreactpwrkVarminus": saveConfigDetails.DemandresponseofexportreactpwrkVarminus
                        }
                    }


                    dbCmdConfig.updateAlarmsEvent(deviceId, deviceType, insertData, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": "Alarms Configurations couldn't be updated!"
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": "Updated Alarms Configurations"
                            });
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
