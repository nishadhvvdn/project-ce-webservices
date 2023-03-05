var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbConst = require('../../config/dbConstants');

router.post('/', function (req, res) {
    // Parameters Passed from UI - "DeviceClassID","EncryptionType1","EncryptionKeyID1","EncryptionKey1","EncryptionType2","EncryptionKeyID2","EncryptionKey2","EncryptionType3","EncryptionKeyID3","EncryptionKey3" 
    var updateHSMSecuritySaveValues = req.body.updateHSMSecuritySaveValues;

    if ((updateHSMSecuritySaveValues.DeviceClassID == null) ||
        (updateHSMSecuritySaveValues.EncryptionType1 == null) ||
        (updateHSMSecuritySaveValues.EncryptionKeyID1 == null) ||
        (updateHSMSecuritySaveValues.EncryptionKey1 == null) ||
        (updateHSMSecuritySaveValues.EncryptionType2 == null) ||
        (updateHSMSecuritySaveValues.EncryptionKeyID2 == null) ||
        (updateHSMSecuritySaveValues.EncryptionKey2 == null) ||
        (updateHSMSecuritySaveValues.EncryptionType3 == null) ||
        (updateHSMSecuritySaveValues.EncryptionKeyID3 == null) ||
        (updateHSMSecuritySaveValues.EncryptionKey3 == null)) {

        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {

        dbCmd.updateSecuritySaveHSM(updateHSMSecuritySaveValues, function (err, securitySaveHSMUpdated) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
                // send an unsuccessful json response
            } else {
                res.json({
                    "type": true,
                    "SecuritySaveHSMUpdated": securitySaveHSMUpdated,
                });
                // send a successful json response. 
            }
        });
    }
});

module.exports = router;