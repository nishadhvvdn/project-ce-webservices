var express = require('express');
var router = express.Router();
// var dbCmd = require('../../../data/dbCommands.js');
// var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
// const schemaValidation = require('../../../config/Helpers/payloadValidation');
// const schema = require('../../../config/Helpers/administratorSchema');
var dbCmd = require('../../data/dbCommands.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/messagingShema');

router.delete('/', function (req, res) {
    var _id = req.body._id;

    dbCmd.deleteMessage(_id, function (err, output) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message
            });
        } else {
            res.json({
                "type": true,
                "output": output
            });
        }
    });
});
module.exports = router;