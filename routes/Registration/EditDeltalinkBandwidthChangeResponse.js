const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeltalink.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deltalinkManagementSchema')


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
    let data = { Rev, Count, MessageID, Action, Attribute, Data, CountryCode, RegionCode, CellID, MeterID, Data, Type }
    schemaValidation.validateSchema(data, bandwidthLimitationSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        } else {
            let deltalinkID = response.MeterID;
            let status = response.Data[0].Status;
        
        dbCmd.editDeltalinkBandwidthReponse(deltalinkID, status, function (err, editMeterWifiResponse) {
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
    
    }})

});
module.exports = router;