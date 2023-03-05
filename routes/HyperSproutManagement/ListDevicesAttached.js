var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
var schema = require('../../config/Helpers/deltalinkManagementSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');

router.post('/', function (req, res) {
    let groupID = parseInt(req.body.GroupID);
    let type = req.body.Type;
    let groupType = req.body.GroupType;
    let listDeviceAttachedSchema = schema.listDeviceAttached;
    let data = { groupType, type, groupID }
    schemaValidation.validateSchema(data, listDeviceAttachedSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!"
            });
        } else {
            var doc = {
                "ConfigID": groupID,
                "Type": type,
                "grpType": groupType
            }
            if (doc.grpType === "Configuration Group") {
                doc.ConfigID = groupID
            } else {
                doc.GroupID = groupID
            }
            dbCmd.listDevicesAttached(doc, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err.message
                    });
                } else {
                    res.json({
                        "type": true,
                        "SerialNumbers": result.listSerialNumber
                    });
                }
            });
        }
    })
});
module.exports = router;