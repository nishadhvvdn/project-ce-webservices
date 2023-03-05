var express = require('express');
var router = express.Router();
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MeterBulkOperationSchema')
const dbCmd = require('../../data/dbCommandsBulkOperation.js');

router.get('/', function (req, res) {
    try {
        dbCmd.listAllJobDetailsForReadConnectDisconnect(function (err, JobLists) {
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
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;