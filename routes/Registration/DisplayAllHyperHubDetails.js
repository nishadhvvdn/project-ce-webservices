var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsHyperHub.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/systemManagement')
let _ = require('lodash');

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
            // payload is NOT empty
            let hyperHubDetails = req.body.HyperHubDetails;
            let type = hyperHubDetails.Type;
            const page = parseInt(req.query.Page);
            const limit = parseInt(req.query.Limit);
            let search = req.query.search;
            let data = { type, page, limit };
            let hyperHubDetailsSchema = schema.hyperHubDetails;
            schemaValidation.validateSchema(data, hyperHubDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    data.search = search;
                    dbCmd.selectAllHyperHubDetails(hyperHubDetails, data, function (err, hyperHubDetailSelected) {
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