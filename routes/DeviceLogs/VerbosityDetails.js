const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeviceLogs.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deviceLogSchema')

router.get('/', function (req, res) {
    try {
        const deviceType = req.query.DeviceType;
        const deviceId = parseInt(req.query.DeviceId);
        const data = { deviceId, deviceType }
        const verbosityDetails = schema.verbosityDetails;
        schemaValidation.validateSchema(data, verbosityDetails, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors":err

                });
            } else {
                dbCmd.getVerbosity(data, function (err, VerbosityDeatil) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "LogType": VerbosityDeatil
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
})

module.exports = router;