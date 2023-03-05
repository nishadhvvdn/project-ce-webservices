var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsNonTechnicalreport.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');


router.post('/', function (req, res) {
    try {
        let page = parseInt(req.query.Page);
        let limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let data = {page, limit }
        let nonTechnicalLossReportSchema = schema.NonTechnicalLossReport;
        schemaValidation.validateSchema(data, nonTechnicalLossReportSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                data.search = search;
                dbCmd.getNontechnicalLossReport(data, function (err, details) {
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
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});
module.exports = router;