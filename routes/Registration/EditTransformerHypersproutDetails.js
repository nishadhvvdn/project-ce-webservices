var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var editHSWifi = require('./EditTransformerHypersproutWifiChangeRequest.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');
const sendToIot = require('../../data/sendToiot');
const sms = require('../../data/sendSmsAZ.js')



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
            let updateTransformerHypersproutValues = req.body.updateTransformerHypersproutValues;
            updateTransformerHypersproutValues.HSWiFiAccessPointPassword = (updateTransformerHypersproutValues.HSWiFiAccessPointPassword)?updateTransformerHypersproutValues.HSWiFiAccessPointPassword:"00000000";
            updateTransformerHypersproutValues.HSSensorDetails = (updateTransformerHypersproutValues.HSSensorDetails)?updateTransformerHypersproutValues.HSSensorDetails:"0";

            let updateTransformerHypersproutValuesSchema = schema.updateTransformerHypersproutValues;
            schemaValidation.validateSchema(updateTransformerHypersproutValues, updateTransformerHypersproutValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if (!((updateTransformerHypersproutValues.TransformerID) && (updateTransformerHypersproutValues.HypersproutID) &&
                    (updateTransformerHypersproutValues.TFMRSerialNumber) && (updateTransformerHypersproutValues.TFMRMake) &&
                    (updateTransformerHypersproutValues.TFMRRatingCapacity) && (updateTransformerHypersproutValues.TFMRHighLineVoltage) &&
                    (updateTransformerHypersproutValues.TFMRLowLineVoltage) && (updateTransformerHypersproutValues.TFMRHighLineCurrent) &&
                    (updateTransformerHypersproutValues.TFMRLowLineCurrent) && (updateTransformerHypersproutValues.TFMRType) &&
                    (updateTransformerHypersproutValues.HypersproutSerialNumber) && (updateTransformerHypersproutValues.HypersproutVersion) &&
                    (updateTransformerHypersproutValues.HypersproutMake) && (updateTransformerHypersproutValues.HSCTRatio) &&
                    (updateTransformerHypersproutValues.HSPTRatio) && (updateTransformerHypersproutValues.HSRatedVoltage) &&
                    (updateTransformerHypersproutValues.HSNumberOfPhases) && (updateTransformerHypersproutValues.HSRatedFrequency) &&
                    (updateTransformerHypersproutValues.HSAccuracy) && (updateTransformerHypersproutValues.HSDemandResetDate) &&
                    (updateTransformerHypersproutValues.HSCompliantToStandards) && (updateTransformerHypersproutValues.HSMaxDemandWindow) &&
                    (updateTransformerHypersproutValues.HSMaxDemandSlidingWindowInterval) &&
                    (updateTransformerHypersproutValues.HSGPRSMacID) && (updateTransformerHypersproutValues.HSWiFiMacID) &&
                    (updateTransformerHypersproutValues.HSWiFiIpAddress) && (updateTransformerHypersproutValues.HSSimCardNumber) &&
                    (updateTransformerHypersproutValues.HSLatitude) && (updateTransformerHypersproutValues.HSLongitude) &&
                    (updateTransformerHypersproutValues.WireSize) && (updateTransformerHypersproutValues.MaxOilTemp) &&
                    (updateTransformerHypersproutValues.MinOilTemp) && (updateTransformerHypersproutValues.HSWifiPassFlag) &&
                    (updateTransformerHypersproutValues.CameraConnect))) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Edit: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                } else if (updateTransformerHypersproutValues.HSGPRSMacID.toLowerCase() == updateTransformerHypersproutValues.HSWiFiMacID.toLowerCase()) {
                    res.json({
                        "type": false,
                        "Message": "Duplicate Mac Id!",
                        "PayloadErrors": "HSGPRSMacID and HSWiFiMacID should not be same "
                    });
                } else {
                    dbCmd.isTransformerVerified(updateTransformerHypersproutValues.HypersproutSerialNumber, function(err, isVerfied) {
                        if(err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            if(isVerfied) {
                                updateTransformerHypersproutValues.isVerfied = true;
                                updateTransformer(updateTransformerHypersproutValues,function (err, result) {
                                if(err) {
                                    res.json({
                                        "type": false,
                                        "Message": err
                                    })
                                }
                                else {
                                    res.json({
                                        "type": true,
                                        "Message":result

                                    });
                                }
                            })
                         } else {
                                if(updateTransformerHypersproutValues.otp) {
                                    dbCmd.verifyOtpInHypersproutUpdate(updateTransformerHypersproutValues.HypersproutSerialNumber, updateTransformerHypersproutValues.otp, function (err, response) {
                                        if(err) {
                                            console.log('verify', err);
                                            res.json({
                                                "type": false,
                                                "Message": err
                                            });
                                        } else {
                                            if(response) {
                                                dbCmd.checkIfDeviceRegistered([updateTransformerHypersproutValues], [], function(err, returnArray) {
                                                    if(err.length) {
                                                        console.log('checkdevice',err);
                                                        res.json({
                                                            "type": false,
                                                            "Message": err
                                                        })
                                                    } else {
                                                        let SakDeviceID = "HS-" + updateTransformerHypersproutValues.HypersproutSerialNumber;
                                                        sendToIot.checkDeviceConnectionSAS(SakDeviceID, function (err, status) {
                                                            if(err) {
                                                                console.log('sak', err);
                                                                res.json({
                                                                    "type": false,
                                                                    "Message": err
                                                                })
                                                            } else {
                                                                dbCmd.updateConfigAfterVerification(updateTransformerHypersproutValues.HypersproutSerialNumber, status, function (err, response) {
                                                                    if(err) {
                                                                        console.log('update config', err);
                                                                        res.json({
                                                                            "type": false,
                                                                            "Message": err
                                                                        })                                                                    
                                                                    } else {
                                                                        dbCmd.pushBootstrapData(updateTransformerHypersproutValues.HypersproutSerialNumber, status, function (err, bootstrapResult) {
                                                                            if(err) {
                                                                                console.log('psh bootstrap', err);
                                                                                res.json({
                                                                                    "type": false,
                                                                                    "Message": err
                                                                                }); 
                                                                            } else {
                                                                                updateTransformerHypersproutValues.isVerfied = true;
                                                                                updateTransformer(updateTransformerHypersproutValues, function (err, result) {
                                                                                    if(err) {
                                                                                        res.json({
                                                                                            "type": false,
                                                                                            "Message": err
                                                                                        })
                                                                                    }
                                                                                    else {
                                                                                        res.json({
                                                                                            "type": true,
                                                                                            "Message":result
            
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        });
                                                    }
                                                })
                                            } else {
                                                res.json({
                                                    "type": false,
                                                    "Message": "Verification failed, OTP doesn't match"
                                                });
                                            }
                                        }
                                    });
                                } else if (updateTransformerHypersproutValues.otp === null || updateTransformerHypersproutValues.otp === '') {
                                    /* OTP generation and SMS for OTP */
                                    if(req.session.user.MobileNumber == undefined || null){
                                        res.json({
                                            "type": false,
                                            "Message": "Please Add Mobile Number to Edit a Transformer"
                                        })
                                    }
                                    let toMobile = req.session.user.MobileNumber;
                                    let otp = Math.floor(1000 + Math.random() * 9000);                                  
                                    let messageData = {
                                            from: process.env.AzSmsNumber,
                                            to: toMobile,
                                            message: "OTP Verification for Delta Account " + otp
                                        }
                                    sms.sendSms(messageData, function(err, success) {
                                        if(err) {
                                            callbackEach(err)
                                        } else {
                                            console.log(success);
                                        }
                                    });
                                    dbCmd.updateOtpInHypersproupt(updateTransformerHypersproutValues.HypersproutSerialNumber, otp, function(err, response) {
                                        if(err) {
                                            res.json({
                                                "type": false,
                                                "Message": err
                                            })
                                        } else {
                                            console.log(response);
                                            res.json({
                                                "type": true,
                                                "Message": 'Please complete the two-factor authentication flow in order to update transformer details.',
                                                 "result":response
                                            })
                                        }
                                    })
                                } else {
                                    res.json({
                                        "type": false,
                                        "Message": "Verification code missing"
                                    })
                                }
                            }
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

function updateTransformer(updateTransformerHypersproutValues,callback) {
    if (updateTransformerHypersproutValues.TransformerID && updateTransformerHypersproutValues.HypersproutID) {
        updateTransformerHypersproutValues.TransformerID = parseInt(updateTransformerHypersproutValues.TransformerID);
        updateTransformerHypersproutValues.HypersproutID = parseInt(updateTransformerHypersproutValues.HypersproutID);
    }
    if (updateTransformerHypersproutValues.HSWifiPassFlag === "Y") {
        editHSWifi.EditHSWifiChangeDetails(updateTransformerHypersproutValues, function (err, result) {
            if (err) {
                callback(err,null)
            }
            else {
                dbCmd.editTransformerHypersproutDetails(updateTransformerHypersproutValues, function (err, transformerHypersproutDetailsUpdated) {
                    if (err) {
                        callback(err,null)
                    } else {
                        console.log("RESULTTTT:::",transformerHypersproutDetailsUpdated);
                        callback(null,transformerHypersproutDetailsUpdated)
                    }
                });
            }
        });
    } else {
        if (updateTransformerHypersproutValues.TransformerID && updateTransformerHypersproutValues.HypersproutID) {
            updateTransformerHypersproutValues.TransformerID = parseInt(updateTransformerHypersproutValues.TransformerID);
            updateTransformerHypersproutValues.HypersproutID = parseInt(updateTransformerHypersproutValues.HypersproutID);
        }
        dbCmd.editTransformerHypersproutDetails(updateTransformerHypersproutValues, function (err, transformerHypersproutDetailsUpdated) {
            if (err) {
                callback (err,null)
            } else {
                console.log("RESULTTTT:::",transformerHypersproutDetailsUpdated);
                callback (null,transformerHypersproutDetailsUpdated) 
            }
        });
    }
}

module.exports = router;
