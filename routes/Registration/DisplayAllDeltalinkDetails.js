const express = require('express');
const router = express.Router();
const dbCmd = require('../../data/dbCommandsDeltalink.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deltalinkManagementSchema')

router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        const deviceStatus = req.query.deviceStatus;
        const meterID = req.query.MeterID;
        let search = req.query.search;
        const data = { page, limit, deviceStatus, meterID}
        const displayAllDeltalinkDetailsSchema = schema.displayAllDeltalinkDetails;
        schemaValidation.validateSchema(data, displayAllDeltalinkDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                data.search = search;
                dbCmd.selectAllDeltalinkDetails(data, function (err, deltalinkDetailSelected) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });
                    } else {
                        res.json({
                            "type": true,
                            "DeltalinkDetailSelected": deltalinkDetailSelected
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
