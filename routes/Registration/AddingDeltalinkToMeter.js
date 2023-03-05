var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')
const unique = require('array-unique');
var _ = require('lodash');



router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            // payload is empty 
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            // Parameters Passed from UI - "Deltalink" & "MeterIDs"
            var addDeltalinkToMeterValues = req.body.addDeltalinkToMeterValues;
            let meterID = addDeltalinkToMeterValues.MeterID;
            let deltalinkID = addDeltalinkToMeterValues.DeltalinkID;
            let data = { meterID, deltalinkID }
            let addDeltalinkToMeterValuesSchema = schema.addDeltalinkToMeterValues;
            schemaValidation.validateSchema(data, addDeltalinkToMeterValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmd.addDeltalinkToMeter(addDeltalinkToMeterValues, function (err, deltalinkToMeterAdded, Errors) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            unique(Errors);
                            res.json({
                                "type": true,
                                "Message": deltalinkToMeterAdded,
                                "Errors": Errors
                            });

                        }
                    });

                }
            })
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});

module.exports = router;