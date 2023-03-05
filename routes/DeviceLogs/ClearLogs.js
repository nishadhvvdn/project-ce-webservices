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
            const clearLogsValues = req.body.ClearLogs;
            const deviceId = parseInt(clearLogsValues.DeviceId);
            const deviceType = clearLogsValues.DeviceType
            const data = { deviceId, deviceType }
            const clearLogsSchema = schema.clearLogs;
            schemaValidation.validateSchema(data, clearLogsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err

                    });
                }
                else {
                    dbCmd.clearLogsStatus(data, function (err, clearLogsStatus) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": clearLogsStatus
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
