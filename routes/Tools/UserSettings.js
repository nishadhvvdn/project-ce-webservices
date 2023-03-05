var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/administratorSchema');

router.post('/', function (req, res) {
    var userID = req.body.UserID;

    var resetPassData = { userID };
    var resetPassSchema = schema.resetPassword;

    schemaValidation.validateSchema(resetPassData, resetPassSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.getUserSettings(userID, function (err, details) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    res.json({
                        "type": true,
                        "Details": details
                    });
                }
            });
        }
    });
});
module.exports = router;