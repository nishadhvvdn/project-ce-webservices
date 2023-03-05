var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');

router.get('/', function (req, res) {
    try {

        dbCmd.getMessagesCount(function (err, output) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err
                });
            } else {
                res.json({
                    "type": true,
                    "message": "Message count fetched successfully",
                    "data": output
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