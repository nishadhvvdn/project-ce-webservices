var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');

router.post('/', function (req, res) {
    //Parameters Passed from UI - "ConfigID"
    var ConfigID = req.body.ConfigID;

    if (ConfigID == null) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {

        dbCmd.hSMConfigEdit(ConfigID, function (err, docs) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
                // send an unsuccessful json response
            } else {
                res.json({
                    "type": true,
                    "Docs": docs,
                });
                // send a successful json response. 
            }
        });
    }
});

module.exports = router;