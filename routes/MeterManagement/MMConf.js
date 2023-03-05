var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.get('/', function (req, res) {
    try {
        dbCmd.configurationDetailsOfMM(function (err, membersInfo, meterData) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message != undefined ? err.message : err ,
                });
            } else {
                res.json({
                    "type": true,
                    "memberInfo": membersInfo,
                    "meterData": meterData
                });
            }
        });
    } catch (error) {
        res.json({
            "type" : false,
            "Message" : `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;