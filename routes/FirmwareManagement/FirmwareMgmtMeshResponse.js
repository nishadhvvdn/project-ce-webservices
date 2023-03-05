var express = require('express');
var router = express.Router();
var dbCmdFrm = require('../../data/dbCommandsFirmware');
var schema = require('../../config/Helpers/ResendFirmwareMgmtSchema');
var schemaValidation = require('../../config/Helpers/payloadValidation');

router.post('/', function (req, res) {
    try {
        var response = req.body;
        var action = Action = response.Action;
        var cellId = CellID = response.CellID;
        var meterId = MeterID = response.MeterID;
        var Data = response.Data
        var firmwareVersion = response.Data[0].FirmwareVersion;
        var Status = response.Data[0].Status;
        let firmwareMgmtResponseSchema = schema.firmwareMgmtResponse;
        let data = { Action, CellID, MeterID , Data}
        schemaValidation.validateSchema(data, firmwareMgmtResponseSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err,
                });
            } else {
                if (action === "METER_FIRMWARE_UPGRADE" || action === "METERCARD_FIRMWARE_UPGRADE") {
                    var DeviceType;
                    if(action === "METER_FIRMWARE_UPGRADE"){
                        DeviceType= "MeshCard";
                    }else{
                        DeviceType = "MeterCard";
                    }
                    dbCmdFrm.updatingMeshFirmwareMgmtStatus(cellId, meterId, Status, DeviceType,firmwareVersion, function (err, updatedMeshFirmStatus) {
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
                    if((!response.hasOwnProperty('Data'))){
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": "Please enter Data key in array"
                        });
                    }else if((response.Data[0].CardType == undefined) && (response.Data[0].SERIAL_NO == undefined) && (response.Data[0].Version == undefined) && (response.Data[0].Status == undefined)){
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": "Please enter CardType/SERIAL_NO/Version/Status in Data key"
                        });
                    }else{
                        var DeviceType = response.Data[0].CardType;
                        var serialNumber = response.Data[0].SERIAL_NO;
                        var version = response.Data[0].Version;
                        var status = response.Data[0].Status;
                
                        dbCmdFrm.compareHHFirmwareVersion(serialNumber, DeviceType, version, status, function (err, updatedHHFirmStatus) {
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
                }
            }
        })
    } catch (error) {
        res.json({
            "type": false,
            "Message": "Failure",
            "Error" : `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;