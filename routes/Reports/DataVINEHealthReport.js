var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsReports.js');

router.post('/', function (req, res) {
    //Parameters Passed from UI - "PartSerialNo"
    var type = req.body.Type;

    if (type == null) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {
        dbCmd.dataVINEHealth(type, function (err, details) {
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
    }
});
module.exports = router;