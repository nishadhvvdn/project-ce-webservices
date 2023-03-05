var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsHyperHub.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
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
            var removeHyperHubFromTransformerValues = req.body.removeHyperHubFromTransformerValues;
            let removeHyperHubFromTransformerValuesSchema = schema.removeHyperHubFromTransformerValues;
            schemaValidation.validateSchema(removeHyperHubFromTransformerValues, removeHyperHubFromTransformerValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmd.removeHyperHubFromTransformer(removeHyperHubFromTransformerValues, function (err, hyperHubFromTransformerRemoved) {
                        if (err) {
                            res.json({
                                "type": false, "Message": err
                            });
                        } else {
                            res.json({
                                "type": true, "Message": hyperHubFromTransformerRemoved,
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