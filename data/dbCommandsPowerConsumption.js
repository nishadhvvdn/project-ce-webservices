//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var dbSqlCon = require('./mySqlConnection.js');
var async = require('async');

function fetchMeterForConsumer(consumerId, EndDate, EndTime, Filter, StartDate, StartTime, Timezone, callback) {
    checkStartEndDate(StartDate, EndDate, Filter, function (err, res) {
        if (err)
            callback(err, null);
        else {
            dbCon.getDb(function (err, db) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" };
                    callback(data, null);
                }
                else {
                    let meterCollection = db.delta_Meters;
                    meterCollection.find({ "Meters_Billing.MeterConsumerNumber": consumerId }, { MeterSerialNumber: 1 }).toArray(function (err, consumer) {
                        if (err) {
                            let data = { message: "Database error occured", responseCode: "300" }
                            callback(data, null);
                        } else {
                            if (consumer.length) {
                                let meterSerialNumber = consumer.map(function (val) {
                                    return val.MeterSerialNumber;
                                });
                                fetchDataFromMySql(meterSerialNumber, EndDate, EndTime, Filter, StartDate, StartTime, Timezone, function (err, data) {
                                    if (err) {
                                        callback(err, null);
                                    }
                                    else {
                                        callback(null, data);
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
        }
    });
};

function checkStartEndDate(StartDate, EndDate, Filter, callback) {

    if (Filter == 'Daily') {
        if (StartDate != undefined || StartDate != null) {

            let afterSplitStart = StartDate.split("-");
            let yearStart = parseInt(afterSplitStart[0]);
            let monthStart = parseInt(afterSplitStart[1]);

            let afterSplitEnd = EndDate.split("-");
            let yearEnd = parseInt(afterSplitEnd[0]);
            let monthEnd = parseInt(afterSplitEnd[1]);

            if (yearStart != yearEnd || monthStart != monthEnd) {
                let data = { message: "StartDate and EndDate should be of same year and month", responseCode: "301" };
                callback(data, null);
            } else {
                callback(null, null);
            }
        } else {
            let data = { message: "Payload Validation Error", responseCode: "301" };
            callback(data, null);
        }
    } else {
        callback(null, null);
    }

}

function fetchDataFromMySql(meterSerialNumber, EndDate, EndTime, Filter, StartDate, StartTime, Timezone, callback) {
    try {
        let meters = "'" + meterSerialNumber.join("','") + "'";
        console.log(meters)
        let hourRange = [];
        let EndDateCon = EndDate + ' ' + EndTime;
        let StartDateCon = StartDate + ' ' + StartTime;
        if (Filter != 'Weeks' && Filter != 'Daily') {
            let sqlQuery;
            switch (Filter) {
                case "Hours":
                    
                    sqlQuery = 'select UNIX_TIMESTAMP(dr.mydate) as datetime , sm.MeterActiveEng, DATE_FORMAT(convert_tz(dr.mydate,"+00:00","'+ Timezone +'"),"%H") as Hourvalue, DATE_FORMAT(convert_tz(dr.mydate,"+00:00","'+ Timezone +'"),"%Y-%m-%d %H:%i:%s") as DateTimeString from ( select mydate from ( SELECT (DATE_FORMAT(CONVERT_TZ("'+ StartDateCon +'","'+ Timezone +'","+00:00"), "%Y-%m-%d %H:00:00")) + INTERVAL (NR * 1) hour AS mydate FROM ( SELECT d2.a*10+d1.a AS nr FROM ( SELECT 0 a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS d1 CROSS JOIN ( SELECT 0 a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 ) AS d2 WHERE d2.a*10+d1.a BETWEEN 0 AND 24 ) AS parameter ) date_range where mydate between CONVERT_TZ("'+ StartDateCon +'","'+ Timezone +'","+00:00") and CONVERT_TZ("'+ EndDateCon +'","'+ Timezone +'","+00:00") ) dr left join ( SELECT datetime , Meter_ActiveReceivedCumulativeRate_Total as MeterActiveEng FROM deltamart.summarymap WHERE datetime >= CONVERT_TZ("'+ StartDateCon +'","'+ Timezone +'","+00:00") and datetime <= CONVERT_TZ("'+  EndDateCon +'","'+ Timezone +'","+00:00") AND MeterID IN ('+ meters +') ) sm on dr.mydate =sm.datetime order by dr.mydate'
                    break;
                case "Months":
                    let jan = '"01"';
                    let feb = '"02"';
                    let march = '"03"';
                    let april = '"04"';
                    let may = '"05"';
                    let june = '"06"';
                    let july = '"07"';
                    let aug = '"08"';
                    let sept = '"09"';
                    let oct = '"10"';
                    let nov = '"11"';
                    let dec = '"12"';
                    let Mperc = '"%m"';
                    let yperc = '"%Y-%m-%d"'

                    sqlQuery = 'Select abc.MONTH, abc.MeterActiveEng from ( SELECT m.MONTH, IFNULL(n.MeterActiveEng,0) MeterActiveEng FROM (SELECT "01" AS MONTH UNION SELECT "02" AS MONTH UNION SELECT "03" AS MONTH UNION SELECT "04" AS MONTH UNION SELECT "05" AS MONTH UNION SELECT "06" AS MONTH UNION SELECT "07" AS MONTH UNION SELECT "08" AS MONTH UNION SELECT "09" AS MONTH UNION SELECT "10" AS MONTH UNION SELECT "11" AS MONTH UNION SELECT "12" AS MONTH ) m LEFT JOIN (SELECT DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"), "%m") AS MONTH, sum(Meter_ActiveReceivedCumulativeRate_Total) MeterActiveEng FROM deltamart.summarymap WHERE DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"),"%Y-%m-%d") BETWEEN DATE_FORMAT("'+ EndDateCon +'" ,"%Y-01-01") AND "'+ EndDateCon +'" AND MeterID IN ('+ meters +') GROUP BY MONTH(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'")) ORDER BY MONTH(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"))) n ON m.MONTH=n.MONTH ) abc where abc.month <= DATE_FORMAT("'+ EndDateCon +'","%m");';
                    break;

                case "Years":

                    sqlQuery = 'SELECT sum(Meter_ActiveReceivedCumulativeRate_Total) AS Value, DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"), ' + '"%Y"' + ') AS Date FROM  deltamart.summarymap WHERE DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"), "%Y") != "1970" and DATE(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'")) <= "'+ EndDateCon +'" AND MeterID IN ('+ meters +') GROUP BY DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"), ' + '"%Y"' + ') ORDER BY DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"), ' + '"%Y"' + ') desc;';
                    break;

            }

            dbSqlCon.getDb(function (err, connection) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" };
                    callback(data, null);
                } else {
                    connection.connect();
                    connection.query(sqlQuery, function (err, rows) {
                        if (err) {
                            let data = { message: "Database error occured", responseCode: "300" };
                            callback(data, null);
                        } else {
                            if (rows.length) {
                                prepareResponse(rows, Filter, function (err, data) {
                                    if (err)
                                        callback(err, null);
                                    else
                                        callback(null, data);
                                });

                            } else {
                                let data = { message: "No data found", responseCode: "306" }
                                callback(data, null)
                            }
                        }
                    });
                    connection.end();
                }
            });
        } else if (Filter == 'Weeks') {
            dbSqlCon.getDb(function (err, connection) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" };
                    callback(data, null);
                } else {
                    getWeeklyData({endDate:EndDate,startTime:StartTime,endTime:EndTime}, function (err, dateArr) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (dateArr.length) {
                                let sqlQuery;
                                connection.connect();
                                let weekNo = 1;
                                let graphData = [];
                                let result = {};
                                let totalUsage = 0;

                                async.each(dateArr, function (date, callbackEach) {
                                    sqlQuery = 'Select sum(Meter_ActiveReceivedCumulativeRate_Total) As PowerUsage from deltamart.summarymap where CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'") Between "'+ date.startDate +'" AND "'+ date.endDate +'" AND  MeterID IN ('+ meters +');'
                                    
                                    connection.query(sqlQuery, function (err, rows) {
                                        if (err) {
                                            callbackEach(err, null);
                                        } else {
                                            let weekKey = 'w' + weekNo;
                                            let data = {};

                                            totalUsage += rows[0].PowerUsage;

                                            if (rows[0].PowerUsage == null)
                                                rows[0].PowerUsage = 0;

                                            data.xAxisName = weekKey;
                                            data.yAxisValue = rows[0].PowerUsage;
                                            graphData.push(data);
                                            weekNo++;
                                            callbackEach();
                                        }
                                    });
                                }, function (err) {
                                    if (err) {
                                        connection.end();
                                        callback({ message: "Something went wrong : " + err, responseCode: "315" }, null);
                                    } else {
                                        connection.end();
                                        result.TotalPowerUsage = Math.round(totalUsage);
                                        result.GraphData = graphData;
                                        let data = { "response": result, "message": "Details Successfully Fetched", "status": true, "responseCode": "200" }
                                        callback(null, data);
                                    }
                                });
                            } else {
                                let data = { message: "No data found", responseCode: "306" }
                                callback(data, null)
                            }
                        }
                    });
                }
            });
        } else if (Filter == 'Daily') {
            dbSqlCon.getDb(function (err, connection) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" };
                    callback(data, null);
                } else {
                    connection.connect();
                    let afterSplitStart = StartDate.split("-");
                    let yearStart = parseInt(afterSplitStart[0]);
                    let monthStart = parseInt(afterSplitStart[1]);
                    let dateStart = parseInt(afterSplitStart[2]);

                    let afterSplitEnd = EndDate.split("-");
                    let yearEnd = parseInt(afterSplitEnd[0]);
                    let monthEnd = parseInt(afterSplitEnd[1]);
                    let dateEnd = parseInt(afterSplitEnd[2]);

                    startTime = yearStart + '-' + monthStart + '-' + dateStart + ' 00:00:00';
                    endTime = yearEnd + '-' + monthEnd + '-' + dateEnd + ' 23:59:00';

                    sqlQuery = 'SELECT Day, Dayname, PowerConsumed FROM ( SELECT Days.Day, Days.Dayname, sm.DateTime, IFNULL(sm.PowerConsumed,0) PowerConsumed FROM (select Day , dayname(Day) AS Dayname from (select adddate("1970-01-01",t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) Day from (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0, (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1, (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2, (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3, (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) v where Day between date("'+ StartDateCon +'") and date("'+ EndDateCon +'") ) Days LEFT JOIN ( SELECT DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"), "%Y-%m-%d") AS Day, dayname(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'")) AS Dayname , CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'") as DateTime, sum(Meter_ActiveReceivedCumulativeRate_Total) PowerConsumed FROM deltamart.summarymap WHERE CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'") between "'+ StartDateCon +'" and  TIMESTAMPADD(day,1,"'+ EndDateCon +'") AND MeterID IN ('+ meters +') GROUP BY DATE_FORMAT(CONVERT_TZ(DateTime,"+00:00","'+ Timezone +'"), "%Y-%m-%d") ) sm ON Days.Day=sm.Day )current_hr where current_hr.Day <= DATE_FORMAT("'+ EndDateCon +'", "%Y-%m-%d") order by current_hr.Day';

                    connection.query(sqlQuery, function (err, rows) {
                        if (err) {
                            let data = { message: "Database error occured", responseCode: "300" };
                            callback(data, null);
                        } else {
                            if (rows.length) {
                                prepareResponse(rows, Filter, function (err, result) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        if (Object.keys(result).length) {
                                            let data = { "response": result, "message": "Details Successfully Fetched", "status": true, "responseCode": "200" };
                                            callback(null, data);
                                        }
                                        else {
                                            let data = { message: "No data found", responseCode: "306" }
                                            callback(data, null);
                                        }
                                    }

                                });
                            } else {
                                let data = { message: "No data found", responseCode: "306" }
                                callback(data, null)
                            }
                            connection.end();
                        }
                    });
                }
            });
        }
    } catch (err) {
        let data = { message: err.message, responseCode: "314" }
        callback(data, null)
    }
}

