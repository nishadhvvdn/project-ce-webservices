var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDataQualityReport.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');



router.post('/', function (req, res) {
    try {
        var StartDate = req.body.StartDate;
        var EndDate = req.body.EndDate;
        let search = req.query.search;
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let data = { StartDate, EndDate, page, limit }
        let dataQualityReturnschema = schema.dataQualityReturns;
        schemaValidation.validateSchema(data, dataQualityReturnschema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                data.search = search;
                dbCmd.getDataQualityReport(StartDate, EndDate, data, function (err, details) {
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