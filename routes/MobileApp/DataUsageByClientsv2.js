var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsdataUsagev2.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema')
var authenticateJWT = require('../../data/authenticateJWT.js');

router.get('/', function (req, res) {
    try {
        /* validate all mandatory fields */

        let consumerID = req.headers.consumerid;
        let page = parseInt(req.query.Page);
        let limit = parseInt(req.query.Limit);
        let startTime = req.query.StartTime;
        let endTime = req.query.EndTime;
        let Timezone = req.query.Timezone;

        if(Timezone.charAt(0) == " ") {
            Timezone = "+"+Timezone.trim();
        }

        let dataUsageData = { consumerID, page, limit, startTime, endTime };

        let dataUsageSchema = schema.dataUsageByClientsSchema;
        authenticateJWT.authentication(req, function (err, result) {
            if (result) {
                schemaValidation.validateSchema(dataUsageData, dataUsageSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "powerUsageData": {},
                            "response": {
                                "message": "Payload Validation Error",
                                "status": false,
                                "responseCode": "301"
                            }
                        });
                    } else {
                        dbCmd.fetchClientsdataUsage(dataUsageData, Timezone, function (err, data) {
                            if (err) {
                                res.json({
                                    "dataUsageData": {},
                                    "response": {
                                        "message": err.message,
                                        "status": false,
                                        "responseCode": err.responseCode
                                    }
                                });
                            } else {
                                res.json({
                                    "TotalDataUsageByClients": data.response,
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
            "powerUsageData": {},
            "response": {
                "message": "Something went wrong : " + e.name + " " + e.message,
                "status": false,
                "responseCode": "315"
            }
        });
    }

});
module.exports = router;