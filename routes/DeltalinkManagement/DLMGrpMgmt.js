var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalink');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');

router.get('/', function (req, res) {
    let page = parseInt(req.query.Page);
    let limit = parseInt(req.query.Limit);
    let data = { page, limit }
    let displayAllDeltlinkAppGroupDetailsSchema = schema.displayAllDeltlinkAppGroupDetails;
    schemaValidation.validateSchema(data, displayAllDeltlinkAppGroupDetailsSchema, function (err, result) {
        if (err) {
            dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Delta Link Group Management ", function (err1, resp) {
                res.json({
                    "type": false,
                    "Message": err,
                });
            })
        } else {
            dbCmd.findFromMongoDB_DLM("DeltaLink", data, function (err, dataMMFromAppGrps, appCount) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err,
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Delta Link Group Management ", function (err, resp) {
                        res.json({
                            "type": true,
                            "dataFromAppGrps": dataMMFromAppGrps,
                            "appGroupCount": appCount
                        });
                    });
                }
            });
        }
    })
});

module.exports = router;