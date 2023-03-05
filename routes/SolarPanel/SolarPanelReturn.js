var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSolarReturn.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');

router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let data = { page, limit }
        let SolarPanelReturnchema = schema.SolarPanelReturn;
        schemaValidation.validateSchema(data, SolarPanelReturnchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                data.search = search;

                dbCmd.getSolarPanelReturnData(data, function (err, details) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err,
                        });
                    } else {
                        res.json({
                            "type": true,
                            "Details": details,
                        });
                    }
                });
            }
        })
    } catch (e) {
        res.json({
            "type": true,
            "Details": "Something went wrong : " + e.name + " " + e.message,
        });
    }
});
module.exports = router;