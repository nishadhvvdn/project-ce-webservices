var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var hypersproutWifiEditReq = require('../../data/hypersproutWifiEditRequest.js');
var sendtoiot = require('../../data/sendToiot.js');

function EditHSWifiChangeDetails(updateTransformerHypersproutValues, callback) {
    try {
        var Action = "CONFIGURATION";
        var Attribute = "HYPERSPROUT_WIFI";
        var rev = 0;
        var HypersproutID = updateTransformerHypersproutValues.HypersproutID;
        HypersproutID = parseInt(HypersproutID);
        var HSWiFiAccessPointPassword = updateTransformerHypersproutValues.HSWiFiAccessPointPassword;
        var MeterID = 0;

        dbCmd.editHSWifiDetails(HypersproutID, function (err, HSWifiDetails) {
            if (err) {
                callback(err, null);
            } else {
                var HypersproutSerialNumber = HSWifiDetails[0].HypersproutSerialNumber;
                var Status = HSWifiDetails[0].Status;
                HSWifiDetails[0].Hypersprout_DeviceDetails.CountryCode = (HSWifiDetails[0].Hypersprout_DeviceDetails.CountryCode == "null" || HSWifiDetails[0].Hypersprout_DeviceDetails.CountryCode == null || HSWifiDetails[0].Hypersprout_DeviceDetails.CountryCode == undefined || HSWifiDetails[0].Hypersprout_DeviceDetails.CountryCode == "") ? 0 : HSWifiDetails[0].Hypersprout_DeviceDetails.CountryCode;
                HSWifiDetails[0].Hypersprout_DeviceDetails.RegionCode = (HSWifiDetails[0].Hypersprout_DeviceDetails.RegionCode == "null" || HSWifiDetails[0].Hypersprout_DeviceDetails.RegionCode == null || HSWifiDetails[0].Hypersprout_DeviceDetails.RegionCode == undefined || HSWifiDetails[0].Hypersprout_DeviceDetails.RegionCode == "") ? 0 : HSWifiDetails[0].Hypersprout_DeviceDetails.RegionCode;
                var CountryCode = HSWifiDetails[0].Hypersprout_DeviceDetails.CountryCode;
                var RegionCode = HSWifiDetails[0].Hypersprout_DeviceDetails.RegionCode;
                var DeviceID = HSWifiDetails[0].DeviceID;
                var MessageID = HSWifiDetails[1];
                var deviceType = "HyperSprout";
                if (HSWifiDetails[0].IsHyperHub)
                    deviceType = "Hyperhub";

                if ((MessageID === 255) || (MessageID === undefined)) {
                    MessageID = 0;
                } else {
                    MessageID++;
                }
                // Checking if the Device is Disconnected
                if (Status === "Registered") {
                    if (HSWiFiAccessPointPassword === null) {
                        callback("Access Point Password can't be null !!", null);
                    } else {
                        sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                            if (err) {
                                callback(err.name, null);
                            } else if (status === "Connected") {
                                hypersproutWifiEditReq.hypersproutWifiEditReq(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID,
                                    MeterID, DeviceID, HSWiFiAccessPointPassword, HypersproutSerialNumber, deviceType, function (err, resp) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            var JobID = resp;
                                            setTimeout(function () {
                                                dbCmd.HSWifiPassRequestDelayed(HypersproutID, JobID, function (err, HSWifiPassDelayed) {
                                                    if (err) {
                                                        //"Error handling the Delay in Response !!"
                                                        callback(err, null);
                                                    } else {
                                                        //"Delay in Response handled !!"
                                                        callback(null, HSWifiPassDelayed);
                                                    }
                                                });
                                                //callback(null, resp);
                                            }, 30000);
                                        }
                                    });
                            } else
                                callback("Error : Device not Connected", null);
                        });
                    }
                } else {
                    callback("Request Unsuccessfull due to HS Status - NotRegistered", null);

                }
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

module.exports = {
    EditHSWifiChangeDetails: EditHSWifiChangeDetails
}