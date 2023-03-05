var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/hypersproutManagement')

router.post('/', function (req, res) {
    try {
        // Parameters Passed from UI -"GroupName","Description","Type"
        var GroupName = req.body.GroupName;
        var Description = req.body.Description;
        var Type = req.body.Type;
        let data = { Type, GroupName, Description }
        let createAppSchema = schema.HSMGrpMgmtAssignGrpMembershipCreateAppGrp;
        /* validate all mandatory fields */
        schemaValidation.validateSchema(data, createAppSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.createNewHSMAppGroup(GroupName, Description, Type, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Status": err.message,
                        });
                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "New Application Group - " + GroupName, function (err, resp) {
                            if (result) {
                                res.json({
                                    "type": true,
                                    "Status": "App Group Added into the System"
                                });
                            } else {
                                res.json({
                                    "type": false,
                                    "Status": "Couldn't add App Group into the System"
                                });
                            }
                        });
                    }
                });
            }
        })

    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

 


module.exports = router;

