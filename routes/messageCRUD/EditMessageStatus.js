var express = require('express');
var router = express.Router();
// var dbCmd = require('../../../data/dbCommands.js');
// var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
var dbCmd = require('../../data/dbCommands.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/messagingShema');


router.put('/', function (req, res) {
    var message_id = req.query.message_id;
    var is_read = req.body.is_read;
    var date = new Date()
    var editMessageData = { is_read , date};
    var editMessageDataSchema = schema.editMessage;

    schemaValidation.validateSchema(editMessageData, editMessageDataSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.editMessage(is_read , date, message_id,function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err
                    });
                } else {
                    // dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Edited User - " + userID, function (err, resp) {
                        res.json({
                            "type": true,
                            "output": output
                        });
                    // });
                }
            });
        }
    });
});
module.exports = router;