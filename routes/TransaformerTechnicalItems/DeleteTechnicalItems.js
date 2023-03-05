const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/technicalItem');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/technicalItemsSchema');

router.post('/', function (req, res) {
    let deleteTechnicalItems = req.body.deleteTechnicalItems;
    let deleteTechnicalItemsSchema = schema.deleteTechnicalItems;

    schemaValidation.validateSchema(deleteTechnicalItems, deleteTechnicalItemsSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors" : err
            });
        }
        else {
            dbCmd.deleteTechItems(deleteTechnicalItems, function (err, result, Errors) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err
                    });
                } else {
                    res.json({
                        "type": true,
                        "Message": result,
                        "Errors": Errors
                    });
                }
            });
        }

    })
});
module.exports = router;