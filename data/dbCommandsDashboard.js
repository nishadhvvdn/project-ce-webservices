var dbCon = require('./dbConnection.js');
var dbSqlCon = require('./mySqlConnection.js');

function FetchDashboardDetails(consumerId, Timezone, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let data = { message: "Database error occured", responseCode: "300" };
            callback(data, null);
        }
        else {
            let meterCollection = db.delta_Meters;
            let deltaLinkCollection = db.delta_DeltaLink;
            let notificationCollection = db.delta_Notification;

            meterCollection.find({ "Meters_Billing.MeterConsumerNumber": consumerId }, { MeterSerialNumber: 1, MeterID: 1 }).toArray(function (err, consumer) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" }
                    callback(data, null);
                } else {
                    if (consumer.length) {
                        let meterSerialNumber = consumer.map(function (val) {
                            return val.MeterSerialNumber;
                        });

                        let meterId = consumer.map(function (val) {
                            return val.MeterID;
                        });

                        fetchDataFromMySql(meterSerialNumber, deltaLinkCollection, meterId, Timezone, function (err, data) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                let condition = { "UserID": consumerId }
                                notificationCollection.find(condition).count().then((count) => {
                                    data.response["totalNotification"] = count
                                    callback(null, data);
                                })
                            }
                        });
                    } else {
                        let data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                        callback(data, null)
                    }
                }
            });
        }
    });
};

function FetchDhcpDetails(consumerId, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let data = { message: "Database error occured", responseCode: "300" };
            callback(data, null);
        }
        else {
            let meterCollection = db.delta_Meters;
            let deltaLinkCollection = db.delta_DeltaLink;

            meterCollection.find({ "Meters_Billing.MeterConsumerNumber": consumerId }, { MeterSerialNumber: 1, MeterID: 1 }).toArray(function (err, consumer) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" }
                    callback(data, null);
                } else {
                    console.log(consumer)
                    if (consumer.length) {
                        let meterId = consumer.map(function (val) {
                            return val.MeterID;
                        });

                        deltaLinkCollection.find({ "MeterID": { $in: meterId }, "IsMaster": true }).toArray(function (err, deltaLink) {
                            if (err) {
                                let data = { message: "Database error occured", responseCode: "300" }
                                callback(data, null);
                            } else {
                                console.log(deltaLink)
                                if (deltaLink.length) {
                                    let dhcp = deltaLink[0].DhcpIp ? deltaLink[0].DhcpIp : null;
                                    let deltalink = { DeltalinkSerialNumber: deltaLink[0].DeltalinkSerialNumber, dhcp: dhcp };
                                    let data = { response: {  "deltaLink": { DeltalinkSerialNumber: deltalink.DeltalinkSerialNumber, "dhcp": deltalink.dhcp }  }, message: "Details Successfully Fetched", responseCode: "200" };
                                        callback(null, data);
                                }
                                else {
                                    let data = { message: "Deltalink attached to the consumer not found", responseCode: "320" };
                                    callback(data, null);
                                }
                            }
                        });
                    } else {
                        let data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                        callback(data, null)
                    }
                }
            });
        }
    });
};

function fetchDeltaLink(deltaLinkCollection, meterId, callback) {

    deltaLinkCollection.find({ "MeterID": { $in: meterId }, "IsMaster": true }).toArray(function (err, deltaLink) {
        if (err) {
            let data = { message: "Database error occured", responseCode: "300" }
            callback(data, null);
        } else {
            if (deltaLink.length) {
                let dhcp = deltaLink[0].DhcpIp ? deltaLink[0].DhcpIp : null;
                let status =  deltaLink[0].ConnectionStatus ? (deltaLink[0].ConnectionStatus ? "Online" : "Offline") : "Offline";
                let deltalink = { DeltalinkSerialNumber: deltaLink[0].DeltalinkSerialNumber, Status: status, dhcp: dhcp };
                callback(null, deltalink);
            }
            else {
                let deltalink = { "DeltalinkSerialNumber": null, "Status": null, "dhcp": null };
                callback(null, deltalink);
            }
        }
    });
}

