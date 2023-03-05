
var express = require('express');
var router = express.Router();
const util = require('util');
var fs = require('fs');
var Path = require('path');
var toHexa = require('../data/sToBParser.js');
var BitArray = require('node-bitarray');
var CRC16 = require('crc-16');
var fileName = './config/protoStructure.json';
var fileData;
var passLength;
var meterLength;
var url;
var hsurl;
var dvurl;
var meterType;


/**
* @description - hexa Creation by reading file
* @params - data, callback
* @return callback function
*/
function hexaCreation(data, callback) {
   // console.log("data..", data)
    var result = '';
    var objErr = null;
    var count;
    var bits;
    var keys;
    fileData = fs.readFileSync(fileName, 'utf-8');
    var obj = JSON.parse(fileData);
    for (var key in obj.FrameFormat) {
       // console.log("key", key)
        if (obj.FrameFormat.hasOwnProperty(key)) {
            switch (key) {
                case 'Rev':
                    toHexa.sToBParser(data.rev, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    break;

                case 'Count':
                    count = Number(obj.FrameFormat.Action.Length) + Number(obj.FrameFormat.Attribute.Length);
                    if (data.Purpose === "Download") {
                        for (keys in obj[data.action][data.attribute]) {
                            if (obj[data.action][data.attribute].hasOwnProperty(keys))
                                count += Number(obj[data.action][data.attribute][keys].Length);
                        }
                    } else if (data.Purpose === "OnDemandConnDisconn") {
                        count += Number(obj.ACTION_FOR_DEVICE.STATUSCODE.Length) + Number(obj.ACTION_FOR_DEVICE.MeterAdminPassword.Length);
                    } else if (data.Purpose === "HSWifiEdit") {
                        passLength = data.AccessPointPassword.length;
                        count += passLength;
                    } else if (data.Purpose === "MeterWifiEdit") {
                        passLength = data.MeterWiFiAccessPointPassword.length;
                        count += passLength;
                    } else if (data.Purpose === "DeltalinkBandwidthEdit") {
                        for (keys in obj[data.action][data.attribute]) {
                            if (obj[data.action][data.attribute].hasOwnProperty(keys)) {
                                count += Number(obj[data.action][data.attribute][keys].Length);
                            }
                        }
                    } else if (data.Purpose === "METER_BANDWIDTH" || data.Purpose == "HS_BANDWIDTH" || data.Purpose == "HH_BANDWIDTH") {
                        for (keys in obj[data.action][data.attribute]) {
                            if (obj[data.action][data.attribute].hasOwnProperty(keys)) {
                                count += Number(obj[data.action][data.attribute][keys].Length);
                            }
                        }
                    } else if (data.Purpose === "MeterDeregister") {
                        // 6 for mac
                        passLength = 6 * data.noOfMeters + 1;
                        count += passLength;
                    } else if (data.Purpose === "DeltalinkDeregister") {
                        passLength = 6 * data.NoOfDeltalinks + 1;
                        count += passLength;
                    }else if (data.Purpose === "SendMACIDs") {

                        if (data.action == 'ENDPOINT_UPDATE' || data.attribute == "MAC_ACL_UPDATE") {
                            count += 6;
                            macIDslength = 21 * data.Length;
                            count += macIDslength + 1;
                            if(data.action == 'ENDPOINT_UPDATE')
                            count += 1  * data.Length;
                        } else if (data.action == 'ENDPOINT_DEREGISTERATION') {
                            macIDslength = 6 * data.Length;
                            count += macIDslength + 2;
                        } else {                            //15 device name + 6 for mac +1 self/roaming
                            macIDslength = 21 * data.Length;
                            count += macIDslength + 1;
			                if(data.action == 'ENDPOINT_REGISTERATION')
                                count += 1  * data.Length;
                        }

                    } else if (data.Purpose === "UPDATEMACIDs") {
                        macIDslength = data.Length;
                        count += macIDslength + 1;
                    }
                    else if (data.Purpose === "FirmwareUpload") {
                        if (data.NoOfMeters > 0) {
                            url = data.url.length + (2 * data.NoOfMeters + 1);
                        } else {
                            url = data.url.length
                        }
                        count += url;
                    } else if (data.Purpose === "DeltalinkFirmwareUpload") {
                        if (data.NoOfDeltalinks > 0) {
                            url = data.url.length + (2 * data.NoOfDeltalinks + 1);
                        } else {
                            url = data.url.length
                        }
                        count += url;
                    } else if (data.Purpose === "METER_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                count += Number(obj.LOGS.METER_VERBOSITY.error.Length);
                                break;
                            case 2:
                                count += Number(obj.LOGS.METER_VERBOSITY.warning.Length);
                                break;
                            case 3:
                                count += Number(obj.LOGS.METER_VERBOSITY.info.Length);
                                break;
                            case 4:
                                count += Number(obj.LOGS.METER_VERBOSITY.debug.Length);
                                break;
                            default:
                                console.log("invalid count")

                        }

                    } else if (data.Purpose === "HH_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                count += Number(obj.LOGS.HH_VERBOSITY.error.Length);
                                break;
                            case 2:
                                count += Number(obj.LOGS.HH_VERBOSITY.warning.Length);
                                break;
                            case 3:
                                count += Number(obj.LOGS.HH_VERBOSITY.info.Length);
                                break;
                            case 4:
                                count += Number(obj.LOGS.HH_VERBOSITY.debug.Length);
                                break;
                            default:
                                console.log("invalid count")
                        }
                    } else if (data.Purpose === "HS_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                count += Number(obj.LOGS.HS_VERBOSITY.error.Length);
                                break;
                            case 2:
                                count += Number(obj.LOGS.HS_VERBOSITY.warning.Length);
                                break;
                            case 3:
                                count += Number(obj.LOGS.HS_VERBOSITY.info.Length);
                                break;
                            case 4:
                                count += Number(obj.LOGS.HS_VERBOSITY.debug.Length);
                                break;
                            default:
                                console.log("invalid count")
                        }
                    } else if (data.Purpose === "DL_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                count += Number(obj.LOGS.DL_VERBOSITY.error.Length);
                                break;
                            case 2:
                                count += Number(obj.LOGS.DL_VERBOSITY.warning.Length);
                                break;
                            case 3:
                                count += Number(obj.LOGS.DL_VERBOSITY.info.Length);
                                break;
                            case 4:
                                count += Number(obj.LOGS.DL_VERBOSITY.debug.Length);
                                break;
                            default:
                                console.log("invalid count")

                        }
                    } else if (data.Purpose === "METER_FETCH_LOG" || data.Purpose === "HH_FETCH_LOG" || data.Purpose === "HS_FETCH_LOG" || data.Purpose === "DL_FETCH_LOG") {
                        if (data.url) {
                            url = data.url.length;
                        }
                        count += url;
                    } else if (data.Purpose === "MacACLDVUrl" || data.Purpose === "MacACLHSUrl" || data.Purpose === "MacACLUrl") {
                        if (data.MAC_ACL_DV_URL) {
                            dvurl = data.MAC_ACL_DV_URL.length;
                            count += dvurl;
                        }
                        if (data.MAC_ACL_HS_URL) {
                            hsurl = data.MAC_ACL_HS_URL.length;
                            count += hsurl;
                        }
                    } else if (data.Purpose === "Backhaul_Cellular") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Username.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Password.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Sim_Pin.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Network_Selection.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Carrier.Length);
                    } else if (data.Purpose === "Backhaul_Ethernet") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Mode.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Gateway.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.IP.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Subnet.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Primary_DNS.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Secondary_DNS.Length);
                    } else if (data.Purpose === "Backhaul_Advanced") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.BACKHAUL.ADVANCED.Primary_Bachaul.Length);
                        count += Number(obj.BACKHAUL.ADVANCED.Auto_Switchover.Length);
                    } else if (data.Purpose === "Configuration_Meter") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.UtilityID.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.CircuitID.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.CertificationNumber.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.MeterESN.Length);
                    } else if (data.Purpose === "Cloud_Connectivity") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.Cloud_Connectivity.HS_Connectivity.Hostname.Length);
                        count += Number(obj.Cloud_Connectivity.HS_Connectivity.SAK.Length);
                        url = data.url.length;
                        count += url;
                    } else if (data.Purpose === "Fronthaul_HS_Radio_2_4") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.radio_mode.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.chan_bw.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.channel.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.txpower.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length);
                    } else if (data.Purpose === "Fronthaul_HS_Radio_5_L") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.radio_mode.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.chan_bw.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.channel.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.txpower.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length);
                    } else if (data.Purpose === "Fronthaul_HS_Radio_5_H") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.radio_mode.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.chan_bw.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.channel.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.txpower.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length);
                    } else if (data.Purpose === "Fronthaul_HS_Mesh_2_4") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.meshID.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.SecurityType.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.PSK.Length);
                    } else if (data.Purpose === "Fronthaul_HS_Mesh_5_L") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_5_L.meshID.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_5_L.SecurityType.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_5_L.PSK.Length);
                    } else if (data.Purpose === "Fronthaul_HS_hotspot_2_4") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length);
                    } else if (data.Purpose === "Fronthaul_HS_hotspot_5") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length);
                        count += Number(2 * obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length);
                    } else if (data.Purpose === "Fronthaul_HS_DHCP") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.Server.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.Status.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.Gateway.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.Subnet.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Length);
                        count += Number(obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Length);
                    } else if (((data.Purpose === "Register_SetConfig") && (data.action === 'COLLECTOR_REGISTERATION')) || ((data.Purpose === "upload_hs_config") && (data.action === 'UPLOAD_CONFIG_SETTINGS'))) {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Username.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Password.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Sim_Pin.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Network_Selection.Length);
                        count += Number(obj.BACKHAUL.CELLULAR.Carrier.Length);
                        count += Number(obj.BACKHAUL.ADVANCED.Primary_Bachaul.Length);
                        count += Number(obj.BACKHAUL.ADVANCED.Auto_Switchover.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Mode.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Gateway.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.IP.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Subnet.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Primary_DNS.Length);
                        count += Number(obj.BACKHAUL.ETHERNET.Secondary_DNS.Length);
                        count += Number(obj.Cloud_Connectivity.HS_Connectivity.Hostname.Length);
                        count += Number(obj.Cloud_Connectivity.HS_Connectivity.SAK.Length);
                        count += Number(obj.Cloud_Connectivity.HS_Connectivity.URL.Length);

                        count += Number(obj.CONFIGURATION.HS_BANDWIDTH.Status.Length);
                        count += Number(obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Length);
                        count += Number(obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Length);

                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.radio_mode.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.chan_bw.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.channel.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.txpower.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.radio_mode.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.chan_bw.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.channel.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.txpower.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.guard_interval.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_L.stream_selection.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.radio_mode.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.chan_bw.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.channel.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.txpower.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.guard_interval.Length);
                        count += Number(obj.HS_FRONTHAUL.RADIO_5_H.stream_selection.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.meshID.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.SecurityType.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_2_4.PSK.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_5_L.mesh_vap_action.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_5_L.meshID.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_5_L.SecurityType.Length);
                        count += Number(obj.HS_FRONTHAUL.MESH_5_L.PSK.Length);
                        count += Number(4 * obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length);
                        count += Number(4 * obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length);
                        count += Number(4 * obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length);
                        count += Number(4 * obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length);
                        count += Number(4 * obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length);
                        count += Number(4 * obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length);

                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.Server.Length);
                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.Status.Length);
                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Length);
                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Length);
                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.Gateway.Length);
                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.Subnet.Length);
                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Length);
                        count += Number(2* obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Length);

                        count += Number(obj.System_Settings.HS_System_Settings.SystemName.Length);
                        count += Number(obj.System_Settings.HS_System_Settings.Country.Length);
                        count += Number(obj.System_Settings.HS_System_Settings.Timezone.Length);
                    } else if (((data.Purpose === "Register_SetConfig") && (data.action === 'METER_REGISTERATION'))||((data.Purpose === "upload_meter_config") && (data.action === 'UPLOAD_CONFIG_SETTINGS'))) {
                        count += Number(obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Length);
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.radio_band.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.radio_mode.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.chan_bw.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.channel.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.txpower.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.stream_selection.Length);
                        
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.meshID.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.SecurityType.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.PSK.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.MeshMac.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Length);
                        
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.vap_availabililty.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.vap_action.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.Password.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.WirelessSecurity.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.Status.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.SSID.Length);

                        count += Number(obj.CONFIGURATION.HS_BANDWIDTH.Status.Length);
                        count += Number(obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Length);
                        count += Number(obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Length);
                        
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Status.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.StartAddress.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.EndAddress.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Gateway.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Subnet.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Primary_DNS.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Secondary_DNS.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.UtilityID.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.CircuitID.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.CertificationNumber.Length);
                        count += Number(obj.Configuration_Meter.Meter_Config.MeterESN.Length);
                        count += Number(obj.System_Settings.Meter_System_Settings.SystemName.Length);
                        count += Number(obj.System_Settings.Meter_System_Settings.Country.Length);
                        count += Number(obj.System_Settings.Meter_System_Settings.Timezone.Length);
                    } else if (data.Purpose === "Fronthaul_Meter_Radio") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.radio_band.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.radio_mode.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.chan_bw.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.channel.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.txpower.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_RADIO.stream_selection.Length);

                    } else if (data.Purpose === "MeshScan") {
                        count += Number(obj.METER_FRONTHAUL.METER_SCAN.radio_band.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_SCAN.scan.Length);
                    } else if (data.Purpose === "Fronthaul_Meter_Mesh") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.meshID.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.SecurityType.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.PSK.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.MeshMac.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Length);
                        count += Number(2 * obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Length);
                    } else if (data.Purpose === "Fronthaul_Meter_Hotspot") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.vap_availabililty.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.vap_action.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.Status.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.SSID.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.Password.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_HOTSPOT.WirelessSecurity.Length);
                    } else if (data.Purpose === "Fronthaul_Meter_DHCP") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Status.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.StartAddress.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.EndAddress.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Gateway.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Subnet.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Primary_DNS.Length);
                        count += Number(obj.METER_FRONTHAUL.METER_DHCP.Secondary_DNS.Length);
                    } else if (data.Purpose === "SystemSettings") {
                        count += Number(obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length);
                        count += Number(obj.System_Settings.HS_System_Settings.SystemName.Length);
                        count += Number(obj.System_Settings.HS_System_Settings.Country.Length);
                        count += Number(obj.System_Settings.HS_System_Settings.Timezone.Length);
                    } else if (data.Purpose !== "WrongPacket") {
                        if ((data.action === "METER_REGISTERATION") && (data.Purpose === "RegistrationError")) {
                            count += Number(obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Length) + 1;
                        } else if ((data.action === "METER_REGISTERATION") && ((data.attribute === "REGISTRATION_PARA") || (data.attribute ===  "GET_DEVICE_CONFIG") || (data.attribute ===  "SET_DEVICE_CONFIG") || (data.Purpose === "RegistrationSuccess"))) {
                            count += Number(obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Length);
                        }
                        if ((data.action === "DELTALINK_REGISTER") && (data.Purpose === "RegistrationError")) {
                            count += Number(obj.DELTALINK_REGISTER.REGISTRATION_PARA.SERIAL_NO.Length) + 1;
                        } else if ((data.action === "DELTALINK_REGISTER") && (data.attribute === "REGISTRATION_PARA") && (data.Purpose === "RegistrationSuccess")) {
                            count += Number(obj.DELTALINK_REGISTER.REGISTRATION_PARA.SERIAL_NO.Length);
                        } else if ((data.action === "DELTALINK_REGISTER") && ((data.attribute === "REGISTRATION_PARA") || (data.Purpose !== "RegistrationSuccess"))) {
                            count += Number(obj.DELTALINK_REGISTER.DL_CONFIG.SERIAL_NO.Length);
                            count += Number(obj.DELTALINK_REGISTER.DL_CONFIG.BW_Enable.Length);
                            count += Number(obj.DELTALINK_REGISTER.DL_CONFIG.BW_Upload.Length);
                            count += Number(obj.DELTALINK_REGISTER.DL_CONFIG.BW_Download.Length);
                        }
                    } else if (data.Purpose === "RegistrationError")
                        count += 1;


                    // //For Factory Reset
                    // if (data.Purpose == 'DL_FACTORY_RESET' && data.attribute == 'DL_FULL_FACTORY_RESET') {
                    //     count += Number(obj.FACTORY_RESET.DL_FULL_FACTORY_RESET.DeltalinkID.Length);
                    // } else if (data.Purpose == 'DL_FACTORY_RESET' && data.attribute == 'DL_SHALLOW_FACTORY_RESET') {
                    //     count += Number(obj.FACTORY_RESET.DL_SHALLOW_FACTORY_RESET.DeltalinkID.Length);
                    // }
                    toHexa.sToBParser(count, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    break;

                case 'MessageID':
                    toHexa.sToBParser(data.messageid, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    break;

                case 'CountryCode':
                    toHexa.sToBParser(data.countrycode, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    break;

                case 'RegionCode':
                    toHexa.sToBParser(data.regioncode, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    break;

                case 'CellID':
                    toHexa.sToBParser(data.cellid, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    break;

                case 'MeterID':
                    if ((data.Purpose === "HSWifiEdit") || (data.Purpose === "MeterDeregister") || (data.Purpose === "DeltalinkDeregister") || (data.Purpose === "HSDeregister") || data.Purpose == "HS_BANDWIDTH" || data.Purpose == "HH_BANDWIDTH" || data.Purpose == "upload_hs_config") {
                        var MeterId = 0;
                        meterLength = obj.FrameFormat[key].Length;
                        meterType = obj.FrameFormat[key].Type;
                        toHexa.sToBParser(MeterId, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    } else {
                        toHexa.sToBParser(data.meterid, obj.FrameFormat[key].Length, obj.FrameFormat[key].Type, handleResult);
                    }
                    break;
                case 'Action':
                    if ((data.Purpose === "RegistrationError") || (data.Purpose === "WrongPacket")) {
                        // || (data.Purpose === 'MacACLDVUrl') || (data.Purpose === 'MacACLUrl') ||(data.Purpose === 'MacACLHSUrl') ) {
                        // bits = BitArray.fromHex(obj.Actions[data.action]);
                        //console.log("action",bits)
                        FirstBit = obj.Actions[data.action].substring(0, 1);
                        Action = obj.Actions[data.action].substring(1, 2);
                        if (FirstBit == 0) {
                            bits = "8" + Action;
                        } else if (FirstBit == 1) {
                            bits = "9" + Action;
                        }
                        result += bits;
                    } else {
                        result += obj.Actions[data.action];
                    }
                    break;

                case 'Attribute':
                    if ((data.Purpose === "MeterNodePing") || ((data.Purpose === "DeltalinkNodePing")) || (data.Purpose === "OnDemandMeterKwH") ||
                        (data.Purpose === "OnDemandConnDisconn") || (data.Purpose === "HSWifiEdit") ||
                        (data.Purpose === "MeterWifiEdit") || (data.Purpose === "deltalinkBandwidth") || (data.Purpose === "MeterDeregister") || (data.Purpose == "DeltalinkBandwidthEdit") ||
                        (data.Purpose === "HSDeregister") || (data.Purpose === "Download") ||
                        (data.Purpose === "SendMACIDs") || (data.Purpose === "UPDATEMACIDs") || (data.Purpose === "FirmwareUpload") || (data.Purpose === "DeltalinkFirmwareUpload") ||
                        (data.Purpose === 'MacACLDVUrl') || (data.Purpose === 'MacACLUrl') || (data.Purpose === 'MacACLHSUrl') || (data.Purpose === "METER_CLEAR_LOGS") ||
                        (data.Purpose === "HS_CLEAR_LOGS") || (data.Purpose === "HH_CLEAR_LOGS") ||
                        (data.Purpose === "DL_CLEAR_LOGS") || (data.Purpose === "METER_CHANGE_VERBOSITY") ||
                        (data.Purpose === "HH_CHANGE_VERBOSITY") || (data.Purpose === "HS_CHANGE_VERBOSITY") ||
                        (data.Purpose === "DL_CHANGE_VERBOSITY") || (data.Purpose === "METER_FETCH_LOG") ||
                        (data.Purpose === "HH_FETCH_LOG") || (data.Purpose === "HS_FETCH_LOG") ||
                        (data.Purpose === "DL_FETCH_LOG") || (data.Purpose === 'LockUnlock') ||
                        (data.Purpose === 'REBOOT') || (data.Purpose === "DeltalinkDeregister") ||
                        (data.Purpose === "Configuration_Meter") || (data.Purpose === "SystemSettings") ||
                        (data.Purpose === 'Fronthaul_HS_Mesh_2_4') || (data.Purpose === 'Fronthaul_HS_Mesh_5_L') ||
                        (data.Purpose === 'Fronthaul_HS_Radio_2_4') || (data.Purpose === 'Fronthaul_HS_Radio_5_L') || (data.Purpose === 'Fronthaul_HS_Radio_5_H') || (data.Purpose === 'Fronthaul_HS_DHCP') ||
                        (data.Purpose === "Fronthaul_HS_hotspot_5") || (data.Purpose === "Fronthaul_HS_hotspot_2_4") || (data.Purpose === 'Fronthaul_Meter_Mesh') || (data.Purpose === 'Fronthaul_Meter_Radio') || (data.Purpose === 'MeshScan') ||
                        (data.Purpose === "Fronthaul_Meter_Hotspot") || (data.Purpose === "Fronthaul_Meter_DHCP") || (data.Purpose === "Cloud_Connectivity") ||
                        (data.Purpose === 'Backhaul_Cellular') || (data.Purpose === 'Backhaul_Ethernet') || (data.Purpose === 'Backhaul_Advanced') ||
                        (data.Purpose === 'CarrierList') || (data.Purpose.includes('FACTORY_RESET') || (data.Purpose === "METER_BANDWIDTH") || (data.Purpose == "HS_BANDWIDTH") || (data.Purpose == "HH_BANDWIDTH") || (data.Purpose == "upload_hs_config") || (data.Purpose == "upload_meter_config")||data.Purpose === "METER_DATA_RATE" || data.Purpose == "HH_DATA_RATE" || data.Purpose == "HS_DATA_RATE"|| data.Purpose == "DL_DATA_RATE" || data.Purpose == 'COIL_DATA')) {
                            // Condition added for coil data action detection
                        result += obj.ActionAttribute[data.action][data.attribute];
                    } else if ((data.Purpose === "RegistrationError") || (data.Purpose === "WrongPacket")) {
                        //bits = BitArray.fromHex(obj.ActionAttribute[data.action][data.attribute]);
                        FirstBit = obj.ActionAttribute[data.action][data.attribute].substring(0, 1);
                        Action = obj.ActionAttribute[data.action][data.attribute].substring(1, 2);
                        if (FirstBit == 0) {
                            bits = "8" + Action;
                        } else if (FirstBit == 1) {
                            bits = "9" + Action;
                        }
                        result += bits;
                    } else if (((data.action === 'COLLECTOR_REGISTERATION') && (data.attribute === "HS_CONFIGURATION"))
                        || ((data.action === 'METER_REGISTERATION') && (data.attribute === "METER_CONFIGURATION"))
                        || (data.Purpose === "RegistrationSuccess")
                        || ((data.action === 'DELTALINK_REGISTER') && (data.attribute === "DL_CONFIG")))
                        result += obj.ActionAttribute[data.action]['SUCCESS'];
                    else if ((data.action === 'COLLECTOR_REGISTERATION') && (data.attribute === "HH_Success"))
                        result += obj.ActionAttribute[data.action]['HH_Success'];
                    else if (((data.action === 'COLLECTOR_REGISTERATION') || (data.action === 'METER_REGISTERATION')) && (data.attribute === "REGISTRATION_PARA"))
                        result += obj.ActionAttribute[data.action]['SET_DEVICE_CONFIG'];
                    else if (((data.action === 'COLLECTOR_REGISTERATION') || (data.action === 'METER_REGISTERATION')) && (data.attribute === "SET_DEVICE_CONFIG"))
                        result += obj.ActionAttribute[data.action]['SET_DEVICE_CONFIG'];
                    else if (((data.action === 'COLLECTOR_REGISTERATION') || (data.action === 'METER_REGISTERATION')) && (data.attribute === "GET_DEVICE_CONFIG"))
                        result += obj.ActionAttribute[data.action]['GET_DEVICE_CONFIG'];
                    else if ((data.action === 'COLLECTOR_REGISTERATION') && (data.attribute === "DEVICE_DETAILS"))
                        result += obj.ActionAttribute[data.action]['HS_CONFIGURATION'];
                    else if ((data.action === 'METER_REGISTERATION') && (data.attribute === "DEVICE_DETAILS"))
                        result += obj.ActionAttribute[data.action]['METER_CONFIGURATION'];
                    else if ((data.action === 'METER_REGISTERATION') && (data.attribute === "REGISTRATION_PARA"))
                        result += obj.ActionAttribute[data.action]['SET_DEVICE_CONFIG'];
                    else if ((data.action === 'METER_REGISTERATION') && (data.attribute === "GET_DEVICE_CONFIG"))
                        result += obj.ActionAttribute[data.action]['GET_DEVICE_CONFIG'];
                    else if ((data.action === 'DELTALINK_REGISTER') && (data.attribute === "REGISTRATION_PARA"))
                        result += obj.ActionAttribute[data.action]['DL_CONFIG'];
                     else if (((data.action === 'COLLECTOR_REGISTERATION') || (data.action === 'METER_REGISTERATION'))&& (data.attribute === "DEVICE_DETAILS1")){
                        result += obj.ActionAttribute[data.action]['DEVICE_DETAILS'];
                        data.attribute = 'DEVICE_DETAILS';
                    }
                    else
                        result += obj.ActionAttribute[data.action]['DEVICE_DETAILS'];
                    break;

                case 'Data':
                    if (data.Purpose === "Download") {
                        for (keys in obj[data.action][data.attribute]) {
                            if (obj[data.action][data.attribute].hasOwnProperty(keys))
                                toHexa.sToBParser(data.ConfigGroups_Info[keys], obj[data.action][data.attribute][keys].Length, obj[data.action][data.attribute][keys].Type, handleResult);
                        }
                    } else if(data.Purpose == "COIL_DATA") {
                        // Condition to parse coil data in to hex
                        toHexa.sToBParser(data.coilData.multiplier, obj.COIL_UPDATE.COIL_DATA.MULTIPLIER.Length, obj.COIL_UPDATE.COIL_DATA.MULTIPLIER.Type, handleResult);
                        toHexa.sToBParser(data.coilData.coilId, obj.COIL_UPDATE.COIL_DATA.COIL_ID.Length, obj.COIL_UPDATE.COIL_DATA.COIL_ID.Type, handleResult);
                    } else if (data.Purpose === "OnDemandConnDisconn") {
                        toHexa.sToBParser(data.STATUS_CODE, obj.ACTION_FOR_DEVICE.STATUSCODE.Length, obj.ACTION_FOR_DEVICE.STATUSCODE.Type, handleResult);
                        toHexa.sToBParser(data.password, obj.ACTION_FOR_DEVICE.MeterAdminPassword.Length, obj.ACTION_FOR_DEVICE.MeterAdminPassword.Type, handleResult);
                    } else if (data.Purpose === "HSWifiEdit") {
                        toHexa.sToBParser(data.AccessPointPassword, passLength, obj.ACTION_FOR_DEVICE.MeterAdminPassword.Type, handleResult);
                    } else if (data.Purpose === "MeterWifiEdit") {
                        toHexa.sToBParser(data.MeterWiFiAccessPointPassword, passLength, obj.ACTION_FOR_DEVICE.MeterAdminPassword.Type, handleResult);
                    } else if (data.Purpose === "deltalinkBandwidth") {
                        toHexa.sToBParser(data.deltalinkBandwidth, passLength, obj.ACTION_FOR_DEVICE.DeltalinkBandwdith.Type, handleResult);
                    } else if (data.Purpose === "FirmwareUpload") {
                        if (data.NoOfMeters > 0) {
                            toHexa.sToBParser(data.NoOfMeters, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusMeter.Length, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusMeter.Type, handleResult);
                        }
                        if (data.meterList) {
                            for (var i in data.meterList) {
                                if (data.meterList.hasOwnProperty(i)) {
                                    toHexa.sToBParser(data.meterList[i], obj.FrameFormat.MeterID.Length, obj.FrameFormat.MeterID.Type, handleResult);
                                }
                            }
                        }
                        toHexa.sToBParser(data.url, data.url.length, obj.COLLECTOR_FIRMWARE_UPGRADE.START_FIRMWARE_UPDATE.Firmware_Package_URL.Type, handleResult);
                    } else if (data.Purpose === "DeltalinkFirmwareUpload") {
                        if (data.NoOfDeltalinks > 0) {
                            toHexa.sToBParser(data.NoOfDeltalinks, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusDeltalink.Length, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusDeltalink.Type, handleResult);
                        }
                        if (data.NoOfDeltalinks) {
                            for (var i in data.deltalinkList) {
                                if (data.deltalinkList.hasOwnProperty(i)) {
                                    toHexa.sToBParser(data.deltalinkList[i], obj.FrameFormat.MeterID.Length, obj.FrameFormat.MeterID.Type, handleResult);
                                }
                            }
                        }
                        toHexa.sToBParser(data.url, data.url.length, obj.COLLECTOR_FIRMWARE_UPGRADE.START_FIRMWARE_UPDATE.Firmware_Package_URL.Type, handleResult);
                    } else if (data.Purpose === "MacACLDVUrl") {
                        toHexa.sToBParser(data.MAC_ACL_DV_URL, data.MAC_ACL_DV_URL.length, obj.MAC_ACL.URL_MAC_ACL.MAC_ACL_DV_URL.Type, handleResult);
                    } else if (data.Purpose === "MacACLHSUrl") {
                        toHexa.sToBParser(data.MAC_ACL_HS_URL, data.MAC_ACL_HS_URL.length, obj.MAC_ACL.URL_MAC_ACL.MAC_ACL_DV_URL.Type, handleResult);
                    } else if (data.Purpose === "MacACLUrl") {
                        if (data.MAC_ACL_DV_URL)
                            toHexa.sToBParser(data.MAC_ACL_DV_URL, data.MAC_ACL_DV_URL.length, obj.MAC_ACL.URL_MAC_ACL.MAC_ACL_DV_URL.Type, handleResult);
                        if (data.MAC_ACL_HS_URL)
                            toHexa.sToBParser(data.MAC_ACL_HS_URL, data.MAC_ACL_HS_URL.length, obj.MAC_ACL.URL_MAC_ACL.MAC_ACL_DV_URL.Type, handleResult);
                    }
                    else if (data.Purpose === "METER_FETCH_LOG") {
                        toHexa.sToBParser(data.url, data.url.length, obj.LOGS.METER_FETCH.url.Type, handleResult);

                    }
                    else if (data.Purpose === "HH_FETCH_LOG") {
                        toHexa.sToBParser(data.url, data.url.length, obj.LOGS.HH_FETCH.url.Type, handleResult);

                    }
                    else if (data.Purpose === "HS_FETCH_LOG") {
                        toHexa.sToBParser(data.url, data.url.length, obj.LOGS.HS_FETCH.url.Type, handleResult);

                    } else if (data.Purpose === "DL_FETCH_LOG") {
                        toHexa.sToBParser(data.url, data.url.length, obj.LOGS.DL_FETCH.url.Type, handleResult);

                    } else if (data.Purpose === "MeterDeregister") {
                        toHexa.sToBParser(data.noOfMeters, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusMeter.Length, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusMeter.Type, handleResult);
                        for (var i in data.meterid) {
                            if (data.meterid.hasOwnProperty(i)) {
                                //toHexa.sToBParser(data.meterid[i], obj.MAC_ACL.MAC_ACL_DEREGISTER.MACID.Length, obj.MAC_ACL.MAC_ACL_DEREGISTER.MACID.Type, handleResult);
                                result += data.meterid[i];
                            }
                        }
                    }
                    else if (data.Purpose === "DeltalinkDeregister") {
                        toHexa.sToBParser(data.NoOfDeltalinks, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusDeltalink.Length, obj.COLLECTOR_DATA_UPLOAD.COMBINED_TRANSACTIONAL_DATA.StatusDeltalink.Type, handleResult);
                        for (var i in data.meterid) {
                            if (data.meterid.hasOwnProperty(i)) {
                                // toHexa.sToBParser(data.meterid[i], meterLength, meterType, handleResult);
                                result += data.meterid[i];
                            }
                        }
                    } else if (data.Purpose === "SystemSettings") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.sysname, obj.System_Settings.HS_System_Settings.SystemName.Length, obj.System_Settings.HS_System_Settings.SystemName.Type, handleResult);
                        toHexa.sToBParser(data.country, obj.System_Settings.HS_System_Settings.Country.Length, obj.System_Settings.HS_System_Settings.Country.Type, handleResult);
                        toHexa.sToBParser(data.timezone, obj.System_Settings.HS_System_Settings.Timezone.Length, obj.System_Settings.HS_System_Settings.Timezone.Type, handleResult);

                    } else if (data.Purpose === "Backhaul_Cellular") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.username, obj.BACKHAUL.CELLULAR.Username.Length, obj.BACKHAUL.CELLULAR.Username.Type, handleResult);
                        toHexa.sToBParser(data.password, obj.BACKHAUL.CELLULAR.Password.Length, obj.BACKHAUL.CELLULAR.Password.Type, handleResult);
                        toHexa.sToBParser(data.sim_pin, obj.BACKHAUL.CELLULAR.Sim_Pin.Length, obj.BACKHAUL.CELLULAR.Sim_Pin.Type, handleResult);
                        toHexa.sToBParser(data.network_selection, obj.BACKHAUL.CELLULAR.Network_Selection.Length, obj.BACKHAUL.CELLULAR.Network_Selection.Type, handleResult);
                        toHexa.sToBParser(data.carrier, obj.BACKHAUL.CELLULAR.Carrier.Length, obj.BACKHAUL.CELLULAR.Carrier.Type, handleResult);

                    } else if (data.Purpose === "Backhaul_Ethernet") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.mode, obj.BACKHAUL.ETHERNET.Mode.Length, obj.BACKHAUL.ETHERNET.Mode.Type, handleResult);
                        toHexa.sToBParser(data.ip, obj.BACKHAUL.ETHERNET.IP.Length, obj.BACKHAUL.ETHERNET.IP.Type, handleResult);
                        toHexa.sToBParser(data.gateway, obj.BACKHAUL.ETHERNET.Gateway.Length, obj.BACKHAUL.ETHERNET.Gateway.Type, handleResult);
                        toHexa.sToBParser(data.subnet, obj.BACKHAUL.ETHERNET.Subnet.Length, obj.BACKHAUL.ETHERNET.Subnet.Type, handleResult);
                        toHexa.sToBParser(data.primary_dns, obj.BACKHAUL.ETHERNET.Primary_DNS.Length, obj.BACKHAUL.ETHERNET.Primary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.secondary_dns, obj.BACKHAUL.ETHERNET.Secondary_DNS.Length, obj.BACKHAUL.ETHERNET.Secondary_DNS.Type, handleResult);

                    } else if (data.Purpose === "Backhaul_Advanced") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.primary_backhaul, obj.BACKHAUL.ADVANCED.Primary_Bachaul.Length, obj.BACKHAUL.ADVANCED.Primary_Bachaul.Type, handleResult);
                        toHexa.sToBParser(data.auto_switchover, obj.BACKHAUL.ADVANCED.Auto_Switchover.Length, obj.BACKHAUL.ADVANCED.Auto_Switchover.Type, handleResult);
                    } else if (data.Purpose === "Configuration_Meter") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.uti_ID, obj.Configuration_Meter.Meter_Config.UtilityID.Length, obj.Configuration_Meter.Meter_Config.UtilityID.Type, handleResult);
                        toHexa.sToBParser(data.cir_ID, obj.Configuration_Meter.Meter_Config.CircuitID.Length, obj.Configuration_Meter.Meter_Config.CircuitID.Type, handleResult);
                        toHexa.sToBParser(data.cer_num, obj.Configuration_Meter.Meter_Config.CertificationNumber.Length, obj.Configuration_Meter.Meter_Config.CertificationNumber.Type, handleResult);
                        toHexa.sToBParser(data.esn, obj.Configuration_Meter.Meter_Config.MeterESN.Length, obj.Configuration_Meter.Meter_Config.MeterESN.Type, handleResult);

                    } else if (data.Purpose === "Fronthaul_HS_Mesh_2_4") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.mesh_vap_action, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Length, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Type, handleResult);
                        toHexa.sToBParser(data.meshID, obj.HS_FRONTHAUL.MESH_2_4.meshID.Length, obj.HS_FRONTHAUL.MESH_2_4.meshID.Type, handleResult);
                        toHexa.sToBParser(data.securityType, obj.HS_FRONTHAUL.MESH_2_4.SecurityType.Length, obj.HS_FRONTHAUL.MESH_2_4.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.PSK, obj.HS_FRONTHAUL.MESH_2_4.PSK.Length, obj.HS_FRONTHAUL.MESH_2_4.PSK.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_HS_Mesh_5_L") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.mesh_vap_action, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Length, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Type, handleResult);
                        toHexa.sToBParser(data.meshID, obj.HS_FRONTHAUL.MESH_5_L.meshID.Length, obj.HS_FRONTHAUL.MESH_5_L.meshID.Type, handleResult);
                        toHexa.sToBParser(data.securityType, obj.HS_FRONTHAUL.MESH_5_L.SecurityType.Length, obj.HS_FRONTHAUL.MESH_5_L.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.PSK, obj.HS_FRONTHAUL.MESH_5_L.PSK.Length, obj.HS_FRONTHAUL.MESH_5_L.PSK.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_HS_Radio_2_4") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.radio_mode, obj.HS_FRONTHAUL.RADIO_2_4.radio_mode.Length, obj.HS_FRONTHAUL.RADIO_2_4.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.chan_bw, obj.HS_FRONTHAUL.RADIO_2_4.chan_bw.Length, obj.HS_FRONTHAUL.RADIO_2_4.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.channel, obj.HS_FRONTHAUL.RADIO_2_4.channel.Length, obj.HS_FRONTHAUL.RADIO_2_4.channel.Type, handleResult);
                        toHexa.sToBParser(data.txpower, obj.HS_FRONTHAUL.RADIO_2_4.txpower.Length, obj.HS_FRONTHAUL.RADIO_2_4.txpower.Type, handleResult);
                        toHexa.sToBParser(data.guard_interval, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Type, handleResult);
                        toHexa.sToBParser(data.stream_selection, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_HS_Radio_5_L") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.radio_mode, obj.HS_FRONTHAUL.RADIO_5_L.radio_mode.Length, obj.HS_FRONTHAUL.RADIO_5_L.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.chan_bw, obj.HS_FRONTHAUL.RADIO_5_L.chan_bw.Length, obj.HS_FRONTHAUL.RADIO_5_L.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.channel, obj.HS_FRONTHAUL.RADIO_5_L.channel.Length, obj.HS_FRONTHAUL.RADIO_5_L.channel.Type, handleResult);
                        toHexa.sToBParser(data.txpower, obj.HS_FRONTHAUL.RADIO_5_L.txpower.Length, obj.HS_FRONTHAUL.RADIO_5_L.txpower.Type, handleResult);
                        toHexa.sToBParser(data.guard_interval, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Type, handleResult);
                        toHexa.sToBParser(data.stream_selection, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_HS_Radio_5_H") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.radio_mode, obj.HS_FRONTHAUL.RADIO_5_H.radio_mode.Length, obj.HS_FRONTHAUL.RADIO_5_H.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.chan_bw, obj.HS_FRONTHAUL.RADIO_5_H.chan_bw.Length, obj.HS_FRONTHAUL.RADIO_5_H.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.channel, obj.HS_FRONTHAUL.RADIO_5_H.channel.Length, obj.HS_FRONTHAUL.RADIO_5_H.channel.Type, handleResult);
                        toHexa.sToBParser(data.txpower, obj.HS_FRONTHAUL.RADIO_5_H.txpower.Length, obj.HS_FRONTHAUL.RADIO_5_H.txpower.Type, handleResult);
                        toHexa.sToBParser(data.guard_interval, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Type, handleResult);
                        toHexa.sToBParser(data.stream_selection, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_HS_DHCP") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.Server, obj.HS_FRONTHAUL.HS_DHCP.Server.Length, obj.HS_FRONTHAUL.HS_DHCP.Server.Type, handleResult);
                        toHexa.sToBParser(data.Status, obj.HS_FRONTHAUL.HS_DHCP.Status.Length, obj.HS_FRONTHAUL.HS_DHCP.Status.Type, handleResult);
                        toHexa.sToBParser(data.StartIpAddr, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Type, handleResult);
                        toHexa.sToBParser(data.EndIpAddr, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Type, handleResult);
                        toHexa.sToBParser(data.Gateway, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Length, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Type, handleResult);
                        toHexa.sToBParser(data.Subnet, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Length, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Type, handleResult);
                        toHexa.sToBParser(data.PrimaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.SecondaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_HS_hotspot_5" || data.Purpose === "Fronthaul_HS_hotspot_2_4") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.vap_availabililty, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.vap_action, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.status, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Type, handleResult);
                        toHexa.sToBParser(data.ssid, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Type, handleResult);
                        toHexa.sToBParser(data.security, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.password, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Type, handleResult);

                        toHexa.sToBParser(data.vap_availabililty1, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.vap_action1, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.status1, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Type, handleResult);
                        toHexa.sToBParser(data.ssid1, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Type, handleResult);
                        toHexa.sToBParser(data.security1, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.password1, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Type, handleResult);


                    } else if (data.Purpose === 'Fronthaul_Meter_Mesh') {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.MeshID_Prim, obj.METER_FRONTHAUL.METER_MESH.meshID.Length, obj.METER_FRONTHAUL.METER_MESH.meshID.Type, handleResult);
                        toHexa.sToBParser(data.SecurityType_Prim, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Length, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.PSK_Prim, obj.METER_FRONTHAUL.METER_MESH.PSK.Length, obj.METER_FRONTHAUL.METER_MESH.PSK.Type, handleResult);
                        toHexa.sToBParser(data.Mac_Prim, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Length, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Type, handleResult);
                        toHexa.sToBParser(data.DeviceType_Prim, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Length, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Type, handleResult);
                        toHexa.sToBParser(data.SerialNumber_Prim, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Length, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Type, handleResult);
                        toHexa.sToBParser(data.MeshID_Sec, obj.METER_FRONTHAUL.METER_MESH.meshID.Length, obj.METER_FRONTHAUL.METER_MESH.meshID.Type, handleResult);
                        toHexa.sToBParser(data.SecurityType_Sec, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Length, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.PSK_Sec, obj.METER_FRONTHAUL.METER_MESH.PSK.Length, obj.METER_FRONTHAUL.METER_MESH.PSK.Type, handleResult);
                        toHexa.sToBParser(data.Mac_Sec, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Length, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Type, handleResult);
                        toHexa.sToBParser(data.DeviceType_Sec, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Length, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Type, handleResult);
                        toHexa.sToBParser(data.SerialNumber_Sec, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Length, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Type, handleResult);
                    }
                    else if (data.Purpose === 'Fronthaul_Meter_Radio') {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.radio_band, obj.METER_FRONTHAUL.METER_RADIO.radio_band.Length, obj.METER_FRONTHAUL.METER_RADIO.radio_band.Type, handleResult);
                        toHexa.sToBParser(data.radio_mode, obj.METER_FRONTHAUL.METER_RADIO.radio_mode.Length, obj.METER_FRONTHAUL.METER_RADIO.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.chan_bw, obj.METER_FRONTHAUL.METER_RADIO.chan_bw.Length, obj.METER_FRONTHAUL.METER_RADIO.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.channel, obj.METER_FRONTHAUL.METER_RADIO.channel.Length, obj.METER_FRONTHAUL.METER_RADIO.channel.Type, handleResult);
                        toHexa.sToBParser(data.txpower, obj.METER_FRONTHAUL.METER_RADIO.txpower.Length, obj.METER_FRONTHAUL.METER_RADIO.txpower.Type, handleResult);
                        toHexa.sToBParser(data.stream_selection, obj.METER_FRONTHAUL.METER_RADIO.stream_selection.Length, obj.METER_FRONTHAUL.METER_RADIO.stream_selection.Type, handleResult);
                    } else if (data.Purpose === 'MeshScan') {
                        toHexa.sToBParser(data.radio_band, obj.METER_FRONTHAUL.METER_SCAN.radio_band.Length, obj.METER_FRONTHAUL.METER_SCAN.radio_band.Type, handleResult);
                        toHexa.sToBParser(data.scan, obj.METER_FRONTHAUL.METER_SCAN.scan.Length, obj.METER_FRONTHAUL.METER_SCAN.scan.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_Meter_Hotspot") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.vap_availabililty, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_availabililty.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.vap_action, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_action.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.status, obj.METER_FRONTHAUL.METER_HOTSPOT.Status.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.Status.Type, handleResult);
                        toHexa.sToBParser(data.ssid, obj.METER_FRONTHAUL.METER_HOTSPOT.SSID.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.SSID.Type, handleResult);
                        toHexa.sToBParser(data.security, obj.METER_FRONTHAUL.METER_HOTSPOT.WirelessSecurity.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.password, obj.METER_FRONTHAUL.METER_HOTSPOT.Password.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.Password.Type, handleResult);
                    } else if (data.Purpose === "Fronthaul_Meter_DHCP") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.Status, obj.HS_FRONTHAUL.HS_DHCP.Status.Length, obj.HS_FRONTHAUL.HS_DHCP.Status.Type, handleResult);
                        toHexa.sToBParser(data.StartIpAddr, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Type, handleResult);
                        toHexa.sToBParser(data.EndIpAddr, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Type, handleResult);
                        toHexa.sToBParser(data.Gateway, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Length, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Type, handleResult);
                        toHexa.sToBParser(data.Subnet, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Length, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Type, handleResult);
                        toHexa.sToBParser(data.PrimaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.SecondaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Type, handleResult);
                    } else if (data.Purpose === "Cloud_Connectivity") {
                        toHexa.sToBParser(data.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.hostname, obj.Cloud_Connectivity.HS_Connectivity.Hostname.Length, obj.Cloud_Connectivity.HS_Connectivity.Hostname.Type, handleResult);
                        toHexa.sToBParser(data.SAK, obj.Cloud_Connectivity.HS_Connectivity.SAK.Length, obj.Cloud_Connectivity.HS_Connectivity.SAK.Type, handleResult);
                        toHexa.sToBParser(data.url, data.url.length, obj.Cloud_Connectivity.HS_Connectivity.URL.Type, handleResult);

                    } else if (((data.Purpose === 'Register_SetConfig') && (data.action === 'COLLECTOR_REGISTERATION')) || ((data.Purpose === "upload_hs_config") && (data.action === 'UPLOAD_CONFIG_SETTINGS'))) {
                        toHexa.sToBParser(data.configData.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.configData.username, obj.BACKHAUL.CELLULAR.Username.Length, obj.BACKHAUL.CELLULAR.Username.Type, handleResult);
                        toHexa.sToBParser(data.configData.password, obj.BACKHAUL.CELLULAR.Password.Length, obj.BACKHAUL.CELLULAR.Password.Type, handleResult);
                        toHexa.sToBParser(data.configData.sim_pin, obj.BACKHAUL.CELLULAR.Sim_Pin.Length, obj.BACKHAUL.CELLULAR.Sim_Pin.Type, handleResult);
                        toHexa.sToBParser(data.configData.network_selection, obj.BACKHAUL.CELLULAR.Network_Selection.Length, obj.BACKHAUL.CELLULAR.Network_Selection.Type, handleResult);
                        toHexa.sToBParser(data.configData.carrier, obj.BACKHAUL.CELLULAR.Carrier.Length, obj.BACKHAUL.CELLULAR.Carrier.Type, handleResult);

                        toHexa.sToBParser(data.configData.bmode, obj.BACKHAUL.ETHERNET.Mode.Length, obj.BACKHAUL.ETHERNET.Mode.Type, handleResult);
                        toHexa.sToBParser(data.configData.bip, obj.BACKHAUL.ETHERNET.IP.Length, obj.BACKHAUL.ETHERNET.IP.Type, handleResult);
                        toHexa.sToBParser(data.configData.bgateway, obj.BACKHAUL.ETHERNET.Gateway.Length, obj.BACKHAUL.ETHERNET.Gateway.Type, handleResult);
                        toHexa.sToBParser(data.configData.bsubnet, obj.BACKHAUL.ETHERNET.Subnet.Length, obj.BACKHAUL.ETHERNET.Subnet.Type, handleResult);
                        toHexa.sToBParser(data.configData.bprimary_dns, obj.BACKHAUL.ETHERNET.Primary_DNS.Length, obj.BACKHAUL.ETHERNET.Primary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.configData.bsecondary_dns, obj.BACKHAUL.ETHERNET.Secondary_DNS.Length, obj.BACKHAUL.ETHERNET.Secondary_DNS.Type, handleResult);

                        toHexa.sToBParser(data.configData.primary_backhaul, obj.BACKHAUL.ADVANCED.Primary_Bachaul.Length, obj.BACKHAUL.ADVANCED.Primary_Bachaul.Type, handleResult);
                        toHexa.sToBParser(data.configData.auto_switchover, obj.BACKHAUL.ADVANCED.Auto_Switchover.Length, obj.BACKHAUL.ADVANCED.Auto_Switchover.Type, handleResult);
                        toHexa.sToBParser(data.configData.r2_radio_mode, obj.HS_FRONTHAUL.RADIO_2_4.radio_mode.Length, obj.HS_FRONTHAUL.RADIO_2_4.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.configData.r2_chan_bw, obj.HS_FRONTHAUL.RADIO_2_4.chan_bw.Length, obj.HS_FRONTHAUL.RADIO_2_4.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.configData.r2_channel, obj.HS_FRONTHAUL.RADIO_2_4.channel.Length, obj.HS_FRONTHAUL.RADIO_2_4.channel.Type, handleResult);
                        toHexa.sToBParser(data.configData.r2_txpower, obj.HS_FRONTHAUL.RADIO_2_4.txpower.Length, obj.HS_FRONTHAUL.RADIO_2_4.txpower.Type, handleResult);
                        toHexa.sToBParser(data.configData.r2_guard_interval, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Type, handleResult);
                        toHexa.sToBParser(data.configData.r2_stream_selection, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Type, handleResult);

                        toHexa.sToBParser(data.configData.r5l_radio_mode, obj.HS_FRONTHAUL.RADIO_5_L.radio_mode.Length, obj.HS_FRONTHAUL.RADIO_5_L.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5l_chan_bw, obj.HS_FRONTHAUL.RADIO_5_L.chan_bw.Length, obj.HS_FRONTHAUL.RADIO_5_L.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5l_channel, obj.HS_FRONTHAUL.RADIO_5_L.channel.Length, obj.HS_FRONTHAUL.RADIO_5_L.channel.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5l_txpower, obj.HS_FRONTHAUL.RADIO_5_L.txpower.Length, obj.HS_FRONTHAUL.RADIO_5_L.txpower.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5l_guard_interval, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5l_stream_selection, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Type, handleResult);

                        toHexa.sToBParser(data.configData.r5h_radio_mode, obj.HS_FRONTHAUL.RADIO_5_H.radio_mode.Length, obj.HS_FRONTHAUL.RADIO_5_H.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5h_chan_bw, obj.HS_FRONTHAUL.RADIO_5_H.chan_bw.Length, obj.HS_FRONTHAUL.RADIO_5_H.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5h_channel, obj.HS_FRONTHAUL.RADIO_5_H.channel.Length, obj.HS_FRONTHAUL.RADIO_5_H.channel.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5h_txpower, obj.HS_FRONTHAUL.RADIO_5_H.txpower.Length, obj.HS_FRONTHAUL.RADIO_5_H.txpower.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5h_guard_interval, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Length, obj.HS_FRONTHAUL.RADIO_2_4.guard_interval.Type, handleResult);
                        toHexa.sToBParser(data.configData.r5h_stream_selection, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Length, obj.HS_FRONTHAUL.RADIO_2_4.stream_selection.Type, handleResult);

                        toHexa.sToBParser(data.configData.m2_mesh_vap_action, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Length, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Type, handleResult);
                        toHexa.sToBParser(data.configData.m2_meshID, obj.HS_FRONTHAUL.MESH_2_4.meshID.Length, obj.HS_FRONTHAUL.MESH_2_4.meshID.Type, handleResult);
                        toHexa.sToBParser(data.configData.m2_securityType, obj.HS_FRONTHAUL.MESH_2_4.SecurityType.Length, obj.HS_FRONTHAUL.MESH_2_4.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.configData.m2_PSK, obj.HS_FRONTHAUL.MESH_2_4.PSK.Length, obj.HS_FRONTHAUL.MESH_2_4.PSK.Type, handleResult);

                        toHexa.sToBParser(data.configData.m5_mesh_vap_action, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Length, obj.HS_FRONTHAUL.MESH_2_4.mesh_vap_action.Type, handleResult);
                        toHexa.sToBParser(data.configData.m5_meshID, obj.HS_FRONTHAUL.MESH_5_L.meshID.Length, obj.HS_FRONTHAUL.MESH_5_L.meshID.Type, handleResult);
                        toHexa.sToBParser(data.configData.m5_securityType, obj.HS_FRONTHAUL.MESH_5_L.SecurityType.Length, obj.HS_FRONTHAUL.MESH_5_L.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.configData.m5_PSK, obj.HS_FRONTHAUL.MESH_5_L.PSK.Length, obj.HS_FRONTHAUL.MESH_5_L.PSK.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_vap_availabililty, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_vap_action, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_status, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_ssid, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_security, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_password, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Type, handleResult);

                        toHexa.sToBParser(data.configData.h2_vap_availabililty1, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_vap_action1, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_status1, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_ssid1, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_security1, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.configData.h2_password1, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Type, handleResult);


                        toHexa.sToBParser(data.configData.h5_vap_availabililty, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_vap_action, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_status, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_ssid, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_security, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_password, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Type, handleResult);

                        toHexa.sToBParser(data.configData.h5_vap_availabililty1, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_vap_action1, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_status1, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_ssid1, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.SSID.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_security1, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.configData.h5_password1, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Length, obj.HS_FRONTHAUL.HOTSPOT_2_4.Password.Type, handleResult);

                        toHexa.sToBParser(data.configData.Server, obj.HS_FRONTHAUL.HS_DHCP.Server.Length, obj.HS_FRONTHAUL.HS_DHCP.Server.Type, handleResult);
                        toHexa.sToBParser(data.configData.Status, obj.HS_FRONTHAUL.HS_DHCP.Status.Length, obj.HS_FRONTHAUL.HS_DHCP.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.StartIpAddr, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Type, handleResult);
                        toHexa.sToBParser(data.configData.EndIpAddr, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Type, handleResult);
                        toHexa.sToBParser(data.configData.Gateway, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Length, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Type, handleResult);
                        toHexa.sToBParser(data.configData.Subnet, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Length, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Type, handleResult);
                        toHexa.sToBParser(data.configData.PrimaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.configData.SecondaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.configData.Server1, obj.HS_FRONTHAUL.HS_DHCP.Server.Length, obj.HS_FRONTHAUL.HS_DHCP.Server.Type, handleResult);
                        toHexa.sToBParser(data.configData.Status1, obj.HS_FRONTHAUL.HS_DHCP.Status.Length, obj.HS_FRONTHAUL.HS_DHCP.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.StartIpAddr1, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Type, handleResult);
                        toHexa.sToBParser(data.configData.EndIpAddr1, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Type, handleResult);
                        toHexa.sToBParser(data.configData.Gateway1, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Length, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Type, handleResult);
                        toHexa.sToBParser(data.configData.Subnet1, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Length, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Type, handleResult);
                        toHexa.sToBParser(data.configData.PrimaryDNS1, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.configData.SecondaryDNS1, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Type, handleResult);

                        toHexa.sToBParser(data.configData.hostname, obj.Cloud_Connectivity.HS_Connectivity.Hostname.Length, obj.Cloud_Connectivity.HS_Connectivity.Hostname.Type, handleResult);
                        toHexa.sToBParser(data.configData.SAK, obj.Cloud_Connectivity.HS_Connectivity.SAK.Length, obj.Cloud_Connectivity.HS_Connectivity.SAK.Type, handleResult);
                        toHexa.sToBParser(data.configData.cerFile, obj.Cloud_Connectivity.HS_Connectivity.URL.Length, obj.Cloud_Connectivity.HS_Connectivity.URL.Type, handleResult);
                       
                        toHexa.sToBParser(data.configData.bw_status, obj.CONFIGURATION.HS_BANDWIDTH.Status.Length, obj.CONFIGURATION.HS_BANDWIDTH.Status.Type, handleResult);
                       toHexa.sToBParser(data.configData.bw_upload, obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Length, obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Type, handleResult);
                       toHexa.sToBParser(data.configData.bw_downlaod, obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Length, obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Type, handleResult);

                        toHexa.sToBParser(data.configData.sysname, obj.System_Settings.HS_System_Settings.SystemName.Length, obj.System_Settings.HS_System_Settings.SystemName.Type, handleResult);
                        toHexa.sToBParser(data.configData.country, obj.System_Settings.HS_System_Settings.Country.Length, obj.System_Settings.HS_System_Settings.Country.Type, handleResult);
                        toHexa.sToBParser(data.configData.timezone, obj.System_Settings.HS_System_Settings.Timezone.Length, obj.System_Settings.HS_System_Settings.Timezone.Type, handleResult);
                    }  else if ((data.Purpose === "Register_GetConfig") && (data.action === 'METER_REGISTERATION')) {
                        toHexa.sToBParser(data.serialNumber, obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Length, obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Type, handleResult);
                    } else if (((data.Purpose === "Register_SetConfig") && (data.action === 'METER_REGISTERATION'))||((data.Purpose === "upload_meter_config") && (data.action === 'UPLOAD_CONFIG_SETTINGS'))) {
                        toHexa.sToBParser(data.serialNumber, obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Length, obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Type, handleResult);
                        toHexa.sToBParser(data.configData.config_time, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Length, obj.COLLECTOR_REGISTERATION.SET_DEVICE_CONFIG.config_time.Type, handleResult);
                        toHexa.sToBParser(data.configData.radio_band, obj.METER_FRONTHAUL.METER_RADIO.radio_band.Length, obj.METER_FRONTHAUL.METER_RADIO.radio_band.Type, handleResult);
                        toHexa.sToBParser(data.configData.radio_mode, obj.METER_FRONTHAUL.METER_RADIO.radio_mode.Length, obj.METER_FRONTHAUL.METER_RADIO.radio_mode.Type, handleResult);
                        toHexa.sToBParser(data.configData.chan_bw, obj.METER_FRONTHAUL.METER_RADIO.chan_bw.Length, obj.METER_FRONTHAUL.METER_RADIO.chan_bw.Type, handleResult);
                        toHexa.sToBParser(data.configData.channel, obj.METER_FRONTHAUL.METER_RADIO.channel.Length, obj.METER_FRONTHAUL.METER_RADIO.channel.Type, handleResult);
                        toHexa.sToBParser(data.configData.txpower, obj.METER_FRONTHAUL.METER_RADIO.txpower.Length, obj.METER_FRONTHAUL.METER_RADIO.txpower.Type, handleResult);
                        toHexa.sToBParser(data.configData.stream_selection, obj.METER_FRONTHAUL.METER_RADIO.stream_selection.Length, obj.METER_FRONTHAUL.METER_RADIO.stream_selection.Type, handleResult);
                        toHexa.sToBParser(data.configData.MeshID_Prim, obj.METER_FRONTHAUL.METER_MESH.meshID.Length, obj.METER_FRONTHAUL.METER_MESH.meshID.Type, handleResult);
                        toHexa.sToBParser(data.configData.SecurityType_Prim, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Length, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.configData.PSK_Prim, obj.METER_FRONTHAUL.METER_MESH.PSK.Length, obj.METER_FRONTHAUL.METER_MESH.PSK.Type, handleResult);
                        toHexa.sToBParser(data.configData.MeshMac_Prim, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Length, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Type, handleResult);
                        toHexa.sToBParser(data.configData.MeshDeviceType_Prim, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Length, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Type, handleResult);
                        toHexa.sToBParser(data.configData.MeshSerialNumber_Prim, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Length, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Type, handleResult);

                        toHexa.sToBParser(data.configData.MeshID_Sec, obj.METER_FRONTHAUL.METER_MESH.meshID.Length, obj.METER_FRONTHAUL.METER_MESH.meshID.Type, handleResult);
                        toHexa.sToBParser(data.configData.SecurityType_Sec, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Length, obj.METER_FRONTHAUL.METER_MESH.SecurityType.Type, handleResult);
                        toHexa.sToBParser(data.configData.PSK_Sec, obj.METER_FRONTHAUL.METER_MESH.PSK.Length, obj.METER_FRONTHAUL.METER_MESH.PSK.Type, handleResult);
                        toHexa.sToBParser(data.configData.MeshMac_Sec, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Length, obj.METER_FRONTHAUL.METER_MESH.MeshMac.Type, handleResult);
                        toHexa.sToBParser(data.configData.MeshDeviceType_Sec, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Length, obj.METER_FRONTHAUL.METER_MESH.MeshDeviceType.Type, handleResult);
                        toHexa.sToBParser(data.configData.MeshSerialNumber_Sec, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Length, obj.METER_FRONTHAUL.METER_MESH.MeshSerialNumber.Type, handleResult);

                        toHexa.sToBParser(data.configData.vap_availabililty, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_availabililty.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_availabililty.Type, handleResult);
                        toHexa.sToBParser(data.configData.vap_action, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_action.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.vap_action.Type, handleResult);
                        toHexa.sToBParser(data.configData.status, obj.METER_FRONTHAUL.METER_HOTSPOT.Status.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.ssid, obj.METER_FRONTHAUL.METER_HOTSPOT.SSID.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.SSID.Type, handleResult);
                        toHexa.sToBParser(data.configData.security, obj.METER_FRONTHAUL.METER_HOTSPOT.WirelessSecurity.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.WirelessSecurity.Type, handleResult);
                        toHexa.sToBParser(data.configData.password, obj.METER_FRONTHAUL.METER_HOTSPOT.Password.Length, obj.METER_FRONTHAUL.METER_HOTSPOT.Password.Type, handleResult);
                        toHexa.sToBParser(data.configData.Status1, obj.HS_FRONTHAUL.HS_DHCP.Status.Length, obj.HS_FRONTHAUL.HS_DHCP.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.StartIpAddr, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.StartAddress.Type, handleResult);
                        toHexa.sToBParser(data.configData.EndIpAddr, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Length, obj.HS_FRONTHAUL.HS_DHCP.EndAddress.Type, handleResult);
                        toHexa.sToBParser(data.configData.Gateway, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Length, obj.HS_FRONTHAUL.HS_DHCP.Gateway.Type, handleResult);
                        toHexa.sToBParser(data.configData.Subnet, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Length, obj.HS_FRONTHAUL.HS_DHCP.Subnet.Type, handleResult);
                        toHexa.sToBParser(data.configData.PrimaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Primary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.configData.SecondaryDNS, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Length, obj.HS_FRONTHAUL.HS_DHCP.Secondary_DNS.Type, handleResult);
                        toHexa.sToBParser(data.configData.uti_ID, obj.Configuration_Meter.Meter_Config.UtilityID.Length, obj.Configuration_Meter.Meter_Config.UtilityID.Type, handleResult);
                        toHexa.sToBParser(data.configData.cir_ID, obj.Configuration_Meter.Meter_Config.CircuitID.Length, obj.Configuration_Meter.Meter_Config.CircuitID.Type, handleResult);
                        toHexa.sToBParser(data.configData.cer_num, obj.Configuration_Meter.Meter_Config.CertificationNumber.Length, obj.Configuration_Meter.Meter_Config.CertificationNumber.Type, handleResult);
                        toHexa.sToBParser(data.configData.esn, obj.Configuration_Meter.Meter_Config.MeterESN.Length, obj.Configuration_Meter.Meter_Config.MeterESN.Type, handleResult);

                        toHexa.sToBParser(data.configData.bw_status, obj.CONFIGURATION.HS_BANDWIDTH.Status.Length, obj.CONFIGURATION.HS_BANDWIDTH.Status.Type, handleResult);
                        toHexa.sToBParser(data.configData.bw_upload, obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Length, obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Type, handleResult);
                        toHexa.sToBParser(data.configData.bw_downlaod, obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Length, obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Type, handleResult);

                        toHexa.sToBParser(data.configData.sysname, obj.System_Settings.HS_System_Settings.SystemName.Length, obj.System_Settings.HS_System_Settings.SystemName.Type, handleResult);
                        toHexa.sToBParser(data.configData.country, obj.System_Settings.HS_System_Settings.Country.Length, obj.System_Settings.HS_System_Settings.Country.Type, handleResult);
                        toHexa.sToBParser(data.configData.timezone, obj.System_Settings.HS_System_Settings.Timezone.Length, obj.System_Settings.HS_System_Settings.Timezone.Type, handleResult);
                    } else if (data.Purpose === "SendMACIDs") {
                        toHexa.sToBParser(data.Length, "1", "int", handleResult);
                        if (data.action == "MAC_ACL") {
                            if (data.attribute == "MAC_ACL_UPDATE") {
                                result += data.update;
                                result += data.MacIDDetails[1];
                                toHexa.sToBParser(data.deviceType, "15", "string", handleResult)
                            } else if (data.attribute == "MAC_ACL_DEREGISTER") {
                                result += data.MacDetails;
                            } else {
                                for (var ids in data.MacIDDetails) {
                                    if (data.MacIDDetails.hasOwnProperty(ids)) {
                                        result += data.MacIDDetails[ids];
                                        toHexa.sToBParser(data.deviceType, "15", "string", handleResult)
                                    }
                                }
                            }
                        } else if (data.action == 'ENDPOINT_UPDATE') {

                            for (var ids in data.MacIDDetails) {
                                if (data.MacIDDetails.hasOwnProperty(ids)) {
                                    var keyArr = ids.split('_');
                                    toHexa.sToBParser(keyArr[0], "1", "int", handleResult);
                                    result += data.update;
                                    result += keyArr[1];
                                    toHexa.sToBParser(data.MacIDDetails[ids], "15", "string", handleResult)
                                    }
                            }
                        } else if (data.action == 'ENDPOINT_DEREGISTERATION') {
                            for (var ids in data.MacIDDetails) {
                                if (data.MacIDDetails.hasOwnProperty(ids)) {
                                    var keyArr = data.MacIDDetails[ids].split('_');
                                    toHexa.sToBParser(keyArr[0], "1", "int", handleResult);
                                    result += keyArr[1];
                                }
                            }
                        } else {
                            for (var ids in data.MacIDDetails) {
                                if (data.MacIDDetails.hasOwnProperty(ids)) {
                                    var keyArr = ids.split('_');
                                    toHexa.sToBParser(keyArr[0], "1", "int", handleResult)
                                    result += keyArr[1];
                                    toHexa.sToBParser(data.MacIDDetails[ids], "15", "string", handleResult)
                                }
                            }
                        }
                    } else if (data.Purpose === "UPDATEMACIDs") {
                        toHexa.sToBParser(data.Length, "1", "int", handleResult);
                        for (var ids in data.MacIDDetails) {
                            if (data.MacIDDetails.hasOwnProperty(ids))
                                result += data.MacIDDetails[ids];
                        }
                    } else if (data.Purpose === "HS_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HS_VERBOSITY.error.Length, obj.LOGS.HS_VERBOSITY.error.Type, handleResult);
                                break;
                            case 2:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HS_VERBOSITY.warning.Length, obj.LOGS.HS_VERBOSITY.warning.Type, handleResult);
                                break;
                            case 3:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HS_VERBOSITY.info.Length, obj.LOGS.HS_VERBOSITY.info.Type, handleResult);
                                break;
                            case 4:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HS_VERBOSITY.debug.Length, obj.LOGS.HS_VERBOSITY.debug.Type, handleResult);
                                break;
                            default:
                                console.log("invalid sToBParser")
                        }
                    }
                    else if (data.Purpose === "HH_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HH_VERBOSITY.error.Length, obj.LOGS.HH_VERBOSITY.error.Type, handleResult);
                                break;
                            case 2:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HH_VERBOSITY.warning.Length, obj.LOGS.HH_VERBOSITY.warning.Type, handleResult);
                                break;
                            case 3:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HH_VERBOSITY.info.Length, obj.LOGS.HH_VERBOSITY.info.Type, handleResult);
                                break;
                            case 4:
                                toHexa.sToBParser(data.LogType, obj.LOGS.HH_VERBOSITY.debug.Length, obj.LOGS.HH_VERBOSITY.debug.Type, handleResult);
                                break;
                            default:
                                console.log("invalid sToBParser")
                        }
                    } else if (data.Purpose === "METER_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                toHexa.sToBParser(data.LogType, obj.LOGS.METER_VERBOSITY.error.Length, obj.LOGS.METER_VERBOSITY.error.Type, handleResult);
                                break;
                            case 2:
                                toHexa.sToBParser(data.LogType, obj.LOGS.METER_VERBOSITY.warning.Length, obj.LOGS.METER_VERBOSITY.warning.Type, handleResult);
                                break;
                            case 3:
                                toHexa.sToBParser(data.LogType, obj.LOGS.METER_VERBOSITY.info.Length, obj.LOGS.METER_VERBOSITY.info.Type, handleResult);
                                break;
                            case 4:
                                toHexa.sToBParser(data.LogType, obj.LOGS.METER_VERBOSITY.debug.Length, obj.LOGS.METER_VERBOSITY.debug.Type, handleResult);
                                break;
                            default:
                                console.log("invalid sToBParser")
                        }
                    } else if (data.Purpose === "DL_CHANGE_VERBOSITY") {
                        switch (data.LogType) {
                            case 1:
                                toHexa.sToBParser(data.LogType, obj.LOGS.DL_VERBOSITY.error.Length, obj.LOGS.DL_VERBOSITY.error.Type, handleResult);
                                break;
                            case 2:
                                toHexa.sToBParser(data.LogType, obj.LOGS.DL_VERBOSITY.warning.Length, obj.LOGS.DL_VERBOSITY.warning.Type, handleResult);
                                break;
                            case 3:
                                toHexa.sToBParser(data.LogType, obj.LOGS.DL_VERBOSITY.info.Length, obj.LOGS.DL_VERBOSITY.info.Type, handleResult);
                                break;
                            case 4:
                                toHexa.sToBParser(data.LogType, obj.LOGS.DL_VERBOSITY.debug.Length, obj.LOGS.DL_VERBOSITY.debug.Type, handleResult);
                                break;
                            default:
                                console.log("invalid sToBParser")

                        }

                    } else if (data.Purpose === "DeltalinkBandwidthEdit") {
                        toHexa.sToBParser(data.DeltalinkBandwdith, obj.CONFIGURATION.DELTALINK_BANDWIDTH.DeltalinkBandwdith.Length, obj.CONFIGURATION.DELTALINK_BANDWIDTH.DeltalinkBandwdith.Type, handleResult);
                        toHexa.sToBParser(data.DeltalinkDownloadBandwidth, obj.CONFIGURATION.DELTALINK_BANDWIDTH.DeltalinkDownloadBandwidth.Length, obj.CONFIGURATION.DELTALINK_BANDWIDTH.DeltalinkDownloadBandwidth.Type, handleResult);
                        toHexa.sToBParser(data.DeltalinkUploadBandwidth, obj.CONFIGURATION.DELTALINK_BANDWIDTH.DeltalinkUploadBandwidth.Length, obj.CONFIGURATION.DELTALINK_BANDWIDTH.DeltalinkUploadBandwidth.Type, handleResult);

                    } else if (data.Purpose === "METER_BANDWIDTH") {
                        toHexa.sToBParser(data.config_time, obj.CONFIGURATION.METER_BANDWIDTH.config_time.Length, obj.CONFIGURATION.METER_BANDWIDTH.config_time.Type, handleResult);
                        toHexa.sToBParser(data.Status, obj.CONFIGURATION.METER_BANDWIDTH.Status.Length, obj.CONFIGURATION.METER_BANDWIDTH.Status.Type, handleResult);
                        toHexa.sToBParser(data.UploadBandwidth, obj.CONFIGURATION.METER_BANDWIDTH.UploadBandwidth.Length, obj.CONFIGURATION.METER_BANDWIDTH.UploadBandwidth.Type, handleResult);
                        toHexa.sToBParser(data.DownloadBandwidth, obj.CONFIGURATION.METER_BANDWIDTH.DownloadBandwidth.Length, obj.CONFIGURATION.METER_BANDWIDTH.DownloadBandwidth.Type, handleResult);

                    } else if (data.Purpose == "HS_BANDWIDTH") {
                        toHexa.sToBParser(data.config_time, obj.CONFIGURATION.HS_BANDWIDTH.config_time.Length, obj.CONFIGURATION.HS_BANDWIDTH.config_time.Type, handleResult);
                        toHexa.sToBParser(data.Status, obj.CONFIGURATION.HS_BANDWIDTH.Status.Length, obj.CONFIGURATION.HS_BANDWIDTH.Status.Type, handleResult);
                        toHexa.sToBParser(data.UploadBandwidth, obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Length, obj.CONFIGURATION.HS_BANDWIDTH.UploadBandwidth.Type, handleResult);
                        toHexa.sToBParser(data.DownloadBandwidth, obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Length, obj.CONFIGURATION.HS_BANDWIDTH.DownloadBandwidth.Type, handleResult);

                    } else if (data.Purpose == "HH_BANDWIDTH") {
                        toHexa.sToBParser(data.config_time, obj.CONFIGURATION.HH_BANDWIDTH.config_time.Length, obj.CONFIGURATION.HH_BANDWIDTH.config_time.Type, handleResult);
                        toHexa.sToBParser(data.Status, obj.CONFIGURATION.HH_BANDWIDTH.Status.Length, obj.CONFIGURATION.HH_BANDWIDTH.Status.Type, handleResult);
                        toHexa.sToBParser(data.UploadBandwidth, obj.CONFIGURATION.HH_BANDWIDTH.UploadBandwidth.Length, obj.CONFIGURATION.HH_BANDWIDTH.UploadBandwidth.Type, handleResult);
                        toHexa.sToBParser(data.DownloadBandwidth, obj.CONFIGURATION.HH_BANDWIDTH.DownloadBandwidth.Length, obj.CONFIGURATION.HH_BANDWIDTH.DownloadBandwidth.Type, handleResult);

                    } if ((data.action === "METER_REGISTERATION") && (data.Purpose === "RegistrationSuccess")) {
                        toHexa.sToBParser(data.serialNumber, obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Length, obj.METER_REGISTERATION.REGISTRATION_PARA.SERIAL_NO.Type, handleResult);
                    } else if ((data.action === "DELTALINK_REGISTER") && (data.attribute === "REGISTRATION_PARA") && (data.Purpose === "RegistrationSuccess")) {
                        toHexa.sToBParser(data.serialNumber, obj.DELTALINK_REGISTER.REGISTRATION_PARA.SERIAL_NO.Length, obj.DELTALINK_REGISTER.REGISTRATION_PARA.SERIAL_NO.Type, handleResult);
                    } else if (data.Purpose === "RegistrationError") {
                        switch (data.parameter) {
                            case 'SerialNumber':
                                result += '01';
                                break;
                            case 'MACID':
                                result += '02';
                                break;
                            case 'NotRegistered':
                                result += '03';
                                break;
                            case 'CellID':
                                result += '04';
                                break;
                            case 'MeterID':
                                result += '05';
                                break;
                            case 'WrongMapping':
                                result += '06';
                                break;
                            case 'MeterNotRegistered':
                                result += '08';
                                break;
                            case 'DeltalinkID':
                                result += '09';
                                break;
                            default:
                                result += '07';
                                break;
                        }
                    }
                    if ((data.action === "METER_REGISTERATION") && (data.attribute === "REGISTRATION_PARA") && (data.Purpose !== "RegistrationSuccess")&& (data.Purpose !== "Register_SetConfig")) {
                        toHexa.sToBParser(data.serialNumber, obj.METER_REGISTERATION[data.attribute].SERIAL_NO.Length, obj.METER_REGISTERATION[data.attribute].SERIAL_NO.Type, handleResult);
                    }
                    if ((data.action === "DELTALINK_REGISTER") && (data.attribute === "REGISTRATION_PARA") && (data.Purpose !== "RegistrationSuccess") && (data.Purpose === "RegistrationError")) {
                        toHexa.sToBParser(data.serialNumber, obj.DELTALINK_REGISTER["DL_CONFIG"].SERIAL_NO.Length, obj.DELTALINK_REGISTER["DL_CONFIG"].SERIAL_NO.Type, handleResult);
                    }
                    if ((data.action === "DELTALINK_REGISTER") && (data.attribute === "REGISTRATION_PARA") && (data.Purpose !== "RegistrationSuccess") && (data.Purpose !== "RegistrationError")) {
                        toHexa.sToBParser(data.serialNumber, obj.DELTALINK_REGISTER["DL_CONFIG"].SERIAL_NO.Length, obj.DELTALINK_REGISTER["DL_CONFIG"].SERIAL_NO.Type, handleResult);
                        toHexa.sToBParser(data.BW_Enable, obj.DELTALINK_REGISTER["DL_CONFIG"].BW_Enable.Length, obj.DELTALINK_REGISTER["DL_CONFIG"].BW_Enable.Type, handleResult);
                        toHexa.sToBParser(data.BW_Upload, obj.DELTALINK_REGISTER["DL_CONFIG"].BW_Upload.Length, obj.DELTALINK_REGISTER["DL_CONFIG"].BW_Upload.Type, handleResult);
                        toHexa.sToBParser(data.BW_Download, obj.DELTALINK_REGISTER["DL_CONFIG"].BW_Download.Length, obj.DELTALINK_REGISTER["DL_CONFIG"].BW_Download.Type, handleResult);
                    }
                    // //Add deltaLinkId
                    // if (data.Purpose == "DL_FACTORY_RESET" && data.attribute == 'DL_FULL_FACTORY_RESET') {
                    //     toHexa.sToBParser(data.deltalinkid, obj.FACTORY_RESET.DL_FULL_FACTORY_RESET.DeltalinkID.Length, obj.FACTORY_RESET.DL_FULL_FACTORY_RESET.DeltalinkID.Type, handleResult);
                    // } else if (data.Purpose == "DL_FACTORY_RESET" && data.attribute == 'DL_SHALLOW_FACTORY_RESET') {
                    //     toHexa.sToBParser(data.deltalinkid, obj.FACTORY_RESET.DL_SHALLOW_FACTORY_RESET.DeltalinkID.Length, obj.FACTORY_RESET.DL_SHALLOW_FACTORY_RESET.DeltalinkID.Type, handleResult);
                    // }
                    break;
                case 'CRC':
                    var buf = new Buffer(result, 'hex');
                    var crcResult = CRC16(buf);
                    result += new Buffer(crcResult).toString('hex');
                    break;
                default:
                    break;
            }
        }
    }
    function handleResult(err, output) {
        if (err) {
            objErr = err;
        } else {
            result += output;

        }
    }
    result = objErr ? null : result;
  //  console.log("hex packet", result)
    return callback(objErr, result);
}

module.exports = {
    hexaCreation: hexaCreation
}
