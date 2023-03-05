var express = require('express');
var router = express.Router();
var unique = require('array-unique');
var dbCmd = require('../../data/dbCommandsRegistration.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
const duplicateItems = require('../../config/Helpers/duplicateEntry')

var _ = require('lodash');
const { string } = require('@hapi/joi');

router.post('/', function (req, res) {
    try {
        var insertNewMeterDetails = req.body.insertNewMeterDetails;
        let insertNewMeterDetailsSchema = schema.insertNewMeterDetails;

        /* validate all mandatory fields */
        schemaValidation.validateSchema(insertNewMeterDetails, insertNewMeterDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else if ((insertNewMeterDetails.MeterSerialNumber.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.BiDirectional.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.EVMeter.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.ImpulseCountKVARh.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.ImpulseCountKWh.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterAccuracy.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterAdminPassword.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterApptype.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterBillingCycleDate.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterBillingTime.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterCTRatio.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterCompliantToStandards.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterConsumerAddress.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterConsumerCity.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterConsumerContactNumber.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterConsumerCountry.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterConsumerName.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterConsumerNumber.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterConsumerState.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterConsumerZipCode.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterDemandResetDate.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterDisconnector.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterInstallationLocation.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterLatitude.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterLongitude.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterMake.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterMaximumCurrent.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterNominalCurrent.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterNumberOfPhases.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterPTRatio.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterRatedFrequency.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterRatedVoltage.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterSerialNumber.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterVersion.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.MeterWiFiIpAddress.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterWiFiMacID.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.SealID.length !== insertNewMeterDetails.MeterSerialNumber.length) ||
                (insertNewMeterDetails.SolarPanel.length !== insertNewMeterDetails.MeterSerialNumber.length) || (insertNewMeterDetails.MeterWiFiAccessPointPassword.length !== insertNewMeterDetails.MeterSerialNumber.length)) {
                res.json({
                    "type": false,
                    "Message": "Failed to Upload: Invalid Length Content!!",
                    "PayloadErrors": "Field(s) length should be equal to MeterSerialNumber"
                });
            } else {

                var MacID = [];
                var SerialNumber = [];
                var dupConsumerNumber = [];
                let resultErrors = [];
                let resultErrors2 = [];
                let isMulticast;
                for (i = 0; i < (insertNewMeterDetails.MeterWiFiMacID).length; i++) {
                    MacID.push(insertNewMeterDetails.MeterWiFiMacID[i].toLowerCase());
                    SerialNumber.push(insertNewMeterDetails.MeterSerialNumber[i].toLowerCase());
                    dupConsumerNumber.push(insertNewMeterDetails.MeterConsumerNumber[i].toLowerCase())
                    isMulticast = duplicateItems.toCheckMulticastMACAddress(insertNewMeterDetails.MeterWiFiMacID[i].toLowerCase())
                    if(isMulticast == 1){
                        resultErrors2.push({ SerialNumber: insertNewMeterDetails.MeterSerialNumber[i], Status: 'Fail', Comment: `${i} ${insertNewMeterDetails.MeterWiFiMacID[i]} multicast WiFi Mac ID!!` });
                    }
                }
                var isDuplicate = duplicateItems.checkIfDuplicateExists(MacID)
                var isDuplicateSerialNumber = duplicateItems.checkIfDuplicateExists(SerialNumber)
                let isDuplicateConsumerNumber = duplicateItems.checkIfDuplicateExists(dupConsumerNumber)
                let dupMacIDs = duplicateItems.duplicateItems(MacID);
                let dupSerialNumbers = duplicateItems.duplicateItems(SerialNumber)
                let dupConsumerNos = duplicateItems.duplicateItems(dupConsumerNumber);
               
                if (isDuplicateSerialNumber) {
                    for (j in insertNewMeterDetails.MeterSerialNumber) {
                        if (dupSerialNumbers.includes(insertNewMeterDetails.MeterSerialNumber[j].toLowerCase())) {
                            resultErrors.push({ SerialNumber: insertNewMeterDetails.MeterSerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertNewMeterDetails.MeterSerialNumber[j]} duplicate Meter Serial Number!!` });

                        }
                    }

                    res.json({
                        "type": false,
                        "Message": "duplicate Meter Serial Number!!",
                        "Result": resultErrors
                    });

                } else if (isDuplicateConsumerNumber) {
                    for (j in insertNewMeterDetails.MeterConsumerNumber) {
                        if (dupConsumerNos.includes(insertNewMeterDetails.MeterConsumerNumber[j].toLowerCase())) {
                            resultErrors.push({ SerialNumber: insertNewMeterDetails.MeterSerialNumber[j], Status: 'Fail', Comment: insertNewMeterDetails.MeterConsumerNumber[j] + " duplicate Meter Consumer Number!!" });

                        }
                    }
                    res.json({
                        "type": false,
                        "Message": "duplicate Meter Consumer Number!!",
                        "Result": resultErrors
                    });

                }
                else if (isDuplicate) {
                    for (j in insertNewMeterDetails.MeterWiFiMacID) {
                        if (dupMacIDs.includes(insertNewMeterDetails.MeterWiFiMacID[j].toLowerCase())) {
                            resultErrors.push({ SerialNumber: insertNewMeterDetails.MeterSerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertNewMeterDetails.MeterWiFiMacID[j]} duplicate Mac ID!!` });
                        }
                    }
                    res.json({
                        "type": false,
                        "Message": "duplicate MAC ID !!",
                        "Result": resultErrors
                    });
                }else if(resultErrors2.length>0){
                    res.json({
                        "type": false,
                        "Message": "multicast MAC ID(s) not allowed!!",
                        "Result": resultErrors2
                    });
                }
                else {
                    for (var i in insertNewMeterDetails.MeterSerialNumber) {
                        insertNewMeterDetails.BiDirectional[i] = insertNewMeterDetails.BiDirectional[i].toLowerCase();
                        insertNewMeterDetails.EVMeter[i] = insertNewMeterDetails.EVMeter[i].toLowerCase();
                        insertNewMeterDetails.SolarPanel[i] = insertNewMeterDetails.SolarPanel[i].toLowerCase();
                        insertNewMeterDetails.MeterWiFiMacID[i] = insertNewMeterDetails.MeterWiFiMacID[i].toLowerCase();
                        insertNewMeterDetails.MeterBillingCycleDate[i] = parseInt(insertNewMeterDetails.MeterBillingCycleDate[i]);
                        insertNewMeterDetails.MeterDemandResetDate[i] = parseInt(insertNewMeterDetails.MeterDemandResetDate[i]);
                        
                        if ((insertNewMeterDetails.BiDirectional[i] === "true")) {
                            insertNewMeterDetails.BiDirectional[i] = true;
                        }
                        if ((insertNewMeterDetails.EVMeter[i] === "true")) {
                            insertNewMeterDetails.EVMeter[i] = true;
                        }
                        if ((insertNewMeterDetails.SolarPanel[i] === "true")) {
                            insertNewMeterDetails.SolarPanel[i] = true;
                        }
                        if ((insertNewMeterDetails.BiDirectional[i] === "false")) {
                            insertNewMeterDetails.BiDirectional[i] = false;
                        }
                        if ((insertNewMeterDetails.EVMeter[i] === "false")) {
                            insertNewMeterDetails.EVMeter[i] = false;
                        }
                        if ((insertNewMeterDetails.SolarPanel[i] === "false")) {
                            insertNewMeterDetails.SolarPanel[i] = false;
                        }
                    }
                    dbCmd.createNewMeterEntry(insertNewMeterDetails, function (err, result, Errors, resultErrors) {
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
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});



module.exports = router;