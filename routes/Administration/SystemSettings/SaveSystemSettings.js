var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/administratorSchema');

router.post('/', function (req, res) {
    var tabValue = req.body.tabHeading;
    var saveSettings = req.body.saveSettings;
  
    var saveSysSettData = {tabValue,saveSettings};
    var saveSystemSettingsschema = schema.saveSystemSettings;

    schemaValidation.validateSchema(saveSysSettData, saveSystemSettingsschema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            var status = 'Updated';
            dbCmd.saveSystemSettings(saveSettings, tabValue, status, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Updated System Settings", function (err, resp) {
                        res.json({
                            "type": true,
                            "output": output
                        });
                    });
                }
            });
        }
    });
});
module.exports = router;