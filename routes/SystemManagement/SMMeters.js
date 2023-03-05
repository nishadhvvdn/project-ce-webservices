var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsSystemManagement.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/systemManagement')
var _ = require('lodash');

router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            // payload is empty 
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            var PartSerialNo = req.body.PartSerialNo;
            const page = parseInt(req.query.Page);
            const limit = parseInt(req.query.Limit);

            let searchByMeterSerialNumber = req.query.searchByMeterSerialNumber;
            let searchByMeterSerialNumberOrName = req.query.searchByMeterSerialNumberOrName;
            let searchByMeterConsumerNumber = req.query.searchByMeterConsumerNumber;
            let searchByMeterID = req.query.searchByMeterID;
            let search1 = req.query.search1;
        
            let search = { searchByMeterSerialNumberOrName, searchByMeterSerialNumber, searchByMeterConsumerNumber, searchByMeterID, search1 }
            let filter = req.query.filter;
            let isGrouping = req.query.IsGrouping;
            let isRegistered = req.query.IsRegistered;
            let groupedMeter = req.query.groupedMeter;
            let TID = req.query.TID;

            let data = { PartSerialNo, page, limit };

            let SMMetersSchema = schema.SMMeters;
            schemaValidation.validateSchema(data, SMMetersSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                }
                else {
                    data.search = search;
                    data.filter = filter;
                    data.isGrouping = isGrouping;
                    data.isRegistered = isRegistered;
                    data.groupedMeter = groupedMeter;
                    data.TID = TID;
                    dbCmd.getSystemMeterDetails(PartSerialNo, data, function (err, details) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err,
                            });
                        } else {
                            res.json({
                                "type": true,
                                "details": details,
                            });
                        }
                    });
                }
            })
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

});

module.exports = router;