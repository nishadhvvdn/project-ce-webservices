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
        var insertMeterConfigurationDetails = req.body.insertMeterConfigurationDetails;
        if (insertMeterConfigurationDetails.DeviceType == 'Meter'&& insertMeterConfigurationDetails.Type=='Upload') {
            let insertmetereConfigurationSchema = schema.uploadMeterConfig;
            schemaValidation.validateSchema(insertMeterConfigurationDetails, insertmetereConfigurationSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if ((insertMeterConfigurationDetails.SerialNumber.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.RadioMode.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.RadioMode.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.ChannelWidth.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.Channel.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.TransmitPower.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.RadioBand.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.StreamSelection.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.PrimaryMeshID.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.PrimarySecurityType.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.SecondarySecurityType.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.PrimaryMacAddress.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.PrimarySerialNumber.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.PrimaryDeviceType.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.SecondaryMacAddress.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.SecondarySerialNumber.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.SecondaryDeviceType.length !== insertMeterConfigurationDetails.SerialNumber.length) ||

                    (insertMeterConfigurationDetails.SSID.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.WirelessSecurity.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.DHCPStatus.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.StartAddress.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.EndAddress.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.PrimaryDNS.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.SecondaryDNS.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.DefaultGateway.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.SubnetMask.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.UtilityID.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.CertificateNumber.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.CircuitID.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.ESN.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.BandwidthStatus.length !== insertMeterConfigurationDetails.SerialNumber.length) || (insertMeterConfigurationDetails.DownloadBandwidth.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.SystemName.length !== insertMeterConfigurationDetails.SerialNumber.length) ||
                    (insertMeterConfigurationDetails.TimeZone.length !== insertMeterConfigurationDetails.SerialNumber.length)) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Upload: Invalid Length Content!!",
                        "PayloadErrors": "Field(s) length should be equal to SerialNumber"
                    });
                }
                else {
                    var SerialNumber = [];
                    for (i = 0; i < (insertMeterConfigurationDetails.SerialNumber).length; i++) {
                        SerialNumber.push(insertMeterConfigurationDetails.SerialNumber[i].toLowerCase());
                    }
                    let isDuplicateSerialNumber = duplicateItems.checkIfDuplicateExists(SerialNumber)
                    let dupSerialNumbers = duplicateItems.duplicateItems(SerialNumber)
                    let resultErrors = [];
                    if (isDuplicateSerialNumber) {
                        for (j in insertMeterConfigurationDetails.SerialNumber) {
                            if (dupSerialNumbers.includes(insertMeterConfigurationDetails.SerialNumber[j].toLowerCase())) {
                                resultErrors.push({ SerialNumber: insertMeterConfigurationDetails.SerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertMeterConfigurationDetails.SerialNumber[j]} duplicate Meter Serial Number!!` });
                            }
                        }
                        res.json({
                            "type": false,
                            "Message": "duplicate Meter Serial Number!!",
                            "Result": resultErrors
                        });
                    }
                    else {
                        for (var i in insertMeterConfigurationDetails.SerialNumber) {
                            insertMeterConfigurationDetails.SerialNumber[i] = insertMeterConfigurationDetails.SerialNumber[i].toLowerCase();
                        }
                        dbCmd.UpdateMeterConfig(insertMeterConfigurationDetails, function (err, result, Errors, resultErrors) {
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