function prepareResponse(rows, filter, callback) {
    try {
        let totalUsage = 0
        let graphData = [];
        let axisData;
        let result = {};

        if (filter == 'Years') {
            for (let indx = 0; indx < rows.length; indx++) {
                totalUsage += rows[indx].Value;
                axisData = {};
                axisData.xAxisName = rows[indx].Date;
                axisData.yAxisValue = rows[indx].Value ? rows[indx].Value : 0;
                graphData.push(axisData);
                if (indx == rows.length - 1) {
                    result.TotalPowerUsage = totalUsage ? Math.round(totalUsage) : 0;
                    result.GraphData = graphData;
                    let data = { "response": result, "message": "Details Successfully Fetched", "status": true, "responseCode": "200" }
                    callback(null, data);
                }
            }
        } else if (filter == 'Months') {

            let arr = rows; //Get second query result

            for (let indx = 0; indx < arr.length; indx++) {

                totalUsage = totalUsage + arr[indx].MeterActiveEng;
                axisData = {};


                if (arr[indx].MONTH == '01') {
                    axisData.xAxisName = 'Jan';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '02') {
                    axisData.xAxisName = 'Feb';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '03') {
                    axisData.xAxisName = 'Mar';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '04') {
                    axisData.xAxisName = 'Apr';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '05') {
                    axisData.xAxisName = 'May';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '06') {
                    axisData.xAxisName = 'Jun';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '07') {
                    axisData.xAxisName = 'Jul';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '08') {
                    axisData.xAxisName = 'Aug';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '09') {
                    axisData.xAxisName = 'Sep';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '10') {
                    axisData.xAxisName = 'Oct';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '11') {
                    axisData.xAxisName = 'Nov';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }
                else if (arr[indx].MONTH == '12') {
                    axisData.xAxisName = 'Dec';
                    axisData.yAxisValue = arr[indx].MeterActiveEng;
                    graphData.push(axisData);
                }

                if (indx == arr.length - 1) {

                    result.TotalPowerUsage = Math.round(totalUsage);
                    result.GraphData = graphData;
                    let data = { "response": result, "message": "Details Successfully Fetched", "status": true, "responseCode": "200" }
                    callback(null, data);
                }
            }

        } else if (filter == 'Hours') {
            let hourlyData = rows;

            if (hourlyData.length) {
                for (let indx = 0; indx < hourlyData.length; indx++) {
                    
                    if(hourlyData[indx].MeterActiveEng == null)
                    hourlyData[indx].MeterActiveEng = 0;

                    totalUsage += hourlyData[indx].MeterActiveEng;
                    let hour = hourlyData[indx].datetime;
                    let hourValue = hourlyData[indx].Hourvalue;
                    // let timeconversion = new Date(hour);
                    // let timestamp = timeconversion.getTime() / 1000;
                    axisData = {};
                    axisData.xAxisName = hour.toString();
                    axisData.yAxisValue = hourlyData[indx].MeterActiveEng;
                    axisData.hourValue = formatHour(hourValue,0);
                    axisData.dateTimeString = hourlyData[indx].DateTimeString;

                    if(indx < 24) {
                        graphData.push(axisData);
                    }
                    if (indx == hourlyData.length - 1) {
                        result.TotalPowerUsage = Math.round(totalUsage);
                        result.GraphData = graphData;
                        let data = { "response": result, "message": "Details Successfully Fetched", "status": true, "responseCode": "200" }
                        callback(null, data);
                    }
                }
            } else {
                let data = { message: "No data found", responseCode: "306" }
                callback(data, null)
            }

        } else if (filter == 'Daily') {

            let result = {};
            let totalUsage = 0;
            for (let indx = 0; indx < rows.length; indx++) {
                if (rows[indx]['Day'] != null && rows[indx]['PowerConsumed'] != null) {

                    totalUsage += rows[indx].PowerConsumed;
                    let hourlyData = rows[indx].PowerConsumed;
                    axisData = {};
                    axisData.yAxisValue = hourlyData ? hourlyData : 0;

                    let afterSplitStart = rows[indx].Day.split("-");
                    let day = parseInt(afterSplitStart[2]);

                    if (rows[indx]['Dayname'] == 'Sunday') {
                        axisData.xAxisName = day + '(SU)';
                    } else if (rows[indx]['Dayname'] == 'Monday') {
                        axisData.xAxisName = day + '(MO)';
                    } else if (rows[indx]['Dayname'] == 'Tuesday') {
                        axisData.xAxisName = day + '(TU)';
                    } else if (rows[indx]['Dayname'] == 'Wednesday') {
                        axisData.xAxisName = day + '(WE)';
                    } else if (rows[indx]['Dayname'] == 'Thursday') {
                        axisData.xAxisName = day + '(TH)';
                    } else if (rows[indx]['Dayname'] == 'Friday') {
                        axisData.xAxisName = day + '(FR)';
                    } else if (rows[indx]['Dayname'] == 'Saturday') {
                        axisData.xAxisName = day + '(SA)';
                    } else {
                        axisData.xAxisName = day + '(N/A)';
                    }

                    graphData.push(axisData);
                }
                if (indx == rows.length - 1) {
                    result.TotalPowerUsage = totalUsage ? Math.round(totalUsage) : 0;
                    result.GraphData = graphData;
                    callback(null, result);
                }
            }
        }
    } catch (exp) {
        callback(exp, null);
    }
}

