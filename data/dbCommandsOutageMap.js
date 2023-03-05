var mysql = require('mysql');
var dbCon = require('./mySqlConnection.js');
const paginatedResults = require('../config/Helpers/Pagination')

var dupStartTime = [];
var result = [];

/**
* @description - get outage report
* @param startDate
* @param endDate
* @param callback - callback function returns success or error response
* @return callback function
*/

function getOutageReport(startDate, endDate, data, callback) {
    try {
        //query SELECT `Event ID`, `Circuit ID`, `Transformer ID`, `Start Time`, `End Time`, Duration FROM outagemap where `Transformer ID` LIKE '%GGND%' OR `Circuit ID` LIKE '%GGND%' AND `Start Time` >= '2020-07-03T11:55:00Z' and `End Time` <= '2020-08-07T12:15:00Z' Group By `Start Time`, `Transformer ID`, `End Time` ORDER BY `End Time` DESC LIMIT 15 OFFSET 0

        if (data.tfrSearch) {
            let TableName = "outagemap";
            let ColumnName = "`Event ID`, `Circuit ID`, `Transformer ID`, `Start Time`, `End Time`, Duration";
            let WhereCondition = "`Transformer ID` LIKE " + `'%${data.tfrSearch}%'` + " AND " + "`Start Time` >= " + "'" + startDate + "'" + " and " + "`End Time` <= " + "'" + endDate + "'" + " Group By " + "`Start Time`, `Transformer ID`, `End Time` ORDER BY `End Time` DESC";
            let countquery = "select count(E_ID) as T_count from ( SELECT  `Event ID` as E_ID, `Circuit ID`, `Transformer ID`, `Start Time`, `End Time`, `Duration` FROM outagemap WHERE" + " `Transformer ID` LIKE " + `'%${data.tfrSearch}%'` + " AND " + "`Start Time` >=" + "'" + startDate + "'" + " and" + " `End Time` <=" + "'" + endDate + "'" + " group by `Transformer ID` , `Start Time`, `End Time`)Total_count"

            paginatedResults.paginatedResultsMySQLToManageCount(TableName, ColumnName, countquery, WhereCondition, data, "Outagereport", function (err, Details) {
                if (err) {
                    callback(err, null)
                } else {
                    let rows = Details.results;
                    var result = [];
                    for (var i in rows) {
                        if (rows.hasOwnProperty(i)) {
                            result.push({ eventID: rows[i]['Event ID'], circuitID: rows[i]['Circuit ID'], transformerId: rows[i]['Transformer ID'], startTime: rows[i]['Start Time'], EndTime: rows[i]['End Time'], duration: rows[i].Duration })
                        }
                    }

                    delete Details.results;
                    Details.results = result
                    callback(null, Details);
                }
            })


        } else if (data.dtcSearch) {
            let TableName = "outagemap";
            let ColumnName = "`Event ID`, `Circuit ID`, `Transformer ID`, `Start Time`, `End Time`, Duration";
            let WhereCondition = "`Circuit ID` LIKE " + `'%${data.dtcSearch}%'` + " AND " + "`Start Time` >= " + "'" + startDate + "'" + " and " + "`End Time` <= " + "'" + endDate + "'" + " Group By " + "`Start Time`, `Transformer ID`, `End Time` ORDER BY `End Time` DESC";
            let countquery = "select count(E_ID) as T_count from ( SELECT  `Event ID` as E_ID, `Circuit ID`, `Transformer ID`, `Start Time`, `End Time`, `Duration` FROM outagemap WHERE" + "`Circuit ID` LIKE " + `'%${data.dtcSearch}%'` + " AND " + "`Start Time` >=" + "'" + startDate + "'" + " and" + " `End Time` <=" + "'" + endDate + "'" + " group by `Transformer ID` , `Start Time`, `End Time`)Total_count"

            paginatedResults.paginatedResultsMySQLToManageCount(TableName, ColumnName, countquery, WhereCondition, data, "Outagereport", function (err, Details) {
                if (err) {
                    callback(err, null)
                } else {
                    let rows = Details.results;
                    var result = [];
                    for (var i in rows) {
                        if (rows.hasOwnProperty(i)) {
                            result.push({ eventID: rows[i]['Event ID'], circuitID: rows[i]['Circuit ID'], transformerId: rows[i]['Transformer ID'], startTime: rows[i]['Start Time'], EndTime: rows[i]['End Time'], duration: rows[i].Duration })
                        }
                    }

                    delete Details.results;
                    Details.results = result
                    callback(null, Details);
                }
            })

        } else {

            let TableName = "outagemap";
            let ColumnName = "`Event ID`, `Circuit ID`, `Transformer ID`, `Start Time`, `End Time`, Duration";
            let WhereCondition = "`Start Time` >= " + "'" + startDate + "'" + " and " + "`End Time` <= " + "'" + endDate + "'" + " Group By " + "`Start Time`, `Transformer ID`, `End Time` ORDER BY `End Time` DESC";
            let countquery = "select count(E_ID) as T_count from ( SELECT  `Event ID` as E_ID, `Circuit ID`, `Transformer ID`, `Start Time`, `End Time`, `Duration` FROM outagemap WHERE `Start Time` >=" + "'" + startDate + "'" + " and" + " `End Time` <=" + "'" + endDate + "'" + " group by `Transformer ID` , `Start Time`, `End Time`)Total_count"
            paginatedResults.paginatedResultsMySQLToManageCount(TableName, ColumnName, countquery, WhereCondition, data, "Outagereport", function (err, Details) {
                if (err) {
                    callback(err, null)
                } else {
                    let rows = Details.results;
                    var result = [];
                    for (var i in rows) {
                        if (rows.hasOwnProperty(i)) {
                            result.push({ eventID: rows[i]['Event ID'], circuitID: rows[i]['Circuit ID'], transformerId: rows[i]['Transformer ID'], startTime: rows[i]['Start Time'], EndTime: rows[i]['End Time'], duration: rows[i].Duration })
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

// function getOutageReport(startDate, endDate, callback) {
//     try {
//         dbCon.getDb(function (err, connection) {
//             if (err) {
//                 callback(err);
//             } else {
//                 connection.connect();
//                 var queryString = 'SELECT `Event ID`,`Circuit ID`,`Transformer ID`,`Start Time`,`End Time`, Duration FROM outagemap WHERE `Start Time`>= ? and `End Time` <= ? ORDER BY `End Time` DESC LIMIT 1000';
//                 connection.query(queryString, [startDate, endDate], function (err, rows, field) {
//                     if (err) {
//                         callback(err);
//                     } else {
//                         dupStartTime = []; result = [];
//                         for (var i = 0; i < rows.length; i++) {
//                             var strUniqueField = rows[i]['Circuit ID'] + "_" + rows[i]['Start Time'] + "_" + rows[i]['End Time'];
//                             if (dupStartTime.indexOf(strUniqueField) === -1) {
//                                 result.push({ eventID: rows[i]['Event ID'], circuitID: rows[i]['Circuit ID'], transformerId: rows[i]['Transformer ID'], startTime: rows[i]['Start Time'], EndTime: rows[i]['End Time'], duration: rows[i].Duration })
//                                 dupStartTime.push(strUniqueField);
//                             }
//                         }
//                         dupStartTime = [];
//                         callback(null, result);
//                     }
//                 })
//                 connection.end();
//             }
//         })
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };

module.exports = {
    getOutageReport: getOutageReport
}