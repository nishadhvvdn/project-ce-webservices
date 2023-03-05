var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsUpdatePassword.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema')
var authenticateJWT = require('../../data/authenticateJWT.js');

router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */

        let ConsumerID = req.headers.consumerid;
        let NewPassword = req.body.NewPassword;
        let Otp = req.body.Otp;
        let updatePassword = { ConsumerID, NewPassword, Otp }
        let ForgetDataSchema = schema.updatePassword;
        authenticateJWT.authentication(req, function (err, result) {
            if (result) {
                schemaValidation.validateSchema(updatePassword, ForgetDataSchema, function (err, result) {
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
                        dbCmd.decryptPassword(NewPassword, function (DecryptedPassword) {
                            updatePassword.NewPassword = DecryptedPassword;
                            dbCmd.UpdatePassword(updatePassword, function (err, result) {
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
                                        "data": {},
                                        "response": {
                                            "message": result.message,
                                            "status": true,
                                            "responseCode": result.responseCode
                                        }

                                    });
                                }
                            });
                        })

                    }
                })

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