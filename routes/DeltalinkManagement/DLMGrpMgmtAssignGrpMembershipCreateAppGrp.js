var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalink');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')

router.post('/', function (req, res) {
    // Parameters Passed from UI -"GroupName","Description","Type"
    var groupName = req.body.GroupName;
    var description = req.body.Description;
    var type = req.body.Type;
    let data = { groupName, description, type }
    let createAppGroupSchema = schema.createAppGroup;
    schemaValidation.validateSchema(data, createAppGroupSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors":err
            });
        } else {
            dbCmd.createNewDLMAppGroup(groupName, description, type, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Status": err.message,
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "New Application Group - " + groupName, function (err, resp) {
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

});


module.exports = router;

