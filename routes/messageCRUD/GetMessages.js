var express = require('express');
var router = express.Router();
// var dbCmd = require('../../../data/dbCommands.js');
// const schemaValidation = require('../../../config/Helpers/payloadValidation');
// const schema = require('../../../config/Helpers/cePaginationSchema');
// var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport');
var dbCmd = require('../../data/dbCommands.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/cePaginationSchema');

router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let filter = req.query.filter;
        let data = { page, limit };
        let GetMessageDetailsSchema = schema.GetMessageDetails;
        schemaValidation.validateSchema(data, GetMessageDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                
                data.search = search;
                data.filter = filter;
                dbCmd.getMessageDetails(data, function (err, output) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        // dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Users", function (err, resp) {
                            res.json({
                                "type": true,
                                "output": output
                            });
                        // });
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