var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsNetworkStatisticsMeter.js');

router.get('/', function (req, res) {
    dbCmd.getMeterNetworkStatitics(function (err, details) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message,
            });
        } else {
            res.json({
                "type": true,
                "Details": details,
            });
        }
    });
});
module.exports = router;