var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsMobileAppLogin.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema')

router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */
         
        let ConsumerID = req.body.ConsumerID;
        let Password = req.body.Password;
        let DeviceToken = req.body.DeviceToken;
        let DevicePlatform = req.body.DevicePlatform;

        let loginData = { ConsumerID, Password , DeviceToken, DevicePlatform }
        let loginDataSchema = schema.login;
        schemaValidation.validateSchema(loginData, loginDataSchema, function (err, result) {
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
                    loginData.Password = DecryptedPassword;
                    dbCmd.loginEntry(loginData, function (err, result) {
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
                            req.user = result.data;                            
                            req.session.user = result.data;
                            res.locals.user = result.data;
                            let data =  result.data;
                            let message = result.message;
                            let code = result.responseCode;
                            req.session.save(function (err, result) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": "Login Again"
                                    });
                                } else {
                                    res.json({
                                        "data": data,
                                        "response": {
                                            "message": message,
                                            "status": true,
                                            "responseCode": code
                                        }
        
                                    });
                                }
                            })
                           
                        }
                    });
                })

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