var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var editWifi = require('./EditMeterWifiChangeRequest.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');

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
            let updateMeterValues = req.body.updateMeterValues;
            updateMeterValues.MeterWiFiAccessPointPassword = ( updateMeterValues.MeterWiFiAccessPointPassword )? updateMeterValues.MeterWiFiAccessPointPassword :"00000000";
            let updateMeterValuesSchema = schema.updateMeterValues;
            schemaValidation.validateSchema(updateMeterValues, updateMeterValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if (!(Object.keys(updateMeterValues).length === 40)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Edit: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                } else {
                    if (updateMeterValues.MeterID) {
                        updateMeterValues.MeterID = parseInt(updateMeterValues.MeterID);
                    }
                    if (updateMeterValues.MeterWiFiPassFlag === "Y") {
                        editWifi.EditMeterWifiChangeDetails(updateMeterValues, function (err, result) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                dbCmd.editMeterDetails(updateMeterValues, function (err, meterDetailsUpdated) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": err
                                        });
                                    } else {
                                        res.json({
                                            "type": true,
                                            "Message": meterDetailsUpdated
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        if (updateMeterValues.MeterID) {
                            updateMeterValues.MeterID = parseInt(updateMeterValues.MeterID);
                        }
                        dbCmd.editMeterDetails(updateMeterValues, function (err, meterDetailsUpdated) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                res.json({
                                    "type": true,
                                    "Message": meterDetailsUpdated
                                });
                            }
                        });
                    }
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