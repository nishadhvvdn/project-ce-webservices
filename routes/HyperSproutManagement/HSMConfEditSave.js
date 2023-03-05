var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');

router.post('/', function (req, res) {
    // Parameters Passed from UI - "ConfigID","ConfigName","Description","Version","ClassName","AllEvents","BillingDateCleard","BillingScheduleExpiration","ConfigurationErrorDetected","DailySelfReadTime","DataVineHyperSproutChange","DataVineSyncFatherChange","Demand","DemandResetOccured","DeregistrationResult","EnableVoltageMonitor","Energy1","HighVoltageThresholdDeviation","HistoryLogCleared","InterrogationSendSucceeded","IntervalLength","LinkFailure","LinkMetric","LoadProfileError","LowBatteryDetected","LowVoltageThreshold","LowVoltageThresholdDeviation","OutageLength","PrimaryPowerDown","PulseWeight1","PulseWeight2","PulseWeight3","PulseWeight4","Quantity4","RMSVoltHighThreshold","RMSVoltLoadThreshold","ReceivedMessageFrom","SendResponseFailed","TableSendRequestFailed","TestModeDemandIntervalLength","TimetoremaininTestMode","ZigbeeSETunnelingMessage","ZigbeeSimpleMeteringMessage"

    var updatevalues = req.body.updatevalues; //object array (key, value)

    if ((updatevalues.ConfigID == null) || (updatevalues.ConfigProgramName == null) || (updatevalues.Type == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {
        dbCmd.updateConfigDataValues(updatevalues, function (err, data) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                if ((data.result.nModified) > 0) {
                    dbCmd.updateEditTimeAndTagDescrepancy(updatevalues, data, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": result.toString()
                            });
                        }
                    });
                } else {
                    res.json({
                        "type": true,
                        "Message": data.toString()
                    });
                }
            }
        });
    }
});

module.exports = router;