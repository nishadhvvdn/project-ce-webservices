var express = require('express');
var dbCon = require('../data/dbConnection');
var router = express.Router();

router.get('/', function (req, res) {
    req.session.destroy(function (err, resp) {
        res.clearCookie('connect.sid', { expires: new Date(), path: '/' });
        if (err) {
            res.json({
                type: false
            });
        } else {
            res.json({
                type: true
            });
        }
    });
});

module.exports = router;