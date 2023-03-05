var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport.js');

router.post('/', function (req, res) {
    var userID = req.body.UserID;
    var loginId = req.body.LoginID;
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var emailAddress = req.body.EmailAddress;
    var homePage = req.body.HomePage;
    var timeZone = req.body.TimeZone;
    var Password = req.body.Password;
    var temprature = req.body.Temprature;

    if ((userID === undefined) || (loginId === undefined) || (firstName === undefined) || (lastName === undefined) ||
        (emailAddress === undefined) || (homePage === undefined) ||
        (timeZone === undefined) || (Password === undefined) || (temprature === undefined)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameters"
        });
    } else {
        dbCmd.updateUserDetails(userID, loginId, firstName, lastName, emailAddress, homePage, timeZone, temprature, Password, function (err, output) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message
                });
            } else {
                dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Updated User Details", function (err, resp) {
                    res.json({
                        "type": true,
                        "output": output
                    });
                });
            }
        });
    }
});
module.exports = router;