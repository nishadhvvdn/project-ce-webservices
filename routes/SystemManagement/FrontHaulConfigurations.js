var express = require('express');
var router = express.Router();
var dbCmdConfig = require('../../data/dbCommandsConfig.js');
var dbCmd = require('../../data/dbConfig.js');
var sendtoiot = require('../../data/sendToiot.js');
let schemaValidation = require('../../config/Helpers/payloadValidation');
let schema = require('../../config/Helpers/ConfigMgmntSchema');
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
            var deviceId = req.body.deviceId;
            var deviceType = req.body.DeviceType;
            var serialNo = req.body.serialNumber;
            var ConfigType = req.body.ConfigType;
            var Type = req.body.Type;
            var saveConfigDetails = req.body.saveConfigDetails;
            let FronthaulSchema = schema.Fronthaul;
            let data = { deviceId, serialNo, deviceType, ConfigType, Type, saveConfigDetails }
            schemaValidation.validateSchema(data, FronthaulSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmdConfig.createFrontHaulJobs(deviceId, serialNo, deviceType, ConfigType, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            result = result[0];
                            //configuraion changes from UI
                            var insertData = {};
                            if (deviceType != "meter") {
                                if (ConfigType == 'Radio') {
                                    if (Type == '2_4') {
                                        insertData = {
                                            "status": 0,
                                            "radio_band": "2.4 GHz",
                                            "radio_mode": saveConfigDetails.RadioMode,
                                            "chan_bw": saveConfigDetails.ChannelWidth,
                                            "channel": saveConfigDetails.Channel,
                                            "txpower": saveConfigDetails.TransmitPower,
                                            "stream_selection": saveConfigDetails.StreamSelection,
                                            "guard_interval": saveConfigDetails.GuardInterval
                                        }
                                    } else if (Type == '5_L') {
                                        insertData = {
                                            "status": 1,
                                            "radio_band": "5 GHz(Low)",
                                            "radio_mode": saveConfigDetails.RadioMode,
                                            "chan_bw": saveConfigDetails.ChannelWidth,
                                            "channel": saveConfigDetails.Channel,
                                            "txpower": saveConfigDetails.TransmitPower,
                                            "stream_selection": saveConfigDetails.StreamSelection,
                                            "guard_interval": saveConfigDetails.GuardInterval
                                        }
                                    } else if (Type == '5_H') {
                                        insertData = {
                                            "status": 1,
                                            "radio_band": "5 GHz(High)",
                                            "radio_mode": saveConfigDetails.RadioMode,
                                            "chan_bw": saveConfigDetails.ChannelWidth,
                                            "channel": saveConfigDetails.Channel,
                                            "txpower": saveConfigDetails.TransmitPower,
                                            "stream_selection": saveConfigDetails.StreamSelection,
                                            "guard_interval": saveConfigDetails.GuardInterval
                                        }
                                    }
                                } else if (ConfigType == 'Mesh') {
                                    if (Type == '2_4') {
                                        insertData = {
                                            "status": 0,
                                            "radio_band": "2.4 GHz",
                                            "meshID": saveConfigDetails.MeshID,
                                            "securityType": saveConfigDetails.SecurityType,
                                            "PSK": saveConfigDetails.PSK,
                                            "enable": 1
                                        }
                                    } else if (Type == '5_H') {
                                        insertData = {
                                            "status": 1,
                                            "radio_band": "5 GHz(High)",
                                            "meshID": saveConfigDetails.MeshID,
                                            "securityType": saveConfigDetails.SecurityType,
                                            "PSK": saveConfigDetails.PSK,
                                            "enable": 1
                                        }
                                    }
                                } else if (ConfigType == 'Hotspot') {
                                    let VapDetails = saveConfigDetails.vap_details;
                                    let VapUpdate = [];
                                    let VappdateLength = 0;
                                    for (i = 0; i < VapDetails.length; i++) {
                                        if (("SSID" in VapDetails[i]) === true) {
                                            VapUpdate[VappdateLength] = {};
                                            VapUpdate[VappdateLength].status = VapDetails[i].Status;
                                            VapUpdate[VappdateLength].ssid = VapDetails[i].SSID;
                                            VapUpdate[VappdateLength].security = VapDetails[i].WirelessSecurity;
                                            VapUpdate[VappdateLength].password = VapDetails[i].Password;
                                            VappdateLength++;
                                        }
                                    }
                                    if (Type == '2_4') {
                                        insertData = {
                                            "status": saveConfigDetails.Status,
                                            "radio_band": "2.4 GHz",
                                            "ssid": saveConfigDetails.SSID,
                                            "password": saveConfigDetails.Password,
                                            "security": saveConfigDetails.WirelessSecurity,
                                            "vap_details": VapUpdate
                                        }
                                    } else if (Type == '5') {
                                        insertData = {
                                            "status": 1,
                                            "radio_band": "5 GHz",
                                            "vap_details": VapUpdate
                                        }
                                    }
                                } else {
                                    var ConfigVar = ""
                                    if (saveConfigDetails.Type == 1) {
                                        // ConfigVar = "Mesh";
                                        insertData = {
                                            "Mesh": {
                                                "Status": saveConfigDetails.Status,
                                                "StartIpAddr": saveConfigDetails.StartAddress,
                                                "EndIpAddr": saveConfigDetails.EndAddress,
                                                "Gateway": saveConfigDetails.Gateway,
                                                "Subnet": saveConfigDetails.Subnet,
                                                "PrimaryDNS": saveConfigDetails.Primary_DNS,
                                                "SecondaryDNS": saveConfigDetails.Secondary_DNS
                                            }
                                        }
                                    } else {
                                        //ConfigVar = "Hotspot";
                                        insertData = {
                                            "Hotspot": {
                                                "Status": saveConfigDetails.Status,
                                                "StartIpAddr": saveConfigDetails.StartAddress,
                                                "EndIpAddr": saveConfigDetails.EndAddress,
                                                "Gateway": saveConfigDetails.Gateway,
                                                "Subnet": saveConfigDetails.Subnet,
                                                "PrimaryDNS": saveConfigDetails.Primary_DNS,
                                                "SecondaryDNS": saveConfigDetails.Secondary_DNS
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (ConfigType == 'Radio') {
                                    insertData = {
                                        "radio_band": saveConfigDetails.RadioBand,
                                        "radio_mode": saveConfigDetails.RadioMode,
                                        "chan_bw": saveConfigDetails.ChannelWidth,
                                        "channel": saveConfigDetails.Channel,
                                        "txpower": saveConfigDetails.TransmitPower,
                                        "stream_selection": saveConfigDetails.StreamSelection,

                                    }
                                } else if (ConfigType == 'Mesh') {
                                    insertData = {
                                        "Primary": {
                                            "meshID": saveConfigDetails.MeshID_Prim,
                                            "securityType": saveConfigDetails.SecurityType_Prim,
                                            "PSK": saveConfigDetails.PSK_Prim,
                                            "Mac": saveConfigDetails.Mac_Prim,
                                            "DeviceType": saveConfigDetails.DeviceType_Prim,
                                            "SerialNumber": saveConfigDetails.SerialNumber_Prim
                                        },
                                        "Secondary": {
                                            "meshID": saveConfigDetails.MeshID_Sec,
                                            "securityType": saveConfigDetails.SecurityType_Sec,
                                            "PSK": saveConfigDetails.PSK_Sec,
                                            "Mac": saveConfigDetails.Mac_Sec,
                                            "DeviceType": saveConfigDetails.DeviceType_Sec,
                                            "SerialNumber": saveConfigDetails.SerialNumber_Sec
                                        }
                                    }
                                } else if (ConfigType == 'Hotspot') {

                                    insertData = {
                                        "ssid": saveConfigDetails.SSID,
                                        "password": saveConfigDetails.Password,
                                        "security": saveConfigDetails.WirelessSecurity
                                    }
                                } else {
                                    insertData = {
                                        "Status": saveConfigDetails.Status,
                                        "StartIpAddr": saveConfigDetails.StartAddress,
                                        "EndIpAddr": saveConfigDetails.EndAddress,
                                        "Gateway": saveConfigDetails.Gateway,
                                        "Subnet": saveConfigDetails.Subnet,
                                        "PrimaryDNS": saveConfigDetails.Primary_DNS,
                                        "SecondaryDNS": saveConfigDetails.Secondary_DNS
                                    }
                                }
                            }
                            if (result) {
                                insertData.config_time = parseInt(Date.now() / 1000);
                                let ConfigDevice = JSON.parse(JSON.stringify(insertData));
                                var rev = 0;
                                var Action = "";
                                var Attribute = '';
                                result["rev"] = rev;
                                if (deviceType != "meter") {
                                    Action = "HS_FRONTHAUL";
                                    if (ConfigType == 'Radio') {
                                        if (Type == '2_4') {
                                            Attribute = "RADIO_2_4";
                                            purpose = "Fronthaul_HS_Radio_2_4";
                                        } else if (Type == '5_L') {
                                            Attribute = "RADIO_5_L";
                                            purpose = "Fronthaul_HS_Radio_5_L";
                                        } else if (Type == "5_H") {
                                            Attribute = "RADIO_5_H";
                                            purpose = "Fronthaul_HS_Radio_5_H";
                                        }
                                    } else if (ConfigType == 'Mesh') {
                                        if (Type == '2_4') {
                                            Attribute = "MESH_2_4";
                                            purpose = "Fronthaul_HS_Mesh_2_4";
                                        } else if (Type == '5_H') {
                                            Attribute = "MESH_5_L";
                                            purpose = "Fronthaul_HS_Mesh_5_L";
                                        }
                                    } else if (ConfigType == 'Hotspot') {
                                        if (Type == '2_4') {
                                            Attribute = "HOTSPOT_2_4";
                                            purpose = "Fronthaul_HS_hotspot_2_4";
                                        } else if (Type == '5') {
                                            Attribute = "HOTSPOT_5";
                                            purpose = "Fronthaul_HS_hotspot_5";
                                        }
                                    } else {
                                        Attribute = "HS_DHCP";
                                        purpose = "Fronthaul_HS_DHCP";
                                    }
                                } else {
                                    Action = "METER_FRONTHAUL";
                                    if (ConfigType == 'Radio') {
                                        Attribute = "METER_RADIO";
                                        purpose = "Fronthaul_Meter_Radio";
                                    } else if (ConfigType == 'Mesh') {
                                        Attribute = "METER_MESH";
                                        purpose = "Fronthaul_Meter_Mesh";
                                    } else if (ConfigType == 'Hotspot') {
                                        Attribute = "METER_HOTSPOT";
                                        purpose = "Fronthaul_Meter_Hotspot";
                                    } else {
                                        Attribute = "METER_DHCP";
                                        purpose = "Fronthaul_Meter_DHCP";
                                    }
                                }
                                if (!result.MessageID) {
                                    result.MessageID = 0;
                                } else if (result.MessageID === 255) {
                                    result.MessageID = 0;
                                } else {
                                    result.MessageID++;
                                }
                                if (deviceType != "meter") {
                                    if (ConfigType == 'Radio') {
                                        if (ConfigDevice["radio_mode"] == "11a")
                                            ConfigDevice["radio_mode"] = 7;
                                        else if (ConfigDevice["radio_mode"] == "11b")
                                            ConfigDevice["radio_mode"] = 0;
                                        else if (ConfigDevice["radio_mode"] == "11ng")
                                            ConfigDevice["radio_mode"] = 2;
                                        else if (ConfigDevice["radio_mode"] == "11g")
                                            ConfigDevice["radio_mode"] = 1;
                                        else if (ConfigDevice["radio_mode"] == "11axg")
                                            ConfigDevice["radio_mode"] = 3;
                                        else if (ConfigDevice["radio_mode"] == "11na")
                                            ConfigDevice["radio_mode"] = 5;
                                        else if (ConfigDevice["radio_mode"] == "11ac")
                                            ConfigDevice["radio_mode"] = 6;
                                        else if (ConfigDevice["radio_mode"] == "11axa")
                                            ConfigDevice["radio_mode"] = 4;

                                        if (ConfigDevice["chan_bw"] == "20MHz")
                                            ConfigDevice["chan_bw"] = 0;
                                        else if (ConfigDevice["chan_bw"] == "40MHz")
                                            ConfigDevice["chan_bw"] = 1;
                                        else if (ConfigDevice["chan_bw"] == "80MHz")
                                            ConfigDevice["chan_bw"] = 2;
                                        //    "guard_interval"
                                        if (ConfigDevice["guard_interval"] == "800ns")
                                            ConfigDevice["guard_interval"] = 0;
                                        else if (ConfigDevice["guard_interval"] == "400ns")
                                            ConfigDevice["guard_interval"] = 1;
                                        else if (ConfigDevice["guard_interval"] == "1600ns")
                                            ConfigDevice["guard_interval"] = 2;
                                        else if (ConfigDevice["guard_interval"] == "3200ns")
                                            ConfigDevice["guard_interval"] = 3;
                                        //    "stream_selection"
                                        if (ConfigDevice["stream_selection"] == "1x1")
                                            ConfigDevice["stream_selection"] = 1;
                                        else if (ConfigDevice["stream_selection"] == "2x2")
                                            ConfigDevice["stream_selection"] = 3;
                                        else if (ConfigDevice["stream_selection"] == "3x3")
                                            ConfigDevice["stream_selection"] = 7;
                                        else if (ConfigDevice["stream_selection"] == "4x4")
                                            ConfigDevice["stream_selection"] = 15;
                                    } else if (ConfigType == 'Mesh') {
                                        if (ConfigDevice["securityType"] == "Open")
                                            ConfigDevice["securityType"] = "none";
                                        else if (ConfigDevice["securityType"] == "SAE")
                                            ConfigDevice["securityType"] = "sae";
                                        ConfigDevice["mesh_vap_action"] = saveConfigDetails.mesh_vap_action;
                                    } else if (ConfigType == 'Hotspot') {
                                        var ConfigDevice1 = {};
                                        if (Type == '2_4') {
                                            saveConfigDetails.vap_details[0].Status = saveConfigDetails.vap_details[0].Status ? saveConfigDetails.vap_details[0].Status : '';
                                            saveConfigDetails.vap_details[0].SSID = saveConfigDetails.vap_details[0].SSID ? saveConfigDetails.vap_details[0].SSID : '';
                                            saveConfigDetails.vap_details[0].Password = saveConfigDetails.vap_details[0].Password ? saveConfigDetails.vap_details[0].Password : '';
                                            saveConfigDetails.vap_details[0].WirelessSecurity = saveConfigDetails.vap_details[0].WirelessSecurity ? saveConfigDetails.vap_details[0].WirelessSecurity : '';
                                            if (saveConfigDetails.WirelessSecurity == "Open")
                                                saveConfigDetails.WirelessSecurity = "none";
                                            if (saveConfigDetails.vap_details[0].WirelessSecurity == "Open")
                                                saveConfigDetails.vap_details[0].WirelessSecurity = "none";
                                            ConfigDevice1 = {
                                                "status": saveConfigDetails.Status,
                                                "ssid": saveConfigDetails.SSID,
                                                "password": saveConfigDetails.Password,
                                                "security": saveConfigDetails.WirelessSecurity,
                                                "vap_availabililty": saveConfigDetails.vap_availabililty,
                                                "vap_action": saveConfigDetails.vap_action,
                                                "status1": saveConfigDetails.vap_details[0].Status,
                                                "ssid1": saveConfigDetails.vap_details[0].SSID,
                                                "password1": saveConfigDetails.vap_details[0].Password,
                                                "security1": saveConfigDetails.vap_details[0].WirelessSecurity,
                                                "vap_availabililty1": saveConfigDetails.vap_details[0].vap_availabililty,
                                                "vap_action1": saveConfigDetails.vap_details[0].vap_action
                                            }

                                        } else if (Type == '5') {
                                            saveConfigDetails.vap_details[0].Status = saveConfigDetails.vap_details[0].Status ? saveConfigDetails.vap_details[0].Status : 0;
                                            saveConfigDetails.vap_details[0].SSID = saveConfigDetails.vap_details[0].SSID ? saveConfigDetails.vap_details[0].SSID : '';
                                            saveConfigDetails.vap_details[0].Password = saveConfigDetails.vap_details[0].Password ? saveConfigDetails.vap_details[0].Password : '';
                                            saveConfigDetails.vap_details[0].WirelessSecurity = saveConfigDetails.vap_details[0].WirelessSecurity ? saveConfigDetails.vap_details[0].WirelessSecurity : '';
                                            saveConfigDetails.vap_details[1].Status = saveConfigDetails.vap_details[1].Status ? saveConfigDetails.vap_details[1].Status : 0;
                                            saveConfigDetails.vap_details[1].SSID = saveConfigDetails.vap_details[1].SSID ? saveConfigDetails.vap_details[1].SSID : '';
                                            saveConfigDetails.vap_details[1].Password = saveConfigDetails.vap_details[1].Password ? saveConfigDetails.vap_details[1].Password : '';
                                            saveConfigDetails.vap_details[1].WirelessSecurity = saveConfigDetails.vap_details[1].WirelessSecurity ? saveConfigDetails.vap_details[1].WirelessSecurity : '';
                                            if (saveConfigDetails.vap_details[1].WirelessSecurity == "Open")
                                                saveConfigDetails.vap_details[1].WirelessSecurity = "none";
                                            if (saveConfigDetails.vap_details[0].WirelessSecurity == "Open")
                                                saveConfigDetails.vap_details[0].WirelessSecurity = "none";
                                            ConfigDevice1 = {
                                                "status": saveConfigDetails.vap_details[0].Status,
                                                "ssid": saveConfigDetails.vap_details[0].SSID,
                                                "password": saveConfigDetails.vap_details[0].Password,
                                                "security": saveConfigDetails.vap_details[0].WirelessSecurity,
                                                "vap_availabililty": saveConfigDetails.vap_details[0].vap_availabililty,
                                                "vap_action": saveConfigDetails.vap_details[0].vap_action,
                                                "status1": saveConfigDetails.vap_details[1].Status,
                                                "ssid1": saveConfigDetails.vap_details[1].SSID,
                                                "password1": saveConfigDetails.vap_details[1].Password,
                                                "security1": saveConfigDetails.vap_details[1].WirelessSecurity,
                                                "vap_availabililty1": saveConfigDetails.vap_details[1].vap_availabililty,
                                                "vap_action1": saveConfigDetails.vap_details[1].vap_action
                                            }
                                        }
                                    } else {
                                        var ConfigDevice1 = {};
                                        ConfigDevice1 = {
                                            "Server": saveConfigDetails.Type,
                                            "Status": saveConfigDetails.Status,
                                            "StartIpAddr": saveConfigDetails.StartAddress,
                                            "EndIpAddr": saveConfigDetails.EndAddress,
                                            "Gateway": saveConfigDetails.Gateway,
                                            "Subnet": saveConfigDetails.Subnet,
                                            "PrimaryDNS": saveConfigDetails.Primary_DNS,
                                            "SecondaryDNS": saveConfigDetails.Secondary_DNS
                                        }
                                    }
                                } else {
                                    if (ConfigType == 'Radio') {
                                        if (ConfigDevice["radio_mode"] == "11a")
                                            ConfigDevice["radio_mode"] = 7;
                                        else if (ConfigDevice["radio_mode"] == "11b")
                                            ConfigDevice["radio_mode"] = 0;
                                        else if (ConfigDevice["radio_mode"] == "11ng")
                                            ConfigDevice["radio_mode"] = 2;
                                        else if (ConfigDevice["radio_mode"] == "11g")
                                            ConfigDevice["radio_mode"] = 1;
                                        else if (ConfigDevice["radio_mode"] == "11na")
                                            ConfigDevice["radio_mode"] = 5;

                                        if (ConfigDevice["chan_bw"] == "20MHz")
                                            ConfigDevice["chan_bw"] = 1;
                                        else if (ConfigDevice["chan_bw"] == "40MHz")
                                            ConfigDevice["chan_bw"] = 2;
                                        else if (ConfigDevice["chan_bw"] == "Auto")
                                            ConfigDevice["chan_bw"] = 0;

                                        if (ConfigDevice["radio_band"] == "5 GHz")
                                            ConfigDevice["radio_band"] = 0;
                                        else if (ConfigDevice["radio_band"] == "2.4 GHz")
                                            ConfigDevice["radio_band"] = 1;

                                        if (ConfigDevice["stream_selection"] == "1x1")
                                            ConfigDevice["stream_selection"] = 1;
                                        else if (ConfigDevice["stream_selection"] == "2x2")
                                            ConfigDevice["stream_selection"] = 2;
                                    } else if (ConfigType == 'Mesh') {
                                        var ConfigDevice1 = saveConfigDetails;
                                        if (ConfigDevice1.SecurityType_Prim == 'Open')
                                            ConfigDevice1.SecurityType_Prim = 'none';
                                        else
                                            ConfigDevice1.SecurityType_Prim = 'sae';
                                        if (ConfigDevice1.SecurityType_Sec == 'Open')
                                            ConfigDevice1.SecurityType_Sec = 'none';
                                        else
                                            ConfigDevice1.SecurityType_Sec = 'sae';
                                    } else if (ConfigType == 'Hotspot') {
                                        ConfigDevice["vap_availabililty"] = saveConfigDetails.vap_availabililty;
                                        ConfigDevice["vap_action"] = saveConfigDetails.vap_action;
                                        ConfigDevice["status"] = 1;
                                        if (ConfigDevice.security == 'Open')
                                            ConfigDevice["security"] = "none";
                                    }
                                }
                                var data = {
                                    "action": Action,
                                    "attribute": Attribute,
                                    "rev": result.rev,
                                    "messageid": result.MessageID,
                                    "countrycode": result.CountryCode,
                                    "regioncode": result.RegionCode,
                                    "cellid": result.CELLID,
                                    "meterid": 0,
                                    "deviceID": result.DeviceID,
                                    "Purpose": purpose
                                }
                                if (deviceType == "meter")
                                    data.meterid = deviceId;
                                if ((deviceType != "meter" && ConfigType == 'Hotspot') || (deviceType != "meter" && ConfigType == 'DHCP') || (deviceType == "meter" && ConfigType == 'Mesh')) {
                                    ConfigDevice1.config_time = parseInt(Date.now() / 1000);
                                    data = Object.assign(data, ConfigDevice1);
                                } else
                                    data = Object.assign(data, ConfigDevice);
                                sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Someting went wrong"
                                        });
                                    } else {
                                        if (status == 'Connected') {
                                            dbCmd.onFrontHaul(data, result.JobID, function (err, resp) {
                                                if (resp == "Success") {
                                                    dbCmdConfig.updateFrontHaul(deviceId, deviceType, Type, ConfigType, insertData, function (err, result) {
                                                        if (err) {
                                                            res.json({
                                                                "type": false,
                                                                "Message": "Someting went wrong"
                                                            });
                                                        } else {
                                                            res.json({
                                                                "type": true,
                                                                "Message": "Updated FrontHaul Configurations"
                                                            });
                                                        }
                                                    });
                                                } else if (resp == "Failure") {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "Failure Response from Device"
                                                    });
                                                } else {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "No Response From Device"
                                                    });
                                                }
                                            });
                                        } else {
                                            // res.json({
                                            //     "type": false,
                                            //     "Message": "Device Not Connected"
                                            // });
                                            insertData.config_time = parseInt(Date.now() / 1000);
                                            dbCmdConfig.updateFrontHaul(deviceId, deviceType, Type, ConfigType, insertData, function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        "type": false,
                                                        "Message": "Someting went wrong"
                                                    });
                                                } else {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "Updated FrontHaul Configurations But Device Not Connected!!"
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                insertData.config_time = parseInt(Date.now() / 1000);
                                dbCmdConfig.updateFrontHaul(deviceId, deviceType, Type, ConfigType, insertData, function (err, result) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Someting went wrong"
                                        });
                                    } else {
                                        res.json({
                                            "type": true,
                                            "Message": "Updated FrontHaul Configurations"
                                        });
                                    }
                                });



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
});
module.exports = router;

