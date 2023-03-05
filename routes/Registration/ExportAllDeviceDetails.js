var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalink');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deltalinkManagementSchema')


router.get('/', function (req, res) {
    try {

        let DeviceType = req.query.DeviceType;
        let JobType = req.query.JobType;
        const data = { DeviceType , JobType}
        const exportAllDeltalinkDetailsSchema = schema.ExportAllDeltalinkDetails;
        schemaValidation.validateSchema(data, exportAllDeltalinkDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmd.selectExportAllDeltalinkDetails(data, function (err, exportData) {
                    if (err) {
                        res.json({
                            "type": false, "Message": err
                        });

                    } else {
                        res.json({
                            "type": true, "ExportAllDeviceDetails": exportData,
                        });
                    }
                });
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});
module.exports = router;