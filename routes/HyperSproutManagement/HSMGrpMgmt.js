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
        let DisplayAllHSManagementDetailsSchema = schema.DisplayAllHSManagementDetails;
        schemaValidation.validateSchema(data, DisplayAllHSManagementDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                dbCmd.findFromMongoDB_HSM("HyperSprout", data, function (err, ApplicationIDs) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err,
                        });
                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "HyperSprout Group Management", function (err, resp) {
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