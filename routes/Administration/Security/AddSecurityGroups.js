var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/securityGroupSchema');

router.post('/', function (req, res) {
    var securityID = req.body.SecurityID;
    var description = req.body.Description;
    var functions = req.body.Functions;

    var addSecurityGroupData = {securityID,description,functions};
    var addSecurityGroupSchema = schema.addSecurityGroupData;
    
    schemaValidation.validateSchema(addSecurityGroupData, addSecurityGroupSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.newSecurityGroup(securityID, description, functions, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Added Security Group - " + securityID, function (err, resp) {
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