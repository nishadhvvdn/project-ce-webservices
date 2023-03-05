var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.get('/', function (req, res) {
    dbCmd.configurationDetailsOfHSM(function (err, membersInfo, hyperSproutData) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message,
            });
        } else {
            res.json({
                "type": true,
                "memberInfo": membersInfo,
                "hyperSproutData": hyperSproutData
            });
        }
    });
});
module.exports = router;