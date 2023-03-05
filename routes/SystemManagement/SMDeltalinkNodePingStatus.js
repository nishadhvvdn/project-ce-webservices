var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeltalinkNodePing.js');
let schemaValidation = require('../../config/Helpers/payloadValidation')
let schema = require('../../config/Helpers/deltalinkManagementSchema')


router.post('/', function (req, res) {
    var SlaveDetails = req.body.DL;
    var messageID = req.body.MessageID;
    var DLid = req.body.MeterID;
    var Mstatus = req.body.MasterStatus;
    var noofSlave = req.body.NoOfDL
    var messageID = req.body.MessageID;
    let nodePingDeltalinkStatusSchema = schema.nodePingDeltalinkStatus;
    let data = {DLid,Mstatus,noofSlave, SlaveDetails, messageID }
    schemaValidation.validateSchema(data, nodePingDeltalinkStatusSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!"
            });
        } else {
            dbCmd.saveDeltalinkDeviceStatus(DLid,Mstatus,noofSlave,SlaveDetails, messageID, function (err, result) {
                if (err) {
                    res.json({
                        "Type": false,
                        "Message": err,
                    });
                } else {
                    res.json({
                        "Type": true,
                        "Output": result,
                    });
                }
            });
        }
    })


});

module.exports = router;