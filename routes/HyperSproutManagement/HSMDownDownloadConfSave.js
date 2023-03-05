var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.post('/', function (req, res) {
    // Parameters Passed from UI - "configName"
    var configName = req.body.configName;
    var SerialNumber = req.body.SerialNumber

    if ((configName == null) || (SerialNumber == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {
        dbCmd.initiateHSJobOfDownConf(configName, SerialNumber, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                res.json({
                    "type": true,
                    "Status": "Job(s) Added"
                });
            }
        });
    }
});
module.exports = router;