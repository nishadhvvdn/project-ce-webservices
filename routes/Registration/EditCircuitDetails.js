var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
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
            // Parameters Passed from UI -CircuitID,KVARating,SubstationID,SubstationName,Address,Country,State,City,ZipCode

            let updateCircuitValues = req.body.updateCircuitValues;
            let circuitNumber = updateCircuitValues.CircuitNumber;
            let circuitID = updateCircuitValues.CircuitID;
            let kVARating = updateCircuitValues.KVARating;
            let substationID = updateCircuitValues.SubstationID;
            let substationName = updateCircuitValues.SubstationName;
            let address = updateCircuitValues.Address;
            let country = updateCircuitValues.Country;
            let state = updateCircuitValues.State;
            let city = updateCircuitValues.City;
            let zipCode = updateCircuitValues.ZipCode;
            let latitude = updateCircuitValues.Latitude;
            let longitude = updateCircuitValues.Longitude;
            let data = { circuitNumber, circuitID, kVARating, substationID, substationName, address, country, state, city, zipCode, latitude, longitude }
            let updateCircuitDetailsSchema = schema.updateCircuitDetails;
            schemaValidation.validateSchema(data, updateCircuitDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if (!(Object.keys(updateCircuitValues).length === 12)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Edit: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                }
                else {
                    dbCmd.updateCircuitDetails(updateCircuitValues, function (err, circuitDetailsUpdated) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": circuitDetailsUpdated
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