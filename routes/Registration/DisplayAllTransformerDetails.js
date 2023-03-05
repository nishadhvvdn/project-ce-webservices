var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsRegistration.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/cePaginationSchema')


router.get('/', function (req, res) {
    try {
        const page = parseInt(req.query.Page);
        const limit = parseInt(req.query.Limit);
        // System management--> Add Devices -->Transformer Details search
        let search = req.query.search;

        //Grouping params
        let searchByHypersproutSerialNumber = req.query.searchByHypersproutSerialNumber;
        let searchByHypersproutName = req.query.searchByHypersproutName;
        let searchByHypersproutHarwareVersion = req.query.searchByHypersproutHarwareVersion;
        let searchByNoOfMeters = req.query.searchByNoOfMeters;
        let searchByAll = req.query.searchByAll;
        let isGrouping = req.query.IsGrouping;
        let CID = req.query.CID;
        let groupSearch = { searchByHypersproutSerialNumber, searchByHypersproutName, searchByHypersproutHarwareVersion, searchByNoOfMeters, searchByAll }

        let data = { page, limit };
        let DisplayAllTransformerDetailsSchema = schema.DisplayAllTransformerDetails;
        schemaValidation.validateSchema(data, DisplayAllTransformerDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            }
            else {
                data.search = search;
                data.isGrouping = isGrouping;
                data.CID = CID;
                data.groupSearch = groupSearch;
                dbCmd.selectAllTransformerDetails(data, function (err, hypersproutAndTransformerDetails) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err
                        });

                    } else {
                        res.json({
                            "type": true,
                            "hypersproutAndTransformerDetails": hypersproutAndTransformerDetails,

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