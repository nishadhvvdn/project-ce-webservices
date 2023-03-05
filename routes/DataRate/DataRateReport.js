var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDataRate');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/dataRateSchema');


router.get('/', function (req, res) {
    try {
        let deviceType = req.query.DeviceType;
        let startTime = req.query.StartTime;
        let endTime = req.query.EndTime;
        let page = parseInt(req.query.Page);
        let limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let data = { deviceType, page, limit, startTime, endTime }
        let dataRateReportSchema = schema.dataRateReport;
        schemaValidation.validateSchema(data, dataRateReportSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                data.search = search;
                //get Reports for Data Rate
                dbCmd.getDataRateReport(data, function (err, CircuitDetails) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "CircuitDetails": CircuitDetails
                        });
                    }
                });
            }
        })

    }
    catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;