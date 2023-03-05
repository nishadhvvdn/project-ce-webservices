var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsOnDemand.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MeterBulkOperationSchema')

router.post('/', function (req, res) {
    try {
        var MeterID = req.body.MeterID;
        const data = { MeterID }
        const getMeterKwhData = schema.getMeterKwH;
        schemaValidation.validateSchema(data, getMeterKwhData, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            }else{
                if (MeterID == null) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!"
                    });
                }
                else {
                    MeterID = parseInt(MeterID);
                    dbCmd.MeterKwHDetails(MeterID, function (err, meterOnDemandKwHDetails) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": meterOnDemandKwHDetails
                            });
                        }
                    });
                }
            }
        });
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;