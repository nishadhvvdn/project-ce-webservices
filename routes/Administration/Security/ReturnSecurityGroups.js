var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/securityGroupSchema');

router.post('/', function (req, res) {
    var securityID = req.body.SecurityID;

    var returnSecurityGroupData = {securityID};
    var returnSecurityGroupDataSchema = schema.deleteSecurityGroupData;
    
    schemaValidation.validateSchema(returnSecurityGroupData, returnSecurityGroupDataSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.securityGroupDetails(securityID, function (err, output) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err
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