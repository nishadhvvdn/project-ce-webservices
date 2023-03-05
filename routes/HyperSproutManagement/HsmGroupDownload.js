var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.post('/', function (req, res) {
    // Parameters Passed from UI - "configName"
    var configName = req.body.configName;

    if ((configName == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {
        dbCmd.hsmGroupDownload(configName, function (err, result) {
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