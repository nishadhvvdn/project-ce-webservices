var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommandsEndpoints.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation')
const schema = require('../../../config/Helpers/EndpointSchema.js');

router.post('/', function (req, res) {
    try {
        // Parameters Passed from UI - "EndpointIDs"
        var EndpointIDs = req.body.EndpointIDs;
        const deleteEndpointDetailsSchema = schema.deleteEndpointDetails;
        const data = { EndpointIDs };
        schemaValidation.validateSchema(data, deleteEndpointDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.deleteEndpoints(EndpointIDs, function (err, circuitDetailsDeleted) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "Message": circuitDetailsDeleted,
                        });
                    }
                });

            }
        });
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;