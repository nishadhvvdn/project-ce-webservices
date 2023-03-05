var express = require('express');
var dbCon = require('../data/dbConnection');
var router = express.Router();
const schemaValidation = require('../config/Helpers/payloadValidation');
const schema = require('../config/Helpers/livedataSchema');


router.get('/', function (req, res) {
    let time = req.query.time;
    let CellID = req.query.cellID;
    time = (time) ? time : 1;
    let liveData = { CellID, time }
    var liveDataSchema = schema.livedata;
    schemaValidation.validateSchema(liveData, liveDataSchema, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            time = parseInt(time);
            CellID = parseInt(CellID);
            dbCon.getDb(function (err, db) {
                if (err) {
                    res.json({
                        type: false,
                        message: err
                    });
                }
                else {
                    let transactionScheduler = db.delta_Transaction_Data;
                    //qa
                    // let cellID = [13, 2566];
                    //dev
                    let cellID = [CellID];
                    let date = new Date(new Date().getTime() - time * 1000 * 60 * 60)
                    //let date = new Date(new Date().setDate(new Date().getDate() - 1))
                    console.log("past " + time + " hours", date)
                    transactionScheduler.aggregate([
                        {
                            $match: { $and: [{ "result.CellID": { '$in': cellID }, DBTimestamp: { '$gte': date } }] }
                        },
                        {
                            $project: {
                                _id: 0, DBTimestamp: 1, 'result.CellID': 1, 'result.Transformer.ActiveReceivedCumulativeRate_Total': 1,
                                'result.meters.ActiveReceivedCumulativeRate_Total': 1,'result.meters.ActiveDeliveredCumulativeRate_Total':1,
                                'result.meters.DeviceID': 1
                            }
                        }, { $sort: { DBTimestamp: -1 } }
                    ]).toArray(function (err, result) {
                        if (err) {
                            res.json({
                                type: false,
                                message: err

                            });
                        }
                        else if (result.length == 0) {
                            res.json({
                                type: false,
                                message: "No Data"

                            });
                        } else {
                            res.json({
                                type: true,
                                message: result

                            });
                        }
                    })

                }
            });
        }
    })
});

module.exports = router;
