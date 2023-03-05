var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommandsConfig.js');


router.post('/', function (req, res) {
    try {

        // "Primary": {
        //     "status": 1, "radio_band": "2.4 GHz", "meshID": val.Data[0].meshID, "securityType": val.Data[0].SecurityType,
        //     "PSK": val.Data[0].PSK,"Mac":val.Data[0].MeshMac.toLowerCase(),"DeviceType":val.Data[0].MeshDeviceType,"SerialNumber":val.Data[0].MeshSerialNumber, "enable": 1, "action": 1
        // },
        // "Secondary": {
        //     "status": 1, "radio_band": "2.4 GHz", "meshID": val.Data[0].meshID1, "securityType": val.Data[0].SecurityType1,
        //     "PSK": val.Data[0].PSK1,"Mac":val.Data[0].MeshMac1.toLowerCase(),"DeviceType":val.Data[0].MeshDeviceType1,"SerialNumber":val.Data[0].MeshSerialNumber1, "enable": 1, "action": 1
        // }
        var insertNewEndpointDetails1 = req.body.Data;
        var DeviceId = req.body.MeterID;
        dbCmd.SendMacAcl(insertNewEndpointDetails1, DeviceId, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err
                });
            } else {

                res.json({
                    "type": true,
                    "Message": "Success"
                });

            }
        });

    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});


module.exports = router;