var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsConfig.js');

router.post('/', function (req, res) {
    var meterID = req.body.MeterID;
    var messageID = req.body.MessageID;
    var Action = req.body.Action;
    var Attribute = req.body.Attribute;
    var CellID = req.body.CellID;
    var CarrierStatus = req.body.CarrierStatus;
    var NoOfCarrier = req.body.NoOfCarrier;
    var Carrier = req.body.Carrier;
    if ((Action == null) || (Attribute == null)) {
        res.json({
            "Type": false,
            "Status": "Invalid Parameter",
        });
    }
    else {
        dbCmd.saveDeviceCarriers(CellID, CarrierStatus, Carrier, messageID, NoOfCarrier, function (err, result) {
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
});

module.exports = router;