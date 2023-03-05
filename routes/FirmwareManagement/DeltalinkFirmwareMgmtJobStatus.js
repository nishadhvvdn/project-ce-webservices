var express = require('express');
var router = express.Router();
var dbCmdFrm = require('../../data/dbCommandsFirmware');
var schema = require('../../config/Helpers/deltalinkManagementSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');

router.get('/', function (req, res) {
    let deviceType = req.query.DeviceType;
    let page = parseInt(req.query.Page);
    let limit = parseInt(req.query.Limit);
    let filter = req.query.Filter;
    let queryParams = { page, limit }
    let firmwareMgmtJobStatusSchema = schema.deltalinkFirmwareMgmtJobStatus;
    let data = { deviceType, page, limit,filter }
    schemaValidation.validateSchema(data, firmwareMgmtJobStatusSchema, function (err, result) {
        if (err) {
            dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Delta Link Management ", function (err1, resp) {
                res.json({
                    "type": false,
                    "Message": err,
                });
            });
        } else {
            dbCmdFrm.selectDeltalinkJobStatusFirmware(deviceType,filter, queryParams, function (err, jobStatusFirmwareSelected) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err,
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Delta Link Management ", function (err, resp) {
                        res.json({
                            "type": true,
                            "JobStatusFirmwareSelected": jobStatusFirmwareSelected,
                        });
                    });
                }
            });
        }
    })
});
module.exports = router;