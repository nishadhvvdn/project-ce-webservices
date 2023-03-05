var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deleteCircuitSchema')
let unique = require('array-unique');
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
            // Parameters Passed from UI - "CircuitID"
            var deleteCircuitValues = req.body.deleteCircuitValues;
            let deleteCircuitDetailsSchema = schema.deleteCircuitDetails;
            if ((!deleteCircuitValues) || (typeof deleteCircuitValues != "object")) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!"
                });
            } else {
                let circuitID = deleteCircuitValues.CircuitID;
                let data = { circuitID }
                schemaValidation.validateSchema(data, deleteCircuitDetailsSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": err
                        });
                    } else {
                        dbCmd.deleteCircuitDetails(deleteCircuitValues, function (err, circuitDetailsDeleted, Errors) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                unique(Errors);
                                res.json({
                                    "type": true,
                                    "Message": circuitDetailsDeleted,
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