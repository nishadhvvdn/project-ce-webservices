var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSignUp.js');
var authenticateJWT = require('../../data/authenticateJWT.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema')

router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */
                let ConsumerID = req.body.ConsumerID;
                let MobileNo = req.body.MobileNo;
                let Email = req.body.Email;
                let Password = req.body.Password;
                let FirstName = req.body.FirstName;
                let LastName = req.body.LastName;
                let signUpData = { ConsumerID, MobileNo, Email, Password, FirstName, LastName }
                let signUpSchema = schema.SignUp;
                schemaValidation.validateSchema(signUpData, signUpSchema, function (err, result) {
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
                        dbCmd.decryptPassword(Password, function (DecryptedPassword) {
                            signUpData.Password = DecryptedPassword;
                            dbCmd.signUpEntry(signUpData, function (err, result) {
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