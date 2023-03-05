var express = require('express');
var router = express.Router();
var dbCmdFrm = require('../../data/dbCommandsFirmware');
var schema = require('../../config/Helpers/ResendFirmwareMgmtSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');

router.post('/', function (req, res) {
    try {
        var DeviceType = req.body.DeviceType;
        let firmwareMgmtFirmGroupSchema = schema.firmwareMgmtFirmGroup;
        let data = { DeviceType }
        schemaValidation.validateSchema(data, firmwareMgmtFirmGroupSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "Status": err,
                });
            } else {
                dbCmdFrm.selectFirmwareAndGroup(DeviceType, function (err, firmwareDetailsSelected, groupDetailsSelected) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err,
                        });
                    } else {
                        res.json({
                            "type": true,
                            "FirmwareDetailsSelected": firmwareDetailsSelected,
                            "GroupDetailsSelected": groupDetailsSelected,
                        });
                    }
                });
            }
        });
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;