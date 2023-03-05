var dbCon = require('./mySqlConnection.js');
var async = require('async');
var dbConMongo = require('./dbConnection.js');
const paginatedResults = require('../config/Helpers/Pagination')

/**
* @description - get Non technical Loss Report
* @param startDate
* @param Enddate
* @param callback - callback function returns success or error response
* @return callback function
*/

function getNontechnicalLossReport(data, callback) {
    try {
        if (!data.search || data.search == null || data.search == "null") {
            let tableName = "summarymap";
            let columnName = " `Circuit ID`,`TransformerID`,`Transformer_CellID`,max(`Transformer_ReadTimestamp`) `Transformer_ReadTimestamp`,sum(`Transformer_active_energy_received`) `Transformer_active_energy_received`,sum(`Meter_active_energy_received`) `Meter_active_energy_received`"
            let whereCondition = "`Non_technichal_Loss` >0 AND `DateTime` > DATE_SUB(NOW(), INTERVAL 24 HOUR)  group by `Transformer_CellID`";
            let count = "distinct `Transformer_CellID`";
            let countWhereCondition = "`Non_technichal_Loss` >0 AND DateTime > DATE_SUB(NOW(), INTERVAL 24 HOUR)";
            paginatedResults.paginatedResultsMySQL(tableName, columnName, count, whereCondition, countWhereCondition, data, "NonTechnicalLossReport", function (err, rows, field) {
                if (err) {
                    callback(err, null)
                } else {
                    getConnectedMeterFromMongoDB(rows, callback)
                }
            })
        } else {
            let tableName = "summarymap";
            let columnName = " `Circuit ID`,`TransformerID`,`Transformer_CellID`,max(`Transformer_ReadTimestamp`) `Transformer_ReadTimestamp`,sum(`Transformer_active_energy_received`) `Transformer_active_energy_received`,sum(`Meter_active_energy_received`) `Meter_active_energy_received`"
            let whereCondition = "`Circuit ID`" + " LIKE " + "'%" + data.search + "%'" + " AND (`Non_technichal_Loss` >0 AND DateTime > DATE_SUB(NOW(), INTERVAL 24 HOUR))  group by `Transformer_CellID`";
            let count = "distinct `Transformer_CellID`";
            let countWhereCondition = "`Circuit ID`" + " LIKE " + "'%" + data.search + "%'" + " AND (`Non_technichal_Loss` >0 AND DateTime > DATE_SUB(NOW(), INTERVAL 24 HOUR))";
            paginatedResults.paginatedResultsMySQL(tableName, columnName, count, whereCondition, countWhereCondition, data, "NonTechnicalLossReport", function (err, rows, field) {
                if (err) {
                    callback(err, null)
                } else {
                    getConnectedMeterFromMongoDB(rows, callback)
                }
            })

        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

// function getNontechnicalLossReport(startDate, Enddate, callback) {
//     try {
//         dbCon.getDb(function (err, connection) {
//             if (err) {
//                 callback(err);
//             } else {
//                 startDate = new Date(startDate);
//                 Enddate = new Date(Enddate);
//                 connection.connect();
//                 connection.query("SELECT `Circuit ID`,`TransformerID`,`Transformer_CellID`,`Transformer_ReadTimestamp`,`Transformer_active_energy_received`,`Meter_active_energy_received` FROM summarymap WHERE  `Non_technichal_Loss` >0 AND `DateTime` > DATE_SUB(NOW(), INTERVAL 24 HOUR) ", function (err, rows, field) {
//                     if (err) {
//                         callback(err);
//                     } else if (rows.length === 0) {
//                         callback(null, 'Data Not Found');
//                     } else {
//                         getCummulativeData(rows, function (err, result) {
//                             if (err) {
//                                 callback(err);
//                             } else {
//                                 getMeterFromMongoDB(result, callback);
//                             }
//                         });
//                     }
//                 })
//                 connection.end();
//             }
//         });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };

/**
* @description - get cummulative data
* @param arrDetail
* @param callback - callback function returns success or error response
* @return callback function
*/
function getCummulativeData(arrDetail, callback) {
    try {
        var lookup = {};
        var unique = [];
        var reqarray = [];
        var Transformer_CellID;
        for (var item, i = 0; item = arrDetail[i++];) {
            Transformer_CellID = item.Transformer_CellID;

            if (!(Transformer_CellID in lookup)) {
                lookup[Transformer_CellID] = 1;
                unique.push(Transformer_CellID);
            }
        }
        for (var uniq = 0; uniq < unique.length; uniq++) {

            var transforRecieve = 0;
            var meterRecieve = 0;
            var TransformerID = 0;
            var CircuitID = null;
            var Transformer_ReadTimestamp = 0;

            for (var res = 0; res < arrDetail.length; res++) {
                if (unique[uniq] === arrDetail[res].Transformer_CellID) {
                    transforRecieve += arrDetail[res].Transformer_active_energy_received;
                    meterRecieve += arrDetail[res].Meter_active_energy_received;
                    TransformerID = arrDetail[res].TransformerID;
                    CircuitID = arrDetail[res]["Circuit ID"];
                    Transformer_ReadTimestamp = arrDetail[res].Transformer_ReadTimestamp;
                    Transformer_CellID = arrDetail[res].Transformer_CellID
                }

            }
            reqarray.push({ Transformer_CellID: Transformer_CellID, TransformerID: TransformerID, CircuitID: CircuitID, Transformer_ReadTimestamp: Transformer_ReadTimestamp, transforRecieve: transforRecieve, meterRecieve: meterRecieve });
        }
        callback(null, reqarray);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description - get meter from mongoDB
* @param result
* @param callback - callback function returns success or error response
* @return callback function
*/

function getConnectedMeterFromMongoDB(result, callback) {
    dbConMongo.getDb(function (err, db) {
        if (err) {
            callback(err);
        } else {
            var meterCollection = db.delta_Meters;
            getConnectedMeter(result, meterCollection, callback);
        }
    });
}

function getMeterFromMongoDB(result, callback) {
    dbConMongo.getDb(function (err, db) {
        if (err) {
            callback(err);
        } else {
            var meterCollection = db.delta_Meters;
            getMeterConnected(result, meterCollection, callback);
        }
    });
}

/**
* @description - get connected meters
* @param result
* @param meterCollection
* @param callback - callback function returns success or error response
* @return callback function
*/

function getMeterConnected(result, meterCollection, callback) {
    var docs = [];
    async.each(result,
        function (meterRes, callback) {
            meterCollection.find({ "HypersproutID": Number(meterRes.Transformer_CellID) },
                { "MeterSerialNumber": 1, "MeterID": 1 }).toArray(function (err, doc) {
                    if (err) {
                        callback(err);
                    } else {
                        var delta;
                        delta = (meterRes.transforRecieve / doc.length) - meterRes.meterRecieve;
                        docs.push({
                            Transformer_CellID: meterRes.Transformer_CellID,
                            TransformerID: meterRes.TransformerID,
                            CircuitID: meterRes.CircuitID,
                            Transformer_ReadTimestamp: meterRes.Transformer_ReadTimestamp,
                            transforRecieve: meterRes.transforRecieve / doc.length,
                            meterRecieve: meterRes.meterRecieve,
                            Delta: delta, meterConnected: doc
                        });
                        callback(null, docs);
                    }
                });
        }, function (err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, docs);
            }
        });
}

/**
* @description - get connected meters
* @param result
* @param meterCollection
* @param callback - callback function returns success or error response
* @return callback function
*/

function getConnectedMeter(result, meterCollection, callback) {
    var docs = [];
    async.each(result.results,
        function (meterRes, callback) {
            meterCollection.find({ "HypersproutID": Number(meterRes.Transformer_CellID) }).project({ "MeterSerialNumber": 1, "MeterID": 1, "_id": 0 }).toArray(function (err, doc) {
                if (err) {
                    callback(err);
                } else {
                    let delta;
                    let transforRecieve;
                    if (doc.length > 0) {
                        delta = (meterRes.Transformer_active_energy_received / doc.length) - meterRes.Meter_active_energy_received;
                        transforRecieve = meterRes.Transformer_active_energy_received / doc.length;
                    } else {
                        delta = 0;
                        transforRecieve = 0;
                    }
                    docs.push({
                        Transformer_CellID: Number(meterRes.Transformer_CellID),
                        TransformerID: meterRes.TransformerID,
                        CircuitID: meterRes["Circuit ID"],
                        Transformer_ReadTimestamp: meterRes.Transformer_ReadTimestamp,
                        transforRecieve: transforRecieve,
                        meterRecieve: meterRes.Meter_active_energy_received,
                        Delta: delta, meterConnected: doc
                    });
                    callback(null, docs);
                }
            });
        }, function (err) {
            if (err) {
                callback(err, null);
            } else {
                result.results = docs
                callback(null, result);
            }
        });
}

module.exports = {
    getNontechnicalLossReport: getNontechnicalLossReport
}