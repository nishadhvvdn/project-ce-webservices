var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');

router.post('/', function (req, res) {
    var configName = req.body.configName;
    var configProgramName = req.body.configProgramName;
    var ClassName = req.body.ClassName;
    var Description = req.body.Description;
    var Type = req.body.Type;

    if ((configName == null) || (ClassName == null) || (Description == null) || (configProgramName == null) ||
        (Type == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    } else {
        dbCmd.newConfGrp(configName, ClassName, configProgramName, Description, Type, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "New Configuration Group - " + configName, function (err, resp) {
                    res.json({
                        "type": true,
                        "Status": result
                    });
                });
            }
        });
    }
});
module.exports = router;