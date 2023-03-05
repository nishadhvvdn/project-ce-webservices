var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalink');

router.get('/', function (req, res) {
    try {
        dbCmd.selectExportAllDeltalinkDetails(function (err, deltalinkDetailSelected) {
            if (err) {
                res.json({
                    "type": false, "Message": err
                });

            } else {
                res.json({
                    "type": true, "DeltalinkDetailSelected": deltalinkDetailSelected,
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