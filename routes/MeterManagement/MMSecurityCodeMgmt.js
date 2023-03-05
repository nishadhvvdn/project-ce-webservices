var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbConst = require('../../config/dbConstants');

router.get('/', function (req, res) {

    dbCmd.selectSecurityCodeMM(function (err, securityCodeMMSelected) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message,
            });
            // send an unsuccessful json response
        } else {
            res.json({
                "type": true,
                "SecurityCodesMMSelected": securityCodeMMSelected,
            });
            // send a successful json response. 
        }
    });
});
module.exports = router;