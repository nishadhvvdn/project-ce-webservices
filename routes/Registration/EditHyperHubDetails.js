var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsHyperHub.js');
var editHSWifi = require('./EditTransformerHypersproutWifiChangeRequest.js');
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
            var updateHyperHubValues = req.body.updateHyperHubValues;
            updateHyperHubValues.WifiAccessPointPassword =(updateHyperHubValues.WifiAccessPointPassword)?updateHyperHubValues.WifiAccessPointPassword:"00000000";
            let hyperHubID = updateHyperHubValues.HyperHubID;
            let hubSerialNumber = updateHyperHubValues.HubSerialNumber;
            let hubName = updateHyperHubValues.HubName;
            let hardwareVersion = updateHyperHubValues.HardwareVersion;
            let gprsMacID = updateHyperHubValues.GprsMacID;
            let wifiMacID = updateHyperHubValues.WifiMacID;
            let wifiIPAddress = updateHyperHubValues.WifiIPAddress;
            let latitude = updateHyperHubValues.Latitude;
            let longitude = updateHyperHubValues.Longitude;
            let simCardNumber = updateHyperHubValues.SimCardNumber;
            let WifiAccessPointPassword = updateHyperHubValues.WifiAccessPointPassword;
            let hhWifiPassFlag = updateHyperHubValues.HHWifiPassFlag;
            let data = { hyperHubID, hubSerialNumber, hubName, hardwareVersion, gprsMacID, wifiMacID, wifiIPAddress, latitude, longitude, simCardNumber, WifiAccessPointPassword, hhWifiPassFlag }
            let updateHyperHubDetailsSchema = schema.updateHyperHubDetails;

            schemaValidation.validateSchema(data, updateHyperHubDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if (!(updateHyperHubValues.HyperHubID && updateHyperHubValues.HubSerialNumber
                    && updateHyperHubValues.HubName && updateHyperHubValues.HardwareVersion && updateHyperHubValues.HHWifiPassFlag &&
                    updateHyperHubValues.GprsMacID && updateHyperHubValues.WifiMacID && updateHyperHubValues.WifiIPAddress &&
                    updateHyperHubValues.SimCardNumber &&updateHyperHubValues.WifiAccessPointPassword  && updateHyperHubValues.Latitude && updateHyperHubValues.Longitude)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Edit: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                } else if (!(Object.keys(updateHyperHubValues).length === 12)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Edit: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                } else if (updateHyperHubValues.GprsMacID.toLowerCase() == updateHyperHubValues.WifiMacID.toLowerCase()) {
                    res.json({
                        "type": false,
                        "Message": "Duplicate Mac Id!",
                        "PayloadErrors": "GprsMacID and WifiMacID should not be same "
                    });
                } else if (updateHyperHubValues.HHWifiPassFlag === "Y") {
                    if (updateHyperHubValues.WifiAccessPointPassword === null) {
                        res.json({
                            "type": false,
                            "Message": "Access Point Password can't be null !!"
                        });
                    } else {
                        if (updateHyperHubValues.HyperHubID) {
                            updateHyperHubValues.HyperHubID = parseInt(updateHyperHubValues.HyperHubID)
                        }
                        updateHyperHubValues.HypersproutID = updateHyperHubValues.HyperHubID;
                        updateHyperHubValues.HSWiFiAccessPointPassword = updateHyperHubValues.WifiAccessPointPassword;

                        editHSWifi.EditHSWifiChangeDetails(updateHyperHubValues, function (err, result) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                updateHyperHubValues.WifiMacID = updateHyperHubValues.WifiMacID.toLowerCase();
                                updateHyperHubValues.GprsMacID = updateHyperHubValues.GprsMacID.toLowerCase();
                                dbCmd.updateHyperHubDetails(updateHyperHubValues, function (err, hyperHubDetailsUpdated) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": err
                                        });
                                    } else {
                                        res.json({
                                            "type": true,
                                            "Message": hyperHubDetailsUpdated
                                        });
                                    }
                                });
                            }
                        });
                    }
                } else {
                    if (updateHyperHubValues.HyperHubID) {
                        updateHyperHubValues.HyperHubID = parseInt(updateHyperHubValues.HyperHubID)
                    }
                    updateHyperHubValues.WifiMacID = updateHyperHubValues.WifiMacID.toLowerCase();
                    updateHyperHubValues.GprsMacID = updateHyperHubValues.GprsMacID.toLowerCase();
                    dbCmd.updateHyperHubDetails(updateHyperHubValues, function (err, hyperHubDetailsUpdated) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": hyperHubDetailsUpdated
                            });
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

module.exports = router;