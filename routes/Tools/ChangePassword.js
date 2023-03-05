var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/administratorSchema');

router.post('/', function (req, res) {
    var loginId = req.body.LoginID;
    var oldPassword = req.body.OldPassword;
    var newPassword = req.body.NewPassword;
    var isPasswordExpired = req.body.isPasswordExpired;

    var changePassData = { loginId, oldPassword, newPassword, isPasswordExpired };
    var changePassSchema = schema.changePassword;

    schemaValidation.validateSchema(changePassData, changePassSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {

            //decrypt the Passwords in base64
            let buff = Buffer.from(oldPassword, 'base64');
            oldPassword = buff.toString('ascii');
            let buffer = Buffer.from(newPassword, 'base64');
            newPassword = buffer.toString('ascii');

            dbCmd.updateUserPassword(loginId, oldPassword, newPassword, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else if (isPasswordExpired) {
                    res.json({
                        "type": true,
                        "output": output
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Change Password", function (err, resp) {
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