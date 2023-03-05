const express = require('express');
const router = express.Router();
const unique = require('array-unique');
const dbCmd = require('../../data/dbCommandsDeltalink.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deltalinkManagementSchema')
var editBandwidth = require('./EditDeltalinkBandwidthChangeRequest.js');
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
            var editDeltalinkDetails = req.body.editDeltalinkDetails;
            let regex = /^0+$/;
            editDeltalinkDetails.DeltalinkVersion = (editDeltalinkDetails.DeltalinkVersion) ? editDeltalinkDetails.DeltalinkVersion : "null";
            editDeltalinkDetails.Bandwidth = (editDeltalinkDetails.Bandwidth == "null" || editDeltalinkDetails.Bandwidth == "" || editDeltalinkDetails.Bandwidth == " " || editDeltalinkDetails.Bandwidth == null || editDeltalinkDetails.Bandwidth == "undefined" || editDeltalinkDetails.Bandwidth == undefined || regex.test(editDeltalinkDetails.Bandwidth) == true || editDeltalinkDetails.Bandwidth == "true" || editDeltalinkDetails.Bandwidth == "false") ? 0 : parseInt(editDeltalinkDetails.Bandwidth);
            let editDeltalinkDetailsSchema = schema.editDeltalinkDetails;
            schemaValidation.validateSchema(editDeltalinkDetails, editDeltalinkDetailsSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else if (!(editDeltalinkDetails.DeltalinkID && editDeltalinkDetails.DeltalinkSerialNumber && editDeltalinkDetails.DeltalinkWiFiMacID )) {
                    res.json({
                        "type": false,
                        "Message": "Failed to Edit: Duplicate/Incorrect file!",
                        "PayloadErrors": "Fields are missing"
                    });
                } else {
                    editDeltalinkDetails.DeltalinkID = parseInt(editDeltalinkDetails.DeltalinkID);
                    editDeltalinkDetails.Bandwidth = parseInt(editDeltalinkDetails.Bandwidth);
                    editDeltalinkDetails.DownloadBandwidth  = parseInt( editDeltalinkDetails.DownloadBandwidth );
                    editDeltalinkDetails.UploadBandwidth  = parseInt(editDeltalinkDetails.UploadBandwidth )
                    if(editDeltalinkDetails.Bandwidth == 0){
                        editDeltalinkDetails.DownloadBandwidth = 1;
                        editDeltalinkDetails.UploadBandwidth = 1;

                    }
                    if (editDeltalinkDetails.DeltalinkBandwidthFlag === "Y") {
                        editBandwidth.EditDeltalinkBandwidthChangeDetails(editDeltalinkDetails, function (err, result) {
                            dbCmd.editDeltalinkDetails(editDeltalinkDetails, function (err, deltalinkDetailsUpdated, Errors) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": err
                                    });
                                } else {
                                    unique(Errors);
                                    res.json({
                                        "type": true,
                                        "Message": deltalinkDetailsUpdated,
                                        "Errors": Errors
                                    });
                                }
                            });

                        });
                    } else {
                        dbCmd.editDeltalinkDetails(editDeltalinkDetails, function (err, deltalinkDetailsUpdated, Errors) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            } else {
                                unique(Errors);
                                res.json({
                                    "type": true,
                                    "Message": deltalinkDetailsUpdated,
                                    "Errors": Errors

                                });
                            }
                        });
                    }
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