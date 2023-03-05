const express = require('express');
const router = express.Router();
const unique = require('array-unique');
const dbCmd = require('../../data/technicalItem');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/technicalItemsSchema');

router.post('/', function (req, res) {
    let insertNewTechnicalItems = req.body.insertNewTechnicalItems;
    let insertNewTechnicalItemsSchema = schema.insertNewTechnicalItems;

    schemaValidation.validateSchema(insertNewTechnicalItems, insertNewTechnicalItemsSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors" : err
            });
        }
        else {
            resultErrors = [];
            if (insertNewTechnicalItems.Name.length === insertNewTechnicalItems.TransformerSerialNo.length && insertNewTechnicalItems.Metered.length === insertNewTechnicalItems.TransformerSerialNo.length && insertNewTechnicalItems.UsagePerDay.length === insertNewTechnicalItems.TransformerSerialNo.length && insertNewTechnicalItems.NoOfConnectedItems.length === insertNewTechnicalItems.TransformerSerialNo.length && insertNewTechnicalItems.UsageTime.length === insertNewTechnicalItems.TransformerSerialNo.length && insertNewTechnicalItems.StartHour.length === insertNewTechnicalItems.TransformerSerialNo.length && insertNewTechnicalItems.EndHour.length === insertNewTechnicalItems.TransformerSerialNo.length) {
                dbCmd.toCheckDuplicate(insertNewTechnicalItems.Name, "Technical Item Name", function (err, isDuplicate) {
                    if (err) {
                        var valueArray = insertNewTechnicalItems.Name.map(function (item) { return item.toLowerCase(); });
                        let dupName = duplicateItems.duplicateItems(valueArray);

                        for (j in insertNewTechnicalItems.Name) {
                            if (dupName.includes(insertNewTechnicalItems.Name[j].toLowerCase())) {
                                resultErrors.push({ SerialNumber: insertNewTechnicalItems.TransformerSerialNo[j], Status: 'Fail', Comment: ` ${j} ${insertNewTechnicalItems.Name[j]}  Technical Item Name!!` });
                            }
                        }
                        res.json({
                            "type": false,
                            "Message": err,
                            "Result": resultErrors
                        });
                    } else {
                        dbCmd.createNewTechItemEntry(insertNewTechnicalItems, function (err, result, Errors, resultErrors) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                unique(Errors);
                                res.json({
                                    "type": true,
                                    "Message": result,
                                    "Errors": Errors,
                                    "Result": resultErrors,
                                });
                            }
                        });
                    }
                })
            } else {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!"
                });
            }
        }

    });
});
module.exports = router;