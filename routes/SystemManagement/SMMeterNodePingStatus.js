var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsMeterNodePing.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/invalidPacketIntimation');

router.post('/', function (req, res) {
    var meterID = req.body.MeterID;
    var status = req.body.Status;
    var messageID = req.body.MessageID;

    var invalidPacketData = { meterID, status, messageID };
    var invalidPacketSchema = schema.smMeterNodePing;

    schemaValidation.validateSchema(invalidPacketData, invalidPacketSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            if (status === "Success") {
                status = "Connected";
            } else
                status = "NotConnected";
            dbCmd.saveMeterDeviceStatus(meterID, status, messageID, function (err, result) {
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
    });
});

module.exports = router;