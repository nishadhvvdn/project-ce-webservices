var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/securityGroupSchema');

router.post('/', function (req, res) {
    var securityID = req.body.SecurityID;
    var description = req.body.Description;
    var functions = req.body.Functions;

    var editSecurityGroupData = {securityID,description,functions};
    var editSecurityGroupSchema = schema.editSecurityGroupData;

    schemaValidation.validateSchema(editSecurityGroupData, editSecurityGroupSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
        dbCmd.editSecurityGroup(securityID, description, functions, function (err, output) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message
                });
            } else {
                res.json({
                    "type": true,
                    "output": output
                });
            }
        });
    }
 });
});
module.exports = router;