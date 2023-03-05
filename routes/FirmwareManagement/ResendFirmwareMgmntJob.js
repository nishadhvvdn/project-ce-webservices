var express = require('express');
var router = express.Router();
var dbCmdFrm = require('../../data/dbCommandsFirmware');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/ResendFirmwareMgmtSchema')

router.post('/', function (req, res) {
    try {
        var CardType = req.body.CardType;
        var JobID = req.body.JobID;
        const ResendFirmwareMgmtSchema = schema.ResetFirmwareDetails;
        const data = { CardType, JobID }
        schemaValidation.validateSchema(data, ResendFirmwareMgmtSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors" : err
                });
            }else{
                if (!CardType.trim()) {
                    res.json({
                        "type": false,
                        "Status": "Invalid Request, Please try again after some time !!"
                    });
                } else {
                    dbCmdFrm.findResendJobAndUpdate(JobID, CardType, function (err, jobStatusFirmwareSelected) {
                        if (err) {
                            res.json({
                                "type": false,
                                "Message": err,
                            });
                        } else {
                            res.json({
                                "type": true,
                                "Message": "Performed Job Successfully",
                            });
                        }
                    });
                }
            }
        });
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});
module.exports = router;