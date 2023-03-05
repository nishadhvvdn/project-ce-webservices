var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/meterManagementSchema')


router.post('/', function (req, res) {
    try {
        // Parameters Passed from UI -"GroupName","Action","listMeters"
        var GroupName = req.body.GroupName;
        var Action = req.body.Action;
        var listMeters = req.body.listMeters;
        var Type = req.body.Type;
        let data = { Type, GroupName, Action, listMeters }
        let AssignEndpointAppSchema = schema.MMGrpMgmtAssignGrpMembershipAssignEndpoint;
        /* validate all mandatory fields */
        schemaValidation.validateSchema(data, AssignEndpointAppSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.assignMetersGroups(GroupName, listMeters, Action, Type, function (err, result, type, remainingSerialNumbers) {
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