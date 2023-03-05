var express = require('express');
var router = express.Router();
var dbCmdFrm = require('../../data/dbCommandsFirmware');
var dbConst = require('../../config/dbConstants');
var schema = require('../../config/Helpers/deltalinkManagementSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');


router.post('/', function (req, res) {
    try {
        let DeviceType = req.body.DeviceType;
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let filter = req.query.filter;
        let data = { DeviceType, page, limit };
        let firmwareMgmtJobStatusSchema = schema.firmwareMgmtJobStatus;
        schemaValidation.validateSchema(data, firmwareMgmtJobStatusSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                data.filter = filter;
                dbCmdFrm.selectJobStatusFirmware(DeviceType, data, function (err, jobStatusFirmwareSelected, appGroup) {
                    if (err) {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, DeviceType+" Management", function (err1, resp) {
                            res.json({
                                "type": false,
                                "Message": err.message != undefined ? err.message : err,
                            });
                        });
                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, DeviceType+" Management", function (err, resp) {
                            res.json({
                                "type": true,
                                "JobStatusFirmwareSelected": jobStatusFirmwareSelected,
                                "AppGroup": appGroup
                            });
                        }); 
                    }
                });
            }
        })
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;