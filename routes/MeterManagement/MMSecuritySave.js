var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');
var dbConst = require('../../config/dbConstants');

router.post('/', function (req, res) {
    // Parameters Passed from UI - "DeviceClassID","EncryptionType1","EncryptionKeyID1","EncryptionKey1","EncryptionType2","EncryptionKeyID2","EncryptionKey2","EncryptionType3","EncryptionKeyID3","EncryptionKey3"
    var updateMMSecuritySaveValues = req.body.updateMMSecuritySaveValues;

    if ((updateMMSecuritySaveValues.DeviceClassID == null) ||
        (updateMMSecuritySaveValues.EncryptionType1 == null) ||
        (updateMMSecuritySaveValues.EncryptionKeyID1 == null) ||
        (updateMMSecuritySaveValues.EncryptionKey1 == null) ||
        (updateMMSecuritySaveValues.EncryptionType2 == null) ||
        (updateMMSecuritySaveValues.EncryptionKeyID2 == null) ||
        (updateMMSecuritySaveValues.EncryptionKey2 == null) ||
        (updateMMSecuritySaveValues.EncryptionType3 == null) ||
        (updateMMSecuritySaveValues.EncryptionKeyID3 == null) ||
        (updateMMSecuritySaveValues.EncryptionKey3 == null)) {

        res.json({
            "type": false,
            "Status": "Invalid Parameter"
        });
    }
    else {

        dbCmd.updateSecuritySaveMM(updateMMSecuritySaveValues, function (err, securitySaveMMUpdated) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
                // send an unsuccessful json response
            } else {
                res.json({
                    "type": true,
                    "SecuritySaveMMUpdated": securitySaveMMUpdated,
                });
                // send a successful json response. 
            }
        });
    }
});

module.exports = router;