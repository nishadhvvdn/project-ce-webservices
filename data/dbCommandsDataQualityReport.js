var mysql = require('mysql');
var dbCon = require('./mySqlConnection.js');
const paginatedResults = require('../config/Helpers/Pagination')
const MOMENT = require('moment');

/**
* @description - get Data Quality Report
* @param startDate
* @param endDate
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDataQualityReport(startDate, endDate, data, callback) {
    try {
        if (!data.search || data.search == null || data.search == "null") {
            let TableName = "summarymap";
            let ColumnName = "CircuitID, SUM(NetworkResponceRate), COUNT(CircuitID)";
            let start = `${new Date(startDate).toLocaleString()}`;
            let end = `${new Date(endDate).toLocaleString()}`;
            let WhereCondition = `DateTime >= '${start}' AND  DateTime <= '${end}' GROUP BY CircuitID`;
            let Count = "DISTINCT CircuitID";
            let CountWhereCondition = `DateTime >= '${start}' AND  DateTime <= '${end}'`
            paginatedResults.paginatedResultsMySQL(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, data, "NetworkResponseRate", function (err, Details) {
                if (err) {
                    callback(err, null)
                } else {
                    let rows = Details.results;
                    var NetworkResponceRates = 0;
                    var result = [];
                    for (var i in rows) {
                        if (rows.hasOwnProperty(i)) {
                            NetworkResponceRates = rows[i]['SUM(NetworkResponceRate)'] / rows[i]['COUNT(CircuitID)'];
                            result.push({ CircuitID: rows[i]['CircuitID'], NetworkResponceRate: NetworkResponceRates, StartDate: startDate, EndDate: endDate })
                        }
                    }

                    delete Details.results;
                    Details.results = result
                    callback(null, Details);
                }
            })
        } else {
            let TableName = "summarymap";
            let ColumnName = "CircuitID, SUM(NetworkResponceRate), COUNT(CircuitID)";
            let start = `${new Date(startDate).toLocaleString()}`;
            let end = `${new Date(endDate).toLocaleString()}`;
            let WhereCondition = ` CircuitID LIKE '%${data.search}%' AND (DateTime >= '${start}' AND  DateTime <= '${end}') GROUP BY CircuitID`;
            let Count = "DISTINCT CircuitID";
            let CountWhereCondition = `CircuitID LIKE '%${data.search}%' AND (DateTime >= '${start}' AND  DateTime <= '${end}')`
            paginatedResults.paginatedResultsMySQL(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, data, "NetworkResponseRate", function (err, Details) {
                if (err) {
                    callback(err, null)
                } else {
                    let rows = Details.results;
                    var NetworkResponceRates = 0;
                    var result = [];
                    for (var i in rows) {
                        if (rows.hasOwnProperty(i)) {
                            NetworkResponceRates = rows[i]['SUM(NetworkResponceRate)'] / rows[i]['COUNT(CircuitID)'];
                            result.push({ CircuitID: rows[i]['CircuitID'], NetworkResponceRate: NetworkResponceRates, StartDate: startDate, EndDate: endDate })
                        }
                    }

                    delete Details.results;
                    Details.results = result
                    callback(null, Details);
                }
            })
        }

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};


// function getDataQualityReport(startDate, endDate, data, callback) {
//     try {
//         dbCon.getDb(function (err, connection) {
//             if (err) {
//                 callback(err, null);
//             } else {
//                 connection.connect();
//                 var qry = "SELECT `CircuitID`,`NetworkResponceRate`,`DateTime` FROM summarymap"
//                 connection.query(qry, function (err, rows, fields) {
//                     if (err) {
//                         callback(err, null);
//                     } else if (rows.length === 0) {
//                         callback(null, "No Data Found");
//                     } else {
//                         var result = [];
//                         var lookup = {};
//                         var unique = [];
//                         var CircuitID;
//                         for (var item, i = 0; item = rows[i++];) {
//                             CircuitID = item.CircuitID;

//                             if (!(CircuitID in lookup)) {
//                                 lookup[CircuitID] = 1;
//                                 unique.push(CircuitID);
//                             }
//                         }
//                         for (var j = 0; j < unique.length; j++) {
//                             var NetworkResponceRates = 0;
//                             var count = 0;
//                             for (var c = 0; c < rows.length; c++) {
//                                 if (rows[c].DateTime >= new Date(startDate) && rows[c].DateTime <= new Date(endDate)) {
//                                     if (unique[j] === rows[c].CircuitID) {
//                                         count++;
//                                         if (rows[c].NetworkResponceRate !== 0 && rows[c].NetworkResponceRate !== null)
//                                             NetworkResponceRates += rows[c].NetworkResponceRate;
//                                     }
//                                 }
//                             }
//                             NetworkResponceRates = NetworkResponceRates / count;
//                             result.push({ CircuitID: unique[j], NetworkResponceRate: NetworkResponceRates, StartDate: startDate, EndDate: endDate })
//                         }

//                         callback(null, result);
//                     }
//                 });
//                 connection.end();
//             }
//         });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };

module.exports = {
    getDataQualityReport: getDataQualityReport
};