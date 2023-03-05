var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsHyperHub.js');
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
            let deleteHyperHubValues = req.body.deleteHyperHubValues;
            let deleteHyperHubDetailsSchema = schema.deleteHyperHubDetails;
            schemaValidation.validateSchema(deleteHyperHubValues, deleteHyperHubDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    dbCmd.deleteHyperHubDetails(deleteHyperHubValues, function (err, hyperHubDetailsDeleted, Errors) {
                        if (err) {
                            res.json({
                                "type": false, "Message": err
                            });
                        } else {
                            unique(Errors);
                            res.json({
                                "type": true, "Message": hyperHubDetailsDeleted, "Errors": Errors
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