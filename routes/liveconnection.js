var express = require('express');
var dbCon = require('../data/dbConnection');
var router = express.Router();
const sendToIOT = require('../data/sendToiot.js');
const schemaValidation = require('../config/Helpers/payloadValidation');
const schema = require('../config/Helpers/livedataSchema');


router.get('/', function (req, res) {
    let CellID = req.query.cellID
    let liveData = { CellID }
    var liveDataSchema = schema.liveconnection;
    schemaValidation.validateSchema(liveData, liveDataSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            CellID = parseInt(CellID)
            dbCon.getDb(function (err, db) {
                if (err) {
                    res.json({
                        type: false,
                        message: err
                    });
                }
                else {
                    let hypersproutCollection = db.delta_Hypersprouts
                    hypersproutCollection.findOne({ "HypersproutID": CellID, "IsHyperHub": false }, { "HypersproutSerialNumber": 1, "DeviceID": 1 }, function (err, hyperhubDetails) {
                        if (err) {
                            res.json({
                                type: false,
                                message: err

                            });
                        }
                        else if (hyperhubDetails == null) {
                            res.json({
                                type: false,
                                message: "Hypersprout not available"

                            });
                        } else {
                            if (hyperhubDetails.DeviceID != null) {
                                DeviceID = hyperhubDetails.DeviceID;
                                sendToIOT.checkDeviceConnectionState(DeviceID, function (err, status) {
                                    if (err) {
                                        let error = err.name != undefined ? err.name : err;
                                        res.json({
                                            type: false,
                                            message: error

                                        });
                                    } else {
                                        if (status == 'Connected') {
                                            res.json({
                                                type: true,
                                                message: status

                                            });
                                        } else {
                                            //Device is not connected
                                            res.json({
                                                type: true,
                                                message: "NotConnected"

                                            });


                                        }
                                    }
                                })
                            } else {
                                res.json({
                                    type: false,
                                    message: "DeviceID not found"

                                });

                            }


                        }
                    })

                }
            });
        }
    });
})
module.exports = router;