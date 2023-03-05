const express = require('express');
const router = express.Router();
var dbCmd = require('../../data/updateDlStatus.js');
const schema = require('../../config/Helpers/MoblieAppSchema');
const schemaValidation = require('../../config/Helpers/payloadValidation');

router.post('/', function (req, res) {

    var Rev = req.body.Rev;
    var Count = req.body.Count;
    var MessageID =  req.body.MessageID;
    var Action = req.body.Action;
    var Attribute = req.body.Attribute;
    var CountryCode =  req.body.CountryCode;
    var RegionCode =  req.body.RegionCode;
    var CellID =req.body.CellID;
    var MeterID = req.body.MeterID;
    var Type = req.body.Type;
    var Status = req.body.Status;
    var MACID = req.body.MACID;
    var ReadTimestamp = req.body.ReadTimestamp;

    var dlStatusSchema = schema.dlStatusSchema;
    var data = { Rev, Count, MessageID, Action, Attribute, CountryCode, RegionCode, CellID, MeterID, Type, Status, MACID, ReadTimestamp };

    schemaValidation.validateSchema(data, dlStatusSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        } else {
            dbCmd.updateDlStatus(MeterID, MACID, ReadTimestamp, Status, function (err, result) {
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