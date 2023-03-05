var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/cePaginationSchema');
var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport');

router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let data = { page, limit };
        let GetSecurityGroupsDetailsSchema = schema.GetSecurityGroupsDetails;
        schemaValidation.validateSchema(data, GetSecurityGroupsDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                data.search = search;
                dbCmd.allSecurityGroupDetails(data, function (err, output, membersInfo) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message
                        });
                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Security", function (err, resp) {
                            res.json({
                                "type": true,
                                "output": output,
                                "membersInfo": membersInfo
                            });
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