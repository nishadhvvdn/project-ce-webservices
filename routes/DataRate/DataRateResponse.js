const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDataRate');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/dataRateSchema');
var _ = require('lodash');


router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            // payload is empty 
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            var MeterID = parseInt(req.body.MeterID);
            var MessageID = parseInt(req.body.MessageID);
            var Action = req.body.Action;
            var Attribute = req.body.Attribute;
            var CellID = parseInt(req.body.CellID);
            let Status = req.body.Data[0].STATUSCODE;
            let Data = req.body.Data;
            var data = { MeterID, Status, MessageID, Action, Attribute, CellID, Data }
            const dataRateResponseSchema = schema.dataRateResponse;
            schemaValidation.validateSchema(data, dataRateResponseSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                }
                else {
                    if (data.Status === 1) {
                        data.Status1 = "Data Rate Fetch Successful";
                    } else {
                        data.Status1 = "Data Rate Fetch Unsuccessful";
                    }
                    dbCmd.saveDeviceDataRateStatus(data, function (err, result) {
                        if (err) {
                            res.json({
                                "Type": false,
                                "Message": err,
                            });
                        } else {
                            res.json({
                                "Type": true,
                                "Output": result,
                            });
                        }
                    });
                }
            })
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;