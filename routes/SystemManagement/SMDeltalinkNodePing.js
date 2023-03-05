var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalinkNodePing.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')

router.post('/', function (req, res) {
    try {
        let DeltalinkID = req.body.DeltalinkID;
        let nodePingDeltalinkValues = schema.nodePingDeltalinkValues;
        let data = { DeltalinkID }
        schemaValidation.validateSchema(data, nodePingDeltalinkValues, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors":err
                });
            } else {
                deltalinkID = parseInt(DeltalinkID)
                dbCmd.deltalinkDeviceStatus(DeltalinkID, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err,
                        });
                    } else {
                        res.json({
                            "type": true,
                            "Status": result,
                        });
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