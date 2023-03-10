var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
const schemaValidation = require('../../config/Helpers/payloadValidation');
const schema = require('../../config/Helpers/messagingShema');

router.get('/', function (req, res) {
    try {
        let _id = req.query._id;
        let data = { _id } ;
        let getMessageById = schema.getMessageById;

        schemaValidation.validateSchema(data, getMessageById, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                dbCmd.getMessageDetailsById(_id, function (err, MessageDetailsById) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "MessageDetailsById": MessageDetailsById
                        });
                    }
                });
            }
        });

    }
    catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;