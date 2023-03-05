const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDataRate');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/dataRateSchema');

router.post('/', function (req, res) {
    try {
        var deviceType = req.body.DeviceType;
        var deviceId = req.body.DeviceID;
        let dataRateSchema = schema.dataRate;
        let data = { deviceType, deviceId }
        schemaValidation.validateSchema(data, dataRateSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.getDataRate(data, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "DataRate": result
                        });
                    }
                })
            }
        })
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }

});
module.exports = router;