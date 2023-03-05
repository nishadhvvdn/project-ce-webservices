var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsUpdateConsumer.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema')
var authenticateJWT = require('../../data/authenticateJWT.js');

router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */

        let ConsumerID = req.headers.consumerid;
        let FirstName = req.body.FirstName;
        let LastName = req.body.LastName;
        let Email = req.body.Email;
        let updateConsumer = { ConsumerID, FirstName, LastName, Email }
        let updateConsumerSchema = schema.updateConsumer;
        authenticateJWT.authentication(req, function (err, result) {
            if (result) {
                schemaValidation.validateSchema(updateConsumer, updateConsumerSchema, function (err, result) {
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
                        dbCmd.UpdateConsumer(updateConsumer, function (err, result) {
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