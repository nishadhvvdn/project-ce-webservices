const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeltalink');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deltalinkManagementSchema')
const unique = require('array-unique');
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
            let deleteDeltalinkDetails = req.body.DeleteDeltalinkDetails;
            let deleteDeltalinkValuesSchema = schema.deleteDeltalinkValues;
            if ((!deleteDeltalinkDetails) || (typeof deleteDeltalinkDetails != "object")) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!"
                });
            } else {
                let deltalinkID = deleteDeltalinkDetails.DeltalinkID;
                let data = { deltalinkID }
                schemaValidation.validateSchema(data, deleteDeltalinkValuesSchema, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": err
                        });
                    } else {
                        dbCmd.deleteDeltalinkDetails(deleteDeltalinkDetails, function (err, DeltalinkDetailsDeleted, Errors) {
                            if (err) {
                                res.json({
                                    "type": false, "Message": err
                                });
                            } else {
                                unique(Errors);
                                res.json({
                                    "type": true, "Message": DeltalinkDetailsDeleted, "Errors": Errors
                                });
                            }
                        });
                    }
                })
            }
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});

module.exports = router;