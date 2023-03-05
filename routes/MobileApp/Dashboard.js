var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDashboard.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/MoblieAppSchema');
var authenticateJWT = require('../../data/authenticateJWT.js');

router.get('/', function (req, res) {
    try {
        /* validate all mandatory fields */
        let ConsumerID = req.headers.consumerid;
        let Timezone = req.query.timezone || "-06:00";
        let powerUsageData = { ConsumerID };
        let dashboardSchema = schema.dashboard;

        if(Timezone.charAt(0) == " ") {
            Timezone = "+"+Timezone.trim();
        }

        authenticateJWT.authentication(req, function (err, result) {
            if (result) {
                schemaValidation.validateSchema(powerUsageData, dashboardSchema, function (err, result) {
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
                        dbCmd.FetchDashboardDetails(ConsumerID, Timezone, function (err, data) {
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
                                    "dashboardData": data.response,
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
