var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var meterDeregister = require('../../data/meterDeregister.js');
var meterNodePing = require('../../data/dbCommandsMeterNodePing.js');
var sendtoiot = require('../../data/sendToiot.js');
var forEach = require('async-foreach').forEach;
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
                "PayloadErrors": "Empty payload"
            });
        } else {
            if ((!req.body.removeMeterFromTransformerValues) || (typeof req.body.removeMeterFromTransformerValues != "object")) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!"
                });
            } else {

                var removeMeterFromTransformerValues = req.body.removeMeterFromTransformerValues;
                var selectedMeterData = removeMeterFromTransformerValues.SelectedMeterID;
                var isForceGrouping = removeMeterFromTransformerValues.IsForceGrouping;
                var NoOfMeters = 0;
                var meterid;
                var response = {};
                var Action = "MAC_ACL";
                var Attribute = "MAC_ACL_DEREGISTER";
                var rev = 0;
                var TransformerID = Object.keys(selectedMeterData)[0];
                let MeterID = selectedMeterData[TransformerID]
                let data = { TransformerID, MeterID, isForceGrouping }
                let removeMeterFromTransformerValuesSchema = schema.removeMeterFromTransformerValues;
                schemaValidation.validateSchema(data, removeMeterFromTransformerValuesSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": err
                        });
                    } else {
                        var hypersproutIDs = Object.keys(selectedMeterData);
                        HypersproutID = parseInt(hypersproutIDs[0]);
                        // Removing foreach as this is not the right way for giving response using settimeout. confirmed with UI only one HS will come
                        // forEach(hypersproutIDs, function (HypersproutID, index) {
                        //var done = this.async();
                        //HypersproutID = parseInt(HypersproutID);
                        let MID = selectedMeterData[HypersproutID]
                        dbCmd.meterTransformerValidation(HypersproutID, MID, function (err, MeterDetails) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                let MData = JSON.parse(JSON.stringify(MeterDetails));
                                var sendMacs = [];
                                Object.keys(MData).forEach(function (k) {
                                    Object.keys(MData[k]).forEach(function (v) {
                                        if (v == 'meterMac') {
                                            MData[k][v] = MData[k][v].replace(/:/g, "");
                                            sendMacs.push(MData[k][v]);
                                        }
                                    });
                                });
                                dbCmd.meterUnGroupDetails(HypersproutID, function (err, meterUnGroupFetched) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": err
                                        });
                                    } else {
                                        if (meterUnGroupFetched.length > 0) {
                                            meterid = selectedMeterData[HypersproutID];
                                            NoOfMeters = selectedMeterData[HypersproutID].length;
                                            var Status = meterUnGroupFetched[0].Status;
                                            meterUnGroupFetched[0].Hypersprout_DeviceDetails.CountryCode = (meterUnGroupFetched[0].Hypersprout_DeviceDetails.CountryCode == "null" || meterUnGroupFetched[0].Hypersprout_DeviceDetails.CountryCode == null || meterUnGroupFetched[0].Hypersprout_DeviceDetails.CountryCode == undefined || meterUnGroupFetched[0].Hypersprout_DeviceDetails.CountryCode == "") ? 0 : meterUnGroupFetched[0].Hypersprout_DeviceDetails.CountryCode;
                                            meterUnGroupFetched[0].Hypersprout_DeviceDetails.RegionCode = (meterUnGroupFetched[0].Hypersprout_DeviceDetails.RegionCode == "null" || meterUnGroupFetched[0].Hypersprout_DeviceDetails.RegionCode == null || meterUnGroupFetched[0].Hypersprout_DeviceDetails.RegionCode == undefined || meterUnGroupFetched[0].Hypersprout_DeviceDetails.RegionCode == "") ? 0 : meterUnGroupFetched[0].Hypersprout_DeviceDetails.RegionCode;
                                            var CountryCode = meterUnGroupFetched[0].Hypersprout_DeviceDetails.CountryCode;
                                            var RegionCode = meterUnGroupFetched[0].Hypersprout_DeviceDetails.RegionCode;
                                            var DeviceID = meterUnGroupFetched[0].DeviceID;
                                            var MessageID = meterUnGroupFetched[1];
                                            var TransformerID = meterUnGroupFetched[0].TransformerID;

                                            if (Status === "Registered") {
                                                sendtoiot.checkDeviceConnectionState(meterUnGroupFetched[0].DeviceID, function (err, status) {

                                                    if (status == 'Connected' && !isForceGrouping) {

                                                        if ((MessageID === 255) || (MessageID === null) || (MessageID === undefined)) {
                                                            MessageID = 0;
                                                        } else {
                                                            MessageID++;
                                                        }


                                                        meterNodePing.checkMultipleMeterConnection(meterUnGroupFetched, MeterDetails, rev, MessageID, CountryCode, RegionCode, HypersproutID, DeviceID, function (err, meterStatus, connectedMeters, disconnectedMeters) {

                                                            if (connectedMeters.length) {

                                                                meterDeregister.meterDeregister(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID, DeviceID, NoOfMeters, meterid, sendMacs, function (err, resp) {
                                                                    if (err) {
                                                                        res.json({
                                                                            "Type": false,
                                                                            //"Message": "Connect to IoT failed !!"
                                                                            "Message": 0
                                                                        });

                                                                    } else {
                                                                        dbCmd.removeMeterFromTransformer(meterid, TransformerID, removeMeterFromTransformerValues, function (err, meterFromTransformerRemoved) {
                                                                            if (err) {
                                                                                res.json({
                                                                                    "type": false,
                                                                                    "Message": err
                                                                                });
                                                                            } else {
                                                                                if (disconnectedMeters.length == 0) {
                                                                                    res.json({
                                                                                        "type": true,
                                                                                        "Message": meterFromTransformerRemoved,
                                                                                        "ForceUngrouping": null
                                                                                    });
                                                                                } else {
                                                                                    res.json({
                                                                                        "type": true,
                                                                                        "Message": meterFromTransformerRemoved,
                                                                                        "ForceUngrouping": meterStatus
                                                                                    });
                                                                                }
                                                                            }

                                                                        });
                                                                    }

                                                                });
                                                            } else {
                                                                res.json({
                                                                    "type": true,
                                                                    "Message": "Meters are offline",
                                                                    "ForceUngrouping": meterStatus
                                                                })
                                                            }
                                                        });
                                                    } else if (status == 'Connected' & isForceGrouping) {
                                                        meterDeregister.meterDeregister(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID, DeviceID, NoOfMeters, meterid, sendMacs, function (err, resp) {
                                                            if (err) {
                                                                res.json({
                                                                    "Type": false,
                                                                    //"Message": "Connect to IoT failed !!"
                                                                    "Message": 0
                                                                });
                                                            } else {
                                                                dbCmd.removeMeterFromTransformer(meterid, TransformerID, removeMeterFromTransformerValues, function (err, meterFromTransformerRemoved) {
                                                                    if (err) {
                                                                        res.json({
                                                                            "type": false,
                                                                            "Message": err
                                                                        });
                                                                    } else {
                                                                        // if (index === hypersproutIDs.length - 1) {
                                                                        res.json({
                                                                            "type": true,
                                                                            "Message": meterFromTransformerRemoved,
                                                                            "ForceUngrouping": null
                                                                        });
                                                                        // }
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    } else if (status == 'Disconnected' && !isForceGrouping) {
                                                        res.json({
                                                            "type": false,
                                                            "Message": "Hypersprout is Disconnected",
                                                            "ForceUngrouping": null
                                                        });
                                                    } else if (status == 'Disconnected' && isForceGrouping) {
                                                        meterDeregister.meterDeregister(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID, DeviceID, NoOfMeters, meterid, sendMacs, function (err, resp) {
                                                            if (err) {
                                                                res.json({
                                                                    "Type": false,
                                                                    //"Message": "Connect to IoT failed !!"
                                                                    "Message": 0
                                                                });
                                                            } else {
                                                                dbCmd.removeMeterFromTransformer(meterid, TransformerID, removeMeterFromTransformerValues, function (err, meterFromTransformerRemoved) {
                                                                    if (err) {
                                                                        res.json({
                                                                            "type": false,
                                                                            "Message": err
                                                                        });
                                                                    } else {
                                                                        // if (index === hypersproutIDs.length - 1) {
                                                                        res.json({
                                                                            "type": true,
                                                                            "Message": meterFromTransformerRemoved,
                                                                            "ForceUngrouping": null
                                                                        });
                                                                        // }
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.json({
                                                            "type": false,
                                                            "Message": "Something Went Wrong!!"
                                                        });
                                                    }
                                                });
                                            } else {
                                                dbCmd.removeMeterFromTransformer(meterid, TransformerID, removeMeterFromTransformerValues, function (err, meterFromTransformerRemoved) {
                                                    if (err) {
                                                        res.json({
                                                            "type": false,
                                                            "Message": err
                                                        });
                                                    } else {
                                                        //if (index === hypersproutIDs.length - 1) {
                                                            res.json({
                                                                "type": true,
                                                                "Message": meterFromTransformerRemoved,
                                                            });
                                                      //  }
                                                    }
                                                });
                                            }
                                        } else {
                                            res.json({
                                                "type": false,
                                                "Message": "No Details for Hypersprout !!"
                                            });
                                        }

                                    }
                                });
                            }
                            // setTimeout(done, 2000);
                        })
                        // });
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