function fetchDataFromMySql(meterSerialNumber, deltaLinkCollection, meterId, Timezone, callback) {
    let meters = '"' + meterSerialNumber.join('","') + '"';

    dbSqlCon.getDb(function (err, connection) {
        if (err) {
            console.log("Err".err)
            let data = { message: "Database error occured", responseCode: "300" };
            callback(data, null);
        } else {
            let dPer = '"%d"';
            let mPer = '"%m"';

           // let sqlQuery = 'SET @CurrentMonthTotalDay:=(SELECT count(distinct( DATE_FORMAT(DateTime, '+dPer+'))) AS CurrentMonthTotalDay from summarymap WHERE YEAR(DateTime) = YEAR(now()) AND month(DateTime) = MONTH(now()) AND MeterApparentReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN ('+ meters + '));SET @PreviousMonthTotalDay:=(SELECT count(distinct( DATE_FORMAT(DateTime, '+dPer+'))) AS PreviousMonthTotalDay from summarymap WHERE YEAR(DateTime) = YEAR(now() - INTERVAL 1 MONTH) AND MONTH(DateTime) = MONTH(NOW() - INTERVAL 1 MONTH) AND MeterApparentReceivedCumulativeRate_Total IS NOT NULL  AND MeterId IN ('+meters+')) ; SET @CurrentMonthSum:=(select sum(MeterApparentReceivedCumulativeRate_Total) from summarymap where YEAR(DateTime) = YEAR(now()) AND MONTH(DateTime)=MONTH(now()) AND MeterApparentReceivedCumulativeRate_Total IS NOT NULL AND MeterID IN ('+meters+')); SET @PreviousMonthSum:=(select sum(MeterApparentReceivedCumulativeRate_Total) from summarymap WHERE YEAR(DateTime) = YEAR(now() - INTERVAL 1 MONTH) AND MONTH(DateTime) = month(now() - INTERVAL 1 MONTH) AND MeterApparentReceivedCumulativeRate_Total IS NOT NULL and MeterID IN (' + meters + ')); SELECT ROUND( ( IFNULL((@CurrentMonthSum/@CurrentMonthTotalDay),0) - IFNULL((@PreviousMonthSum/ @PreviousMonthTotalDay),0) )  / IFNULL((@CurrentMonthSum/@CurrentMonthTotalDay),0)* 100,6) AS TotalUse, @CurrentMonthSum AS CurrentMonthSum, @PreviousMonthSum As PreviousMonthSum;SET @TotalMonth :=(SELECT count(distinct( DATE_FORMAT(DateTime, ' + mPer + '))) AS MONTH from summarymap WHERE MeterId IN (' + meters + ') AND YEAR(DateTime) = YEAR(now())); SET @TotalApparentValue :=(select sum(MeterApparentReceivedCumulativeRate_Total)from summarymap WHERE MeterId IN (' + meters + ') AND YEAR(DateTime) = YEAR(now())); SELECT(@TotalApparentValue/@TotalMonth) AS MonthlyAveragePowerUsed;'
           let sqlQuery = `SET @nowTime:= CONVERT_TZ(NOW(),"+00:00","${Timezone}"); SET @CurrentMonthTotalDay:=(  select   min(CurrentMonthTotalDay) as CurrentMonthTotalDay  from (select case when (YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = MONTH(@nowTime - INTERVAL 1 MONTH) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN (${meters})) then day(@nowTime) when (YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = MONTH(@nowTime) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN (${meters})) then (day(@nowTime) - (SELECT min(DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","${Timezone}"), ${dPer}) ) from summarymap WHERE YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = MONTH(@nowTime) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL  AND MeterId IN (${meters}) )) + 1 else '10001' end  AS CurrentMonthTotalDay from summarymap WHERE Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN  (${meters})) as asd where CurrentMonthTotalDay <> '10001'); SET @PreviousMonthTotalDay:=(  select   min(PreviousMonthTotalDay) as PreviousMonthTotalDay  from (select case when (YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime - INTERVAL 2 MONTH) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = MONTH(@nowTime - INTERVAL 2 MONTH) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN  (${meters})) then  day (LAST_DAY (@nowTime - INTERVAL 1 MONTH)) when (YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = MONTH(@nowTime - INTERVAL 1 MONTH) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN (${meters})) then (day (LAST_DAY (@nowTime - INTERVAL 1 MONTH)) - (SELECT min(DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","${Timezone}"), ${dPer})) from summarymap WHERE YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = MONTH(@nowTime - INTERVAL 1 MONTH) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN (${meters})))+1 else '10001' end AS PreviousMonthTotalDay from summarymap WHERE Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterId IN (${meters})) as asd where PreviousMonthTotalDay <> '10001'); SET @CurrentMonthSum:=(select sum(Meter_ActiveReceivedCumulativeRate_Total) from summarymap where YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}"))=MONTH(@nowTime) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL AND MeterID IN (${meters})); SET @PreviousMonthSum:=(select sum(Meter_ActiveReceivedCumulativeRate_Total) from summarymap WHERE YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = month(@nowTime - INTERVAL 1 MONTH) AND Meter_ActiveReceivedCumulativeRate_Total IS NOT NULL and MeterID IN (${meters})); SELECT ROUND( ( IFNULL((@CurrentMonthSum/@CurrentMonthTotalDay),0) - IFNULL((@PreviousMonthSum/ @PreviousMonthTotalDay),0))/IFNULL((@PreviousMonthSum/@PreviousMonthTotalDay),0)* 100,6) AS TotalUse, @CurrentMonthSum AS CurrentMonthSum, @PreviousMonthSum As PreviousMonthSum; SET @TotalMonth :=(SELECT count(distinct( DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","${Timezone}"), ${mPer}))) AS MONTH from summarymap WHERE MeterId IN  (${meters}) AND YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime)); SET @TotalApparentValue :=(select sum(Meter_ActiveReceivedCumulativeRate_Total)from summarymap WHERE MeterId IN (${meters}) AND YEAR(CONVERT_TZ(DateTime,"+00:00","${Timezone}")) = YEAR(@nowTime)); SELECT(@TotalApparentValue/@TotalMonth) AS MonthlyAveragePowerUsed;`;

           
           connection.connect();
            connection.query(sqlQuery, function (err, rows) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" };
                    callback(data, null);
                } else {
                    
                    if(rows.length == 9) {
                        rows.shift();
                    }
                    if (rows.length) {
                        let isMoreThanLastMonthDataUsage;
                        let lastMonthUsagePercentage;

                        if (rows[4][0]['TotalUse'] > 0) {
                            isMoreThanLastMonthDataUsage = true;
                        } else if (rows[4][0]['TotalUse'] < 0) {
                            isMoreThanLastMonthDataUsage = false;
                        } else {
                            isMoreThanLastMonthDataUsage = false;
                        }

                        lastMonthUsagePercentage = rows[4][0]['TotalUse'] ? Math.abs(rows[4][0]['TotalUse']) : 0;
                        rows[4][0]['PreviousMonthSum'] = rows[4][0]['PreviousMonthSum'] ? rows[4][0]['PreviousMonthSum'] : 0;
                        rows[4][0]['CurrentMonthSum'] = rows[4][0]['CurrentMonthSum'] ? rows[4][0]['CurrentMonthSum'] : 0;
                        rows[7][0]['MonthlyAveragePowerUsed'] = rows[7][0]['MonthlyAveragePowerUsed'] ? rows[7][0]['MonthlyAveragePowerUsed'] : 0;

                        let powerUsage = { 'lastMonthUsagePercentage': lastMonthUsagePercentage, 'isMoreThanLastMonthPowerUsage': isMoreThanLastMonthDataUsage, 'LastMonthPowerUsage': rows[4][0]['PreviousMonthSum'], 'CurrentMonthPowerUsage': rows[4][0]['CurrentMonthSum'], 'monthlyAveragePowerUsed': rows[7][0]['MonthlyAveragePowerUsed'] };

                        fetchDeltaLink(deltaLinkCollection, meterId, function (err, deltalink) {
                            if (err) {
                                callback(err, null);
                            } else {
                                getDLdataUsage(deltalink, Timezone, function (err, dataUsage,dlStatus) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        let data = { response: { "powerUsage": powerUsage, "dataUsage": dataUsage, "deltaLink": { DeltalinkSerialNumber: deltalink.DeltalinkSerialNumber, Status: dlStatus }, "dhcp": deltalink.dhcp }, message: "Details Successfully Fetched", responseCode: "200" };
                                        connection.end();
                                        callback(null, data);
                                    }
                                })
                                // let data = { response: { "powerUsage": powerUsage, "dataUsage": { "lastMonthUsagePercentage": 0, "isMoreThanLastMonthDataUsage": false, "LastMonthDataUsage": 0, "CurrentMonthDataUsage": 0, "monthlyAverageDataUsed": 0 }, "deltaLink": { DeltalinkSerialNumber: deltalink.DeltalinkSerialNumber, Status: deltalink.Status }, "dhcp": deltalink.dhcp }, message: "Details Successfully Fetched", responseCode: "200" };
                                // connection.end();
                                // callback(null, data);
                            }
                        });

                    } else {
                        let data = { message: "No data found", responseCode: "306" }
                        callback(data, null);
                    }
                }
            });
        }
    });

}


