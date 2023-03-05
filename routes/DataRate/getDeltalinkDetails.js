var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDataRate');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/dataRateSchema');


router.get('/', function (req, res) {
    try {
        let meterID = parseInt(req.query.MeterID);
        let getDeltalinkByMeterID = schema.getDeltalinkByMeterID;
        let data = {meterID}
        schemaValidation.validateSchema(data, getDeltalinkByMeterID, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
        //get DeltalinkID and DeltalinkSerialNumber
        dbCmd.selectAllUniqueDeltalink(data, function (err, DeltalinkDetails) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message != undefined ? err.message : err
                });
            } else {
                res.json({
                    "type": true,
                    "DeltalinkDetails": DeltalinkDetails
                });
            }
        });
    }})

    }
    catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;