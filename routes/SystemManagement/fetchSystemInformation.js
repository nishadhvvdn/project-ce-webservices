var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSystemManagement.js');
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
            var deviceType = req.body.deviceType;

            let FetchInfoSchema = schema.FetchInfo;
            let data = { deviceId, deviceType }
            schemaValidation.validateSchema(data, FetchInfoSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmd.getConfigHSDetails(deviceId, deviceType, function (err, details) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            if (details.length > 0) {
                                res.json({
                                    "type": true,
                                    "details": details,
                                });
                            } else {
                                res.json({
                                    "type": false,
                                    "Status": "No Config in system",
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