var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/hypersproutManagement')


router.post('/', function (req, res) {
    try {
        // Parameters Passed from UI -"GroupName","Action","listHS"
        var GroupName = req.body.GroupName;
        var Action = req.body.Action;
        var listHS = req.body.listHS;
        var Type = req.body.Type;
        let data = { Type, GroupName, Action, listHS }
        let AssignEndpointAppSchema = schema.HSMGrpMgmtAssignGrpMembershipAssignEndpoint;
        /* validate all mandatory fields */
        schemaValidation.validateSchema(data, AssignEndpointAppSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.assignHyperSproutGroups(GroupName, listHS, Action, Type, function (err, result, remainingSerialNumbers) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message,
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

    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;