var express = require('express');
var router = express.Router();
var unique = require('array-unique');
var dbCmd = require('../../data/dbCommandsRegistration.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');
const duplicateItems = require('../../config/Helpers/duplicateEntry')



router.post('/', function (req, res) {
    let toMob = req.session.user.MobileNumber;
    if(req.session.user.MobileNumber == undefined || null){
        res.json({
            "type": false,
            "Message": "Please Add Mobile Number to Add a New Transformer"
        })
    }
    try {
        let insertNewTransformerHypersproutDetails = req.body.insertNewTransformerHypersproutDetails;
        let insertNewTransformerHypersproutDetailsSchema = schema.insertNewTransformerHypersproutDetails;
        /* validate all mandatory fields */
        schemaValidation.validateSchema(insertNewTransformerHypersproutDetails, insertNewTransformerHypersproutDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else if ((insertNewTransformerHypersproutDetails.TFMRSerialNumber.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.TFMRMake.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.TFMRRatingCapacity.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.TFMRHighLineVoltage.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.TFMRLowLineVoltage.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.TFMRHighLineCurrent.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.TFMRLowLineCurrent.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.TFMRType.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HypersproutSerialNumber.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HypersproutVersion.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HypersproutMake.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSCTRatio.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSPTRatio.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSRatedVoltage.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSNumberOfPhases.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSRatedFrequency.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSAccuracy.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSDemandResetDate.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSCompliantToStandards.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSMaxDemandWindow.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSMaxDemandSlidingWindowInterval.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSGPRSMacID.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSWiFiMacID.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSWiFiIpAddress.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSSimCardNumber.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSLatitude.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.HSLongitude.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.WireSize.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.MaxOilTemp.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.MinOilTemp.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) ||
                (insertNewTransformerHypersproutDetails.CameraConnect.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSWiFiAccessPointPassword.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length) || (insertNewTransformerHypersproutDetails.HSSensorDetails.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length || insertNewTransformerHypersproutDetails.TFMRName.length !== insertNewTransformerHypersproutDetails.TFMRSerialNumber.length)) {
                res.json({
                    "type": false,
                    "Message": "Failed to Upload: Invalid Length Content!!",
                    "PayloadErrors": "Field(s) length should be equal to TFMRSerialNumber"
                });
            }
            else {
                var dubMACID = [];
                var dubTransformerSerialNumber = [];
                var dubHypersproutSerialNumber = [];
                let resultErrors = [];
                let resultErrors1 = [];  
                let   resultErrors2 = [];
                let isMulticast;            
                
                /*  flowType introduced to decide which flow we have to proceed
                    0 is for bulk upload flow
                    1 is for first time add where OTP is null or empty string
                    2 is for second time add where OTP shoud have value
                */
                let flowType = 0;

                if((insertNewTransformerHypersproutDetails.otp == '' || insertNewTransformerHypersproutDetails.otp == null) && insertNewTransformerHypersproutDetails.Type == 'Add')
                {
                    flowType = 1;
                } else if(insertNewTransformerHypersproutDetails.otp && insertNewTransformerHypersproutDetails.Type == 'Add') {
                    flowType = 2;
                }
                
                for (i = 0; i < (insertNewTransformerHypersproutDetails.HSGPRSMacID).length; i++) {
                    dubMACID.push(insertNewTransformerHypersproutDetails.HSGPRSMacID[i]);
                    dubTransformerSerialNumber.push(insertNewTransformerHypersproutDetails.TFMRSerialNumber[i]);
                    dubHypersproutSerialNumber.push(insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i])
                    isMulticast = duplicateItems.toCheckMulticastMACAddress(insertNewTransformerHypersproutDetails.HSGPRSMacID[i].toLowerCase())
                    if(isMulticast == 1){
                        resultErrors2.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: 'Fail', Comment: `${i} ${insertNewTransformerHypersproutDetails.HSGPRSMacID[i]}  multicast Gprs Mac ID!!` });
                    }

                }
                for (i = 0; i < (insertNewTransformerHypersproutDetails.HSWiFiMacID).length; i++) {
                    dubMACID.push(insertNewTransformerHypersproutDetails.HSWiFiMacID[i]);
                    isMulticast = duplicateItems.toCheckMulticastMACAddress(insertNewTransformerHypersproutDetails.HSWiFiMacID[i].toLowerCase())
                    if(isMulticast == 1){
                        resultErrors2.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: 'Fail', Comment: `${i} ${insertNewTransformerHypersproutDetails.HSWiFiMacID[i]}  multicast WiFi Mac ID!!` });
                    }
                }

                var valueArr = dubMACID.map(function (item) { return item.toLowerCase(); });
                var isDuplicate = valueArr.some(function (item, idx) {
                    return valueArr.indexOf(item) != idx
                });
                var valuedubTransformerSerialNumber = dubTransformerSerialNumber.map(function (item) { return item.toLowerCase(); });
                var isDuplicatedubTransformerSerialNumber = valuedubTransformerSerialNumber.some(function (item, idx) {
                    return valuedubTransformerSerialNumber.indexOf(item) != idx
                });
                var valuedubHypersproutSerialNumber = dubHypersproutSerialNumber.map(function (item) { return item.toLowerCase(); });
                var isDuplicatedubHypersproutSerialNumber = valuedubHypersproutSerialNumber.some(function (item, idx) {
                    return valuedubHypersproutSerialNumber.indexOf(item) != idx
                });
                let dupMacIDs = duplicateItems.duplicateItems(valueArr);
                let dupTFRSerialNumbers = duplicateItems.duplicateItems(valuedubTransformerSerialNumber);
                let dupHSSerialNumbers = duplicateItems.duplicateItems(valuedubHypersproutSerialNumber);
            
                if (isDuplicatedubTransformerSerialNumber) {
                    for (j in valuedubTransformerSerialNumber) {
                        if (dupTFRSerialNumbers.includes(valuedubTransformerSerialNumber[j])) {
                            if (valuedubTransformerSerialNumber[j] == insertNewTransformerHypersproutDetails.TFMRSerialNumber[j].toLowerCase()) {
                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertNewTransformerHypersproutDetails.TFMRSerialNumber[j]} duplicate Transformer Serial Number!!` });
                            }
                        }
                    }
                    res.json({
                        "type": false,
                        "Message": "duplicate Transformer Serial Number !!",
                        "Result": resultErrors

                    });
                } else if (isDuplicatedubHypersproutSerialNumber) {
                    for (j in valuedubHypersproutSerialNumber) {
                        if (dupHSSerialNumbers.includes(valuedubHypersproutSerialNumber[j])) {
                            if (valuedubHypersproutSerialNumber[j] == insertNewTransformerHypersproutDetails.HypersproutSerialNumber[j].toLowerCase()) {
                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.HypersproutSerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertNewTransformerHypersproutDetails.HypersproutSerialNumber[j]}  duplicate Hypersprout  Serial Number!!` });
                            }
                        }
                    }
                    res.json({
                        "type": false,
                        "Message": "duplicate Hypersprout Serial Number !!",
                        "Result": resultErrors
                    });
                } else if (isDuplicate) {
                    for (j in insertNewTransformerHypersproutDetails.HSGPRSMacID) {
                        if (dupMacIDs.includes(insertNewTransformerHypersproutDetails.HSGPRSMacID[j].toLowerCase()))
                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[j], Status: 'Fail', Comment: `  ${j} ${insertNewTransformerHypersproutDetails.HSGPRSMacID[j]}  duplicate GPRS Mac ID!!` });

                    }
                    for (j in insertNewTransformerHypersproutDetails.HSWiFiMacID) {
                        if (dupMacIDs.includes(insertNewTransformerHypersproutDetails.HSWiFiMacID[j].toLowerCase())) {
                            resultErrors1.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[j], Status: 'Fail', Comment: `  ${j} ${insertNewTransformerHypersproutDetails.HSWiFiMacID[j]}  duplicate Wifi Mac ID!!` });

                        }
                    }
                    if (resultErrors.length > 0) {
                        res.json({
                            "type": false,
                            "Message": "duplicate MAC ID !!",
                            "Result": resultErrors
                        });
                    } else {
                        res.json({
                            "type": false,
                            "Message": "duplicate MAC ID !!",
                            "Result": resultErrors1
                        });
                    }
                }else if(resultErrors2.length>0){
                    res.json({
                        "type": false,
                        "Message": "multicast MAC ID(s) not allowed!!",
                        "Result": resultErrors2
                    });
                }
                else {
                    for (var i in insertNewTransformerHypersproutDetails.TFMRSerialNumber) {
                        insertNewTransformerHypersproutDetails.CameraConnect[i] = insertNewTransformerHypersproutDetails.CameraConnect[i].toLowerCase();
                        insertNewTransformerHypersproutDetails.HSWiFiMacID[i] = insertNewTransformerHypersproutDetails.HSWiFiMacID[i].toLowerCase();
                        insertNewTransformerHypersproutDetails.HSGPRSMacID[i] = insertNewTransformerHypersproutDetails.HSGPRSMacID[i].toLowerCase();
                        insertNewTransformerHypersproutDetails.HSDemandResetDate[i] = parseInt(insertNewTransformerHypersproutDetails.HSDemandResetDate[i])

                        if ((insertNewTransformerHypersproutDetails.CameraConnect &&
                            insertNewTransformerHypersproutDetails.CameraConnect[i] === "true")) {
                            insertNewTransformerHypersproutDetails.CameraConnect[i] = true;
                        }

                        if ((insertNewTransformerHypersproutDetails.CameraConnect[i] === "false")) {
                            insertNewTransformerHypersproutDetails.CameraConnect[i] = false;
                        }
                    }
                    dbCmd.createNewTransformerHypersproutEntry(insertNewTransformerHypersproutDetails, req.sessionID,toMob, flowType, function (err, result, Errors, resultErrors) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            unique(Errors);
                            if(flowType == 1 && resultErrors[0].Status == 'Pass') {
                                resultErrors[0].Otpmessage = 'OTP generated successfully';
                                result=result.concat(" ",'Two-factor authentication is required to complete the transformer end-to-end process.')
                            }
                            if(flowType == 2 && result == 'Transformer Details Successfully Added!') {
                                Errors = [];
                                let validResult = resultErrors[0];
                                validResult.Status = 'Pass';
                                validResult.Comment = 'OTP verified successfully & Details Added';
                                resultErrors = [validResult];
                            } else if(flowType == 2 && result == 'Failed: OTP does not match!'){
                                Errors=[result]
                                result=[]
                                let validResult = resultErrors[0];
                                validResult.Status = 'Fail';
                                validResult.Comment = 'OTP Does not match';
                                resultErrors = [validResult];
                            }
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
