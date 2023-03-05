var dbCon = require('../../data/dbConnection.js');

function getMongoDBStats(startTime, endTime, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            getMongoDBStatistics(db.delta_DBStatistics, db.delta_Errorlogs, startTime, endTime, callback);
        }
    });
};

function getMongoDBStatistics(dbStatsCollection, collectionError, startTime, endTime, callback) {
    var dbStats = [];
    var Start = startTime;
    if (startTime < endTime) {
        var option = { "limit": 1, "sort": "localTime" }
        dbStatsCollection.find(
            { "localTime": { $gte: new Date(startTime) } }, { "opcounters": 1, "wiredTiger.transaction": 1, localTime: 1, _id: 0 }).sort({ localTime: 1 }).limit(1).toArray(function (err, res) {

                if (err) {
                    callback(err, null, null);
                } else {
                    if (res.length === 0) {
                        //"No User Operations in this duration !!"
                        callback(null, res, res);
                    } else {
                        var startValInsert;
                        var startValUpdate;
                        var startValCommand;
                        var startTime;
                        var startTransactionsCommited;
                        if (res != null) {
                            // for (var i in res) {
                            //     if (res.hasOwnProperty(i)) {
                                    startTime = res[0].localTime;
                                    startValInsert = res[0].opcounters.insert;
                                    startValUpdate = res[0].opcounters.update;
                                    startValCommand = res[0].opcounters.command;
                                    //  supported for mongo cluster setup with version +3.6.3
                                    if (res[0].wiredTiger && res[0].wiredTiger.transaction && res[0].wiredTiger.transaction["transactions committed"]) {
                                        startTransactionsCommited = res[0].wiredTiger.transaction["transactions committed"];
                                    } else {
                                        startTransactionsCommited = "NULL";
                                    }
                            //     }
                            // }
                        }
                        dbStatsCollection.find(
                            { localTime: { $lte: new Date(endTime) } }, { "opcounters": 1, "wiredTiger.transaction": 1, localTime: 1, _id: 0 }).sort({ localTime: -1 }).limit(1).toArray(function (err, result) {
                                if (err) {
                                    callback(err, null, null);
                                } else {
                                    if (result.length === 0) {
                                        //"No User Operations in this duration !!"
                                        callback(null, result);
                                    } else {
                                        var endValInsert;
                                        var endValUpdate;
                                        var endValCommand;
                                        var endTime;
                                        var endTransactionsCommited;
                                                endTime = result[0].localTime;
                                                endValInsert = result[0].opcounters.insert;
                                                endValUpdate = result[0].opcounters.update;
                                                endValCommand = result[0].opcounters.command;
                                                //  supported for mongo cluster setup with version +3.6.3
                                                if (result[0].wiredTiger && result[0].wiredTiger.transaction && result[0].wiredTiger.transaction["transactions committed"]) {
                                                    endTransactionsCommited = result[0].wiredTiger.transaction["transactions committed"];
                                                } else {
                                                    endTransactionsCommited = "NULL";
                                         
                                        }
                                        var finalValInsert = endValInsert - startValInsert;
                                        var finalValUpdate = endValUpdate - startValUpdate;
                                        var finalValCommand = endValCommand - startValCommand;
                                        var finalValTransactionsCommited = endTransactionsCommited - startTransactionsCommited;
                                        //If DB Reset happend
                                        if (finalValInsert < 0)
                                            finalValInsert = endValInsert;
                                        if (finalValUpdate < 0)
                                            finalValUpdate = endValUpdate;
                                        if (finalValCommand < 0)
                                            finalValCommand = endValCommand;
                                        if (finalValTransactionsCommited < 0)
                                            finalValTransactionsCommited = endTransactionsCommited;
                                        var secondsDiff = (endTime - startTime) / 1000;
                                        var finalValTransactions = finalValTransactionsCommited / secondsDiff;
                                        dbStats.push(finalValInsert);
                                        dbStats.push(finalValUpdate);
                                        dbStats.push(finalValCommand);
                                        dbStats.push(finalValTransactions);
                                        collectionError.find({ $and: [{ "errorTimestamp": { $gte: new Date(Start) } }, { "errorTimestamp": { $lte: new Date(endTime) } }] }, { writeError: 1, _id: 0, errorTimestamp: 1 }).sort({ "errorTimestamp": 1 }).toArray(function (err, res_error) {
                                            if (err) {
                                                callback(err, null, null);
                                            } else {
                                                if (res_error.length === 0) {
                                                    callback(null, dbStats, null);
                                                } else {
                                                    callback(null, dbStats, res_error);
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                     }
                }
            });
     }
    else {
        callback(new Error("Start Time cann't be greater than End Time"), null);
    }
}

module.exports = {
    getMongoDBStats: getMongoDBStats
};
