var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsFirmwareGroup');
var schema = require('../../config/Helpers/hypersproutManagement');
var schemaValidation = require('../../config/Helpers/payloadValidation');
router.get('/', (req, res) => {
    let DeviceType = req.query.DeviceType;
    let data = { DeviceType }
    let FirmwareGroupListsSchema = schema.FirmwareGroupLists;
    schemaValidation.validateSchema(data, FirmwareGroupListsSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.FirmwareGroupListsDetails(data, (err, result) => {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err
                    });
                }
                else {
                    res.json({
                        "type": true,
                        "FirmwareList": result
                    })
                }
            })
        }
    })

})

module.exports = router;
