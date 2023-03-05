var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbConst = require('../../config/dbConstants');

router.post('/', function (req, res) {
    var startTime = req.body.StartTime;
    var endTime = req.body.EndTime;

    dbCmd.selectTagDiscrepanciesMM(startTime, endTime, function (err, tagDiscrepanciesSelected) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message,
            });
            // send an unsuccessful json response
        } else {
            res.json({
                "type": true,
                "TagDiscrepanciesSelected": tagDiscrepanciesSelected,
            });
            // send a successful json response. 
        }
    });
});
module.exports = router;