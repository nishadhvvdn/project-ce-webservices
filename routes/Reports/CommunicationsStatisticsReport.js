var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsReports.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');


router.post('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let IfHyperhub = req.body.IfHyperhub;
        const data = { page, limit, IfHyperhub };
        dbCmd.communicationStatistics(data, function (err, details) {
            if (err) {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Communication Statistics Reports", function (err1, resp) {
                    res.json({
                        "type": false,
                        "Message": err,
                    });
                })
            } else {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Communication Statistics Reports", function (err, resp) {
                    res.json({
                        "type": true,
                        "Details": details,
                    });
                });
            }
        });

    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});
module.exports = router;