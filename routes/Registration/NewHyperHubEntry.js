var express = require('express');
var router = express.Router();
var unique = require('array-unique');
var dbCmd = require('../../data/dbCommandsHyperHub.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');
const duplicateItems = require('../../config/Helpers/duplicateEntry')

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
            // payload is not empty 

            var insertNewHyperHubDetails = req.body.insertNewHyperHubDetails;
            let type = insertNewHyperHubDetails.Type;
            let hubSerialNumber = insertNewHyperHubDetails.HubSerialNumber;
            let hubName = insertNewHyperHubDetails.HubName;
            let hardwareVersion = insertNewHyperHubDetails.HardwareVersion;
            let gprsMacID = insertNewHyperHubDetails.GprsMacID;
            let wifiMacID = insertNewHyperHubDetails.WifiMacID;
            let wifiIPAddress = insertNewHyperHubDetails.WifiIPAddress;
            let latitude = insertNewHyperHubDetails.Latitude;
            let longitude = insertNewHyperHubDetails.Longitude;
            let simCardNumber = insertNewHyperHubDetails.SimCardNumber;
            let WifiAccessPointPassword = insertNewHyperHubDetails.WifiAccessPointPassword;
            let GroupTransformerSerialNo = insertNewHyperHubDetails.GroupTransformerSerialNo;
            let data = { type, hubSerialNumber, hubName, hardwareVersion, gprsMacID, wifiMacID, wifiIPAddress, latitude, longitude, simCardNumber, WifiAccessPointPassword, GroupTransformerSerialNo }
            let insertNewHyperHubDetailsSchema = schema.insertNewHyperHubDetails;
            /* validate all mandatory fields */
            schemaValidation.validateSchema(data, insertNewHyperHubDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if ((insertNewHyperHubDetails.HubName.length !== insertNewHyperHubDetails.HubSerialNumber.length) || (insertNewHyperHubDetails.HardwareVersion.length !== insertNewHyperHubDetails.HubSerialNumber.length) ||
                    (insertNewHyperHubDetails.GprsMacID.length !== insertNewHyperHubDetails.HubSerialNumber.length) || (insertNewHyperHubDetails.WifiMacID.length !== insertNewHyperHubDetails.HubSerialNumber.length) ||
                    (insertNewHyperHubDetails.SimCardNumber.length !== insertNewHyperHubDetails.HubSerialNumber.length) ||
                    (insertNewHyperHubDetails.Latitude.length !== insertNewHyperHubDetails.HubSerialNumber.length) || (insertNewHyperHubDetails.Longitude.length !== insertNewHyperHubDetails.HubSerialNumber.length) || (insertNewHyperHubDetails.WifiAccessPointPassword.length !== insertNewHyperHubDetails.HubSerialNumber.length)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Upload: Invalid Length Content!!",
                        "PayloadErrors": "Field(s) length should be equal to HyperHub Serial Number"
                    });
                } else if (!(Object.keys(insertNewHyperHubDetails).length === 12)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Add/Upload: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                }
                else {
                    var dubMacID = [];
                    var dupHyperhubSerialNumber = [];
                    let isMulticast;
                    let resultErrors2 = [];
                    for (i = 0; i < (insertNewHyperHubDetails.GprsMacID).length; i++) {
                        dupHyperhubSerialNumber.push(insertNewHyperHubDetails.HubSerialNumber[i])
                        dubMacID.push(insertNewHyperHubDetails.GprsMacID[i]);
                        isMulticast = duplicateItems.toCheckMulticastMACAddress(insertNewHyperHubDetails.GprsMacID[i].toLowerCase())
                        if (isMulticast == 1) {
                            resultErrors2.push({ SerialNumber: insertNewHyperHubDetails.HubSerialNumber[i], Status: 'Fail', Comment: `${i} ${insertNewHyperHubDetails.GprsMacID[i]}  multicast Gprs Mac ID!!` });
                        }
                    }
                    for (i = 0; i < (insertNewHyperHubDetails.WifiMacID).length; i++) {
                        dubMacID.push(insertNewHyperHubDetails.WifiMacID[i]);
                        isMulticast = duplicateItems.toCheckMulticastMACAddress(insertNewHyperHubDetails.WifiMacID[i].toLowerCase())
                        if (isMulticast == 1) {
                            resultErrors2.push({ SerialNumber: insertNewHyperHubDetails.HubSerialNumber[i], Status: 'Fail', Comment: `${i} ${insertNewHyperHubDetails.WifiMacID[i]}  multicast Wifi Mac ID!!` });
                        }
                    }
                    var valueArr = dubMacID.map(function (item) { return item.toLowerCase() });
                    var isDuplicate = valueArr.some(function (item, idx) {
                        return valueArr.indexOf(item) != idx
                    });
                    var valuedupHyperhubSerialNumberArr = dupHyperhubSerialNumber.map(function (item) { return item.toLowerCase() });
                    var isDuplicateHyperhubSerialNumber = valuedupHyperhubSerialNumberArr.some(function (item, idx) {
                        return valuedupHyperhubSerialNumberArr.indexOf(item) != idx
                    });
                    let dupMacIDs = duplicateItems.duplicateItems(valueArr);
                    let dupSerialNumbers = duplicateItems.duplicateItems(valuedupHyperhubSerialNumberArr)
                    let resultErrors = [];
                    let resultErrors1 = [];

                    if (isDuplicateHyperhubSerialNumber) {
                        for (j in valuedupHyperhubSerialNumberArr) {
                            if (dupSerialNumbers.includes(valuedupHyperhubSerialNumberArr[j])) {
                                if (valuedupHyperhubSerialNumberArr[j] == insertNewHyperHubDetails.HubSerialNumber[j].toLowerCase()) {
                                    resultErrors.push({ SerialNumber: insertNewHyperHubDetails.HubSerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertNewHyperHubDetails.HubSerialNumber[j]}  duplicate Hyperhub Serial Number!!` });
                                }
                            }
                        }
                        res.json({
                            "type": false,
                            "Message": "duplicate Hyperhub Serial Number!!",
                            "Result": resultErrors

                        });
                    }
                    else if (isDuplicate) {
                        for (j in insertNewHyperHubDetails.GprsMacID) {
                            if (dupMacIDs.includes(insertNewHyperHubDetails.GprsMacID[j].toLowerCase()))
                                resultErrors.push({ SerialNumber: insertNewHyperHubDetails.HubSerialNumber[j], Status: 'Fail', Comment: `  ${j} ${insertNewHyperHubDetails.GprsMacID[j]}  duplicate  Gprs Mac ID!!` });

                        }
                        for (j in insertNewHyperHubDetails.WifiMacID) {
                            if (dupMacIDs.includes(insertNewHyperHubDetails.WifiMacID[j].toLowerCase())) {
                                resultErrors1.push({ SerialNumber: insertNewHyperHubDetails.HubSerialNumber[j], Status: 'Fail', Comment: `  ${j} ${insertNewHyperHubDetails.WifiMacID[j]}  duplicate  WiFi Mac ID!!` });

                            }
                        }
                        if (resultErrors.length > 0) {
                            res.json({
                                "type": false,
                                "Message": "duplicate  MAC ID !!",
                                "Result": resultErrors
                            });
                        } else {
                            res.json({
                                "type": false,
                                "Message": "duplicate MAC ID !!",
                                "Result": resultErrors1
                            });
                        }
                    } else if (resultErrors2.length > 0) {
                        res.json({
                            "type": false,
                            "Message": "multicast MAC ID(s) not allowed!!",
                            "Result": resultErrors2
                        });
                    } else {
                        for (var i in insertNewHyperHubDetails.HubSerialNumber) {

                            insertNewHyperHubDetails.WifiMacID[i] = insertNewHyperHubDetails.WifiMacID[i].toLowerCase();
                            insertNewHyperHubDetails.GprsMacID[i] = insertNewHyperHubDetails.GprsMacID[i].toLowerCase();
                           
                        }

                        dbCmd.createNewHyperHubEntry(insertNewHyperHubDetails, function (err, result, Errors, resultErrors) {
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