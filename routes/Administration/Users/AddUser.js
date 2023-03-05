var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
var dbCmdAuditLogs = require('../../../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/administratorSchema');

router.post('/', function (req, res) {
    var userID = req.body.UserID;
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var emailAdd = req.body.EmailAddress;
    var securityGroup = req.body.SecurityGroup;
    var homePage = req.body.HomePage;
    var timeZone = req.body.TimeZone;
    var accountLocked = req.body.AccountLocked;
    var temprature = req.body.Temprature;
    var mobileNumber = req.body.MobileNumber;  //add a '-' while concating country code and phone number in Front End

    var addUserData = { userID, firstName,lastName,emailAdd,securityGroup,homePage,timeZone,accountLocked,temprature,mobileNumber};
    var addUserDataSchema = schema.addUser;
    schemaValidation.validateSchema(addUserData, addUserDataSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.addUser(userID, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, mobileNumber, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Added New User - " + userID, function (err, resp) {
                        res.json({
                            "type": true,
                            "output": output
                        });
                    });
                }
            });
        }
    });
});
module.exports = router;