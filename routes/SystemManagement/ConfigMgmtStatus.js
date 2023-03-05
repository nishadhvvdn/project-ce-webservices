var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsConfig.js');

router.post('/', function (req, res) {
    var meterID = req.body.MeterID;
    var status = req.body.Status;
    var messageID = req.body.MessageID;
    var Action = req.body.Action;
    var Attribute = req.body.Attribute;
    var CellID = req.body.CellID;
    var FailureMsg = req.body.STATUSCODE;
    if ((status == null) || (Action == null) || (Attribute == null)) {
        res.json({
            "Type": false,
            "Status": "Invalid Parameter",
        });
    }
    else {
       
        if (Attribute == "HS_System_Settings" || Action == "Cloud_Connectivity" || Action == "HS_FRONTHAUL" || Action == "BACKHAUL") {
            DeviceType = 'hs';
        } else {
            DeviceType = "meter";
        }
        
        if (DeviceType === 'hs') {
            dbCmd.saveDeviceConfigStatus(CellID, status, DeviceType, messageID,FailureMsg, function (err, result) {
                if (err) {
                    res.json({
                        "Type": false,
                        "Message": err.message,
                    });
                } else {
                    res.json({
                        "Type": true,
                        "Output": result,
                    });
                }
            });
        } else {
            dbCmd.saveDeviceConfigStatus(meterID, status, DeviceType, messageID,FailureMsg, function (err, result) {
                if (err) {
                    res.json({
                        "Type": false,
                        "Message": err.message,
                    });
                } else {
                    res.json({
                        "Type": true,
                        "Output": result,
                    });
                }
            });
        }
    }
});

module.exports = router;