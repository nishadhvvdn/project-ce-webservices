var express = require('express');
var router = express.Router();
var dbCmd = require('../data/dbCommandsInvalidIOT.js');
const schemaValidation = require('../config/Helpers/payloadValidation');
const schema = require('../config/Helpers/invalidPacketIntimation');

router.post('/', function (req, res) {
    var Rev = req.body.Rev;
    var MessageID = req.body.MessageID;
    var CountryCode = req.body.CountryCode;
    var RegionCode = req.body.RegionCode;
    var CellID = req.body.CellID;
    var MeterID = req.body.MeterID;
    var Action = req.body.Action;
    var Attribute = req.body.Attribute;

    var invalidPacketData = {Rev,MessageID,CountryCode,RegionCode,CellID,MeterID,Action,Attribute};
    var invalidPacketSchema = schema.invalidPacketIntimation;
    
    schemaValidation.validateSchema(invalidPacketData, invalidPacketSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
        var packetData = {
            "rev": Rev,
            "messageid": MessageID,
            "countrycode": CountryCode,
            "regioncode": RegionCode,
            "cellid": CellID,
            "meterid": MeterID,
            "action": Action,
            "attribute": Attribute,
            "Purpose": "WrongPacket"
        };
        dbCmd.intimateWrongPacket(packetData, function (err, details) {
            if (err) {
                res.json({
                    "Type": false,
                    "Message": err.message,
                });
            } else {
                res.json({
                    "Type": true,
                    "Details": details,
                    "Message": "Device Intimated about Invalid Packet"
                });
            }
        });
    }
});
});

module.exports = router;