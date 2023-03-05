var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var unique = require('array-unique');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
const duplicateItems = require('../../config/Helpers/duplicateEntry')

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
            let insertNewCircuitDetails = req.body.insertNewCircuitDetails;
            let type = insertNewCircuitDetails.Type;
            let circuitID = insertNewCircuitDetails.CircuitID;
            let kVARating = insertNewCircuitDetails.KVARating;
            let substationID = insertNewCircuitDetails.SubstationID;
            let substationName = insertNewCircuitDetails.SubstationName;
            let address = insertNewCircuitDetails.Address;
            let country = insertNewCircuitDetails.Country;
            let state = insertNewCircuitDetails.State;
            let city = insertNewCircuitDetails.City;
            let zipCode = insertNewCircuitDetails.ZipCode;
            let latitude = insertNewCircuitDetails.Latitude;
            let longitude = insertNewCircuitDetails.Longitude;
            let data = { type, circuitID, kVARating, substationID, substationName, address, country, state, city, zipCode, latitude, longitude }
            let insertNewCircuitDetailsSchema = schema.insertNewCircuitDetails;
            /* validate all mandatory fields */
            schemaValidation.validateSchema(data, insertNewCircuitDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if ((insertNewCircuitDetails.KVARating.length !== insertNewCircuitDetails.CircuitID.length) || (insertNewCircuitDetails.SubstationID.length !== insertNewCircuitDetails.CircuitID.length) ||
                    (insertNewCircuitDetails.SubstationName.length !== insertNewCircuitDetails.CircuitID.length) || (insertNewCircuitDetails.Address.length !== insertNewCircuitDetails.CircuitID.length) ||
                    (insertNewCircuitDetails.Country.length !== insertNewCircuitDetails.CircuitID.length) || (insertNewCircuitDetails.State.length !== insertNewCircuitDetails.CircuitID.length) ||
                    (insertNewCircuitDetails.City.length !== insertNewCircuitDetails.CircuitID.length) || (insertNewCircuitDetails.ZipCode.length !== insertNewCircuitDetails.CircuitID.length) ||
                    (insertNewCircuitDetails.Latitude.length !== insertNewCircuitDetails.CircuitID.length) || (insertNewCircuitDetails.Longitude.length !== insertNewCircuitDetails.CircuitID.length)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Upload: Invalid Length Content!!",
                        "PayloadErrors": "Field(s) length should be equal to CircuitID"
                    });
                } else if (!(Object.keys(insertNewCircuitDetails).length === 12)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Add/Upload: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                }
                else {
                    var dupCircuitID = [];
                    for (i = 0; i < (insertNewCircuitDetails.CircuitID).length; i++) {
                        dupCircuitID.push(insertNewCircuitDetails.CircuitID[i]);
                    }
                    var valueCircuitID = dupCircuitID.map(function (item) {
                        return item.toLowerCase();
                    });
                    var isDuplicateCircuitID = valueCircuitID.some(function (item, idx) {
                        return valueCircuitID.indexOf(item) != idx
                    });
                    resultErrors = [];

                    if (isDuplicateCircuitID) {
                        var valueArray = insertNewCircuitDetails.CircuitID.map(function (item) { return item.toLowerCase(); });
                        let CircuitIDs = duplicateItems.duplicateItems(valueArray);

                        for (j in insertNewCircuitDetails.CircuitID) {
                            if (CircuitIDs.includes(insertNewCircuitDetails.CircuitID[j].toLowerCase())) {
                                resultErrors.push({ SerialNumber: insertNewCircuitDetails.CircuitID[j], Status: 'Fail', Comment: ` ${j} ${insertNewCircuitDetails.CircuitID[j]}  duplicate Circuit ID!!` });
                            }
                        }
                        res.json({
                            "type": false,
                            "Message": "duplicate Circuit ID!!",
                            "Result": resultErrors
                        });
                    }
                    else {
                        dbCmd.createNewCircuitEntry(insertNewCircuitDetails, function (err, result, Errors, resultErrors) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                unique(Errors);
                                res.json({
                                    "type": true,
                                    "Message": result,
                                    "Errors": Errors,
                                    "Result": resultErrors
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