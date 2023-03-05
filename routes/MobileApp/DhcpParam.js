const express = require('express');
const router = express.Router();
var dbCmd = require('../../data/updateDhcp.js');
const schema = require('../../config/Helpers/MoblieAppSchema');
const schemaValidation = require('../../config/Helpers/payloadValidation');


router.post('/', function (req, res) {

    var Rev = req.body.Rev;
    var Count = req.body.Count;
    var MessageID =  req.body.MessageID;
    var Action = req.body.Action;
    let Attribute = req.body.Attribute;
    var CountryCode =  req.body.CountryCode;
    var RegionCode =  req.body.RegionCode;
    var CellID =req.body.CellID;
    var MeterID = req.body.MeterID;
    var Type = req.body.Type;
    var Ip = req.body.Ip;

    dhcpSchema = schema.dhcpSchema;
    let data = { Rev, Count, MessageID, Action, Attribute, CountryCode, RegionCode, CellID, MeterID, Type , Ip}
    schemaValidation.validateSchema(data, dhcpSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        } else {
            dbCmd.updateDhcp(MeterID,Ip ,function (err, result) {
                if (err) {
                    res.json({
                        "Type": false,
                        "Message": "Failure"
                    });
                } else {
                    res.json({
                        "Type": true,
                        "Message": "Success"
                    });
                }
            });

        }
    })
});
module.exports = router;