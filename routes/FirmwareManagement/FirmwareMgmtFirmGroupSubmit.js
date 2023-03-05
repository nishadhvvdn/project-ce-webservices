var express = require('express');
var router = express.Router();
var dbCmdFrm = require('../../data/dbCommandsFirmware.js');
var dbCmd = require('../../data/dbFirmwareUpload');
var sendtoiot = require('../../data/sendToiot.js');
var async = require('async');
var schema = require('../../config/Helpers/ResendFirmwareMgmtSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');

router.post('/', function (req, res) {
    try {
        var DeviceType = req.body.DeviceType;
        var Firmware = parseInt(req.body.Firmware);
        var Group = parseInt(req.body.Group);
        var CardType = req.body.CardType;
        var Url = req.body.Url;
        let firmwareMgmtFirmGroupSubmitSchema = schema.firmwareMgmtFirmwareGroupSubmit;
        let data = { DeviceType, Firmware, Group, CardType, Url }
        schemaValidation.validateSchema(data, firmwareMgmtFirmGroupSubmitSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            } else {
                if(Url.indexOf('.zip') == -1){
                    res.json({
                        "type": false,
                        "Message": "Only .zip file allowed in Url"
                    });
                } else {
                    var NoOfMeters = 0;
                    var NoOfDeltalinks = 0;
                    var Attribute = "START_FIRMWARE_UPDATE";
                    var rev = 0;
                    let Action;
                    if (CardType === "iNC") {
                        Action = "COLLECTOR_FIRMWARE_UPGRADE";
                    } else if (CardType === "MeshCard") {
                        Action = 'METER_FIRMWARE_UPGRADE';
                    } else if (CardType === "MeterCard") {
                        Action = 'METERCARD_FIRMWARE_UPGRADE';
                    } else if (CardType == 'DeltaLink') {
                        Action = 'DELTALINK_FIRMWARE_UPGRADE'
                    } else if (CardType == "Cellular") {
                        Action = 'CELLULAR_FIRMWARE_UPGRADE'
                    } else if (CardType == "Bluetooth") {
                        Action = 'BLUETOOTH_FIRMWARE_UPGRADE'
                    }
                    else {
                        Action = "ITM_FIRMWARE_UPGRADE";
                    }
                    dbCmdFrm.createFirmwareJob(CardType, Firmware, Group, function (err, hypersproutMeterData) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message != undefined ? err.message : err,
                            });
                        } else {
                            dbCmdFrm.fetchFirmwareData(Firmware, function (err, FwData) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": err.message != undefined ? err.message : err,
                                    });
                                } else {
                                    if (FwData[0].Url != undefined || FwData[0].Url != null) {
                                        Url = FwData[0].Url;
                                        async.each(hypersproutMeterData,
                                            function (firmwareData, callbackEach) {
                                                if (firmwareData.MessageID === 255) {
                                                    firmwareData.MessageID = 0;
                                                } else {
                                                    firmwareData.MessageID++;
                                                }
                                                sendtoiot.checkDeviceConnectionState(firmwareData.DeviceID, function (err, status) {
                                                    if (err) {
                                                        callbackEach(err.name != undefined ? err.name : err, null);
                                                    } else {
                                                        // if(status == 'Connected'){
                                                        //     if (firmwareData.MeterList) {
                                                        //         NoOfMeters = firmwareData.MeterList.length;
                                                        //     }
                                                        //     if (firmwareData.DeltaLinkList) {
                                                        //         NoOfDeltalinks = firmwareData.DeltaLinkList.length;
                                                        //     }
                                                        //     if (CardType == "DeltaLink") {
                                                        //         dbCmd.onDeltalinkFirmwareUpload(Action, Attribute, rev, firmwareData.MessageID, firmwareData.CountryCode, firmwareData.RegionCode, firmwareData.CELLID,
                                                        //             firmwareData.MeterID, firmwareData.DeviceID, Url, firmwareData.DeltaLinkList, NoOfDeltalinks, firmwareData.SerialNumber, function (err, resp) {
                                                        //                 if (err) {
                                                        //                     callbackEach(err, null);
                                                        //                 } else {
                                                        //                     callbackEach(null, true);
                                                        //                 }
                                                        //             });
                                                        //     } else {
                                                        //         dbCmd.onFirmwareUpload(Action, Attribute, rev, firmwareData.MessageID, firmwareData.CountryCode, firmwareData.RegionCode, firmwareData.CELLID,
                                                        //             firmwareData.MeterID, firmwareData.DeviceID, Url, firmwareData.MeterList, NoOfMeters, firmwareData.SerialNumber, function (err, resp) {
                                                        //                 if (err) {
                                                        //                     callbackEach(err, null);
                                                        //                 } else {
                                                        //                     callbackEach(null, true);
                                                        //                 }
                                                        //             });
                                                        //     }
                                                        // }else{
                                                        //     //Device is not connected
                                                        //     dbCmdFrm.updateFirmwareJob(firmwareData , function(err, result) { 
                                                        //         //callbackEach(null, true);
                                                        //         callbackEach("HS is Disconnected", true);
                                                        //     });
                                                        // }

                                                        if (firmwareData.MeterList) {
                                                            NoOfMeters = firmwareData.MeterList.length;
                                                        }
                                                        if (firmwareData.DeltaLinkList) {
                                                            NoOfDeltalinks = firmwareData.DeltaLinkList.length;
                                                        }
                                                        if (CardType == "DeltaLink") {
                                                            dbCmd.onDeltalinkFirmwareUpload(Action, Attribute, rev, firmwareData.MessageID, firmwareData.CountryCode, firmwareData.RegionCode, firmwareData.CELLID,
                                                                firmwareData.MeterID, firmwareData.DeviceID, Url, firmwareData.DeltaLinkList, NoOfDeltalinks, firmwareData.SerialNumber, function (err, resp) {
                                                                    if (err) {
                                                                        callbackEach(err, null);
                                                                    } else {
                                                                        if (status == "Disconnected") {
                                                                            //Device is not connected
                                                                            dbCmdFrm.updateFirmwareJob(firmwareData, function (err, result) {
                                                                                //callbackEach(null, true);
                                                                                callbackEach("HS is Disconnected", true);
                                                                            });
                                                                        } else {
                                                                            callbackEach(null, true);

                                                                        }
                                                                    }
                                                                });
                                                        } else {
                                                            dbCmd.onFirmwareUpload(Action, Attribute, rev, firmwareData.MessageID, firmwareData.CountryCode, firmwareData.RegionCode, firmwareData.CELLID,
                                                                firmwareData.MeterID, firmwareData.DeviceID, Url, firmwareData.MeterList, NoOfMeters, firmwareData.SerialNumber, function (err, resp) {
                                                                    if (err) {
                                                                        callbackEach(err, null);
                                                                    } else {
                                                                        if (status == "Disconnected") {
                                                                            //Device is not connected
                                                                            dbCmdFrm.updateFirmwareJob(firmwareData, function (err, result) {
                                                                                //callbackEach(null, true);
                                                                                callbackEach("HS is Disconnected", true);
                                                                            });
                                                                        } else {
                                                                            callbackEach(null, true);

                                                                        }
                                                                    }
                                                                });
                                                        }

                                                    }
                                                });
                                            },
                                            function (err) {
                                                if (err) {
                                                    res.json({
                                                        "type": false, "Message": err
                                                    });
                                                } else {
                                                    res.json({
                                                        "Type": true, "Message": "Uploaded Successfully"
                                                    });
                                                }
                                            });
                                    } else {
                                        res.json({
                                            "type": false, "Message": "Invalid Fimware"
                                        });
                                    }
                                }
                            });
        
                        }
                    });
                }
            }
        })
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }

});
module.exports = router;