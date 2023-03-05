var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')
let deltlinkDeregister = require('../../data/deltalinkDeregister');
const unique = require('array-unique');

router.post('/', function (req, res) {
    var removeDeltalinkFromMeterValues = req.body.removeDeltalinkFromMeterValues;
    removeDeltalinkFromMeterValues.MeterID = parseInt(removeDeltalinkFromMeterValues.MeterID)
    // map() return a new array of DeltalinkID having only integer values and  integerValue function return an Integer values
    removeDeltalinkFromMeterValues.DeltalinkID = (removeDeltalinkFromMeterValues.DeltalinkID).map(integerValue);
    let meterID = removeDeltalinkFromMeterValues.MeterID;
    let deltalinkId = removeDeltalinkFromMeterValues.DeltalinkID;
    let data = { meterID, deltalinkId }
    let addDeltalinkToMeterValuesSchema = schema.removeDeltalinkFromMeterValues;
    var Action = "MAC_ACL";
    var Attribute = "MAC_ACL_DEREGISTER";
    var rev = 0;
    schemaValidation.validateSchema(data, addDeltalinkToMeterValuesSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!"
            });
        } else {
            dbCmd.deltalinkMeterValidation(meterID, deltalinkId, function (err, AlreadyUngroupedMeter) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err
                    });
                } else {
                    let DLData = JSON.parse(JSON.stringify(AlreadyUngroupedMeter.deltalinkId));
                    var sendMacs = [];
                    var DLid = [];
                    Object.keys(DLData).forEach(function (k) {
                        Object.keys(DLData[k]).forEach(function (v) {
                            if (v == 'DeltalinkMac'){
                                DLData[k][v] = DLData[k][v].replace(/:/g, "");
                                sendMacs.push(DLData[k][v]);
                            }else if(v == 'DeltalinkID'){
                                DLid.push(DLData[k][v]);
                            }
                        });
                    });
                    if (AlreadyUngroupedMeter.deltalinkId.length > 0) {
                        // let deltalinkID = AlreadyUngroupedMeter.deltalinkId;
                        let deltalinkID = DLid;
                        dbCmd.deltalinkUnGroupDetails(meterID, function (err, deltalinkUnGroupFetched) {
                            if(err == "Sucesss"){
                                dbCmd.removeDeltalinkFromMeter(deltalinkID, meterID, function (err, deltalinkFromMeterRemoved) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": err
                                        });
                                    } else {
                                        res.json({
                                            "type": true,
                                            "Message": deltalinkFromMeterRemoved,
                                            "Errors": AlreadyUngroupedMeter.errorFinal
                                        });

                                    }

                                });
                            }
                            else if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                if (deltalinkUnGroupFetched.length > 0) {
                                    NoOfDeltalink = deltalinkID.length;
                                    var hsCount = deltalinkUnGroupFetched.length;
                                    var i = 0;
                                    deltalinkUnGroupFetched.forEach(function (deltalinkUnGroupFetch) {
                                        var Status = deltalinkUnGroupFetch.Status;
                                        var CountryCode = deltalinkUnGroupFetch.Hypersprout_DeviceDetails.CountryCode;
                                        var RegionCode = deltalinkUnGroupFetch.Hypersprout_DeviceDetails.RegionCode;
                                        var DeviceID = deltalinkUnGroupFetch.DeviceID;
                                        var MessageID = deltalinkUnGroupFetch.MessageID;
                                        var HypersproutID = deltalinkUnGroupFetch.HypersproutID;

                                        if ((MessageID === 255) || (MessageID === null) || (MessageID === undefined)) {
                                            MessageID = 0;
                                        } else {
                                            MessageID++;
                                        }
                                        if (Status === "Registered") {
                                            deltlinkDeregister.deltlinkDeregister(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID, DeviceID, NoOfDeltalink, deltalinkID, sendMacs, function (err, resp) {
                                                if (err) {
                                                    res.json({
                                                        "Type": false,
                                                        //"Message": "Connect to IoT failed !!"
                                                        "Message": err
                                                    });

                                                } else {
                                                    i++;
                                                    if (i == hsCount) {
                                                        dbCmd.removeDeltalinkFromMeter(deltalinkID, meterID, function (err, deltalinkFromMeterRemoved) {
                                                            if (err) {
                                                                res.json({
                                                                    "type": false,
                                                                    "Message": err
                                                                });
                                                            } else {
                                                                res.json({
                                                                    "type": true,
                                                                    "Message": deltalinkFromMeterRemoved,
                                                                    "Errors": AlreadyUngroupedMeter.errorFinal
                                                                });

                                                            }

                                                        });
                                                    }
                                                }

                                            });
                                        } else {
                                            dbCmd.removeDeltalinkFromMeter(deltalinkID, meterID, function (err, deltalinkFromMeterRemoved) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": err
                                                    });
                                                } else {
                                                    res.json({
                                                        "type": true,
                                                        "Message": deltalinkFromMeterRemoved,
                                                        "Errors": AlreadyUngroupedMeter.errorFinal
                                                    });

                                                }
                                            });
                                        }
                                    });
                                } else {
                                    dbCmd.removeDeltalinkFromMeter(deltalinkID, meterID, function (err, deltalinkFromMeterRemoved) {
                                        if (err) {
                                            res.json({
                                                "type": false,
                                                "Message": err
                                            });
                                        } else {
                                            res.json({
                                                "type": true,
                                                "Message": deltalinkFromMeterRemoved,
                                                "Errors": AlreadyUngroupedMeter.errorFinal
                                            });

                                        }

                                    });
                                }
                            }
                        })
                    }else{
                        res.json({
                            "type": false,
                            "Message": "Unable to unlink Deltalink",
                            "Errors": AlreadyUngroupedMeter.errorFinal
                        });
                    }
                    
                }
            })
        }
    }) 
      
});

// function return an Integer values

function integerValue(x) {
    return parseInt(x);
}

module.exports = router;