const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeltalink.js');
const deltalinkBandwidthEditReq = require('../../data/deltalinkBandwidthRequest.js');
const sendtoiot = require('../../data/sendToiot.js');

function EditDeltalinkBandwidthChangeDetails(updateDeltalinkValues, callback) {
    try {
        let action = "CONFIGURATION";
        let attribute = "DELTALINK_BANDWIDTH";
        let rev = 0;
        let deltalinkID = updateDeltalinkValues.DeltalinkID;
        let deltalinkBandwidth = updateDeltalinkValues.Bandwidth;
        let deltalinkDownloadBandwidth = updateDeltalinkValues.DownloadBandwidth;
        let deltalinkUploadBandwidth = updateDeltalinkValues.UploadBandwidth;
        if (deltalinkBandwidth === null || deltalinkDownloadBandwidth == null || deltalinkUploadBandwidth == null) {
            callback("Bandwidth can't be null !!", null);
        } else {
            dbCmd.editDeltalinkBandwidthDetails(deltalinkID, function (err, deltalinkDetails) {
                if (err) {
                    callback(err, null);
                } else {
                    let deltalinkSerialNumber = deltalinkDetails[0].DeltalinkSerialNumber;
                    let connDisconnStatus = deltalinkDetails[0].ConnDisconnStatus;
                    let meterID = deltalinkDetails[0].MeterID;
                    let countryCode = deltalinkDetails[0].DeltaLinks_DeviceDetails.CountryCode;
                    countryCode = (countryCode == "undefined" || countryCode == undefined || countryCode == "null" || countryCode == null || countryCode == "") ? 0 : countryCode;
                    let regionCode = deltalinkDetails[0].DeltaLinks_DeviceDetails.RegionCode;
                    regionCode = (regionCode == "undefined" || regionCode == undefined || regionCode == "null" || regionCode == null || regionCode == "") ? 0 : regionCode;
                    let deviceID = deltalinkDetails[1];
                    let transformerID = deltalinkDetails[2]
                    let messageID = deltalinkDetails[3];
                    if (messageID === 255) {
                        messageID = 0;
                    } else {
                        messageID++;
                    }
                    sendtoiot.checkDeviceConnectionState(deviceID, function (err, status) {
                        if (err) {
                            callback("Error : Device not Connected", null);
                        } else {
                            if (status === "Connected") {
                                deltalinkBandwidthEditReq.deltalinkBandwidthEditReq(action, attribute, rev, messageID, countryCode, regionCode, transformerID, meterID, deltalinkID
                                    , deviceID, deltalinkBandwidth, deltalinkDownloadBandwidth, deltalinkUploadBandwidth, deltalinkSerialNumber, function (err, resp) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            var JobID = resp;
                                            setTimeout(function () {
                                                dbCmd.DetalinkBandwidthRequestDelayed(deltalinkID, JobID, function (err, DeltalinkBandwidthDelayed) {
                                                    if (err) {
                                                        //"Error handling the Delay in Response !!"
                                                        callback(err, null);
                                                    } else {
                                                        //"Delay in Response handled !!"
                                                        callback(null, DeltalinkBandwidthDelayed);
                                                    }
                                                });
                                            }, 8000);
                                        }
                                    });
                            } else {
                                callback("Request Unsuccessfull due to Deltalink Status - Disconnected", null);
                            }
                        }
                    });
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
    EditDeltalinkBandwidthChangeDetails: EditDeltalinkBandwidthChangeDetails
}