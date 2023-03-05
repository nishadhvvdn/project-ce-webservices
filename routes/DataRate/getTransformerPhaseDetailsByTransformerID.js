var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDataRate');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/dataRateSchema');

router.get('/', function (req, res) {
    try {
        let transformerId = req.query.transformerId;
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;

        let data = { transformerId, startDate, endDate };
        let getTransformerPhaseDetails = schema.getTransformerPhaseDetails;

        schemaValidation.validateSchema(data, getTransformerPhaseDetails, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                dbCmd.getTransformerPhaseDetails(transformerId, startDate, endDate, function (err, TransformerPhaseDetails) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "TransformerPhaseDetails": TransformerPhaseDetails
                        });
                    }
                });
            }
        });

    }
    catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;