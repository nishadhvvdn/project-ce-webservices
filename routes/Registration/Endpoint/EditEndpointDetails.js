var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommandsEndpoints.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation')
const schema = require('../../../config/Helpers/EndpointSchema.js');

router.post('/', function (req, res) {
    try {
        var updateEndpointValues = req.body.updateEndpointValues;
        const editEndpointDetailsSchema = schema.editEndpointDetails;
        const data = { updateEndpointValues };
        schemaValidation.validateSchema(data, editEndpointDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                // Parameters Passed from UI -EndpointID, MACID, Owner, Description, CircuitID

                if (!((updateEndpointValues.EndpointID) && (updateEndpointValues.MacID) &&
                    (updateEndpointValues.Owner) && (updateEndpointValues.Description) &&
                    (updateEndpointValues.CircuitID) && (updateEndpointValues.DeviceType))) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Fields are missing !!"
                    });
                } else {
                    if (updateEndpointValues.EndpointID) {
                        updateEndpointValues.EndpointID = parseInt(updateEndpointValues.EndpointID);
                    }
                    dbCmd.updateEndpointDetails(updateEndpointValues, function (err, circuitDetailsUpdated) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message != undefined ? err.message : err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": circuitDetailsUpdated
                            });
                        }
                    });
                }
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