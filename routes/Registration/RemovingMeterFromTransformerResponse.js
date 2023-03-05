var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var _ = require('lodash');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deleteMeterSchema')

router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            var response = req.body;
            var MID = [];
            var MIDFailure = [];
            var NoOfMeter = req.body.NoOfMeter;
            var CellID = req.body.CellID;
            let meters = req.body.meters;
            const RemoveMeterFromTransDetailSchema = schema.RemovingMeterFromTransformerWifiDetails;
            const data = { CellID , NoOfMeter, meters }
            /* validate all mandatory fields */
            schemaValidation.validateSchema(data, RemoveMeterFromTransDetailSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                }else{
                    var HypersproutID = req.body.CellID;
                    if ((HypersproutID == null) || (HypersproutID == 'null') || (HypersproutID == 0)) {
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": "Invalid HypersproutID"
                        });
                    } else {
                        if (NoOfMeter > 0) {
                            for (var i in response.meters) {
                                if (response.meters[i].Status === "Success") {
                                    MID.push(response.meters[i].DeviceID);
                                } else {
                                    MIDFailure.push(response.meters[i].DeviceID);
                                }
                            }
                        }
                        dbCmd.removingMeterFromTransformerResponse(MID, MIDFailure, HypersproutID, function (err, removingMeterFromTransformerResponse) {
                            if (err) {
                                res.json({
                                    "Type": false,
                                    "Message": "Failure"
                                });
                            } else {
                                res.json({
                                    "Type": true,
                                    "Message": "Success"
                                });
                            }
                        });
                    }
                }
            })


        }
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;