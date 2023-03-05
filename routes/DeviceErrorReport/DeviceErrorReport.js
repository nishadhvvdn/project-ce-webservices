var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeviceErrorReport.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');


router.post('/', function (req, res) {
    try {
        var StartDate = req.body.StartDate;
        var EndDate = req.body.EndDate;
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let data = { StartDate, EndDate, page, limit }
        let DeviceErrorReportschema = schema.DeviceErrorReport;
        schemaValidation.validateSchema(data, DeviceErrorReportschema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {

                dbCmd.getDeviceErrorReport(StartDate, EndDate, data, function (err, details) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Details": err,
                        });
                    } else {
                        res.json({
                            "type": true,
                            "Details": details,
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