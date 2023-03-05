var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');

router.post('/', function (req, res) {
    var name = req.body.configProgramName;
    var type = req.body.Type;

    if (((type === "HyperSprout") || (type === "Meter")) && (name !== null)) {
        dbCmd.deleteConfigPrograms(name, type, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Delete Configuration Program - " + name, function (err, resp) {
                    res.json({
                        "type": true,
                        "Result": result
                    });
                });
            }
        });
    } else {
        res.json({
            "type": false,
            "Status": "Invalid Parameters"
        });
    }
});
module.exports = router;