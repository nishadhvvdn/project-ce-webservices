var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsMeterBilling.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MacACLMgmtSchema')

router.post('/', function (req, res) {
    try {
        var FileName = req.body.FileName;
        var DateTime = req.body.DateTime;
        const MeterBillingSchema = schema.MeterBillingDetails;
        const data = { FileName, DateTime }
        schemaValidation.validateSchema(data, MeterBillingSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.deleteMeterBillingFile(FileName, DateTime, function (err, Messege) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "Messege": Messege
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