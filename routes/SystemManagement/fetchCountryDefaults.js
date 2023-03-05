var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSystemManagement.js');
let schemaValidation = require('../../config/Helpers/payloadValidation');
let schema = require('../../config/Helpers/ConfigMgmntSchema');
var _ = require('lodash');

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
            var Country = req.body.Country;
            var type = req.body.Type;
            let CountryDefaultSchema = schema.CountryDefault;
            let data = { Country, type }
            schemaValidation.validateSchema(data, CountryDefaultSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    Country = Country.toUpperCase();

                    dbCmd.getCountryDefaults(Country, type, function (err, details) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            if (details.length > 0) {
                                res.json({
                                    "type": true,
                                    "details": details,
                                });
                            } else {
                                res.json({
                                    "type": false,
                                    "Status": "No Config in system",
                                });
                            }
                        }
                    });
                }
            });
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});
module.exports = router;