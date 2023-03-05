var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var removeReq = require('./RemovingTransformerFromCircuitRequest.js');
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
            // Parameters Passed from UI - "CircuitID" & "TransformerIDs"
            var removeTransformerFromCircuitValues = req.body.removeTransformerFromCircuitValues;
            let removeTransformerFromCircuitValuesSchema = schema.removeTransformerFromCircuitValues;
            schemaValidation.validateSchema(removeTransformerFromCircuitValues, removeTransformerFromCircuitValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    removeReq.removeTransformerFromCircuitRequest(removeTransformerFromCircuitValues, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        }
                        else {
                            //continue
                        }
                    });
                    dbCmd.removeTransformerFromCircuit(removeTransformerFromCircuitValues, function (err, transformerFromCircuitRemoved) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": transformerFromCircuitRemoved,
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