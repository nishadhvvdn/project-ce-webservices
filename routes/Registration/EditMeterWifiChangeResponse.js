var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
var _ = require('lodash');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deleteMeterSchema')

router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            var response = req.body;
            var MeterID = response.MeterID;
            var Data = response.Data;
            const EditMeterWifiDetailSchema = schema.EditMeterWifiDetails;
            const data = { MeterID , Data}
            /* validate all mandatory fields */
            schemaValidation.validateSchema(data, EditMeterWifiDetailSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                }else{
                    var Status = response.Data[0].STATUSCODE;
                    if((Status == null) || (Status == 'null')){
                        res.json({
                            "type": false,
                            "Message": "Invalid Request, Please try again after some time !!",
                            "PayloadErrors": "Invalid MeterID"
                        });
                    }else{
                        dbCmd.editMeterWifiReponse(MeterID, Status, function (err, editMeterWifiResponse) {
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
            })
        }
    
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;