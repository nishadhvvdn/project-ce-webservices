var express = require('express');
var router = express.Router();
var dbCmd = require('../data/dbCommandsBandwidthLimitaion.js');
const schemaValidation = require('../config/Helpers/payloadValidation')
const schema = require('../config/Helpers/bandwidthLimitaions')
const unique = require('array-unique');


router.post('/', function (req, res) {
    try {
        /* validate all mandatory fields */

        let deviceId = parseInt(req.body.deviceId);
        let serialNumber = req.body.serialNumber;
        let ConfigType = req.body.ConfigType;
        let Type = req.body.Type;
        let DeviceType = req.body.DeviceType;
        let saveConfigDetails = req.body.saveConfigDetails;
        let Status = saveConfigDetails.Status;
        let BandwidthFlag = saveConfigDetails.BandwidthFlag;
        let DownloadBandwidth = saveConfigDetails.DownloadBandwidth;
        let UploadBandwidth = saveConfigDetails.UploadBandwidth;
        let bandwidthData = { deviceId, serialNumber, ConfigType, Type, Status, DeviceType, DownloadBandwidth, UploadBandwidth, BandwidthFlag }
        let bandwidthLimitationSchema;
        switch (DeviceType) {
            case "Meter": bandwidthLimitationSchema = schema.meterBandwidthLimitations;
                break;
            case "HyperSprout": bandwidthLimitationSchema = schema.hsBandwidthLimitations;
                break;
            case "HyperHub": bandwidthLimitationSchema = schema.hsBandwidthLimitations;
                break;
            default:
                bandwidthLimitationSchema = schema.hsBandwidthLimitations
        }
        schemaValidation.validateSchema(bandwidthData, bandwidthLimitationSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                bandwidthData.Status = parseInt(bandwidthData.Status);
                bandwidthData.DownloadBandwidth = parseInt(bandwidthData.DownloadBandwidth);
                bandwidthData.UploadBandwidth = parseInt(bandwidthData.UploadBandwidth);
                if (bandwidthData.Status == 0) {
                    bandwidthData.DownloadBandwidth = 1;
                    bandwidthData.UploadBandwidth = 1;
                }
                bandwidthData.config_time = parseInt(Date.now()/1000);

                if (BandwidthFlag == "Y") {
                    dbCmd.editBandwidthChangeDetails(bandwidthData, function (err, result) {
                        if (err) {
                            dbCmd.editBandwidthDetails(bandwidthData, function (err, DetailsUpdated, Errors) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": err
                                    });
                                } else {
                                    unique(Errors);
                                    res.json({
                                        "type": true,
                                        "Message": DetailsUpdated,
                                        "Errors": Errors
                                    });
                                }
                            });
                        } else {
                            dbCmd.editBandwidthDetails(bandwidthData, function (err, DetailsUpdated, Errors) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": err
                                    });
                                } else {
                                    unique(Errors);
                                    res.json({
                                        "type": true,
                                        "Message": DetailsUpdated,
                                        "Errors": Errors
                                    });
                                }
                            });
                        }
                    });
                } else {
                    dbCmd.editBandwidthDetails(bandwidthData, function (err, DetailsUpdated, Errors) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            unique(Errors);
                            res.json({
                                "type": true,
                                "Message": DetailsUpdated,
                                "Errors": Errors
                            });
                        }
                    });
                }


            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message,
        });
    }

});


module.exports = router;