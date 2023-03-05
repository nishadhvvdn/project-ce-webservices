var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');

router.post('/', function (req, res) {
    //Parameters Passed from UI - "configName","listHS"
    var configName = req.body.configName;
    var listMeters = req.body.listMeters;
    var Action = req.body.Action;

    if ((configName === null) || (listMeters === null) ||(listMeters.length ==0)|| (Action === null) || (configName === "Unknown Membership Group")) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    } else {
        dbCmd.updateMeterGroups(configName, listMeters, Action, function (err, user) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "New Meter Configuration Group - " + configName, function (err, resp) {
                    if (user) {
                        res.json({
                            "type": true,
                            "Status": user
                        });
                    } else {
                        res.json({
                            "type": false,
                            "Status": "Group assignment failed"
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;