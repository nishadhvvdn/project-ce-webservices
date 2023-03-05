var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.post('/', function (req, res) {
    var type = req.body.Type;
    if ((type === "HyperSprout") || (type === "Meter")) {
        dbCmd.configPrograms(type, function (err, membersInfo, configProgramData) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                res.json({
                    "type": true,
                    "memberInfo": membersInfo,
                    "configProgramData": configProgramData
                });
            }
        });
    } else {
        res.json({
            "type": false,
            "Message": "Invalid Parameters"
        });
    }
});
module.exports = router;