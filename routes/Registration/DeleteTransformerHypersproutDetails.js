var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
let unique = require('array-unique');
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
            let deleteTransformerHypersproutValues = req.body.deleteTransformerHypersproutValues;
            let deleteTransformerHypersproutValuesSchema = schema.deleteTransformerHypersproutValues;
            schemaValidation.validateSchema(deleteTransformerHypersproutValues, deleteTransformerHypersproutValuesSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    // Parameters Passed from UI - "TransformerID","HypersproutID"

                    dbCmd.deleteTransformerHypersproutDetails(deleteTransformerHypersproutValues, function (err, transformerHypersproutDeleted, Errors) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            unique(Errors)
                            res.json({
                                "type": true,
                                "Message": transformerHypersproutDeleted,
                                "Errors":Errors
                            });
                        }
                    });
                }
            })
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
});

module.exports = router;