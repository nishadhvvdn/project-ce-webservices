var express = require('express');
var router = express.Router();
var unique = require('array-unique');
var dbCmd = require('../../data/dbCommandsRegistration.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');
const duplicateItems = require('../../config/Helpers/duplicateEntry')

router.post('/', function (req, res) {
    try {
        var insertHypersproutConfigurationDetails = req.body.insertHypersproutConfigurationDetails;
        if (insertHypersproutConfigurationDetails.Type == 'Upload') {
            if (insertHypersproutConfigurationDetails.DeviceType == 'HyperSprout' || insertHypersproutConfigurationDetails.DeviceType == 'HyperHub') {
                let insertHyperSproutConfigurationSchema = schema.uploadHyperSproutConfig;
                schemaValidation.validateSchema(insertHypersproutConfigurationDetails, insertHyperSproutConfigurationSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": err
                        });
                    } else if ((insertHypersproutConfigurationDetails.SerialNumber.length !== insertHypersproutConfigurationDetails.SerialNumber.length) || (insertHypersproutConfigurationDetails.RadioMode2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.ChannelWidth2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) || (insertHypersproutConfigurationDetails.Channel2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.TransmitPower2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) || (insertHypersproutConfigurationDetails.GuardInterval2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||(insertHypersproutConfigurationDetails.StreamSelection2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.RadioMode5_L.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.ChannelWidth5_L.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.Channel5_L.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.TransmitPower5_L.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.GuardInterval5_L.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.StreamSelection5_L.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.RadioMode5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.ChannelWidth5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.Channel5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.TransmitPower5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.GuardInterval5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.StreamSelection5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.MeshID2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SecurityType2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.PreSharedKey2_4.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.MeshID5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SecurityType5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.PreSharedKey5_H.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.HotspotStatus2_4_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SSID2_4_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.WirelessSecurity2_4_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.Password2_4_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.HotspotStatus2_4_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SSID2_4_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.WirelessSecurity2_4_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.Password2_4_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.HotspotStatus5_H_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SSID5_H_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.WirelessSecurity5_H_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||

                        (insertHypersproutConfigurationDetails.Password5_H_1.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.HotspotStatus5_H_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SSID5_H_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.WirelessSecurity5_H_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.Password5_H_2.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.DHCPStatus.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.StartAddress.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.EndAddress.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.PrimaryDNS.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SecondaryDNS.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.DefaultGateway.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||

                        (insertHypersproutConfigurationDetails.SubnetMask.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.UserName.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.Password.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SimPin.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.NetworkSelection.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.CarrierName.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.EthernetStatus.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||

                        (insertHypersproutConfigurationDetails.EthernetIPAddress.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||(insertHypersproutConfigurationDetails.EthernetStatus.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.EthernetPrimaryDNS.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.EthernetSecondaryDNS.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.EthernetDefaultGateway.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.EthernetSubnetMask.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||

                        (insertHypersproutConfigurationDetails.PrimaryBackhaul.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||(insertHypersproutConfigurationDetails.EthernetStatus.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.AutoSwitchOver.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.BandwidthStatus.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.DownloadBandwidth.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.UploadBandwidth.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.SystemName.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.Country.length !== insertHypersproutConfigurationDetails.SerialNumber.length) ||
                        (insertHypersproutConfigurationDetails.TimeZone.length !== insertHypersproutConfigurationDetails.SerialNumber.length)) {
                        res.json({
                            "type": false,
                            "Message": "Failed to Upload: Invalid Length Content!!",
                            "PayloadErrors": "Field(s) length should be equal to SerialNumber"
                        });
                    }
                    else {
                        var SerialNumber = [];
                        for (i = 0; i < (insertHypersproutConfigurationDetails.SerialNumber).length; i++) {
                            SerialNumber.push(insertHypersproutConfigurationDetails.SerialNumber[i].toLowerCase());
                        }
                        let isDuplicateSerialNumber = duplicateItems.checkIfDuplicateExists(SerialNumber)
                        let dupSerialNumbers = duplicateItems.duplicateItems(SerialNumber)
                        let resultErrors = [];
                        if (isDuplicateSerialNumber) {
                            for (j in insertHypersproutConfigurationDetails.SerialNumber) {
                                if (dupSerialNumbers.includes(insertHypersproutConfigurationDetails.SerialNumber[j].toLowerCase())) {
                                    resultErrors.push({ SerialNumber: insertHypersproutConfigurationDetails.SerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertHypersproutConfigurationDetails.SerialNumber[j]} duplicate  Serial Number!!` });
                                }
                            }
                            res.json({
                                "type": false,
                                "Message": "duplicate  Serial Number!!",
                                "Result": resultErrors
                            });
                        }
                        else {
                            for (var i in insertHypersproutConfigurationDetails.SerialNumber) {
                                insertHypersproutConfigurationDetails.SerialNumber[i] = insertHypersproutConfigurationDetails.SerialNumber[i];
                            }
                            dbCmd.UpdateHyperSproutConfig(insertHypersproutConfigurationDetails, function (err, result, Errors, resultErrors) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": err
                                    });
                                } else {
                                    unique(Errors);
                                    res.json({
                                        "type": true,
                                        "Message": result,
                                        "Errors": Errors,
                                        "Result": resultErrors
                                    });
                                }
                            });
                        }


                    }
                })

            }
        } else {
            res.json({
                "type": false,
                "Message": "invalid device Type"
            });
        }
        /* validate all mandatory fields */


    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});
module.exports = router;