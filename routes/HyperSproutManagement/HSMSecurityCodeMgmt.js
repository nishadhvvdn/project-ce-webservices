var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbConst = require('../../config/dbConstants');

router.get('/', function (req, res) {

    dbCmd.selectSecurityCodesHSM(function (err, securityCodesHSMSelected) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message,
            });
            // send an unsuccessful json response
        } else {
            res.json({
                "type": true,
                "SecurityCodesHSMSelected": securityCodesHSMSelected,
            });
            // send a successful json response. 
        }
    });
});
module.exports = router;