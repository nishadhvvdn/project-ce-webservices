var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbConst = require('../../config/dbConstants');

router.post('/', function (req, res) {
    // Parameters Passed from UI - "DeviceClassID","Primary","Secondary","Tertiary","Quarternary","SecurityCodeLevels"
    var updateHSMAssignDeviceSecCodeValues = req.body.updateHSMAssignDeviceSecCodeValues;

    if ((updateHSMAssignDeviceSecCodeValues.DeviceClassID == null) || (updateHSMAssignDeviceSecCodeValues.Primary == null) || (updateHSMAssignDeviceSecCodeValues.Secondary == null) || (updateHSMAssignDeviceSecCodeValues.Tertiary == null) || (updateHSMAssignDeviceSecCodeValues.Quarternary == null) || (updateHSMAssignDeviceSecCodeValues.SecurityCodeLevels == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {
        dbCmd.updateAssignDeviceSecurityCodeHSM(updateHSMAssignDeviceSecCodeValues, function (err, assignDeviceSecurityCodeHSMUpdated) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
                // send an unsuccessful json response
            } else {
                res.json({
                    "type": true,
                    "AssignDeviceSecurityCodeHSMUpdated": assignDeviceSecurityCodeHSMUpdated,
                });
                // send a successful json response. 
            }
        });
    }
});

module.exports = router;