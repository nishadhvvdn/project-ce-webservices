const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/technicalItem');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/technicalItemsSchema');

router.post('/', function (req, res) {
    let editNewTechnicalItems = req.body.editNewTechnicalItems;
    let editTechnicalItemsSchema = schema.editTechnicalItems;
    schemaValidation.validateSchema(editNewTechnicalItems, editTechnicalItemsSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors" : err
            });
        }
        else {
                    dbCmd.editTechItemEntry(editNewTechnicalItems, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": result,
                                "Errors": null
                            });
                        }
                    });
        }

    })
});
module.exports = router;