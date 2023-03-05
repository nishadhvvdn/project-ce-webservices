var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDelayResponseReport.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');


router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let data = { page, limit }
        let DelayResponseReportSchema = schema.DelayResponseReport;
        schemaValidation.validateSchema(data, DelayResponseReportSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {

        dbCmd.getDelayResponseReport(data, function (err, details) {
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
    }})
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});
module.exports = router;