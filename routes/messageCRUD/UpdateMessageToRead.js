var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/messagingShema');


router.put('/', function (req, res) {
    var updatemessageReadStatusData = { is_read : true , date: new Date()};
    var updatemessageReadStatusSchema = schema.updatemessageReadStatus;

    schemaValidation.validateSchema(updatemessageReadStatusData, updatemessageReadStatusSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.updateMessageAsRead(updatemessageReadStatusData,function (err, output) {
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