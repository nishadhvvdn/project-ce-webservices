var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsReports.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');

router.get('/', function (req, res) {
    try {
        var StartTime = req.query.StartTime;
        var EndTime = req.query.EndTime;
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let filter = req.query.filter;
        let data = { StartTime, EndTime, page, limit }
        let SystemAuditLogReportSchema = schema.SystemAuditLogReport;
        schemaValidation.validateSchema(data, SystemAuditLogReportSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                data.filter = filter;
                dbCmd.systemAuditLog(StartTime, EndTime, data, function (err, details) {
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
            "Details": "Something went wrong : " + e.name + " " + e.message
        });
    }
});
module.exports = router;