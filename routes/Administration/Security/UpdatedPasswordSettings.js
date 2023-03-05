var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');

router.get('/', function (req, res) {
    dbCmd.getUpdatedPasswordSettings(function (err, output) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message
            });
        } else {
            res.json({
                "type": true,
                "output": output
            });
        }
    });
});
module.exports = router;