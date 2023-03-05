var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsToken.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/MoblieAppSchema');
var authenticateJWT = require('../../data/authenticateJWT.js');

router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */
        console.log(req.headers)
        let ConsumerID = req.headers.consumerid;
        let DevicePlatform = req.headers.deviceplatform;
        let DeviceToken = req.headers.devicetoken;
        let DeviceAppId = req.headers.deviceappid;
        let DeviceLang = req.headers.devicelang || "ENG";
        let Consumserdata = { ConsumerID,DeviceToken,DevicePlatform,DeviceAppId,DeviceLang };
        let tokenUpdateSchema = schema.tokenUpdate;

        authenticateJWT.authentication(req, function (err, result) {
            if (result) {
                schemaValidation.validateSchema(Consumserdata, tokenUpdateSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "data": {},
                            "response": {
                                "message": "Payload Validation Error",
                                "status": false,
                                "responseCode": "301"
                            }
                        });
                    } else {
                        dbCmd.FetchTokenDetails(ConsumerID,DevicePlatform,DeviceAppId,DeviceToken,DeviceLang, function (err, data) {
                            if (err) {
                                res.json({
                                    "data": {},
                                    "response": {
                                        "message": err.message,
                                        "status": false,
                                        "responseCode": err.responseCode
                                    }
                                });
                            } else {
                                res.json({
                                    "dhcpData": data.response,
                                    "response": {
                                        "message": data.message,
                                        "status": true,
                                        "responseCode": data.responseCode
                                    }

                                });
                            }
                        });
                    }
                });
            } else {
                res.json({
                    "data": {},
                    "response": {
                        "message": err.message,
                        "status": false,
                        "responseCode": err.responseCode
                    }
                });
            }
        });
    } catch (e) {
        res.json({
            "data": {},
            "response": {
                "message": "Something went wrong : " + e.name + " " + e.message,
                "status": false,
                "responseCode": "315"
            }
        });
    }

});
module.exports = router;