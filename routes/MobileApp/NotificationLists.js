var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsNotificationLists.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema')
var authenticateJWT = require('../../data/authenticateJWT.js');

router.get('/', function (req, res) {
    try {
        /* validate all mandatory fields */
        let page = parseInt(req.query.Page);
        let limit = parseInt(req.query.Limit);
        let ConsumerID = req.headers.consumerid;

        let consumerDetails = { page, limit, ConsumerID }
        let NotificationListsSchema = schema.NotificationLists;
        authenticateJWT.authentication(req, function (err, result) {
            if (result) {
        schemaValidation.validateSchema(consumerDetails, NotificationListsSchema, function (err, result) {
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
                dbCmd.getNotificationLists(consumerDetails, function (err, result) {
                    if (err) {
                        res.json({
                            "notificationData": {},
                            "response": {
                                "message": err.message,
                                "status": false,
                                "responseCode": err.responseCode
                            }
                        });
                    } else {
                        res.json({
                            "notificationData": result.data,
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