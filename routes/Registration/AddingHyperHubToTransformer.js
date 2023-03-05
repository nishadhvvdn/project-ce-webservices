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
            let addHyperHubToTransformerValues = req.body.addHyperHubToTransformerValues;
            let addHyperHubToTransformerValuesSchema = schema.addHyperHubToTransformerValues;
            schemaValidation.validateSchema(addHyperHubToTransformerValues, addHyperHubToTransformerValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmd.addHyperHubToTransformer(addHyperHubToTransformerValues,
                        function (err, hyperHubToTransformerAdded) {
                            if (err) {
                                res.json({
                                    "type": false, "Message": err
                                });
                            } else {
                                res.json({
                                    "type": true, "Message": hyperHubToTransformerAdded,
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