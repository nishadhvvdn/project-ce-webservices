var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsTransactionScheduler.js');

router.post('/', function (req, res) {
    var deviceID = req.body.DeviceID;
    var status = req.body.Status;

    if ((deviceID == null) || (status === null)) {
        res.json({
            "Type": false,
            "Status": "Invalid Parameters"
        });
    } else {
        dbCmd.deviceConnectionStatus(deviceID, status, function (err, output) {
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