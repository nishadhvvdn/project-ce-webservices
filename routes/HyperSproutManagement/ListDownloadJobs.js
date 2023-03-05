var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.post('/', function (req, res) {
    var startTime = req.body.StartTime;
    var endTime = req.body.EndTime;
    var type = req.body.Type;
    if ((startTime !== null) || (endTime !== null) || (type !== null)) {
        dbCmd.listDownloadJobs(startTime, endTime, type, function (err, downloadJobs) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                res.json({
                    "type": true,
                    "Download Jobs": downloadJobs
                });
            }
        });
    } else {
        res.json({
            "type": false,
            "Message": "Invalid Parameters"
        });
    }
});
module.exports = router;