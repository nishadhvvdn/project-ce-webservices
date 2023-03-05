var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/administratorSchema');

router.post('/', function (req, res) {
    var userID = req.body.UserID;

    var resetPassData = { userID};
    var resetPassSchema = schema.resetPassword;

    schemaValidation.validateSchema(resetPassData, resetPassSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.resetPassword(userID, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Reset Password for " + userID + " User", function (err, resp) {
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