var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalink');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');


router.get('/', function (req, res) {
    var startTime = req.query.StartTime;
    var endTime = req.query.EndTime;
    var deviceType = req.query.DeviceType;
    var filter = req.query.filter;
    filter= decodeURI(filter)
    let page = parseInt(req.query.Page);
    let limit = parseInt(req.query.Limit);
    let data = { deviceType, startTime, endTime, page, limit , filter}
    let deltalinkJobListSchema = schema.deltalinkJobList;
    schemaValidation.validateSchema(data, deltalinkJobListSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!"
            });
        } else {
            dbCmd.selectJobs(data,filter, function (err, jobsArray) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err,
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "HyperSprout Management", function (err, resp) {
                        res.json({
                            "type": true,
                            "JobsArray": jobsArray,
                        });
                     });
                }
            });
        }
    })


});
module.exports = router;