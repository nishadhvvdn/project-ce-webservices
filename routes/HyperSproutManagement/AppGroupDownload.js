var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/hypersproutManagement')

router.post('/', function (req, res) {
    try {
        // Parameters Passed from UI -"GroupName","Description","Type"
        var GroupID = req.body.GroupID;
        var Type = req.body.Type;
        let data = { Type, GroupID}
        let appGroupDownloadSchema = schema.AppGroupDownload;
        /* validate all mandatory fields */
        schemaValidation.validateSchema(data, appGroupDownloadSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                GroupID = parseInt(GroupID)
                dbCmd.initiateAppGrpDownload(GroupID, Type, function (err, result) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message,
                        });
                    } else {
                        res.json({
                            "type": true,
                            "Status": "Job(s) Added"
                        });
                    }
                });
            }})
} catch (e) {
    res.json({
        "type": false,
        "Message": "Something went wrong : " + e.name + " " + e.message
    });
}
});
module.exports = router;