function getDLdataUsage(deltalink, Timezone, callback) {
    dbSqlCon.getDb(function (err, connection) {
        if (err) {
            let data = { message: "Database error occured", responseCode: "300" };
            callback(data, null,null);
        } else {
            let DeltalinkSerialNumber = deltalink.DeltalinkSerialNumber;
            let dPer = '"%d"';
            let mPer = '"%m"';
            //    let sqlQuery = 'SET @CurrentMonthTotalDay:=(SELECT count(distinct( DATE_FORMAT(ReadTimestamp, '+dPer+'))) AS CurrentMonthTotalDay from device_dataconsumption WHERE YEAR(ReadTimestamp) = YEAR(now()) AND month(ReadTimestamp) = MONTH(now()) AND DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN ('+ DeltalinkSerialNumber + '));SET @PreviousMonthTotalDay:=(SELECT count(distinct( DATE_FORMAT(ReadTimestamp, '+dPer+'))) AS PreviousMonthTotalDay from device_dataconsumption WHERE YEAR(ReadTimestamp) = YEAR(now() - INTERVAL 1 MONTH) AND MONTH(ReadTimestamp) = MONTH(NOW() - INTERVAL 1 MONTH) AND DeltaLink_Total IS NOT NULL  AND Deltalink_SerialNumber IN ('+DeltalinkSerialNumber+')) ; SET @CurrentMonthSum:=(select sum(DeltaLink_Total) from device_dataconsumption where YEAR(ReadTimestamp) = YEAR(now()) AND MONTH(ReadTimestamp)=MONTH(now()) AND DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN ('+DeltalinkSerialNumber+')); SET @PreviousMonthSum:=(select sum(DeltaLink_Total) from device_dataconsumption WHERE YEAR(ReadTimestamp) = YEAR(now() - INTERVAL 1 MONTH) AND MONTH(ReadTimestamp) = month(now() - INTERVAL 1 MONTH) AND DeltaLink_Total IS NOT NULL and Deltalink_SerialNumber IN (' + DeltalinkSerialNumber + ')); SELECT ROUND( ( IFNULL((@CurrentMonthSum/@CurrentMonthTotalDay),0) - IFNULL((@PreviousMonthSum/ @PreviousMonthTotalDay),0) )  / IFNULL((@CurrentMonthSum/@CurrentMonthTotalDay),0)* 100,6) AS TotalUse, @CurrentMonthSum AS CurrentMonthSum, @PreviousMonthSum As PreviousMonthSum;SET @TotalMonth :=(SELECT count(distinct( DATE_FORMAT(ReadTimestamp, ' + mPer + '))) AS MONTH from device_dataconsumption WHERE Deltalink_SerialNumber IN (' + DeltalinkSerialNumber + ') AND YEAR(ReadTimestamp) = YEAR(now())); SET @TotalApparentValue :=(select sum(DeltaLink_Total)from device_dataconsumption WHERE Deltalink_SerialNumber IN (' + DeltalinkSerialNumber + ') AND YEAR(ReadTimestamp) = YEAR(now())); SELECT(@TotalApparentValue/@TotalMonth) AS MonthlyAveragePowerUsed;'
            let sqlQuery = `SET @CurrentMonthTotalDay:=(  select   min(CurrentMonthTotalDay) as CurrentMonthTotalDay  from (
                select case when (YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = MONTH(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND  
                DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN ("${deltalink.DeltalinkSerialNumber}")) 
                            then   day(CONVERT_TZ(NOW(),"+00:00","${Timezone}"))     
                    when (YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}") ) AND MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = MONTH(CONVERT_TZ(NOW(),"+00:00","${Timezone}") ) AND  
                DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN ("${deltalink.DeltalinkSerialNumber}") ) 
                            then   ( day(CONVERT_TZ(NOW(),"+00:00","${Timezone}")) - (  SELECT   min( DATE_FORMAT(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}"), ${dPer}) ) from device_dataconsumption
                WHERE YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}") ) AND MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = MONTH(CONVERT_TZ(NOW(),"+00:00","${Timezone}") ) AND 
                DeltaLink_Total IS NOT NULL  AND Deltalink_SerialNumber IN ("${deltalink.DeltalinkSerialNumber}") ) ) + 1
                    else '10001' end  AS CurrentMonthTotalDay 
                from device_dataconsumption 
                WHERE 
                DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}")  
                ) as asd where CurrentMonthTotalDay <> '10001'  );
                SET @PreviousMonthTotalDay:=(  select   min(PreviousMonthTotalDay) as PreviousMonthTotalDay  from (
                select case when (YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 2 MONTH) AND MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = MONTH(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 2 MONTH) AND  
                DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}") ) 
                            then  day (LAST_DAY (CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) )   
                    when (YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = MONTH(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND  
                DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}")) 
                            then   ( day (LAST_DAY (CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) ) - (  SELECT   min( DATE_FORMAT(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}"),${dPer}) ) from device_dataconsumption
                WHERE YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = MONTH(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND 
                DeltaLink_Total IS NOT NULL  AND Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}")) )+1
                    else '10001' end  AS PreviousMonthTotalDay 
                from device_dataconsumption 
                WHERE 
                DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}")   
                ) as asd where PreviousMonthTotalDay <> '10001'  ) ; 
                SET @CurrentMonthSum:=(select sum(DeltaLink_Total) from device_dataconsumption where YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}")) AND
                MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}"))=MONTH(CONVERT_TZ(NOW(),"+00:00","${Timezone}")) AND DeltaLink_Total IS NOT NULL AND Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}")); 
                SET @PreviousMonthSum:=(select sum(DeltaLink_Total) from device_dataconsumption WHERE 
                YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND MONTH(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = month(CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 1 MONTH) AND 
                DeltaLink_Total IS NOT NULL and Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}")); 
                SELECT ROUND( ( IFNULL((@CurrentMonthSum/@CurrentMonthTotalDay),0) - IFNULL((@PreviousMonthSum/ @PreviousMonthTotalDay),0) ) 
                / IFNULL((@PreviousMonthSum/@PreviousMonthTotalDay),0)* 100,6) AS TotalUse, @CurrentMonthSum AS CurrentMonthSum, 
                @PreviousMonthSum As PreviousMonthSum;
                SET @TotalMonth :=(SELECT count(distinct( DATE_FORMAT(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}"), ${mPer}))) AS MONTH from device_dataconsumption WHERE 
                Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}") AND YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}"))); 
                SET @TotalApparentValue :=(select sum(DeltaLink_Total)from device_dataconsumption WHERE 
                Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}") AND YEAR(CONVERT_TZ(ReadTimestamp,"+00:00","${Timezone}")) = YEAR(CONVERT_TZ(NOW(),"+00:00","${Timezone}"))); 
                SELECT(@TotalApparentValue/@TotalMonth) AS MonthlyAveragePowerUsed;
                SET @DeltaLinkStatus :=(SELECT IF(EXISTS(select Deltalink_SerialNumber from deltalink_dataconsumption where Deltalink_SerialNumber IN  ("${deltalink.DeltalinkSerialNumber}") and CONVERT_TZ(createdAt,"+00:00","${Timezone}") >= CONVERT_TZ(NOW(),"+00:00","${Timezone}") - INTERVAL 15 MINUTE), 'Online', 'Offline'));
                SELECT @DeltaLinkStatus as DeltaLinkStatus`;


            connection.connect();
            connection.query(sqlQuery, function (err, rows, fields) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" };
                    connection.end();
                    callback(data, null, null);
                } else {
                    if (rows.length) {
                        let isMoreThanLastMonthDataUsage;
                        let lastMonthUsagePercentage;

                        if (rows[4][0]['TotalUse'] > 0) {
                            isMoreThanLastMonthDataUsage = true;
                        } else if (rows[4][0]['TotalUse'] < 0) {
                            isMoreThanLastMonthDataUsage = false;
                        } else {
                            isMoreThanLastMonthDataUsage = false;
                        }
                        lastMonthUsagePercentage = rows[4][0]['TotalUse'] ? Math.abs(rows[4][0]['TotalUse']) : 0;
                        rows[4][0]['PreviousMonthSum'] = rows[4][0]['PreviousMonthSum'] ? rows[4][0]['PreviousMonthSum'] : 0;
                        rows[4][0]['CurrentMonthSum'] = rows[4][0]['CurrentMonthSum'] ? rows[4][0]['CurrentMonthSum'] : 0;
                        rows[7][0]['MonthlyAveragePowerUsed'] = rows[7][0]['MonthlyAveragePowerUsed'] ? rows[7][0]['MonthlyAveragePowerUsed'] : 0;

                        let dataUsage = { 'lastMonthUsagePercentage': lastMonthUsagePercentage, 'isMoreThanLastMonthDataUsage': isMoreThanLastMonthDataUsage, 'LastMonthDataUsage': rows[4][0]['PreviousMonthSum'], 'CurrentMonthDataUsage': rows[4][0]['CurrentMonthSum'], 'monthlyAverageDataUsed': rows[7][0]['MonthlyAveragePowerUsed'] };

                        let DlStatus = rows[9][0]['DeltaLinkStatus'];

                        connection.end();

                        callback(null, dataUsage,DlStatus)


                    } else {
                        let data = { message: "No data found", responseCode: "306" }
                        connection.end();
                        callback(data, null,null);
                    }
                }
            });
        }
    });

}
module.exports = {

    FetchDashboardDetails: FetchDashboardDetails,
    FetchDhcpDetails : FetchDhcpDetails
}

