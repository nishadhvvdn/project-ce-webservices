var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/securityGroupSchema');

router.post('/', function (req, res) {
    var passwordSettings = req.body.PasswordSettings;
    var passwordSettingsschema = schema.passwordSettings;

    schemaValidation.validateSchema(passwordSettings,passwordSettingsschema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.savePasswordSettings(passwordSettings, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Updated Password Settings", function (err, resp) {
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