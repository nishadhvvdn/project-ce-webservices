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
            let TransformerID = req.body.TransformerDetails.TransformerID;
            const page = parseInt(req.query.Page);
            const limit = parseInt(req.query.Limit);
            let search = req.query.search;
            let data = { TransformerID, page, limit };
            let TransformerDetailsSchema = schema.TransformerDetails;

            /* validate all mandatory fields */
            schemaValidation.validateSchema(data, TransformerDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    data.search = search;
                    dbCmd.getAllHyperHubAttached(data, function (err, hyperHubDetailSelected) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "HyperHubDetailSelected": hyperHubDetailSelected,
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