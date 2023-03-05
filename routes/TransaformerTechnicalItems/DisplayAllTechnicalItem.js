const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/technicalItem');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/technicalItemsSchema');

router.get('/', function (req, res) {
    const page = parseInt(req.query.Page);
    const limit = parseInt(req.query.Limit);
    const search = req.query.search;
    const transformerSN = req.query.TransformerSN;
    const data = { page, limit, transformerSN }
    const displayAllDeltalinkDetailsSchema = schema.displayAllTechnicalItems;
    schemaValidation.validateSchema(data, displayAllDeltalinkDetailsSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        } else {
            data.search = search;
            dbCmd.displayAllTechnicalItems(data, function (err, TechnicalItemDetailSelected) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err
                    });
                } else {
                    res.json({
                        "type": true,
                        "TechnicalItemDetailSelected": TechnicalItemDetailSelected
                    });
                }
            });
        }
    })
});

module.exports = router;
