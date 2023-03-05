var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsTransactionScheduler.js');

router.get('/', function (req, res) {
    dbCmd.ListDevicesAsReadTime(function (err, output) {
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
});
module.exports = router;