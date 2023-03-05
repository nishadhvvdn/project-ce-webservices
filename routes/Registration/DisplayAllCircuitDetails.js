var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/cePaginationSchema')
var dbCmdAuditLogs = require('../../data/dbCommandsSystemAuditLogReport');


router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        let search = req.query.search;
        let data = { page, limit };
        let DisplayAllCircuitDetailsSchema = schema.DisplayAllCircuitDetails;
        schemaValidation.validateSchema(data, DisplayAllCircuitDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                data.search = search;
                dbCmd.selectAllCircuitDetails(data, function (err, circuitDetailSelected) {
                    if (err) {
                        res.json({
                            "type": false, "Message": err
                        });

                    } else {
                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "System Management", function (err1, resp) {
                            res.json({
                                "type": true, "CircuitDetailSelected": circuitDetailSelected,
                            });
                         });
                    }
                });
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});
module.exports = router;