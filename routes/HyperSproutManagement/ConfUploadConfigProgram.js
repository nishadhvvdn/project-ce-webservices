var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');

router.post('/', function (req, res) {
    //Parameters Passed from UI - "configName","ClassName","Description"
    var configProgramName = req.body.configProgramName;
    var configProgramDetails = req.body.configProgramDetails;
    var Description = req.body.Description;
    var type = req.body.Type;

    if ((configProgramName == null) || (configProgramDetails == null) || (Description == null) || (type == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    } else {
        dbCmd.newConfigProgram(configProgramName, configProgramDetails, Description, type, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "New Configuration Program - " + configProgramName, function (err, resp) {
                    if (result.result.ok > 0) {
                        res.json({
                            "type": true,
                            "Status": "Group Added into the System"
                        });
                    } else {
                        res.json({
                            "type": false,
                            "Status": "Couldn't add Group into the System"
                        });
                    }
                });
            }
        });
    }
});
module.exports = router;