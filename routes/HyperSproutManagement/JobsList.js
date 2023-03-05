var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
let schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');

router.post('/', function (req, res) {
    try {
        var StartTime = req.body.StartTime;
        var EndTime = req.body.EndTime;
        var Type = req.body.Type;
        let jobListSchema = schema.jobList;
        let data = { StartTime, EndTime, Type }
        schemaValidation.validateSchema(data, jobListSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.selectJobs(Type, StartTime, EndTime, function (err, jobsArray) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message,
                        });
                    } else {
                        res.json({
                            "type": true,
                            "JobsArray": jobsArray,
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