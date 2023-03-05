var express = require('express');
var dbCmd = require('../../data/mobileLogout.js');

var router = express.Router();
router.get('/', function (req, res) {
    var consumerID = req.headers.consumerid;
    let DevicePlatform = req.headers.deviceplatform;
    let DeviceToken = req.headers.devicetoken;
    dbCmd.mobileLogout(consumerID,DevicePlatform,DeviceToken, function (err, result) {
        if (err) {
            res.json({
                "data": {},
                "response": {
                    "message": err.message,
                    "status": false,
                    "responseCode": err.responseCode
                }
            });
        } else {
            res.json({
                "data": {},
                "response": {
                    "message": result.message,
                    "status": true,
                    "responseCode": result.responseCode
                }
            });
        }
    });
});

module.exports = router;