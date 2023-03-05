var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommandsEndpoints.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation')
const schema = require('../../../config/Helpers/cePaginationSchema')


router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let data = { page, limit };
        let DisplayAllEndpointDetailsSchema = schema.DisplayAllEndpointDetails;
        schemaValidation.validateSchema(data, DisplayAllEndpointDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                data.search = search;
                dbCmd.selectAllEndpointDetails(data, function (err, endpointDetails) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "EndpointDetails": endpointDetails
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