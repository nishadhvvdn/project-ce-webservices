var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var sendtoiot = require('../../data/sendToiot.js');
var transformerDeregisterReq = require('../../data/transformerDeregister.js');


function removeTransformerFromCircuitRequest(removeTransformerFromCircuitValues, callback) {
    try {
        var Action = "COLLECTOR_DEREGISTER";
        var Attribute = "HYPERSPROUT_DELETE";
        var rev = 0;
        var MeterID = 0;
        var TID = [];

        for (var j in removeTransformerFromCircuitValues.TransformerID) {
            if (removeTransformerFromCircuitValues.TransformerID.hasOwnProperty(j)) {
                TID.push(removeTransformerFromCircuitValues.TransformerID[j]);
            }
        }
        for (var i in TID) {
            if (TID.hasOwnProperty(i)) {
                dbCmd.removeTransFromCircuitDetails(TID[i], function (err, TransformerDetails) {
                    if (err) {
                        callback(err, null);
                    } else {
                        // Checking if the Device is Registered
                        if (TransformerDetails[0].Status === "Registered") {
                            var HypersproutSerialNumber = TransformerDetails[0].HypersproutSerialNumber;
                            var TID = TransformerDetails[0].HypersproutID;
                            var Status = TransformerDetails[0].Status;
                            TransformerDetails[0].Hypersprout_DeviceDetails.CountryCode = (TransformerDetails[0].Hypersprout_DeviceDetails.CountryCode == null || TransformerDetails[0].Hypersprout_DeviceDetails.CountryCode == "null" || TransformerDetails[0].Hypersprout_DeviceDetails.CountryCode == undefined || TransformerDetails[0].Hypersprout_DeviceDetails.CountryCode == "") ? 0 : TransformerDetails[0].Hypersprout_DeviceDetails.CountryCode;
                            TransformerDetails[0].Hypersprout_DeviceDetails.RegionCode = (TransformerDetails[0].Hypersprout_DeviceDetails.RegionCode == null || TransformerDetails[0].Hypersprout_DeviceDetails.RegionCode == "null" || TransformerDetails[0].Hypersprout_DeviceDetails.RegionCode == undefined || TransformerDetails[0].Hypersprout_DeviceDetails.RegionCode == "") ? 0 : TransformerDetails[0].Hypersprout_DeviceDetails.RegionCode;
                            var CountryCode = TransformerDetails[0].Hypersprout_DeviceDetails.CountryCode;
                            var RegionCode = TransformerDetails[0].Hypersprout_DeviceDetails.RegionCode;
                            var DeviceID = TransformerDetails[0].DeviceID;
                            var MessageID = TransformerDetails[1];

                            if ((MessageID === 255) || (MessageID === null) || (MessageID === undefined)) {
                                MessageID = 0;
                            } else {
                                MessageID++;
                            }
                            transformerDeregisterReq.transformerDeregisterReq(Action, Attribute, rev, MessageID, CountryCode, RegionCode, TID,
                                MeterID, DeviceID, HypersproutSerialNumber, function (err, resp) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, "Request to Device Sent !!");
                                    }
                                });
                        } else {
                            callback(null, "Request Unsuccessfull due to HS Status - NotRegistered");

                        }
                    }
                });
            }
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}

module.exports = {
    removeTransformerFromCircuitRequest: removeTransformerFromCircuitRequest
}