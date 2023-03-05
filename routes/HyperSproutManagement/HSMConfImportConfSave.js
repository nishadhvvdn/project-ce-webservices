var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');

router.post('/', function (req, res) {
    //Parameters Passed from UI - "configName","listHS"
    var configName = req.body.configName;
    var listHS = req.body.listHS;
    var Action = req.body.Action;

    if ((configName === null) || (listHS === null) || (Action === null) || (configName === "Unknown Membership Group")) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {
        dbCmd.updateHyperSproutGroups(configName, listHS, Action, function (err, user) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "New HS Configuration Group - " + configName, function (err, resp) {
                    if (user) {
                        res.json({
                            "type": true,
                            "Status": "Successful"
                        });
                    } else {
                        res.json({
                            "type": false,
                            "Message": "Group assignment failed"
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;