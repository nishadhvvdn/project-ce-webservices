const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeviceLogs.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deviceLogSchema')
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
            const verbosityLogsValues = req.body.VerbosityLogs;
            const verbosityLogsSchema = schema.verbosityLogsValues;
            if ((!verbosityLogsValues) || (typeof verbosityLogsValues != "object")) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                });
            }
            else {
                const deviceId = parseInt(verbosityLogsValues.DeviceId);
                const deviceType = verbosityLogsValues.DeviceType;
                const logType = parseInt(verbosityLogsValues.LogType);
                const data = { deviceId, deviceType, logType }
                schemaValidation.validateSchema(data, verbosityLogsSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors":err
                        });
                    } else {
                        dbCmd.verbosityLogsStatus(data, function (err, verbosityLogsStatus) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });

                            } else {
                                res.json({
                                    "type": true,
                                    "Message": verbosityLogsStatus
                                });

                            }
                        });

                    }

                })

            }
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;