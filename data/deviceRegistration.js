var devReg = require('../data/deviceRegistrationCommonFunctions.js');
/**
* @description - device Registeration
* @params - Action, Attribute, SerialNumber, rev, messageid, countrycode, regioncode, cellid, meterid, deviceID, RegistrationJobID, callback
* @return callback function
*/
function deviceReg(Action, Attribute, SerialNumber, rev, messageid, countrycode, regioncode, cellid, meterid, deviceID, RegistrationJobID, ConfigData, callback) {
    try {
        rev = (rev) ? rev : 0;
        countrycode = (countrycode) ? countrycode : 0;
        regioncode = (regioncode) ? regioncode : 0;
       
        if (Action == 'COLLECTOR_REGISTERATION' && Attribute == 'REGISTRATION_PARA') {
            if (ConfigData[0].DeviceType == 'hs')
                deviceID = 'HS-' + SerialNumber;
            else
                deviceID = 'HH-' + SerialNumber;
            var configData = setConfig(Action, ConfigData);

            var data = {
                "action": Action,
                "attribute": Attribute,
                "serialNumber": SerialNumber,
                "rev": rev,
                "messageid": messageid,
                "countrycode": countrycode,
                "regioncode": regioncode,
                "cellid": cellid,
                "meterid": meterid,
                "deviceID": deviceID,
                "configData": configData,
                "Purpose": "Register_SetConfig",
                "JobID": RegistrationJobID
            }

        } else if (Action == 'COLLECTOR_REGISTERATION' && Attribute == 'GET_DEVICE_CONFIG') {
            if (ConfigData[0].DeviceType == 'hs')
                deviceID = 'HS-' + SerialNumber;
            else
                deviceID = 'HH-' + SerialNumber;
            var data = {
                "action": Action,
                "attribute": Attribute,
                "serialNumber": SerialNumber,
                "rev": rev,
                "messageid": messageid,
                "countrycode": countrycode,
                "regioncode": regioncode,
                "cellid": cellid,
                "meterid": meterid,
                "deviceID": deviceID,
                "Purpose": "Register_GetConfig",
                "JobID": RegistrationJobID
            }
        } else if (Action == 'METER_REGISTERATION' && Attribute == 'REGISTRATION_PARA') {
            var configData = setConfig(Action, ConfigData);

            var data = {
                "action": Action,
                "attribute": Attribute,
                "serialNumber": SerialNumber,
                "rev": rev,
                "messageid": messageid,
                "countrycode": countrycode,
                "regioncode": regioncode,
                "cellid": cellid,
                "meterid": meterid,
                "deviceID": deviceID,
                "configData": configData,
                "Purpose": "Register_SetConfig",
                "JobID": RegistrationJobID
            }
        } else {
            var data = {
                "action": Action,
                "attribute": Attribute,
                "serialNumber": SerialNumber,
                "rev": rev,
                "messageid": messageid,
                "countrycode": countrycode,
                "regioncode": regioncode,
                "cellid": cellid,
                "meterid": meterid,
                "deviceID": deviceID,
                "Purpose": "RegistrationNextStep",
                "JobID": RegistrationJobID
            }
        }
        devReg.deviceRegistration(data, function (err, response) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, response);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
function deviceDLReg(Action, Attribute, DLData, rev, messageid, countrycode, regioncode, cellid, DLid, deviceID, RegistrationJobID, callback) {
    try {
        rev = (rev) ? rev : 0;
        countrycode = (countrycode) ? countrycode : 0;
        regioncode = (regioncode) ? regioncode : 0;

        var data = {
            "action": Action,
            "attribute": Attribute,
            "serialNumber": DLData.DeltalinkSerialNumber,
            "rev": rev,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": cellid,
            "meterid": DLid,
            "deviceID": deviceID,
            "Purpose": "RegistrationNextStep",
            "BW_Enable": DLData.Bandwidth,
            "BW_Upload": DLData.UploadBandwidth,
            "BW_Download": DLData.DownloadBandwidth,
            "JobID": RegistrationJobID
        }
        devReg.deviceRegistration(data, function (err, response) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, response);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

function setConfig(Action, ConfigData) {
    var cloud_time = parseInt(ConfigData[0].config_UpdateTime);
    if (ConfigData[0].System_Settings.country) {
        ConfigData[0].System_Settings.country = ConfigData[0].System_Settings.country.split(" ");

        for (var i = 0, x = ConfigData[0].System_Settings.country.length; i < x; i++) {
            ConfigData[0].System_Settings.country[i] = ConfigData[0].System_Settings.country[i][0].toUpperCase() + ConfigData[0].System_Settings.country[i].substr(1).toLowerCase();;
        }
        ConfigData[0].System_Settings.country = ConfigData[0].System_Settings.country.join(" ");
        if (ConfigData[0].System_Settings.country == "Usa")
            ConfigData[0].System_Settings.country = "USA";
    }
    if (Action == 'COLLECTOR_REGISTERATION') {
        ConfigData[0].BackHaul.Cellular.carrier = ConfigData[0].BackHaul.Cellular.carrier ? ConfigData[0].BackHaul.Cellular.carrier : '';
        
        var insertData = {
            //config time
            "config_time": cloud_time,
            //cellular
            "username": ConfigData[0].BackHaul.Cellular.username,
            "password": ConfigData[0].BackHaul.Cellular.password,
            "sim_pin": ConfigData[0].BackHaul.Cellular.sim_pin,
            "network_selection": ConfigData[0].BackHaul.Cellular.network_selection,
            "carrier": ConfigData[0].BackHaul.Cellular.carrier,
            //ethernet
            "bmode": ConfigData[0].BackHaul.Ethernet.mode,
            "bip": ConfigData[0].BackHaul.Ethernet.ip,
            "bgateway": ConfigData[0].BackHaul.Ethernet.gateway,
            "bsubnet": ConfigData[0].BackHaul.Ethernet.subnet,
            "bprimary_dns": ConfigData[0].BackHaul.Ethernet.primary_dns,
            "bsecondary_dns": ConfigData[0].BackHaul.Ethernet.secondary_dns,
            //Advanced
            "primary_backhaul": ConfigData[0].BackHaul.Advanced.primary_backhaul,
            "auto_switchover": ConfigData[0].BackHaul.Advanced.auto_switchover,
            //Radio 2_4
            "r2_radio_mode": ConfigData[0].FrontHaul.Radio_Configuration.two_four.radio_mode,
            "r2_chan_bw": ConfigData[0].FrontHaul.Radio_Configuration.two_four.chan_bw,
            "r2_channel": ConfigData[0].FrontHaul.Radio_Configuration.two_four.channel,
            "r2_txpower": ConfigData[0].FrontHaul.Radio_Configuration.two_four.txpower,
            "r2_stream_selection": ConfigData[0].FrontHaul.Radio_Configuration.two_four.stream_selection,
            "r2_guard_interval": ConfigData[0].FrontHaul.Radio_Configuration.two_four.guard_interval,
            //Radio 5_L
            "r5l_radio_mode": ConfigData[0].FrontHaul.Radio_Configuration.five_low.radio_mode,
            "r5l_chan_bw": ConfigData[0].FrontHaul.Radio_Configuration.five_low.chan_bw,
            "r5l_channel": ConfigData[0].FrontHaul.Radio_Configuration.five_low.channel,
            "r5l_txpower": ConfigData[0].FrontHaul.Radio_Configuration.five_low.txpower,
            "r5l_stream_selection": ConfigData[0].FrontHaul.Radio_Configuration.five_low.stream_selection,
            "r5l_guard_interval": ConfigData[0].FrontHaul.Radio_Configuration.five_low.guard_interval,
            //Radio 5_H
            "r5h_radio_mode": ConfigData[0].FrontHaul.Radio_Configuration.five_high.radio_mode,
            "r5h_chan_bw": ConfigData[0].FrontHaul.Radio_Configuration.five_high.chan_bw,
            "r5h_channel": ConfigData[0].FrontHaul.Radio_Configuration.five_high.channel,
            "r5h_txpower": ConfigData[0].FrontHaul.Radio_Configuration.five_high.txpower,
            "r5h_stream_selection": ConfigData[0].FrontHaul.Radio_Configuration.five_high.stream_selection,
            "r5h_guard_interval": ConfigData[0].FrontHaul.Radio_Configuration.five_high.guard_interval,
            //Mesh 2_4
            "m2_meshID": ConfigData[0].FrontHaul.Mesh_Configuration.two_four.meshID,
            "m2_securityType": ConfigData[0].FrontHaul.Mesh_Configuration.two_four.securityType,
            "m2_PSK": ConfigData[0].FrontHaul.Mesh_Configuration.two_four.PSK,
            "m2_mesh_vap_action": 1,
            //Mesh 5h
            "m5_meshID": ConfigData[0].FrontHaul.Mesh_Configuration.five_high.meshID,
            "m5_securityType": ConfigData[0].FrontHaul.Mesh_Configuration.five_high.securityType,
            "m5_PSK": ConfigData[0].FrontHaul.Mesh_Configuration.five_high.PSK,
            "m5_mesh_vap_action": 1,
            //Hotspot 2_4
            "h2_vap_availabililty": 1,
            "h2_vap_action": 1,
            "h2_status": ConfigData[0].FrontHaul.Hotspot_Configuration.two_four.status,
            "h2_ssid": ConfigData[0].FrontHaul.Hotspot_Configuration.two_four.ssid,
            "h2_password": ConfigData[0].FrontHaul.Hotspot_Configuration.two_four.password,
            "h2_security": ConfigData[0].FrontHaul.Hotspot_Configuration.two_four.security,
            //dhcp
            "Server": 0,
            "Status": ConfigData[0].FrontHaul.DHCP.Hotspot.Status,
            "StartIpAddr": ConfigData[0].FrontHaul.DHCP.Hotspot.StartIpAddr,
            "EndIpAddr": ConfigData[0].FrontHaul.DHCP.Hotspot.EndIpAddr,
            "Gateway": ConfigData[0].FrontHaul.DHCP.Hotspot.Gateway,
            "Subnet": ConfigData[0].FrontHaul.DHCP.Hotspot.Subnet,
            "PrimaryDNS": ConfigData[0].FrontHaul.DHCP.Hotspot.PrimaryDNS,
            "SecondaryDNS": ConfigData[0].FrontHaul.DHCP.Hotspot.SecondaryDNS,
            "Server1": 1,
            "Status1": ConfigData[0].FrontHaul.DHCP.Mesh.Status,
            "StartIpAddr1": ConfigData[0].FrontHaul.DHCP.Mesh.StartIpAddr,
            "EndIpAddr1": ConfigData[0].FrontHaul.DHCP.Mesh.EndIpAddr,
            "Gateway1": ConfigData[0].FrontHaul.DHCP.Mesh.Gateway,
            "Subnet1": ConfigData[0].FrontHaul.DHCP.Mesh.Subnet,
            "PrimaryDNS1": ConfigData[0].FrontHaul.DHCP.Mesh.PrimaryDNS,
            "SecondaryDNS1": ConfigData[0].FrontHaul.DHCP.Mesh.SecondaryDNS,
            //system settings
            "sysname": ConfigData[0].System_Settings.sysname,
            "country": ConfigData[0].System_Settings.country,
            "timezone": ConfigData[0].System_Settings.timezone,
            //cloud connectivity
            "cerFile": ConfigData[0].Cloud_Connectivity_Settings.cerFile,
            "hostname": ConfigData[0].Cloud_Connectivity_Settings.Hostname,
            "SAK": ConfigData[0].Cloud_Connectivity_Settings.SAK,
            //bandwidth
            "bw_status": ConfigData[0].Bandwidth_Details.Bandwidth,
            "bw_upload": ConfigData[0].Bandwidth_Details.UploadBandwidth,
            "bw_downlaod": ConfigData[0].Bandwidth_Details.DownloadBandwidth

        }
        if (Object.keys(ConfigData[0].FrontHaul.Hotspot_Configuration.two_four.vap_details).length > 0) {
            var h21 = ConfigData[0].FrontHaul.Hotspot_Configuration.two_four.vap_details[0];
            h21.status = (h21.status || (h21.status != null)) ? h21.status : '';
            h21.ssid = (h21.ssid || (h21.ssid != null)) ? h21.ssid : '';
            h21.password = (h21.password || (h21.password != null)) ? h21.password : '';
            h21.security = (h21.security || (h21.security != null)) ? h21.security : '';
            if (h21.security == "Open")
                h21.security = "none";
            var Hotspot_2_4 = {
                "h2_vap_availabililty1": 1,
                "h2_vap_action1": 1,
                "h2_status1": h21.status,
                "h2_ssid1": h21.ssid,
                "h2_password1": h21.password,
                "h2_security1": h21.security
            }
            insertData = Object.assign(insertData, Hotspot_2_4);
        } else {
            var Hotspot_2_4 = {
                "h2_vap_availabililty1": 0,
                "h2_vap_action1": 0,
                "h2_status1": '',
                "h2_ssid1": '',
                "h2_password1": '',
                "h2_security1": ''
            }
            insertData = Object.assign(insertData, Hotspot_2_4);
        }
        if (ConfigData[0].FrontHaul.Hotspot_Configuration.five.vap_details) {

            var saveConfigDetails = ConfigData[0].FrontHaul.Hotspot_Configuration.five;
            if (Object.keys(saveConfigDetails.vap_details).length == 2) {
                saveConfigDetails.vap_details[0].Status = (saveConfigDetails.vap_details[0].status || (saveConfigDetails.vap_details[0].status != null)) ? saveConfigDetails.vap_details[0].status : 0;
                saveConfigDetails.vap_details[0].SSID = (saveConfigDetails.vap_details[0].ssid || (saveConfigDetails.vap_details[0].ssid != null)) ? saveConfigDetails.vap_details[0].ssid : '';
                saveConfigDetails.vap_details[0].Password = (saveConfigDetails.vap_details[0].password || (saveConfigDetails.vap_details[0].password != null)) ? saveConfigDetails.vap_details[0].password : '';
                saveConfigDetails.vap_details[0].WirelessSecurity = (saveConfigDetails.vap_details[0].security || (saveConfigDetails.vap_details[0].security != null)) ? saveConfigDetails.vap_details[0].security : '';
                saveConfigDetails.vap_details[1].Status = (saveConfigDetails.vap_details[1].status || (saveConfigDetails.vap_details[1].status != null)) ? saveConfigDetails.vap_details[1].status : 0;
                saveConfigDetails.vap_details[1].SSID = (saveConfigDetails.vap_details[1].ssid || (saveConfigDetails.vap_details[1].ssid != null)) ? saveConfigDetails.vap_details[1].ssid : '';
                saveConfigDetails.vap_details[1].Password = (saveConfigDetails.vap_details[1].password || (saveConfigDetails.vap_details[1].password != null)) ? saveConfigDetails.vap_details[1].password : '';
                saveConfigDetails.vap_details[1].WirelessSecurity = (saveConfigDetails.vap_details[1].security || (saveConfigDetails.vap_details[1].security != null)) ? saveConfigDetails.vap_details[1].security : '';
                if (saveConfigDetails.vap_details[1].SSID) {
                    saveConfigDetails.vap_details[1].vap_availabililty = 1;
                    saveConfigDetails.vap_details[1].vap_action = 1;
                } else {
                    saveConfigDetails.vap_details[1].vap_availabililty = 0;
                    saveConfigDetails.vap_details[1].vap_action = 0;
                }
                if (saveConfigDetails.vap_details[0].SSID) {
                    saveConfigDetails.vap_details[0].vap_availabililty = 1;
                    saveConfigDetails.vap_details[0].vap_action = 1;
                } else {
                    saveConfigDetails.vap_details[0].vap_availabililty = 0;
                    saveConfigDetails.vap_details[0].vap_action = 0;
                }
            } else if (Object.keys(saveConfigDetails.vap_details).length == 1) {
                if (!saveConfigDetails.vap_details[0]) {
                    saveConfigDetails.vap_details[0] = {};
                }
                if (!saveConfigDetails.vap_details[1]) {
                    saveConfigDetails.vap_details[1] = {};
                }
                saveConfigDetails.vap_details[0].Status = (saveConfigDetails.vap_details[0].status || (saveConfigDetails.vap_details[0].status != null)) ? saveConfigDetails.vap_details[0].status : 0;
                saveConfigDetails.vap_details[0].SSID = (saveConfigDetails.vap_details[0].ssid || (saveConfigDetails.vap_details[0].ssid != null)) ? saveConfigDetails.vap_details[0].ssid : '';
                saveConfigDetails.vap_details[0].Password = (saveConfigDetails.vap_details[0].password || (saveConfigDetails.vap_details[0].password != null)) ? saveConfigDetails.vap_details[0].password : '';
                saveConfigDetails.vap_details[0].WirelessSecurity = (saveConfigDetails.vap_details[0].security || (saveConfigDetails.vap_details[0].security != null)) ? saveConfigDetails.vap_details[0].security : '';
                saveConfigDetails.vap_details[1].Status = (saveConfigDetails.vap_details[1].status || (saveConfigDetails.vap_details[1].status != null)) ? saveConfigDetails.vap_details[1].status : 0;
                saveConfigDetails.vap_details[1].SSID = (saveConfigDetails.vap_details[1].ssid || (saveConfigDetails.vap_details[1].ssid != null)) ? saveConfigDetails.vap_details[1].ssid : '';
                saveConfigDetails.vap_details[1].Password = (saveConfigDetails.vap_details[1].password || (saveConfigDetails.vap_details[1].password != null)) ? saveConfigDetails.vap_details[1].password : '';
                saveConfigDetails.vap_details[1].WirelessSecurity = (saveConfigDetails.vap_details[1].security || (saveConfigDetails.vap_details[1].security != null)) ? saveConfigDetails.vap_details[1].security : '';
                if (saveConfigDetails.vap_details[1].SSID) {
                    saveConfigDetails.vap_details[1].vap_availabililty = 1;
                    saveConfigDetails.vap_details[1].vap_action = 1;
                } else {
                    saveConfigDetails.vap_details[1].vap_availabililty = 0;
                    saveConfigDetails.vap_details[1].vap_action = 0;
                }
                if (saveConfigDetails.vap_details[0].SSID) {
                    saveConfigDetails.vap_details[0].vap_availabililty = 1;
                    saveConfigDetails.vap_details[0].vap_action = 1;
                } else {
                    saveConfigDetails.vap_details[0].vap_availabililty = 0;
                    saveConfigDetails.vap_details[0].vap_action = 0;
                }
            } else {
                saveConfigDetails.vap_details = [];
                var vap = {
                    Status: 0,
                    SSID: '',
                    Password: '',
                    WirelessSecurity: '',
                    vap_availabililty: 0,
                    vap_action: 0
                }
                saveConfigDetails.vap_details.push(vap);
                saveConfigDetails.vap_details.push(vap);
                if (saveConfigDetails.vap_details[1].SSID) {
                    saveConfigDetails.vap_details[1].vap_availabililty = 1;
                    saveConfigDetails.vap_details[1].vap_action = 1;
                } else {
                    saveConfigDetails.vap_details[1].vap_availabililty = 0;
                    saveConfigDetails.vap_details[1].vap_action = 0;
                }
                if (saveConfigDetails.vap_details[0].SSID) {
                    saveConfigDetails.vap_details[0].vap_availabililty = 1;
                    saveConfigDetails.vap_details[0].vap_action = 1;
                } else {
                    saveConfigDetails.vap_details[0].vap_availabililty = 0;
                    saveConfigDetails.vap_details[0].vap_action = 0;
                }
            }
            if (saveConfigDetails.vap_details[1].WirelessSecurity == "Open")
                saveConfigDetails.vap_details[1].WirelessSecurity = "none";
            if (saveConfigDetails.vap_details[0].WirelessSecurity == "Open")
                saveConfigDetails.vap_details[0].WirelessSecurity = "none";
            Hotspot_5 = {
                "h5_status": saveConfigDetails.vap_details[0].Status,
                "h5_ssid": saveConfigDetails.vap_details[0].SSID,
                "h5_password": saveConfigDetails.vap_details[0].Password,
                "h5_security": saveConfigDetails.vap_details[0].WirelessSecurity,
                "h5_vap_availabililty": saveConfigDetails.vap_details[0].vap_availabililty,
                "h5_vap_action": saveConfigDetails.vap_details[0].vap_action,
                "h5_status1": saveConfigDetails.vap_details[1].Status,
                "h5_ssid1": saveConfigDetails.vap_details[1].SSID,
                "h5_password1": saveConfigDetails.vap_details[1].Password,
                "h5_security1": saveConfigDetails.vap_details[1].WirelessSecurity,
                "h5_vap_availabililty1": saveConfigDetails.vap_details[1].vap_availabililty,
                "h5_vap_action1": saveConfigDetails.vap_details[1].vap_action
            }
            insertData = Object.assign(insertData, Hotspot_5);
        }


        if (insertData["r2_radio_mode"] == "11a")
            insertData["r2_radio_mode"] = 7;
        else if (insertData["r2_radio_mode"] == "11b")
            insertData["r2_radio_mode"] = 0;
        else if (insertData["r2_radio_mode"] == "11ng")
            insertData["r2_radio_mode"] = 2;
        else if (insertData["r2_radio_mode"] == "11g")
            insertData["r2_radio_mode"] = 1;
        else if (insertData["r2_radio_mode"] == "11axg")
            insertData["r2_radio_mode"] = 3;
        else if (insertData["r2_radio_mode"] == "11na")
            insertData["r2_radio_mode"] = 5;
        else if (insertData["r2_radio_mode"] == "11ac")
            insertData["r2_radio_mode"] = 6;
        else if (insertData["r2_radio_mode"] == "11axa")
            insertData["r2_radio_mode"] = 4;

        if (insertData["r2_chan_bw"] == "20MHz")
            insertData["r2_chan_bw"] = 0;
        else if (insertData["r2_chan_bw"] == "40MHz")
            insertData["r2_chan_bw"] = 1;
        else if (insertData["r2_chan_bw"] == "80MHz")
            insertData["r2_chan_bw"] = 2;
        //    "r2_guard_interval"
        if (insertData["r2_guard_interval"] == "800ns")
            insertData["r2_guard_interval"] = 0;
        else if (insertData["r2_guard_interval"] == "400ns")
            insertData["r2_guard_interval"] = 1;
        else if (insertData["r2_guard_interval"] == "1600ns")
            insertData["r2_guard_interval"] = 2;
        else if (insertData["r2_guard_interval"] == "3200ns")
            insertData["r2_guard_interval"] = 3;
        //    "r2_stream_selection"
        if (insertData["r2_stream_selection"] == "1x1")
            insertData["r2_stream_selection"] = 1;
        else if (insertData["r2_stream_selection"] == "2x2")
            insertData["r2_stream_selection"] = 3;
        else if (insertData["r2_stream_selection"] == "3x3")
            insertData["r2_stream_selection"] = 7;
        else if (insertData["r2_stream_selection"] == "4x4")
            insertData["r2_stream_selection"] = 15;
        if (insertData["r5l_radio_mode"] == "11a")
            insertData["r5l_radio_mode"] = 7;
        else if (insertData["r5l_radio_mode"] == "11b")
            insertData["r5l_radio_mode"] = 0;
        else if (insertData["r5l_radio_mode"] == "11ng")
            insertData["r5l_radio_mode"] = 2;
        else if (insertData["r5l_radio_mode"] == "11g")
            insertData["r5l_radio_mode"] = 1;
        else if (insertData["r5l_radio_mode"] == "11axg")
            insertData["r5l_radio_mode"] = 3;
        else if (insertData["r5l_radio_mode"] == "11na")
            insertData["r5l_radio_mode"] = 5;
        else if (insertData["r5l_radio_mode"] == "11ac")
            insertData["r5l_radio_mode"] = 6;
        else if (insertData["r5l_radio_mode"] == "11axa")
            insertData["r5l_radio_mode"] = 4;

        if (insertData["r5l_chan_bw"] == "20MHz")
            insertData["r5l_chan_bw"] = 0;
        else if (insertData["r5l_chan_bw"] == "40MHz")
            insertData["r5l_chan_bw"] = 1;
        else if (insertData["r5l_chan_bw"] == "80MHz")
            insertData["r5l_chan_bw"] = 2;
        //    "r5l_guard_interval"
        if (insertData["r5l_guard_interval"] == "800ns")
            insertData["r5l_guard_interval"] = 0;
        else if (insertData["r5l_guard_interval"] == "400ns")
            insertData["r5l_guard_interval"] = 1;
        else if (insertData["r5l_guard_interval"] == "1600ns")
            insertData["r5l_guard_interval"] = 2;
        else if (insertData["r5l_guard_interval"] == "3200ns")
            insertData["r5l_guard_interval"] = 3;
        //    "r5l_stream_selection"
        if (insertData["r5l_stream_selection"] == "1x1")
            insertData["r5l_stream_selection"] = 1;
        else if (insertData["r5l_stream_selection"] == "2x2")
            insertData["r5l_stream_selection"] = 3;
        else if (insertData["r5l_stream_selection"] == "3x3")
            insertData["r5l_stream_selection"] = 7;
        else if (insertData["r5l_stream_selection"] == "4x4")
            insertData["r5l_stream_selection"] = 15;
        if (insertData["r5h_radio_mode"] == "11a")
            insertData["r5h_radio_mode"] = 7;
        else if (insertData["r5h_radio_mode"] == "11b")
            insertData["r5h_radio_mode"] = 0;
        else if (insertData["r5h_radio_mode"] == "11ng")
            insertData["r5h_radio_mode"] = 2;
        else if (insertData["r5h_radio_mode"] == "11g")
            insertData["r5h_radio_mode"] = 1;
        else if (insertData["r5h_radio_mode"] == "11axg")
            insertData["r5h_radio_mode"] = 3;
        else if (insertData["r5h_radio_mode"] == "11na")
            insertData["r5h_radio_mode"] = 5;
        else if (insertData["r5h_radio_mode"] == "11ac")
            insertData["r5h_radio_mode"] = 6;
        else if (insertData["r5h_radio_mode"] == "11axa")
            insertData["r5h_radio_mode"] = 4;

        if (insertData["r5h_chan_bw"] == "20MHz")
            insertData["r5h_chan_bw"] = 0;
        else if (insertData["r5h_chan_bw"] == "40MHz")
            insertData["r5h_chan_bw"] = 1;
        else if (insertData["r5h_chan_bw"] == "80MHz")
            insertData["r5h_chan_bw"] = 2;
        //    "r5h_guard_interval"
        if (insertData["r5h_guard_interval"] == "800ns")
            insertData["r5h_guard_interval"] = 0;
        else if (insertData["r5h_guard_interval"] == "400ns")
            insertData["r5h_guard_interval"] = 1;
        else if (insertData["r5h_guard_interval"] == "1600ns")
            insertData["r5h_guard_interval"] = 2;
        else if (insertData["r5h_guard_interval"] == "3200ns")
            insertData["r5h_guard_interval"] = 3;
        //    "r5h_stream_selection"
        if (insertData["r5h_stream_selection"] == "1x1")
            insertData["r5h_stream_selection"] = 1;
        else if (insertData["r5h_stream_selection"] == "2x2")
            insertData["r5h_stream_selection"] = 3;
        else if (insertData["r5h_stream_selection"] == "3x3")
            insertData["r5h_stream_selection"] = 7;
        else if (insertData["r5h_stream_selection"] == "4x4")
            insertData["r5h_stream_selection"] = 15;
        if ((insertData.m2_securityType).toLowerCase() == 'sae' || insertData.m2_securityType == 'SAE')
            insertData.m2_securityType = 'sae';
        else
            insertData.m2_securityType = 'none';
        if ((insertData.m5_securityType).toLowerCase() == 'sae' || insertData.m5_securityType == 'SAE')
            insertData.m5_securityType = 'sae';
        else
            insertData.m5_securityType = 'none';
        if (!insertData.cerFile)
            insertData.cerFile = ''

    } else {
        //config time
        var insertData = {};
        insertData["config_time"] = cloud_time;
        insertData["radio_band"] = ConfigData[0].FrontHaul.Radio_Configuration.radio_band;
        insertData["radio_mode"] = ConfigData[0].FrontHaul.Radio_Configuration.radio_mode;
        insertData["chan_bw"] = ConfigData[0].FrontHaul.Radio_Configuration.chan_bw;
        insertData["channel"] = ConfigData[0].FrontHaul.Radio_Configuration.channel;
        insertData["txpower"] = ConfigData[0].FrontHaul.Radio_Configuration.txpower;
        insertData["stream_selection"] = ConfigData[0].FrontHaul.Radio_Configuration.stream_selection;

        insertData["MeshID_Prim"] = ConfigData[0].FrontHaul.Mesh_Configuration.Primary.meshID;
        insertData["SecurityType_Prim"] = ConfigData[0].FrontHaul.Mesh_Configuration.Primary.securityType;
        insertData["PSK_Prim"] = ConfigData[0].FrontHaul.Mesh_Configuration.Primary.PSK;
        insertData["MeshMac_Prim"] = ConfigData[0].FrontHaul.Mesh_Configuration.Primary.Mac;
        insertData["MeshDeviceType_Prim"] = ConfigData[0].FrontHaul.Mesh_Configuration.Primary.DeviceType;
        insertData["MeshSerialNumber_Prim"] = ConfigData[0].FrontHaul.Mesh_Configuration.Primary.SerialNumber;

        insertData["MeshID_Sec"] = ConfigData[0].FrontHaul.Mesh_Configuration.Secondary.meshID;
        insertData["SecurityType_Sec"] = ConfigData[0].FrontHaul.Mesh_Configuration.Secondary.securityType;
        insertData["PSK_Sec"] = ConfigData[0].FrontHaul.Mesh_Configuration.Secondary.PSK;
        insertData["MeshMac_Sec"] = ConfigData[0].FrontHaul.Mesh_Configuration.Secondary.Mac;
        insertData["MeshDeviceType_Sec"] = ConfigData[0].FrontHaul.Mesh_Configuration.Secondary.DeviceType;
        insertData["MeshSerialNumber_Sec"] = ConfigData[0].FrontHaul.Mesh_Configuration.Secondary.SerialNumber;

        insertData["vap_availabililty"] = 1;
        insertData["vap_action"] = 3;
        insertData["status"] = 1;
        insertData["ssid"] = ConfigData[0].FrontHaul.Hotspot_Configuration.ssid;
        insertData["password"] = ConfigData[0].FrontHaul.Hotspot_Configuration.password;
        insertData["security"] = ConfigData[0].FrontHaul.Hotspot_Configuration.security;
        insertData["Status1"] = ConfigData[0].FrontHaul.DHCP.Status;
        insertData["StartIpAddr"] = ConfigData[0].FrontHaul.DHCP.StartIpAddr;
        insertData["EndIpAddr"] = ConfigData[0].FrontHaul.DHCP.EndIpAddr;
        insertData["Gateway"] = ConfigData[0].FrontHaul.DHCP.Gateway;
        insertData["Subnet"] = ConfigData[0].FrontHaul.DHCP.Subnet;
        insertData["PrimaryDNS"] = ConfigData[0].FrontHaul.DHCP.PrimaryDNS;
        insertData["SecondaryDNS"] = ConfigData[0].FrontHaul.DHCP.SecondaryDNS;
        insertData["uti_ID"] = ConfigData[0].Meter_Configuration.uti_ID;
        insertData["cir_ID"] = ConfigData[0].Meter_Configuration.cir_ID;
        insertData["cer_num"] = ConfigData[0].Meter_Configuration.cer_num;
        insertData["esn"] = ConfigData[0].Meter_Configuration.esn;
        insertData["sysname"] = ConfigData[0].System_Settings.sysname;
        insertData["country"] = ConfigData[0].System_Settings.country;
        insertData["timezone"] = ConfigData[0].System_Settings.timezone;
        insertData["bw_status"] = ConfigData[0].Bandwidth_Details.Bandwidth;
        insertData["bw_upload"] = ConfigData[0].Bandwidth_Details.UploadBandwidth;
        insertData["bw_downlaod"] = ConfigData[0].Bandwidth_Details.DownloadBandwidth;
        if (insertData["radio_mode"] == "11a")
            insertData["radio_mode"] = 7;
        else if (insertData["radio_mode"] == "11b")
            insertData["radio_mode"] = 0;
        else if (insertData["radio_mode"] == "11ng")
            insertData["radio_mode"] = 2;
        else if (insertData["radio_mode"] == "11g")
            insertData["radio_mode"] = 1;
        else if (insertData["radio_mode"] == "11axg")
            insertData["radio_mode"] = 3;
        else if (insertData["radio_mode"] == "11na")
            insertData["radio_mode"] = 5;
        else if (insertData["radio_mode"] == "11ac")
            insertData["radio_mode"] = 6;
        else if (insertData["radio_mode"] == "11axa")
            insertData["radio_mode"] = 4;

        if (insertData["radio_band"] == "2.4 GHz")
            insertData["radio_band"] = 1;
        else
            insertData["radio_band"] = 0;

        if (insertData["chan_bw"] == "20MHz")
            insertData["chan_bw"] = 1;
        else if (insertData["chan_bw"] == "40MHz")
            insertData["chan_bw"] = 2;
        else if (insertData["chan_bw"] == "Auto")
            insertData["chan_bw"] = 0;
       
        //    "stream_selection"
        if (insertData["stream_selection"] == "1x1")
            insertData["stream_selection"] = 1;
        else (insertData["stream_selection"] == "2x2")
            insertData["stream_selection"] = 2;

        if (insertData.SecurityType_Prim == 'Open')
            insertData.SecurityType_Prim = 'none';
        else
            insertData.SecurityType_Prim = 'sae';
        if (insertData.SecurityType_Sec == 'Open')
            insertData.SecurityType_Sec = 'none';
        else
            insertData.SecurityType_Sec = 'sae';
    }
    if (insertData.timezone == 'Asia/Kolkata - GMT+5:30')
        insertData.timezone = 0;
    else if (insertData.timezone == 'Asia/Tashkent - GMT+5')
        insertData.timezone = 1;
    else if (insertData.timezone == 'Asia/Manila - GMT+8')
        insertData.timezone = 2;
    else if (insertData.timezone == 'Africa/Johannesburg - GMT+2')
        insertData.timezone = 3;
    else if (insertData.timezone == 'America/Tijuana - UTC --8:00/ -7:00')
        insertData.timezone = 4;
    else if (insertData.timezone == 'America/Hermosillo - UTC -7')
        insertData.timezone = 5;
    else if (insertData.timezone == 'America/Mazatlan - UTC -7:00 / -6:00')
        insertData.timezone = 6;
    else if (insertData.timezone == 'America/Mexico_City- UTC -6:00 / -5:00')
        insertData.timezone = 7;
    else if (insertData.timezone == 'America/Cancun - UTC -5:00')
        insertData.timezone = 8;
    else if (insertData.timezone == 'Asia/Singapore - GMT+8')
        insertData.timezone = 9;
    else if (insertData.timezone == 'Europe/Kaliningrad - UTC+02:00')
        insertData.timezone = 10;
    else if (insertData.timezone == 'Europe/Moscow - UTC+03:00')
        insertData.timezone = 11;
    else if (insertData.timezone == 'Europe/Samara - UTC+04:00')
        insertData.timezone = 12;
    else if (insertData.timezone == 'Asia/Yekaterinburg- UTC+05:00')
        insertData.timezone = 13;
    else if (insertData.timezone == 'Asia/omsk - UTC+06:00')
        insertData.timezone = 14;
    else if (insertData.timezone == 'Asia/Krasnoyarsk - UTC+07:00')
        insertData.timezone = 15;
    else if (insertData.timezone == 'Asia/Irkutsk- UTC+08:00')
        insertData.timezone = 16;
    else if (insertData.timezone == 'Asia/Yakutsk - UTC+09:00')
        insertData.timezone = 17;
    else if (insertData.timezone == 'Asia/Vladivostok - UTC+10:00')
        insertData.timezone = 18;
    else if (insertData.timezone == 'Asia/Magadan - UTC+11:00')
        insertData.timezone = 19;
    else if (insertData.timezone == 'Asia/Kamchatka - UTC+12:00')
        insertData.timezone = 20;
    else if (insertData.timezone == 'America/Vancouver - UTC -8:00 / -7:00')
        insertData.timezone = 21;
    else if (insertData.timezone == 'America/Dawson Creek - UTC -7:00')
        insertData.timezone = 22;
    else if (insertData.timezone == 'America/Edmonton - UTC -7:00 / -6:00')
        insertData.timezone = 23;
    else if (insertData.timezone == 'America/Regina - UTC -6:00')
        insertData.timezone = 24;
    else if (insertData.timezone == 'America/Winnipeg - UTC -6:00 / -5:00')
        insertData.timezone = 25;
    else if (insertData.timezone == 'America/Atikokan - UTC -5:00')
        insertData.timezone = 26;
    else if (insertData.timezone == 'America/Toronto - UTC -5:00 / -4:00')
        insertData.timezone = 27;
    else if (insertData.timezone == 'America/Blanc-Sablon - UTC -4:00')
        insertData.timezone = 28;
    else if (insertData.timezone == 'America/Halifax - UTC -4:00 / -3:00')
        insertData.timezone = 29;
    else if (insertData.timezone == 'America/St Johns - UTC -3.30 / -2.30')
        insertData.timezone = 30;
    else if (insertData.timezone == 'Pacific/Honolulu - UTC -10:00')
        insertData.timezone = 31;
    else if (insertData.timezone == 'America/Anchorage - UTC -9:00 / -8:00')
        insertData.timezone = 32;
    else if (insertData.timezone == 'America/Los Angeles - UTC -8:00 / -7:00')
        insertData.timezone = 33;
    else if (insertData.timezone == 'America/Phoenix - UTC -7:00')
        insertData.timezone = 34;
    else if (insertData.timezone == 'America/Boise - UTC -7.00/-6.00')
        insertData.timezone = 35;
    else if (insertData.timezone == 'America/Chicago - UTC -6:00 / -5:00')
        insertData.timezone = 37;
    else if (insertData.timezone == 'America/New York - UTC -5:00 / -4:00')
        insertData.timezone = 38;
    
    return insertData;
}

module.exports = {
    deviceReg: deviceReg,
    deviceDLReg: deviceDLReg,
    setConfig: setConfig
}
