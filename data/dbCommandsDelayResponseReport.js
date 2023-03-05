var dbCon = require('./mySqlConnection.js');
var _ = require('lodash');
const paginatedResults = require('../config/Helpers/Pagination')

/**
* @description - get Delay Response Report
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDelayResponseReport(data, callback) {
    try {
        var presentTime = new Date();
        var fromDate40min = new Date();
        fromDate40min.setMinutes(fromDate40min.getHours() - 40);
        fromDate40min = fromDate40min.toLocaleString()
        let TableName = "latesttransactions";
        let ColumnName = "`CircuitID`,`TransformerID`,`HypersproutID`,`MeterID`,`Meter_ReadTimestamp`";
        let WhereCondition = `Meter_ReadTimestamp < DATE_SUB(NOW(), INTERVAL 40 MINUTE)
         AND (MeterID != "0" AND MeterID != "" AND MeterID IS NOT NULL) Group By Meter_ReadTimestamp Order By Meter_ReadTimestamp DESC`;
        let Count = " Distinct `Meter_ReadTimestamp`";
        let CountWhereCondition = `Meter_ReadTimestamp < DATE_SUB(NOW(), INTERVAL 40 MINUTE) AND (MeterID != "0" AND MeterID != "" AND MeterID IS NOT NULL )`;
        paginatedResults.paginatedResultsMySQL(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, data, "DelayResponseReport", function (err, Details) {
            if (err) {
                callback(err, null)
            } else {
                let rows = Details.results;
                var result = [];
                for (var c in rows) {
                    if (rows.hasOwnProperty(c)) {
                        var timeDiff = (Math.abs(presentTime - new Date(rows[c].Meter_ReadTimestamp)) / 36e5) * 4;
                        result.push({ CircuitID: rows[c].CircuitID, TransformerID: rows[c].TransformerID, HypersproutID: rows[c].HypersproutID, MeterID: rows[c].MeterID, Meter_ReadTimestamp: rows[c].Meter_ReadTimestamp, DiffInInterval: parseInt(timeDiff) })
                    }
                }

                delete Details.results;
                Details.results = result
                callback(null, Details);
            }
        })


    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};









// function getDelayResponseReport(callback) {
//     try{
//     dbCon.getDb(function (err, connection) {
//         if (err) {
//             callback(err, null);
//         } else {
//             // var collectionSchedularLogs = db.delta_SchedulerLogs;
//             // getResponseDataFromMongoDB(startDate, endDate, collectionSchedularLogs, callback);
//             connection.connect();

//             connection.query("SELECT `CircuitID`,`TransformerID`,`HypersproutID`,`MeterID`,`Meter_ReadTimestamp` FROM latesttransactions", function (err, rows, fields) {
//                 if (err) {
//                     callback(err, null);
//                 } else if (rows.length === 0) {
//                     callback(null, 'Data Not Found');
//                 } else {
//                     var presentTime = new Date();
//                     var fromDate40min = new Date();
//                     fromDate40min.setMinutes(fromDate40min.getHours() - 40);
//                     var totalData = [];
//                     for (var c in rows) {

//                         if (new Date(rows[c].Meter_ReadTimestamp) < fromDate40min && rows[c].MeterID != 0 && rows[c].MeterID != null) {
//                             // timeDiff = (presentTime-rows[c].Meter_ReadTimestamp)/15;
//                             var timeDiff = (Math.abs(new Date(presentTime) - new Date(rows[c].Meter_ReadTimestamp)) / 36e5) * 4;
//                             // count++;
//                             totalData.push({ CircuitID: rows[c].CircuitID, TransformerID: rows[c].TransformerID, HypersproutID: rows[c].HypersproutID, MeterID: rows[c].MeterID, Meter_ReadTimestamp: rows[c].Meter_ReadTimestamp, DiffInInterval: parseInt(timeDiff) })
//                         }

//                     }
//                     callback(null, totalData);
//                 }
//             });
//             connection.end();
//         }
//     });
// } catch (e) {
//     callback("Something went wrong : " + e.name + " " + e.message, null)
//       }
// };





//     // dbCon.getDb(function (err, connection) {
//     //     if (err) {
//     //         callback(err, null);
//     //     } else {
//     //         // var collectionSchedularLogs = db.delta_SchedulerLogs;
//     //         // getResponseDataFromMongoDB(startDate, endDate, collectionSchedularLogs, callback);
//     //         connection.connect();

//     //         connection.query("SELECT `CircuitID`,`TransformerID`,`HypersproutID`,`MeterID`,`Meter_ReadTimestamp` FROM latesttransactions", function (err, rows, fields) {
//     //             if (err) {
//     //                 callback(err, null);
//     //             } else if (rows.length === 0) {
//     //                 callback(null, 'Data Not Found');
//     //             } else {
//     //                 var presentTime = new Date();
//     //                 var fromDate40min = new Date();
//     //                 fromDate40min.setMinutes(fromDate40min.getHours() - 40);
            
//     //                 var totalData = [];
//     //                 for (var c in rows) {
//     //                    console.log("rows[c].Meter_ReadTimestamp", rows[c].Meter_ReadTimestamp)
//     //                    console.log("fromDate40min", fromDate40min)
                       
//     //                     if (new Date(rows[c].Meter_ReadTimestamp) < fromDate40min && rows[c].MeterID != 0 && rows[c].MeterID != null) {
//     //                         // timeDiff = (presentTime-rows[c].Meter_ReadTimestamp)/15;
//     //                         var timeDiff = (Math.abs(new Date(presentTime) - new Date(rows[c].Meter_ReadTimestamp)) / 36e5) * 4;
//     //                         // count++;
//     //                         totalData.push({ CircuitID: rows[c].CircuitID, TransformerID: rows[c].TransformerID, HypersproutID: rows[c].HypersproutID, MeterID: rows[c].MeterID, Meter_ReadTimestamp: rows[c].Meter_ReadTimestamp, DiffInInterval: parseInt(timeDiff) })
//     //                     }

//     //                 }
//     //                 callback(null, totalData);
//     //             }
//     //         });
//     //         connection.end();
//     //     }
//     // });
// } catch (e) {
//     callback("Something went wrong : " + e.name + " " + e.message, null)
//       }
// };




module.exports = {
    getDelayResponseReport: getDelayResponseReport,
};





















// var dbCon = require('./dbConnection.js');
// var _ = require('lodash');

// function getDelayResponseReport(startDate, endDate, callback) {
//     dbCon.getDb(function (err, db) {
//         if (err) {
//             callback(err, null);
//         } else {
//             var collectionSchedularLogs = db.delta_SchedulerLogs;
//             getResponseDataFromMongoDB(startDate, endDate, collectionSchedularLogs, callback);
//         }
//     });
// };

// function getResponseDataFromMongoDB(startDate, endDate, collectionSchedularLogs, callback) {
//     collectionSchedularLogs.find({ "TimeStampRequest": { '$gte': new Date(startDate).toISOString(), '$lte': new Date(endDate).toISOString() } }).toArray(function (err, result) {
//         if (err) {
//             callback(err);
//         } else if (result.length === 0) {
//             callback(null, '');
//         } else {
//             var arr = [];
//             for (var i = 0; i < result.length; i++) {
//                 var count = 0;
//                 for (var j = 0; j < result.length; j++) {
//                     if (result[i].DeviceID === result[j].DeviceID && !result[j].TimeStampResponse) {
//                         count++;
//                         if (arr.length > 0) {
//                             if (result[j].DeviceID === arr[arr.length - 1].DeviceID)
//                                 arr.splice(arr.length - 1);
//                         }
//                         arr.push({ DeviceID: result[i].DeviceID, timeSpent: result[i].TimeStampRequest, resDelay: count });
//                     }
//                 }
//             }
//             callback(null, arr);
//         }
//     });
// };



// module.exports = {
//     getDelayResponseReport: getDelayResponseReport,
// };