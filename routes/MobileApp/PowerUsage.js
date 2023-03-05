var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsPowerConsumption.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MoblieAppSchema');
var authenticateJWT = require('../../data/authenticateJWT.js');

router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */

        let ConsumerID = req.headers.consumerid;
        let EndDate = req.body.EndDate;
        let StartDate = req.body.StartDate;
        let Filter = req.body.Filter;
        let EndTime = req.body.EndTime;
        let StartTime = req.body.StartTime;
        let Timezone = req.body.timezone;

        let powerUsageData = { ConsumerID, EndDate, EndTime, Filter, StartDate, StartTime };

        let powerUsageSchema = schema.powerUsageSchema;
        authenticateJWT.authentication(req, function (err, result) {
            if (result) {
                schemaValidation.validateSchema(powerUsageData, powerUsageSchema, function (err, result) {
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
                        dbCmd.fetchMeterForConsumer(ConsumerID, EndDate, EndTime, Filter, StartDate, StartTime, Timezone, function (err, data) {
                            if (err) {
                                res.json({
                                    "powerUsageData": {},
                                    "response": {
                                        "message": err.message,
                                        "status": false,
                                        "responseCode": err.responseCode
                                    }
                                });
                            } else {
                                res.json({
                                    "powerUsageData": data.response,
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
