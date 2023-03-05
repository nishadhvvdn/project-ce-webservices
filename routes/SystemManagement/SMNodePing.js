var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSystemManagement.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');

router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            // payload is empty 
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            //Parameters Passed from UI - "SerialNumber"
            var SerialNumber = req.body.SerialNumber;
            var Type = req.body.Type;
            let data = { SerialNumber, Type }
            let SMNodePingSchema = schema.SMNodePing;
            schemaValidation.validateSchema(data, SMNodePingSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                }
                else {
                    dbCmd.deviceStatus(Type, SerialNumber, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err.message,
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Output": result,
                            });
                        }
                    });
                }
            })



        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;