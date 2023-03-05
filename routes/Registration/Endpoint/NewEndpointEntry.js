var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommandsEndpoints.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/EndpointSchema.js');
const duplicateItems = require('../../../config/Helpers/duplicateEntry')

router.post('/', function (req, res) {
    try {
        var insertNewEndpointDetails = req.body.insertNewEndpointDetails;
        const addEndpointDetailsSchema = schema.addNewEndpointDetails;
        schemaValidation.validateSchema(insertNewEndpointDetails, addEndpointDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else if (!((insertNewEndpointDetails.Owner) && (insertNewEndpointDetails.MacID)
                && (insertNewEndpointDetails.Description) && (insertNewEndpointDetails.CircuitID)
                && (insertNewEndpointDetails.Type) && (insertNewEndpointDetails.DeviceType))) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Fields are missing !!"
                });
            } else if (!(Object.keys(insertNewEndpointDetails).length === 6)) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Fields are missing !!"
                });
            } else {
                var dubMacID = [];
                let isMulticast;
                let resultErrors2 = [];
                for (i = 0; i < (insertNewEndpointDetails.MacID).length; i++) {
                    dubMacID.push(insertNewEndpointDetails.MacID[i]);
                    isMulticast = duplicateItems.toCheckMulticastMACAddress(insertNewEndpointDetails.MacID[i].toLowerCase())
                    if (isMulticast == 1) {
                        resultErrors2.push({ SerialNumber: insertNewEndpointDetails.MacID[i], Status: 'Fail', Comment: `${i} ${insertNewEndpointDetails.MacID[i]}  multicast Mac ID!!` });
                    }
                }

                var valueArr = dubMacID.map(function (item) { return item.toLowerCase() });
                var isDuplicate = valueArr.some(function (item, idx) {
                    return valueArr.indexOf(item) != idx
                });
                var valueArray = insertNewEndpointDetails.MacID.map(function (item) { return item.toLowerCase(); });
                let dupMacIDs = duplicateItems.duplicateItems(valueArray);
                let resultErrors = [];
                if (isDuplicate) {
                    for (j in insertNewEndpointDetails.MacID) {
                        if (dupMacIDs.includes(insertNewEndpointDetails.MacID[j].toLowerCase())) {
                            resultErrors.push({ SerialNumber: insertNewEndpointDetails.MacID[j], Status: 'Fail', Comment: `  ${j} ${insertNewEndpointDetails.MacID[j]} duplicate Mac ID!!` });
                        }
                    }
                    res.json({
                        "type": false,
                        "Message": "duplicate MAC ID !!",
                        "Result": resultErrors

                    });
                } else if (resultErrors2.length > 0) {
                    res.json({
                        "type": false,
                        "Message": "multicast MAC ID(s) not allowed!!",
                        "Result": resultErrors2

                    });
                } else {
                    dbCmd.createNewEndpointEntry(insertNewEndpointDetails, function (err, result, duplicateIds, resultErrors) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": result,
                                "Errors": duplicateIds,
                                "Result": resultErrors
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