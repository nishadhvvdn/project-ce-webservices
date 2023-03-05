var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsReports.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');


router.get('/', function (req, res) {
    try {
        var StartTime = req.query.StartTime;
        var EndTime = req.query.EndTime;
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let data = { StartTime, EndTime, page, limit }
        let SystemLogReportSchema = schema.SystemLogReport;
        schemaValidation.validateSchema(data, SystemLogReportSchema, function (err, result) {
            if (err) {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "System Log Reports", function (err1, resp) {
                    res.json({
                        "type": false,
                        "Message": err,
                    });
                });
            } else {
                data.search = search;
                dbCmd.systemLog(StartTime, EndTime, data, function (err, details) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err,
                        });
                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "System Log Reports", function (err, resp) {
                            res.json({
                                "type": true,
                                "Details": details,
                            });
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