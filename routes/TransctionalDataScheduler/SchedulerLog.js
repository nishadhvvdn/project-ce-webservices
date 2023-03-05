var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsTransactionScheduler.js');

router.post('/', function (req, res) {
    var deviceID = req.body.DeviceID;
    var messageID = req.body.MessageID;
    var data = req.body.Data;
    var time = req.body.TimeStampRequest;

    if ((deviceID == null) || (messageID == null) || (data == null) || (time == null)) {
        res.json({
            "Type": false,
            "Status": "Invalid Parameters"
        });
    } else {
        dbCmd.storeSchedulerLog(deviceID, messageID, data, time, function (err, output) {
            if (err) {
                res.json({
                    "Type": false,
                    "Message": err.message
                });
            } else {
                res.json({
                    "Type": true,
                    "output": output
                });
            }
        });
    }
});
module.exports = router;