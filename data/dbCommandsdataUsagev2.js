//REQUIRED PACKAGES AND FILES.
var async = require('async');
var insertError = require('./insertErrorLogsToDB.js');
var dbMysqlCon = require('./mySqlConnection.js');
var dbMongoCon = require('./dbConnection.js');
const sendToIOT = require('./sendToiot.js');
const parser = require('../data/parser.js');
const paginatedResults = require('../config/Helpers/Pagination');
const shortid = require('shortid');


/**
* @description - For the Webservice - MobileApp - fetchClientsdataUsage     Desc - get data total usage details IN MONGODB   
* @params data i.e consumerID, Startime, endtime, page, limit, callback
* @return callback function
*/
function fetchClientsdataUsage(data, Timezone, callback) {
    dbMongoCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            fetchClientsdataUsageFromMongoDB(db.delta_Meters, db.delta_User, db.delta_DeltaLink, data, Timezone, callback);
    });
};



/**
* @description -  get Total Data Usage by client
* @param , meterCollection, userCollection, deltalinkCollection, data i.e  consumerID, Startime, endtime, page, limit,, callback
* @return callback function
*/

function fetchClientsdataUsageFromMongoDB(meterCollection, userCollection, deltalinkCollection, data, Timezone, callback) {
    try {

        meterCollection.find({ $and: [{ "Meters_Billing.MeterConsumerNumber": data.consumerID }] }).toArray(function (err, consumer) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                callback(data, null);
            }
            else {
                if (consumer.length > 0) {
                    userCollection.find({ $and: [{ UserID: data.consumerID }, { "UserType": "Consumer" }] }).toArray(function (err, res) {
                        if (err) {
                            data = { message: "Database error occured", responseCode: "300" }
                            return callback(data, null);
                        }
                        else {
                            if (res.length == 0) {
                                data = { message: "ConsumerID not registered", responseCode: "325" }
                                callback(data, null);
                            } else {
                                deltalinkCollection.find({ $and: [{ MeterID: consumer[0].MeterID }, { "IsMaster": true }] }).toArray(function (err, res) {
                                    if (err) {
                                        data = { message: "Database error occured", responseCode: "300" }
                                        callback(data, null);
                                    }
                                    else {
                                        if (res.length) {
                                            let start = `"${convertIntoUTC(data.startTime)}"`;
                                            let end = `"${convertIntoUTC(data.endTime)}"`;
                                            start = start.replace("T", " ");
                                            end = end.replace("T", " ");
                                            start = start.replace("Z", "");
                                            end = end.replace("Z", "");
                                            // let query = `SET @StartDate:=${start}; 
                                            //         SET @EndDate:=${end}; 
                                            //          SELECT  Deltalink_SerialNumber, User_Mac_Id , User_Hostname, sum(user_Total) 
                                            //          FROM deltamart.deltalink_clients_hourly 
                                            //          where ReadTimestamp between @StartDate and @EndDate  and Deltalink_SerialNumber = '${res[0].DeltalinkSerialNumber}' and DataType = 'User'
                                            //          group by User_Mac_Id , User_Hostname  order by sum(user_Total)  desc `
                                            //  console.log(query)
                                            //Query to ignore zero values
                                            //let query = `SET @StartDate:="${data.startTime}";SET @EndDate:="${data.endTime}"; SELECT Deltalink_SerialNumber, User_Mac_Id , User_Hostname, sum(user_Total) FROM deltamart.deltalink_clients_hourly where CONVERT_TZ(ReadTimestamp,"+00:00","`+ Timezone +`") >= @StartDate and CONVERT_TZ(ReadTimestamp,"+00:00","`+ Timezone +`") < @EndDate and Deltalink_SerialNumber =  '${res[0].DeltalinkSerialNumber}' and DataType = 'User' group by User_Mac_Id , User_Hostname having sum(user_Total) > 0 order by sum(user_Total) desc`;
                                            let query = `SET @StartDate:="${data.startTime}";SET @EndDate:="${data.endTime}";select Deltalink_SerialNumber, User_Mac_Id,
                                            case when (select count(User_Hostname) from deltamart.deltalink_clients_hourly where Deltalink_SerialNumber =  '${res[0].DeltalinkSerialNumber}' and User_Mac_Id = t1.User_Mac_Id and User_Hostname not in ('','*') and DataType = 'User') =0 then ''
                                            else (select distinct User_Hostname from deltamart.deltalink_clients_hourly where Deltalink_SerialNumber =  '${res[0].DeltalinkSerialNumber}' and User_Hostname not in ('','*') and DataType = 'User' and User_Mac_Id=t1.User_Mac_Id) end as User_Hostname,
                                                sum_user_Total ,ReadTimestamp
                                            from (
                                            SELECT Deltalink_SerialNumber, User_Mac_Id,User_Hostname
                                            , sum(user_Total) as sum_user_Total ,ReadTimestamp
                                            FROM deltamart.deltalink_clients_hourly
                                            where CONVERT_TZ(ReadTimestamp,"+00:00","`+ Timezone +`") >= @StartDate and CONVERT_TZ(ReadTimestamp,"+00:00","`+ Timezone +`") < @EndDate
                                            and Deltalink_SerialNumber =  '${res[0].DeltalinkSerialNumber}'
                                            and DataType = 'User'
                                            group by User_Mac_Id , User_Hostname having sum(user_Total) > 0
                                            )t1
                                             group by User_Mac_Id
                                            order by sum_user_Total desc`;
                                            // let countQuery = `SET @StartDate:=${start}; 
                                            //          SET @EndDate:=${end}; 
                                            //           SELECT count(*) FROM (
                                            //           SELECT  User_Mac_Id , User_Hostname, sum(user_Total) 
                                            //           FROM deltamart.deltalink_clients_hourly 
                                            //           where ReadTimestamp between @StartDate and @EndDate and Deltalink_SerialNumber = '${res[0].DeltalinkSerialNumber}' and DataType = 'User'
                                            //           group by User_Mac_Id , User_Hostname 
                                            //             ) cnt ;`
                                            let countQuery = `SET @StartDate:="${data.startTime}"; SET @EndDate:="${data.endTime}"; select count(*) from ( SELECT User_Mac_Id , User_Hostname, sum(user_Total) 
                                        FROM deltamart.deltalink_clients_hourly where CONVERT_TZ(ReadTimestamp,"+00:00","`+ Timezone +`") >= @StartDate and CONVERT_TZ(ReadTimestamp,"+00:00","`+ Timezone +`") < @EndDate and Deltalink_SerialNumber = '${res[0].DeltalinkSerialNumber}' and DataType = 'User' group by User_Mac_Id , User_Hostname having sum(user_Total) > 0 ) count`;

                                        console.log(query);

                                            paginatedResults.paginatedResultsMySQLDataUsage(query, countQuery, "Data Usage by Client", data, function (err, Details) {
                                                if (err) {
                                                    data = { message: err, responseCode: "326" }
                                                    callback(data, null)
                                                } else {
                                                    if (Details.results[2].length > 0) {
                                                        let results = [];
                                                        async.each(Details.results[2], function (Detail, callbackEach) {
                                                            let details = { "DeltalinkSerialNumber": Detail.Deltalink_SerialNumber, "UserHost": Detail["User_Hostname"], "UserMacID": Detail["User_Mac_Id"], "TotalDataUsed": Detail["sum_user_Total"] }
                                                            results.push(details)
                                                            callbackEach();

                                                        }, function (err, result) {
                                                            delete Details.results[0]
                                                            delete Details.results[1]
                                                            Details.results = results;
                                                            data = { response: Details, message: "Data Used By Clients Successfully Fetched", responseCode: "200" }
                                                            callback(null, data)

                                                        })
                                                    }
                                                    else {
                                                        data = { message: "Data Usage by Client details not available in the system", responseCode: "326" }
                                                        callback(data, null)
                                                    }


                                                }
                                            })
                                        } else {
                                            data = { message: "DeltaLinkID not found", responseCode: "313" }
                                            callback(data, null);
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else {
                    data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                    callback(data, null);
                }
            }
        })

    } catch (e) {
        callback({ message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" }, null)
    }
}




function convertIntoUTC(epoctime) {
    epoctime = parseInt(epoctime)
    var myDate = new Date(epoctime * 1000);
    console.log("UTC Time " + myDate.toISOString());
    console.log("Local Time " + myDate.toLocaleString());
    myDate = myDate.toISOString();
    return myDate;
}

module.exports = {
    fetchClientsdataUsage: fetchClientsdataUsage
}
