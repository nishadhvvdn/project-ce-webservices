const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeviceLogs.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deviceLogSchema')
const unique = require('array-unique');

router.post('/', function (req, res) {
    try {
        var deleteDeviceLogValues = req.body.DeleteDeviceLogsDetails;
        const deleteDeviceLogValuesSchema = schema.deleteDeviceLogValues;
        if ((!deleteDeviceLogValues) || (typeof deleteDeviceLogValues != "object")) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!"
            });
        } else {
            const deviceId = parseInt(deleteDeviceLogValues.DeviceId);
            const deviceType = deleteDeviceLogValues.DeviceType;
            const logID = deleteDeviceLogValues.LogID;
            const data = { deviceId, deviceType, logID }
            schemaValidation.validateSchema(data, deleteDeviceLogValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmd.deleteDeviceLogDetails(data, function (err, DeviceLogDetailsDeleted, Errors) {
                        if (err) {
                            res.json({
                                "type": false, "Message": err
                            });
                        } else {
                            unique(Errors);
                            res.json({
                                "type": true, "Message": DeviceLogDetailsDeleted, "Errors": Errors
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