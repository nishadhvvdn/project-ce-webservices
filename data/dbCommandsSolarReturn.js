var mysql = require('mysql');
var dbCon = require('./mySqlConnection.js');
const paginatedResults = require('../config/Helpers/Pagination')

/**
* @description - get Solar Panel Return Data
* @params - callback
* @return callback function
*/


function getSolarPanelReturnData(QueryDetails, callback) {
    try {
        let query;
        let countQuery;
        if (!QueryDetails.search || QueryDetails.search == null || QueryDetails.search == "null") {
            query = `select monthly.MeterId,sum_of_24h,sum_of_30d,count_of_24h,count_of_30d From
            (
            select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total)as sum_of_30d,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_30d
            from summarymap where (DateTime >= NOW()-INTERVAL 1 month)AND SolarPanel=1 group by MeterID) monthly
            LEFT JOIN 
            (select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total) as sum_of_24h,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_24h
            from summarymap where (DateTime >= NOW() - INTERVAL 24 hour) AND SolarPanel=1 group by MeterID)  daily
            ON monthly.MeterId = daily.MeterId`
            countQuery = `select count(monthly.MeterId) as total_count From
             (
             select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total)as sum_of_30d,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_30d
             from summarymap where (DateTime >= NOW()-INTERVAL 1 month)AND SolarPanel=1 group by MeterID) monthly
             LEFT JOIN 
             (select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total) as sum_of_24h,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_24h
             from summarymap where (DateTime >= NOW() - INTERVAL 24 hour) AND SolarPanel=1 group by MeterID ) daily
             ON monthly.MeterId = daily.MeterId;`
        } else {
            search = { MeterID: { $regex: new RegExp(QueryDetails.search, "i") } };
            query = `select monthly.MeterId,sum_of_24h,sum_of_30d,count_of_24h,count_of_30d From
            (
            select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total)as sum_of_30d,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_30d
            from summarymap where (DateTime >= NOW()-INTERVAL 1 month)AND (MeterID LIKE '%${QueryDetails.search}%' AND SolarPanel=1) group by MeterID) monthly
            LEFT JOIN 
            (select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total) as sum_of_24h,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_24h
            from summarymap where (DateTime >= NOW() - INTERVAL 24 hour) AND (MeterID LIKE '%${QueryDetails.search}%' AND SolarPanel=1) group by MeterID ) daily
            ON monthly.MeterId = daily.MeterId`

            countQuery = `select count(monthly.MeterId) as total_count From
             (
             select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total)as sum_of_30d,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_30d
             from summarymap where (DateTime >= NOW()-INTERVAL 1 month)AND (MeterID LIKE '%${QueryDetails.search}%' AND SolarPanel=1) group by MeterID) monthly
             LEFT JOIN 
             (select MeterId, Sum(Meter_ActiveDeliveredCumulativeRate_Total) as sum_of_24h,Count(Meter_ActiveDeliveredCumulativeRate_Total) as count_of_24h
             from summarymap where (DateTime >= NOW() - INTERVAL 24 hour) AND (MeterID LIKE '%${QueryDetails.search}%' AND SolarPanel=1) group by MeterID ) daily
             ON monthly.MeterId = daily.MeterId;`

        }

        dbCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                let totalcount;
                let pagination;
                let result = [];
                let OFFSET = (QueryDetails.page - 1) * QueryDetails.limit;
                OFFSET = QueryDetails.page > 0 ? (OFFSET) : 0;
                const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
                const endIndex = QueryDetails.page * QueryDetails.limit;
                const results = {};
                totalcount = countQuery;
                pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;
                connection.query(totalcount, function (err, rows1, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(pagination, function (err, rows, fields) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (rows.length > 0) {
                                    if (endIndex > 0) {
                                        results.next = {
                                            Page: QueryDetails.page + 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    if (startIndex > 0) {
                                        results.previous = {
                                            Page: QueryDetails.page - 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    results.totalRecords = rows1[0]["total_count"];
                                    for (var i in rows) {
                                        if (rows.hasOwnProperty(i)) {
                                            let total30daysData = rows[i]['sum_of_30d'];
                                            let avg30DaysData = rows[i]['sum_of_30d'] / rows[i]['count_of_30d'];
                                            let total24hours = rows[i]['sum_of_24h'];
                                            let avg24hours = rows[i]['sum_of_24h'] / rows[i]['count_of_24h'];
                                            avg24hours = (avg24hours)?avg24hours:"NA";
                                            total24hours = (total24hours)?total24hours:"NA";
                                            avg30DaysData = (avg30DaysData)?avg30DaysData:"NA";
                                            total30daysData = (total30daysData)?total30daysData:"NA";
                                            let data = { 'meterId': rows[i]['MeterId'], "avg24hours": avg24hours, 'total24hours': total24hours, 'avg30DaysData': avg30DaysData, 'total30daysData': total30daysData }
                                            result.push(data)
                                        }
                                    }
                                    results.results = result;
                                    connection.end();
                                    callback(null, results);
                                } else {
                                    callback("SolarPanelReturn Details not available in the System", null);

                                }

                            }
                        })
                    }
                })
            }
        })

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};


// function getSolarPanelReturnData(callback) {
//     try {

// dbCon.getDb(function (err, connection) {
//     if (err) {
//         callback(err, null);
//     } else {
//         connection.connect();

//         connection.query("SELECT * FROM summarymap where SolarPanel=1 AND `DateTime` > DATE_SUB(NOW(), INTERVAL 30 HOUR)", function (err, rows, fields) {
//             if (err) {
//                 callback(err, null);
//             } else {
//                 var toDate24hours = new Date();
//                 var fromDate24hours = new Date();
//                 fromDate24hours.setHours(fromDate24hours.getHours() - 24);
//                 var dataof30days = new Date();
//                 dataof30days.setHours(fromDate24hours.getHours() - (24 * 30));
//                 if (rows.length === 0) {
//                     callback(null, 'No Data Found');
//                 } else {
//                     var resArray = [];
//                     for (var cnt in rows) {
//                         if (rows.hasOwnProperty(cnt)) {
//                             var count = 0;
//                             var count30Days = 0;
//                             var total24hours = 0;
//                             var total30daysData = 0;
//                             var occurences = 0;
//                             for (var c in rows) {
//                                 if (rows[cnt].MeterID === rows[c].MeterID) {

//                                     if (new Date(rows[c].DateTime) >= fromDate24hours && new Date(rows[c].DateTime) <= toDate24hours) {
//                                         count++;
//                                         total24hours += rows[c].Meter_ActiveDeliveredCumulativeRate_Total;
//                                     }
//                                     if (new Date(rows[c].DateTime) >= dataof30days && new Date(rows[c].DateTime) <= toDate24hours) {
//                                         count30Days++;
//                                         total30daysData += rows[c].Meter_ActiveDeliveredCumulativeRate_Total;
//                                     }
//                                 }
//                             }
//                             var avg24hours = total24hours / count;
//                             var avg30DaysData = total30daysData / count30Days;
//                             for (var i = 0; i < resArray.length; i++) {
//                                 if (rows[cnt].MeterID === resArray[i].meterId)
//                                     occurences++;
//                             }
//                             if (occurences === 0) {
//                                 resArray.push({ 'meterId': rows[cnt].MeterID, "avg24hours": avg24hours, 'total24hours': total24hours, 'avg30DaysData': avg30DaysData, 'total30daysData': total30daysData });
//                             }
//                         }
//                     }
//                     callback(null, resArray);
//                 }
//             }
//         });
//         connection.end();
//     }
// });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };



module.exports = {
    getSolarPanelReturnData: getSolarPanelReturnData
};