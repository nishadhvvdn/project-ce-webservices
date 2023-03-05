var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deleteMeterSchema')
var _ = require('lodash');
let unique = require('array-unique');


router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            // payload is empty 
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "Errors": "Empty payload"
            });
        } else {
            // Parameters Passed from UI - "MeterID"
            var deleteMeterValues = req.body.deleteMeterValues;
            let deleteMeterDetailsSchema = schema.deleteMeterDetails;
            if ((!deleteMeterValues) || (typeof deleteMeterValues != "object")) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!"
                });
            } else {
                let meterID = deleteMeterValues.MeterID;
                let data = { meterID }
                schemaValidation.validateSchema(data, deleteMeterDetailsSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": err
                        });
                    } else {
                        dbCmd.deleteMeterDetails(deleteMeterValues, function (err, meterDetailsDeleted, Errors) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                unique(Errors)
                                res.json({
                                    "type": true,
                                    "Message": meterDetailsDeleted,
                                    "Errors": Errors
                                });
                            }
                        });
                    }
                })
            }
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;