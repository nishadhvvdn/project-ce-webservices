var express = require('express');
var router = express.Router();
var dbCmd = require('../../../data/dbCommands.js');
const schemaValidation = require('../../../config/Helpers/payloadValidation');
const schema = require('../../../config/Helpers/administratorSchema');

router.post('/', function (req, res) {
    var tabValue = req.body.tabHeading;

    var restoreSettData = { tabValue };
    var restoreSettSchema = schema.restoreDefaultSettings;

    schemaValidation.validateSchema(restoreSettData, restoreSettSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.restoreDefaultSystemSettings(tabValue, function (err, output) {
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