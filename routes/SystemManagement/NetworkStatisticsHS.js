var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSystemManagement.js');

router.get('/', function (req, res) {
    dbCmd.networkStatisticsHS(function (err, nwStatsHS) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message
            });
        } else {
            res.json({
                "type": true,
                "NetworkStatisticsHS": nwStatsHS
            });
        }
    });
});

module.exports = router;