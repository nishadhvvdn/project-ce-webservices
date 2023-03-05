var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsOnDemand.js');
var onDemandKwh = require('../../data/onDemandMeterKwH.js');
var sendtoiot = require('../../data/sendToiot.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MeterBulkOperationSchema')

router.post('/', function (req, res) {
    try {
        var Action = "COLLECTOR_DATA_UPLOAD";
        var Attribute = "ON_DEMAND_METER_DATA";
        var rev = 0;
        var MeterID = req.body.MeterID;
        const data = { MeterID }
        const getMeterKwhData = schema.getMeterKwH;
        schemaValidation.validateSchema(data, getMeterKwhData, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            }else{
                if (MeterID === null) {
                    res.json({
                        "type": false, "Message": "Invalid Request, Please try again after some time !!"
                    });
                }
                else {
                    MeterID = parseInt(MeterID);
                    dbCmd.MeterKwH(MeterID, function (err, meterKwHDetails) {
                        if (err) {
                            res.json({
                                "type": false, "Message": err
                            });
                        } else {
                            var MeterSerialNumber = meterKwHDetails[0].MeterSerialNumber;
                            var Status = meterKwHDetails[0].Status;
                            var HypersproutID = meterKwHDetails[0].HypersproutID;
                            var TransformerID = meterKwHDetails[0].TransformerID;
                            var CountryCode = meterKwHDetails[0].Meters_DeviceDetails.CountryCode != undefined ? meterKwHDetails[0].Meters_DeviceDetails.CountryCode : 0;
                            var RegionCode = meterKwHDetails[0].Meters_DeviceDetails.RegionCode != undefined ? meterKwHDetails[0].Meters_DeviceDetails.RegionCode : 0;
                            var DeviceID = meterKwHDetails[1];
                            var MessageID = meterKwHDetails[2];
                            if (MessageID === 255) {
                                MessageID = 0;
                            } else {
                                MessageID++;
                            }
                            if (Status === "NotRegistered") {
                                res.json({
                                    // Case II: "Meter Not Registered!!"
                                    "type": true, "Message": 3
                                });
            
                            } else {
                                sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                                    if (err) {
                                        res.json({
                                            "type": false, "Message": err.name != undefined ? err.name : err
                                        });
                                    } else {
                                        if (status === "Connected") {
                                            onDemandKwh.onDemandKwH(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID,
                                                MeterID, DeviceID, function (err, resp) {
                                                    if (err) {
                                                        res.json({
                                                            //"Message": "Connect to IoT failed !!"
                                                            "Type": false, "Message": 0
                                                        });
                                                    } else {
                                                        dbCmd.MeterKwHRequested(DeviceID, MessageID, MeterID, MeterSerialNumber, function (err, MeterKwHRequested) {
                                                            if (err) {
                                                                res.json({
                                                                    "type": false, "Message": err
                                                                });
                                                            } else {
                                                                res.json({
                                                                    //"Message": Request Sent to IoT
                                                                    "type": true, "Message": 1
                                                                });
                                                                var JobID = MeterKwHRequested;
                                                                setTimeout(function () {
                                                                    dbCmd.MeterKwHRequestDelayed(MeterID, JobID, function(err, response) { });
                                                                }, 50000);
            
                                                            }
                                                        });
                                                    }
                                                });
                                        } else {
                                            res.json({
                                                //Case III: "Meter Not Accessible !!"
                                                "type": true, "Message": 2
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;
