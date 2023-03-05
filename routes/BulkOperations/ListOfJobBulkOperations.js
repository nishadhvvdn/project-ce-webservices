var express = require('express');
var router = express.Router();
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MeterBulkOperationSchema')
const dbCmd = require('../../data/dbCommandsBulkOperation.js');

router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        const startTime = req.query.startTime;
        const endTime = req.query.endTime;
        const data = { page, limit , startTime , endTime }
        const getListOfBulkData = schema.getListOfBulkData;
        schemaValidation.validateSchema(data, getListOfBulkData, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            } else {
                dbCmd.listJobDetailsForReadConnectDisconnect(data, function (err, JobLists) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "JobLists": JobLists
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