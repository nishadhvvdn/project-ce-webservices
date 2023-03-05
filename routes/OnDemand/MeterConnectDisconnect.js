var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsOnDemand.js');
var onDemDisConn = require('../../data/onDemandDisconnect.js');
var sendtoiot = require('../../data/sendToiot.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/MeterBulkOperationSchema');

router.post('/', function (req, res) {
    try {
        var MeterID = req.body.MeterID;
        var OnDemandType = req.body.OnDemandType;
        var Password = req.body.Password;

        var rev = 0;
        MeterID = parseInt(MeterID);
        const connectDisconnectDetailsSchema = schema.connectDisconnectDetails;
        const data = { MeterID, OnDemandType, Password };
        //Validate payload before uploading data
        schemaValidation.validateSchema(data, connectDisconnectDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }else{
                dbCmd.validatePassword(Password, function (err, data) {
                    if (err)
                        res.json({ "type": false, "Message": err });
                    else{
                        if (OnDemandType === "Disconnect") {
                            dbCmd.MeterConnDisconn(MeterID, function (err, meterConnDisconnDetails) {
                                if (err) {
                                    res.json({ "type": false, "Message": err });
                                } else {
                                    var MeterDisconnector = meterConnDisconnDetails[0].Meters_DeviceDetails.MeterDisconnector;
                                    if (MeterDisconnector === "No") {
                                        // Case I: "Meter not eligible for Online Disconnect!!"
                                        res.json({ "type": true, "Message": 0 });
                                    } else {
                                        var MeterSerialNumber = meterConnDisconnDetails[0].MeterSerialNumber;
                                        var DeviceID = meterConnDisconnDetails[1];
                                        var CountryCode = meterConnDisconnDetails[0].Meters_DeviceDetails.CountryCode != undefined ? meterConnDisconnDetails[0].Meters_DeviceDetails.CountryCode : 0;
                                        var RegionCode = meterConnDisconnDetails[0].Meters_DeviceDetails.RegionCode != undefined ? meterConnDisconnDetails[0].Meters_DeviceDetails.RegionCode : 0;
                                        var MeterMeterAdminPassword = meterConnDisconnDetails[0].Meters_Communications.MeterAdminPassword;
                                        var ConnDisconnStatus = meterConnDisconnDetails[0].ConnDisconnStatus;
                                        var Action = "ACTION_FOR_DEVICE";
                                        var Attribute = "METER_DISCONNECT";
                                        var STATUS_CODE = "2"; // "AA4"
                                        var HypersproutID = meterConnDisconnDetails[0].HypersproutID;
                                        var TransformerID = meterConnDisconnDetails[0].TransformerID;
                                        var MessageID = meterConnDisconnDetails[2];

                                        if (MessageID === 255) {
                                            MessageID = 0;
                                        } else {
                                            MessageID++;
                                        }
                                        if (ConnDisconnStatus === "Disconnected") {
                                            // Case II: "Meter already Disconnect!!"
                                            res.json({ "type": true, "Message": 1 });
                                        } else {
                                            sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                                                if (err) {
                                                    res.json({ "type": false, "Message": err.name != undefined ? err.name : err });
                                                } else {
                                                    if (status === "Connected") {
                                                        onDemDisConn.onDemDisConn(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID,
                                                            MeterID, STATUS_CODE, MeterMeterAdminPassword, DeviceID, function (err, resp) {
                                                                if (err) {
                                                                    //Case II: "Connect to IoT failed !!"
                                                                    res.json({ "Type": false, "Message": 2 });
                                                                } else {
                                                                    dbCmd.MeterConnDisconnInitiated(MeterID, OnDemandType, DeviceID, MessageID, MeterSerialNumber, function (err, meterConnDisconnInitiated) {
                                                                        if (err) {
                                                                            res.json({ "type": false, "Message": err });
                                                                        } else {
                                                                            //Case III: "Disconnect Request successsfully sent to IoT"
                                                                            res.json({ "type": true, "Message": 3 });
                                                                            var JobID = meterConnDisconnInitiated;
                                                                            setTimeout(function () {
                                                                                dbCmd.MeterConnDisconnDelayed(MeterID, JobID, function (err, responses) { });
                                                                            }, 180000);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                    } else {
                                                        //Case III: "Meter Not Accessible !!"
                                                        res.json({ "type": true, "Message": 4 });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                        else {
                            //OnDemandType = Connect
                            dbCmd.MeterConnDisconn(MeterID, function (err, meterConnDisconnDetails) {
                                if (err) {
                                    res.json({
                                        "type": false, "Message": err
                                    });
                                } else {
                                    var MeterDisconnector = meterConnDisconnDetails[0].Meters_DeviceDetails.MeterDisconnector;
                                    if (MeterDisconnector === "No") {
                                        res.json({
                                            // Case I: "Meter not eligible for Online Disconnect!!"
                                            "type": true, "Message": 0
                                        });
                                    } else {
                                        var ConnDisconnStatus = meterConnDisconnDetails[0].ConnDisconnStatus;
                                        var Action = "ACTION_FOR_DEVICE";
                                        var Attribute = "METER_CONNECT";
                                        var STATUS_CODE = "1"; //"AA3"
                                        var TransformerID = meterConnDisconnDetails[0].TransformerID;
                                        var DeviceID = meterConnDisconnDetails[1];
                                        var CountryCode = meterConnDisconnDetails[0].Meters_DeviceDetails.CountryCode != undefined ? meterConnDisconnDetails[0].Meters_DeviceDetails.CountryCode : 0;
                                        var RegionCode = meterConnDisconnDetails[0].Meters_DeviceDetails.RegionCode != undefined ? meterConnDisconnDetails[0].Meters_DeviceDetails.RegionCode : 0;
                                        var MeterMeterAdminPassword = meterConnDisconnDetails[0].Meters_Communications.MeterAdminPassword;
                                        var MessageID = meterConnDisconnDetails[2];
                                        var MeterSerialNumber = meterConnDisconnDetails[0].MeterSerialNumber;
                                        var HypersproutID = meterConnDisconnDetails[0].HypersproutID;

                                        if (MessageID === 255) {
                                            MessageID = 0;
                                        } else {
                                            MessageID++;
                                        }
                                        if (ConnDisconnStatus === "Connected") {
                                            res.json({
                                                // Case II: "Meter already Disconnect!!"
                                                "type": true, "Message": 1
                                            });

                                        } else {
                                            sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                                                if (err) {
                                                    res.json({
                                                        "type": false, "Message": err.name != undefined ? err.name : err
                                                    });
                                                } else {
                                                    if (status === "Connected") {
                                                        onDemDisConn.onDemDisConn(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID,
                                                            MeterID, STATUS_CODE, MeterMeterAdminPassword, DeviceID, function (err, resp) {
                                                                if (err) {
                                                                    res.json({
                                                                        //Case II: "Failed to Connect to IoT !!"
                                                                        "Type": false, "Message": 2
                                                                    });
                                                                } else {
                                                                    dbCmd.MeterConnDisconnInitiated(MeterID, OnDemandType, DeviceID, MessageID, MeterSerialNumber, function (err, meterConnDisconnInitiated) {
                                                                        if (err) {
                                                                            res.json({
                                                                                "type": false,
                                                                                "Message": err
                                                                            });
                                                                        } else {
                                                                            res.json({
                                                                                //Case III: "Connect Request successsfully sent to IoT"
                                                                                "type": true, "Message": 3
                                                                            });
                                                                            var JobID = meterConnDisconnInitiated;
                                                                            setTimeout(function () {
                                                                                dbCmd.MeterConnDisconnDelayed(MeterID, JobID, function (err, responses) { });
                                                                            }, 180000);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                    } else {
                                                        res.json({
                                                            //Case III: "Meter Not Accessible !!"
                                                            "type": true, "Message": 4
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }

                });
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
