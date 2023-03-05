var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalink');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')

router.post('/', function (req, res) {
    // Parameters Passed from UI -"GroupName","Action","listHS"
    var groupName = req.body.GroupName;
    var listDeltalinks = req.body.listDeltalinks;
    var action = req.body.Action;
    var type = req.body.Type;
    let data = { groupName, listDeltalinks, action, type }
    let assignGroupMemberSchema = schema.assignGroupMember;
    schemaValidation.validateSchema(data, assignGroupMemberSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": err
            });
        } else {
            dbCmd.assignDeltalinksGroups(groupName, listDeltalinks, action, type, function (err, result, type, remainingSerialNumbers) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err,
                        "remainingSerialNumbers": remainingSerialNumbers
                    });
                } else {
                    if (result) {
                        res.json({
                            "type": true,
                            "Status": "Successful",
                            "remainingSerialNumbers": remainingSerialNumbers
                        });
                    }
                }
            });
        }
    })
});

module.exports = router;