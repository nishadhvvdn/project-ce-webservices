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
            var Status = response.Data[0].STATUSCODE;
            if((HID == null) || (HID == 'null') || (HID == 0) || (Status == null) || (Status == 'null')){
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": "Invalid HypersproutID"
                });
            }else{
                dbCmd.editHypersproutWifiReponse(HID, Status, function (err, editHypersproutWifiResponse) {
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
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;