function getWeeklyData(data, callback) {

    try {
        let afterSplit = data.endDate.split("-");;

        let year = parseInt(afterSplit[0]);
        let month = parseInt(afterSplit[1]);
        let totalDays = parseInt(afterSplit[2]);

        let dateArr = [];
        let dateObj;

        let noOfWeeks = Math.floor(totalDays / 7);
        let noOfDays = totalDays % 7;

        let startNo = 1;
        let endNo;

        if (noOfWeeks) {
            for (let indx = noOfWeeks; indx > 0; indx--) {

                endNo = startNo + 6;

                dateObj = {};
                dateObj.startDate = year + '-' + month + '-' + startNo + ' ' + data.startTime;
                dateObj.endDate = year + '-' + month + '-' + endNo + ' ' + data.endTime;
                dateArr.push(dateObj);

                startNo = endNo + 1;

                if (indx == 1) {
                    if (noOfDays != 0) {
                        dateObj = {};
                        dateObj.startDate = dateObj.startDate = year + '-' + month + '-' + startNo + ' ' + data.startTime;
                        endNo = startNo + (noOfDays - 1);
                        dateObj.endDate = year + '-' + month + '-' + endNo + ' ' + data.endTime;
                        dateArr.push(dateObj);
                        callback(null, dateArr);
                    } else {
                        callback(null, dateArr);
                    }
                }
            }
        } else {

            dateObj = {};
            dateObj.startDate = dateObj.startDate = year + '-' + month + '-' + startNo + ' ' + data.startTime;
            endNo = startNo + (noOfDays - 1);
            dateObj.endDate = year + '-' + month + '-' + endNo + ' ' + data.endTime;
            dateArr.push(dateObj);
            callback(null, dateArr);

        }
    } catch (err) {
        callback({ message: "Something went wrong : " + err.name + " " + err.message, responseCode: "315" }, null);
    }
}

function formatHour(hour, value) {
    let hourNum = parseInt(hour) + value;
    if(hourNum > 9) {
        return hourNum.toString();
    } else {
        return "0"+hourNum;
    }
}

module.exports = {
    fetchMeterForConsumer: fetchMeterForConsumer
}
