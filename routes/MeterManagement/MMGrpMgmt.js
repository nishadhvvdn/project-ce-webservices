var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/cePaginationSchema');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');

router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let data = { page, limit };
        let DisplayAllMeterManagementDetailsSchema = schema.DisplayAllMeterManagementDetails;
        schemaValidation.validateSchema(data, DisplayAllMeterManagementDetailsSchema, function (err, result) {
            if (err) {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Meter Group Management", function (err1, resp) {
                    res.json({
                        "type": false,
                        "Message": err,
                    });
                })
            }
            else {
                dbCmd.findFromMongoDB_HSM("Meter", data, function (err, ApplicationIDs) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err,
                        });
                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Meter Group Management", function (err, resp) {
                            res.json({
                                "type": true,
                                "ApplicationIDs": ApplicationIDs
                            });
                        });
                    }
                });
            }
        });
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;