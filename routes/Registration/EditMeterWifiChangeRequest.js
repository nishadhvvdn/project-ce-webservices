var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var meterWifiEditReq = require('../../data/meterWifiEditRequest.js');
var sendtoiot = require('../../data/sendToiot.js');

function EditMeterWifiChangeDetails(updateMeterValues, callback) {
    try {
        var Action = "CONFIGURATION";
        var Attribute = "METER_WIFI";
        var rev = 0;
        var MeterID = updateMeterValues.MeterID;
        MeterID = parseInt(MeterID);
        var MeterWiFiAccessPointPassword = updateMeterValues.MeterWiFiAccessPointPassword;
        if (MeterWiFiAccessPointPassword === null) {
            callback("Access Point Password can't be null !!", null);
        } else {
            dbCmd.editMeterWifiDetails(MeterID, function (err, meterWifiDetails) {
                if (err) {
                    callback(err, null);
                } else {
                    var MeterSerialNumber = meterWifiDetails[0].MeterSerialNumber;
                    var ConnDisconnStatus = meterWifiDetails[0].ConnDisconnStatus;
                    var TransformerID = meterWifiDetails[0].TransformerID;
                    meterWifiDetails[0].Meters_DeviceDetails.CountryCode = (meterWifiDetails[0].Meters_DeviceDetails.CountryCode == null || meterWifiDetails[0].Meters_DeviceDetails.CountryCode == "null" || meterWifiDetails[0].Meters_DeviceDetails.CountryCode == undefined || meterWifiDetails[0].Meters_DeviceDetails.CountryCode == "") ? 0 : meterWifiDetails[0].Meters_DeviceDetails.CountryCode;
                    meterWifiDetails[0].Meters_DeviceDetails.RegionCode = (meterWifiDetails[0].Meters_DeviceDetails.RegionCode == null || meterWifiDetails[0].Meters_DeviceDetails.RegionCode == "null" || meterWifiDetails[0].Meters_DeviceDetails.RegionCode == undefined || meterWifiDetails[0].Meters_DeviceDetails.RegionCode == "") ? 0 : meterWifiDetails[0].Meters_DeviceDetails.RegionCode;
                    var CountryCode = meterWifiDetails[0].Meters_DeviceDetails.CountryCode;
                    var RegionCode = meterWifiDetails[0].Meters_DeviceDetails.RegionCode;
                    var DeviceID = meterWifiDetails[1];
                    var MessageID = meterWifiDetails[2];
                    if (MessageID === 255) {
                        MessageID = 0;
                    } else {
                        MessageID++;
                    }
                    // Checking if the Device is Disconnected
                    /*if (ConnDisconnStatus === "Disconnected") {
                        callback("Request Unsuccessfull due to Meter Status - Disconnected", null);
        
                    } else {*/
                    // sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                    //     if (err) {
                    //         callback("Error : Device not Connected", null);
                    //     } else {
                    //         if (status === "Connected") {
                                meterWifiEditReq.meterWifiEditReq(Action, Attribute, rev, MessageID, CountryCode, RegionCode, TransformerID,
                                    MeterID, DeviceID, MeterWiFiAccessPointPassword, MeterSerialNumber, function (err, resp) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            var JobID = resp;
                                            setTimeout(function () {
                                                dbCmd.MeterWifiPassRequestDelayed(MeterID, JobID, function (err, MeterWifiPassDelayed) {
                                                    if (err) {
                                                        //"Error handling the Delay in Response !!"
                                                        callback(err, null);
                                                    } else {
                                                        //"Delay in Response handled !!"
                                                        callback(null, MeterWifiPassDelayed);
                                                    }
                                                });
                                                //callback(null, resp);
                                            }, 30000);
                                        }
                                    });
                    //         } else {
                    //             callback("Request Unsuccessfull due to Meter Status - Disconnected", null);
                    //         }
                    //     }
                    // });
                    // }
                }
            });
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
}

module.exports = {
    EditMeterWifiChangeDetails: EditMeterWifiChangeDetails
}