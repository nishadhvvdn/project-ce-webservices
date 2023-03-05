var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/systemManagement')
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
            var addTransformerToCircuitValues = req.body.addTransformerToCircuitValues;
            let addTransformerToCircuitValuesSchema = schema.addTransformerToCircuitValues;
            schemaValidation.validateSchema(addTransformerToCircuitValues, addTransformerToCircuitValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmd.addTransformerToCircuit(addTransformerToCircuitValues, function (err, transformerToCircuitAdded) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": transformerToCircuitAdded,
                            });
                        }
                    });
                }})
  
}
} catch (e) {
    callback("Something went wrong : " + e.name + " " + e.message, null)
}
});

module.exports = router;