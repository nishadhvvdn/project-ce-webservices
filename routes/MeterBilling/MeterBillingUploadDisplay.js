var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsMeterBilling.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');


router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let data = { page, limit }
        let MeterBillingUploadDisplaySchema = schema.MeterBillingUploadDisplay;
        schemaValidation.validateSchema(data, MeterBillingUploadDisplaySchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.MeterBillingDetails(data, function (err, meterBillingDetails) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "Message": meterBillingDetails
                        });
                    }
                });
            }
        })
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }


});

module.exports = router;