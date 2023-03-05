const express = require('express');
const router = express.Router();
var dbCmd = require('../data/dbCommandsBandwidthLimitaion.js');
const schema = require('../config/Helpers/bandwidthLimitaions')
const schemaValidation = require('../config/Helpers/payloadValidation')


router.post('/', function (req, res) {

    let response = req.body;
    var Rev = Rev = req.body.Rev;
    var Count = Count = req.body.Count;
    var MessageID = MessageID = req.body.MessageID;
    var Action = req.body.Action;
    let Attribute = req.body.Attribute;
    var Data = req.body.Data;
    var CountryCode = CountryCode = req.body.CountryCode;
    var RegionCode = RegionCode = req.body.RegionCode;
    var CellID = CellID = req.body.CellID;
    var MeterID = MeterID = req.body.MeterID;
    var Data = req.body.Data;
    var Type = req.body.Type;
    bandwidthLimitationSchema = schema.BandwidthLimitationsResponse;
    let Id;
    let data = { Rev, Count, MessageID, Action, Attribute, CountryCode, RegionCode, CellID, MeterID, Type }
    schemaValidation.validateSchema(data, bandwidthLimitationSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        } else {
            let status = response.Status;
            if (status == "Success")
                status = 1;
            else
                status = 2;
            if (Attribute == "METER_BANDWIDTH") {
                Id = req.body.MeterID;
            } else {
                Id = req.body.CellID;
            }
            dbCmd.editBandwidthReponse(Id, status, Attribute, function (err, editWifiResponse) {
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