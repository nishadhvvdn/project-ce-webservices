var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.post('/', function (req, res) {
    var cellID = req.body.CellID;
    var meterID = req.body.MeterID;
    var messageID = req.body.MessageID;
    var statusCode = req.body.Data[0].Status;
    var type = req.body.Attribute;

    if ((cellID === null) || (meterID === null) || (messageID === null) || (statusCode === null) || (type === null)) {
        res.json({
            "Type": false,
            "Status": "Invalid Parameter"
        });
    } else {
        var status;
        if (statusCode === 1) {
            status = "Completed";
        } else {
            status = "Failed";
        }
        dbCmd.updateDownloadJobs(cellID, meterID, messageID, status, type, function (err, result) {
            if (err) {
                res.json({
                    "Type": false,
                    "Message": err.message,
                });
            } else {
                res.json({
                    "Type": true,
                    "Status": "Jobs Added"
                });
            }
        });
    }
});
module.exports = router;