var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommandsEndpoints.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/EndpointSchema.js');

router.post('/', function (req, res) {
    try {
        var cellID = req.body.CellID;
        var messageID = req.body.MessageID;
        var meterID = req.body.MeterID;
        var action = req.body.Action;
        var statusCode = req.body.Data[0].STATUSCODE;

        const responseEndpointDetailsSchema = schema.responseEndpointDetails;
        const data = { cellID, messageID, meterID, action };
        schemaValidation.validateSchema(data, responseEndpointDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            }else{
                if ((cellID === null) || (messageID === null) || (statusCode === null)
                    || (action === null) || (meterID === null)) {
                    res.json({
                        "Type": false,
                        "Status": "Invalid Parameter"
                    });
                } else {
                    var status, jobType;
                    if (statusCode === 1)
                        status = "Completed";
                    else if (statusCode === 2)
                        status = "INVALID_MAC";
                    else
                        status = "MAC_ID_NOT_PRESENT";
                    if (action === "ENDPOINT_REGISTERATION")
                        jobType = "MacID Registraion";
                    else
                        jobType = "MacID DeRegistraion";
                    dbCmd.endpointRegistrationJobsResponse(cellID, messageID, status, jobType, function (err, result) {
                        if (err) {
                            res.json({
                                "Type": false,
                                "Message": err.message != undefined ? err.message : err,
                            });
                        } else {
                            res.json({
                                "Type": true,
                                "Status": "Jobs Updated"
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