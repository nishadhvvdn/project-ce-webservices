var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsVerifyOtp.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema')

router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */

        let ConsumerID = req.body.ConsumerID;
        let Otp = req.body.Otp;
        let DeviceToken = req.body.DeviceToken;
        let DevicePlatform = req.body.DevicePlatform;

        let otpData = { ConsumerID, Otp, DeviceToken, DevicePlatform }
        let verifyOtpSchema = schema.verifyOtp;
        schemaValidation.validateSchema(otpData, verifyOtpSchema, function (err, result) {
            if (err) {
                res.json({
                    "data": {},
                    "response": {
                        "message": "Payload validation error",
                        "status": false,
                        "responseCode": "301"
                    }
                });
            } else {
                dbCmd.otpVerification(otpData, function (err, result) {
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
                            "data": result.data,
                            "response": {
                                "message": result.message,
                                "status": true,
                                "responseCode": result.responseCode
                            }

                        });
                    }
                });


            }
        })

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