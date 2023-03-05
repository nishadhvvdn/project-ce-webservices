var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbConst = require('../../config/dbConstants');

router.post('/', function (req, res) {
    // Parameters Passed from UI - "DeviceClassID","Primary","Secondary","Tertiary","Quarternary","SecurityCodeLevels"
    var updateMMAssignDeviceSecCodeValues = req.body.updateMMAssignDeviceSecCodeValues;

    if ((updateMMAssignDeviceSecCodeValues.DeviceClassID == null) || (updateMMAssignDeviceSecCodeValues.Primary == null) || (updateMMAssignDeviceSecCodeValues.Secondary == null) || (updateMMAssignDeviceSecCodeValues.Tertiary == null) || (updateMMAssignDeviceSecCodeValues.Quarternary == null) || (updateMMAssignDeviceSecCodeValues.SecurityCodeLevels == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {

        dbCmd.updateAssignDeviceSecurityCodeMM(updateMMAssignDeviceSecCodeValues, function (err, assignDeviceSecurityCodeUpdatedMM) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
                // send an unsuccessful json response
            } else {
                res.json({
                    "type": true,
                    "AssignDeviceSecurityCodeUpdatedMM": assignDeviceSecurityCodeUpdatedMM,
                });
                // send a successful json response. 
            }
        });
    }
});

module.exports = router;