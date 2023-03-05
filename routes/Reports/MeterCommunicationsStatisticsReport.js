var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsReports.js');

router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        const data = { page, limit};
        dbCmd.meterCommunicationStatistics(data,function (err, details) {
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
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});
module.exports = router;