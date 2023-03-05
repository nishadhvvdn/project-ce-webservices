var express = require('express');
var router = express.Router();
// var dbCmd = require('../../../data/dbCommands.js');
var dbCmd = require('../../data/dbCommands.js')
// var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
// const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/messagingShema');

router.post('/', function (req, res) {
    var message_id = req.body.message_id;
    // var ProfilePic = req.body.ProfilePic;
    var recipient = req.body.recipient;
    var message = req.body.message;
    var is_read = req.body.is_read;
    var date = new Date()
    var sender = req.session.user._id; //    console.log("user", req.session.user._id)
    var severity = req.body.severity;

    var addMessageData = { message_id,recipient,message,is_read,date,sender,severity};
    var addMessageDataSchema = schema.addMessage;

    schemaValidation.validateSchema(addMessageData, addMessageDataSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.addMessage(message_id,recipient,message,is_read,date,sender,severity, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    // dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Added New Message - " + message_id, function (err, resp) {
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