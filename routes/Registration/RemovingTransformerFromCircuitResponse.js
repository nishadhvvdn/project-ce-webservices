var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var _ = require('lodash');

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
            var HID = response.CellID;
            var Status = response.Status;
            var Attribute = response.Attribute;
            if((HID == null) || (HID == '') || (HID == 'null') || (Status == null) || (Status == 'null')|| (Status == '')){
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : "Please add CellID/Status/Attribute"
                });
            }else{
                if (Attribute == "HYPERHUB_DELETE") {
                    dbCmd.removingHHFromTransformerResponse(HID, Status, function (err, removingTransformerFromCircuitResponse) {
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
                } else {
                    dbCmd.removingTransformerFromCircuitResponse(HID, Status, function (err, removingTransformerFromCircuitResponse) {
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
        }
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;