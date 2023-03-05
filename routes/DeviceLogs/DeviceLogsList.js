const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeviceLogs.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deviceLogSchema')

router.get('/', function (req, res) {
    try {
        const deviceType = req.query.DeviceType;
        const deviceId = parseInt(req.query.DeviceId);
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        const data = { deviceId, deviceType, page, limit }
        const getLogs = schema.getLogs;
        schemaValidation.validateSchema(data, getLogs, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors":err
                });
            } else {
                dbCmd.getDeviceLogsList(data, function (err, deviceLogLists) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "DeviceLogLists": deviceLogLists
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