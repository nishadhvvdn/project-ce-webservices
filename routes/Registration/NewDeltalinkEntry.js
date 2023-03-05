const express = require('express');
const router = express.Router();
const unique = require('array-unique');
const dbCmd = require('../../data/dbCommandsDeltalink.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deltalinkManagementSchema')
var _ = require('lodash');
const duplicateItems = require('../../config/Helpers/duplicateEntry')


router.post('/', function (req, res) {
    try {

        let insertNewDeltalinkEntry = req.body.insertNewDeltalinkEntry;
        let insertNewDeltalinkEntrySchema = schema.insertNewMeterDetails;
        schemaValidation.validateSchema(insertNewDeltalinkEntry, insertNewDeltalinkEntrySchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                let resultErrors = [];
                dbCmd.toCheckDuplicate(insertNewDeltalinkEntry.DeltalinkSerialNumber, "Deltalink Serial Number", function (err, isDuplicate) {
                    if (err) {
                        var valueArray = insertNewDeltalinkEntry.DeltalinkSerialNumber.map(function (item) { return item.toLowerCase(); });
                        let dupSerialNumber = duplicateItems.duplicateItems(valueArray);

                        for (j in insertNewDeltalinkEntry.DeltalinkSerialNumber) {
                            if (dupSerialNumber.includes(insertNewDeltalinkEntry.DeltalinkSerialNumber[j].toLowerCase())) {
                                resultErrors.push({ SerialNumber: insertNewDeltalinkEntry.DeltalinkSerialNumber[j], Status: 'Fail', Comment: `${j} ${insertNewDeltalinkEntry.DeltalinkSerialNumber[j]}  duplicate Deltalink  Serial Number!!` });
                            }
                        }
                        res.json({
                            "type": false,
                            "Message": err,
                            "Result": resultErrors

                        });
                    } else {
                        dbCmd.toCheckDuplicate(insertNewDeltalinkEntry.DeltalinkWiFiMacID, "Deltalink MacID", function (err, isDuplicate) {
                            if (err) {
                                var valueArray = insertNewDeltalinkEntry.DeltalinkWiFiMacID.map(function (item) { return item.toLowerCase(); });
                                let dupMacIDs = duplicateItems.duplicateItems(valueArray);
                                for (j in insertNewDeltalinkEntry.DeltalinkWiFiMacID) {
                                    if (dupMacIDs.includes(insertNewDeltalinkEntry.DeltalinkWiFiMacID[j].toLowerCase())) {
                                        resultErrors.push({ SerialNumber: insertNewDeltalinkEntry.DeltalinkSerialNumber[j], Status: 'Fail', Comment: ` ${j} ${insertNewDeltalinkEntry.DeltalinkWiFiMacID[j]} duplicate Mac ID!!` });
                                    }
                                }

                                res.json({
                                    "type": false,
                                    "Message": err,
                                    "Result": resultErrors

                                });
                            } else {
                                let isMulticast;
                                let resultErrors2 = []
                                for (j in insertNewDeltalinkEntry.DeltalinkSerialNumber) {
                                    isMulticast = duplicateItems.toCheckMulticastMACAddress(insertNewDeltalinkEntry.DeltalinkWiFiMacID[j].toLowerCase())
                                    if (isMulticast == 1) {
                                        resultErrors2.push({ SerialNumber: insertNewDeltalinkEntry.DeltalinkSerialNumber[j], Status: 'Fail', Comment: `${j} ${insertNewDeltalinkEntry.DeltalinkWiFiMacID[j]}  multicast WiFi Mac ID!!` });
                                    }

                                }
                                if (resultErrors2.length > 0) {
                                    res.json({
                                        "type": false,
                                        "Message": "multicast MAC ID(s) not allowed!!",
                                        "Result": resultErrors2

                                    });
                                } else {
                                    if (insertNewDeltalinkEntry.Bandwidth == undefined) {
                                        insertNewDeltalinkEntry.Bandwidth = [];
                                    } else {
                                        if (insertNewDeltalinkEntry.Bandwidth.length !== insertNewDeltalinkEntry.DeltalinkSerialNumber.length) {
                                            insertNewDeltalinkEntry.Bandwidth.length = insertNewDeltalinkEntry.DeltalinkSerialNumber.length;
                                        }
                                    }
                                    dbCmd.createNewDeltalinkEntry(insertNewDeltalinkEntry, function (err, result, Errors, resultErrors) {
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
                })

            }

        })

    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});
module.exports = router;