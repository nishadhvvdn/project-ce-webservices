var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsReports.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');


router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let DeviceType = req.query.DeviceType;
        let search = req.query.search;
        let data = { page, limit, DeviceType }
        let DeviceFirmwareVersionReportSchema = schema.DeviceFirmwareVersionReport;
        schemaValidation.validateSchema(data, DeviceFirmwareVersionReportSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                data.search = search;
                dbCmd.deviceFirmwareVersion(data, function (err, details) {
                    if (err) {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Device Firmware Versions Reports", function (err1, resp) {
                            res.json({
                                "type": false,
                                "Message": err,
                            });
                        });
                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Device Firmware Versions Reports", function (err, resp) {
                            res.json({
                                "type": true,
                                "Details": details,
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