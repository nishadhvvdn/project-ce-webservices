var express = require('express');
var router = express.Router();
var dbCmdFrm = require('../../data/dbCommandsFirmware');
var schema = require('../../config/Helpers/deltalinkManagementSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');


router.post('/', function (req, res) {
    let response = req.body;
    let action = response.Action;
    let status = response.Status;
    let cellId = parseInt(response.CellID);
    let deltalinkId = parseInt(response.MeterID);
    let firmwareMgmtDeltalinkResponseSchema = schema.firmwareMgmtDeltalinkResponse;
    let data = { action, cellId }
    schemaValidation.validateSchema(data, firmwareMgmtDeltalinkResponseSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!"
            });
        } else {
            if (action === "DELTALINK_FIRMWARE_UPGRADE") {
                var deviceType = "DeltaLink";
                dbCmdFrm.updatingDeltalinkFirmwareMgmtStatus(cellId, deltalinkId, response.Status, deviceType, function (err, updatedMeshFirmStatus) {
                    if (err) {
                        res.json({
                            "Type": false,
                            "Message": "Failure"
                        });
                    } else {
                        res.json({
                            "Type": true,
                            "Message": "Success"
                        });
                    }
                });
            } else {
                var deviceType = response.Data[0].CardType;
                var serialNumber = response.Data[0].SERIAL_NO;
                var version = response.Data[0].Version;
                var status = response.Data[0].Status; 
                dbCmdFrm.compareHHFirmwareVersion(serialNumber, deviceType, version, status, function (err, updatedHHFirmStatus) {
                    if (err) {
                        res.json({
                            "Type": false,
                            "Message": "Failure"
                        });
                    } else {
                        res.json({
                            "Type": true,
                            "Message": "Success"
                        });
                    }
                });
            }
        }})
   
});
module.exports = router;