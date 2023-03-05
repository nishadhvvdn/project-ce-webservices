var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsMeterNodePing.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')

router.post('/', function (req, res) {
    var meterID = req.body.MeterID;

    let data = { meterID }
    let SMNodePingSchema = schema.SMMeterNodePing;
    schemaValidation.validateSchema(data, SMNodePingSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.meterDeviceStatus(meterID, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message,
                    });
                } else {
                    res.json({
                        "type": true,
                        "Output": result,
                    });
                }
            });
        }
    });
});

module.exports = router;