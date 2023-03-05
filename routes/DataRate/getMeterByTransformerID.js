var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDataRate');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/dataRateSchema');


router.get('/', function (req, res) {
    try {
        let transformerID = req.query.transformerID;
        let getMeterByTransformerID = schema.getMeterByTransformerID;
        let data = {transformerID}
        schemaValidation.validateSchema(data, getMeterByTransformerID, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                //get Unique TransformerSerialNumber and TransformerID on the basis of CircuitID
                dbCmd.selectAllMeterByTransformerID(transformerID, function (err, MeterDetails) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "MeterDetails": MeterDetails
                        });
                    }
                });
            }
        })

    }
    catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;