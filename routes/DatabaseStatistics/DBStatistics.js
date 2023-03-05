var express = require('express');
var router = express.Router();
var dbStats = require('./getDbStatistics.js');
var schema = require('../../config/Helpers/reportsSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');

router.post('/', function (req, res) {
    var StartTime = req.body.StartTime;
    var EndTime = req.body.EndTime;

    let data = {StartTime, EndTime }
    let dataQualityReturnschema = schema.DbStatistics;
    schemaValidation.validateSchema(data, dataQualityReturnschema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        } else {
            dbStats.getMongoDBStats(StartTime, EndTime, function (err, dbStats, errors) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err,
                    });
                } else {
                    res.json({
                        "type": true,
                        "dbStats": dbStats,
                        "Errors": errors
                    });
                }
            });
        }
    });
});
module.exports = router;
