var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')

router.post('/', function (req, res) {
    var ID = parseInt(req.body.ID);
    var Type = req.body.Type;
    var DeviceType = req.body.DeviceType;
    let data = { ID, Type, DeviceType }
    let appGroupDeleteSchema = schema.appGroupDelete;
    schemaValidation.validateSchema(data, appGroupDeleteSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors":err
            });
        } else {
            var groupID = parseInt(req.body.ID);
            dbCmd.deleteHSConfiggroup(groupID, Type, DeviceType, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Group Deletion", function (err, resp) {
                        res.json({
                            "type": true,
                            "output": output
                        });
                    });
                }
            });
        }
    })

});
module.exports = router;