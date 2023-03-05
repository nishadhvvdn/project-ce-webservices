var express = require('express');
var router = express.Router();
var dbCmd = require('../data/dbCommandsUserDetails.js');
var sessioncheck = require('./sessionCheck.js');

router.get('/', function (req, res) {
    var sessionID = req.sessionID;
    sessioncheck.findUser(sessionID, function (err, result) {
        if (err) {
            res.json({
                type: false,
                "Status": err.message
            });
        } else {
            dbCmd.getUserDetails(result, function (err, user, securitygrp, sysSettings) {
                if (err)
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                else
                    res.json({
                        "type": true,
                        "User Details": user,
                        "Security Group Details": securitygrp,
                        "System Settings": sysSettings
                    });
            });
        }
    });
});

module.exports = router;