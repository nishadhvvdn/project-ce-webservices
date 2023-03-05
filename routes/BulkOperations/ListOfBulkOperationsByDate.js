var express = require('express');
var router = express.Router();
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MeterBulkOperationSchema')
const dbCmd = require('../../data/dbCommandsBulkOperation.js');

router.get('/', function (req, res) {
    try {
        const startTime = req.query.startTime;
        const data = { startTime}
        const getListOfBulkDataByDate = schema.getListOfBulkDataByDate;
        schemaValidation.validateSchema(data, getListOfBulkDataByDate, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            } else {
                if(schema.checkIfDateIsValidOrNot(startTime)){
                    dbCmd.listJobDetailsForBulkOperation(data, function (err, JobLists) {
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
                }else{
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "Error" : "Invalid format of startTime"
                    });
                }
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