//REQUIRED PACKAGES AND FILES.
var async = require('async');
var dbCon = require('./dbConnection.js');
var moment = require('moment');
var insertError = require('./insertErrorLogsToDB.js');
const paginatedResults = require('../config/Helpers/Pagination')
let _ = require("lodash")


/* *************** DB Commands (Reports) SECTION 1 - EXPOSED METHODS ************************ */

/* ====================== Start : Added by Dhruv  ========================= */

/**
* @description - firmwareVersionReport Web Service
* @params - callback
* @return callback function
*/
function deviceFirmwareVersion(data, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var hypersproutsCollection = db.delta_Hypersprouts;
                var meterCollection = db.delta_Meters;
                var deltalinkCollection = db.delta_DeltaLink;
                firmwareVersionReport(data, hypersproutsCollection, meterCollection, deltalinkCollection, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
/**
* @description - CommunicationStatisticsReport Web Service
* @params - ifHyperhub, callback
* @return callback function
*/

function communicationStatistics(data, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var schedulerFlagsCollection = db.delta_SchedulerFlags;
                var hypersproutsCollection = db.delta_Hypersprouts;
                var schedulerLogsCollection = db.delta_SchedulerLogs;
                var transactionDataCollection = db.delta_Transaction_Data;
                communicationStatisticsReport(data, schedulerFlagsCollection, schedulerLogsCollection, hypersproutsCollection, transactionDataCollection, callback);
            }
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
/**
* @description - MeterCommunicationsStatisticsReport Web Service 
* @params - callback
* @return callback function
*/

function meterCommunicationStatistics(data,callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var meterCollection = db.delta_Meters;
                var hypersproutsCollection = db.delta_Hypersprouts;
                var schedulerFlagsCollection = db.delta_SchedulerFlags;
                var transactionDataCollection = db.delta_Transaction_Data;
                meterCommunicationStatisticsReport(data,meterCollection, hypersproutsCollection, schedulerFlagsCollection, transactionDataCollection, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}


/* ====================== Start : Added by Shweta  ========================= */


/**
* @description - new Account
* @params - startTime, endTime, callback
* @return callback function
*/
//New Account Report Web Service
function newAccount(startTime, endTime, data, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var meterCollection = db.delta_Meters;
                newAccountReport(meterCollection, startTime, endTime, data, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};


//Changed Data Report Web Service
// function changedData(callback) {
//     dbCon.getDb(function (err, db) {
//         if (err) {
//             callback(err, null);
//         } else {
//             var meterCollection = db.delta_Meters; 
//             changedDataReport(meterCollection, callback);
//         }
//     });
// };

/* =========================== End : Added by Shweta  ========================= */

/**
* @description - SystemAuditLogReport Web Service
* @params - startTime, endTime, callback
* @return callback function
*/
function systemAuditLog(startTime, endTime, data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var auditLogsCollection = db.delta_AuditLogs;
            systemAuditLogReport(auditLogsCollection, startTime, endTime, data, callback);
        }
    });
};

/**
* @description - SystemLogReport Web Service
* @params - startTime, endTime, callback
* @return callback function
*/
function systemLog(startTime, endTime, data, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var systemEventsCollection = db.delta_SystemEvents;
                var hypersproutsCollection = db.delta_Hypersprouts;
                var meterCollection = db.delta_Meters;
                systemLogReport(systemEventsCollection, hypersproutsCollection, meterCollection, startTime, endTime, data, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description - save audit Log
* @params - userID, description, callback
* @return callback function
*/
function saveauditLog(userID, description, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var auditLogsCollection = db.delta_AuditLogs;
            saveUserOperations(auditLogsCollection, userID, description, callback);
        }
    });
}


/* =========================== End : Added by Dhruv  ========================= */

/* ********** DB Commands (Reports) SECTION 2 - NON-EXPOSED METHODS************************ */

/* ======================= Start : Added by Dhruv  ======================= */
/**
* @description - firmware Version Report
* @params - hypersproutsCollection, meterCollection, callback
* @return callback function
*/
function firmwareVersionReport(data, hypersproutsCollection, meterCollection, deltalinkCollection, callback) {
    try {
        let condition;
        let collection;
        let msg;
        let query;

        if (!data.search || data.search == null || data.search == "null") {
            switch (data.DeviceType) {
                case "Meter": condition = { Status: "Registered" };
                    collection = meterCollection;
                    msg = "Registered Meter"
                    break;
                case "HyperSprout": condition = { Status: "Registered", IsHyperHub: false }
                    collection = hypersproutsCollection;
                    msg = "Registered Hypersprout"
                    break;
                case "HyperHub":
                    condition = { Status: "Registered", IsHyperHub: true }
                    collection = hypersproutsCollection;
                    msg = "Registered Hyperhub"
                    break;
                case "DeltaLink": condition = { Status: "Registered" };
                    collection = deltalinkCollection;
                    msg = "Registered Deltalink"
                    break;
                default:
                    return callback("Invalid Condition!!", null);
            }
        } else {
            switch (data.DeviceType) {
                case "Meter":
                    query = { MeterSerialNumber: { $regex: new RegExp(data.search, "i") } };
                    condition = { $and: [{ Status: "Registered" }, query] }
                    collection = meterCollection;
                    msg = "Registered Meter"
                    break;
                case "HyperSprout":
                    query = { HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } };
                    condition = { $and: [{ Status: "Registered", IsHyperHub: false }, query] }
                    collection = hypersproutsCollection;
                    msg = "Registered Hypersprout"
                    break;
                case "HyperHub":
                    query = { HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } };
                    condition = { $and: [{ Status: "Registered", IsHyperHub: true }, query] }
                    collection = hypersproutsCollection;
                    msg = "Registered Hyperhub"
                    break;
                case "DeltaLink":
                    query = { DeltalinkSerialNumber: { $regex: new RegExp(data.search, "i") } };
                    condition = { $and: [{ Status: "Registered" }, query] }
                    collection = deltalinkCollection;
                    msg = "Registered Deltalink"
                    break;
                default:
                    return callback("Invalid Condition!!", null);
            }
        }
        paginatedResults.paginatedResults(collection, condition, data, msg, function (err, Details) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, Details)
            }
        })


    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}
/**
* @description - Hyper Sprout Data Formation
* @params - hsDetails, callback
* @return callback function
*/
function hsDataFormation(hsDetails, callback) {
    try {
        var hsData = [];
        async.each(hsDetails,
            function (hsDetail, callbackEach) {
                if (hsDetail.hasOwnProperty('Hypersprout_FirmwareDetails')) {
                    var res1 = {
                        HypersproutSerialNumber: hsDetail.HypersproutSerialNumber,
                        BoardType: "iNC",
                        iNCHardwareVersion: hsDetail.Hypersprout_FirmwareDetails.iNCHardwareVersion,
                        iNCFirmwareVersion: hsDetail.Hypersprout_FirmwareDetails.iNCFirmwareVersion,
                        IsHyperHub: hsDetail.IsHyperHub
                    }
                    hsData.push(res1);
                    res1 = {
                        HypersproutSerialNumber: hsDetail.HypersproutSerialNumber,
                        BoardType: "iTM",
                        iTMHardwareVersion: hsDetail.Hypersprout_FirmwareDetails.iTMHardwareVersion,
                        iTMFirmwareVersion: hsDetail.Hypersprout_FirmwareDetails.iTMFirmwareVersion,
                        IsHyperHub: hsDetail.IsHyperHub
                    }
                    hsData.push(res1);
                } else {
                    hsData.push(hsDetail);
                }
                callbackEach(null, hsData);
            },
            function (err) {
                if (err)
                    callback(err, null);
                else
                    callback(null, hsData);
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}




/* ======================= Start : Added by Shweta  ======================= */
/**
* @description - new Account Report
* @params - meterCollection, startTime, endTime, callback
* @return callback function
*/
function newAccountReport(meterCollection, startTime, endTime, data, callback) {
    try {
        if (!data.search || data.search == null || data.search == "null") {
            let whereCondition = { "CreatedOn": { '$gte': new Date(startTime), '$lte': new Date(endTime) } }
            paginatedResults.paginatedResultsSort(meterCollection, whereCondition, data, "Meter", "CreatedOn", function (err, res) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, res)
                }
            })
        } else {
            let query = { MeterSerialNumber: { $regex: new RegExp(data.search, "i") } };
            let whereCondition = { $and: [{ "CreatedOn": { '$gte': new Date(startTime), '$lte': new Date(endTime) } }, query] }
            paginatedResults.paginatedResultsSort(meterCollection, whereCondition, data, "Meter", "CreatedOn", function (err, res) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, res)
                }
            })
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

// function changedDataReport(meterCollection, callback){
//     meterCollection.find({}).toArray(function(err,res){
//         if(err){
//             callback(err,null);
//         } else{
//             callback(null,res);
//         }
//     });
// };



/* ======================= End : Added by Shweta  ======================= */

/**
* @description - communication Statistics Report
* @params - ifHyperhub, schedulerFlagsCollection, schedulerLogsCollection, hypersproutsCollection, transactionDataCollection, callback
* @return callback function
*/

function communicationStatisticsReport(data, schedulerFlagsCollection, schedulerLogsCollection, hypersproutsCollection, transactionDataCollection, callback) {
    try {
        if (data.IfHyperhub) {
            condition = { Status: "Registered", IsHyperHub: true }
            collection = hypersproutsCollection;
            msg = "Registered Hyperhub"
        } else {
            condition = { Status: "Registered", IsHyperHub: false }
            collection = hypersproutsCollection;
            msg = "Registered Hypersprout"
        }
        paginatedResults.paginatedResults(collection, condition, data, msg, function (err, HypersproutData) {
            if (err) {
                callback(err, null)
            } else {
                schedulerFlagsCollection.find().toArray(function (err, schedulerFlagsData) {
                    if (err)
                        callback(err, null);
                    else
                        commStatistics(HypersproutData, data, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback);
                });
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}
/**
* @description - communication Statistics
* @params - hyperSproutDetails, ifHyperhub, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback
* @return callback function
*/
function commStatistics(hyperSproutDetails, data, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback) {
    try {
        var HyperSprout = Object.assign({}, hyperSproutDetails);
        HyperSprout.results = [];
        var communicationStatisticsResponse = HyperSprout;
        // var communicationStatisticsResponse = [];
        async.each(hyperSproutDetails.results,
            function (hyperSproutDetail, callbackEach) {
                commStats(hyperSproutDetail, data, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, function (err, result) {
                    if (err) {
                        callbackEach(err, null);
                    } else if (result !== null) {
                        communicationStatisticsResponse.results.push(result);
                        callbackEach(null, communicationStatisticsResponse);
                    } else {
                        callbackEach(null, communicationStatisticsResponse);
                    }
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else
                    callback(null, communicationStatisticsResponse);
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

/**
* @description - communication Statistics
* @params - hyperSproutDetails, ifHyperhub, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback
* @return callback function
*/
function commStatisticsFilter(schedulerLogsData, hypersproutsCollection, ifHyperhub, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback) {
    try {
        //return callback(null, hyperSproutDetails)
        var communicationStatisticsResponse = [];
        async.each(schedulerLogsData.results,
            function (schedulerLogsDetail, callbackEach) {
                commStatsFilter(schedulerLogsDetail, hypersproutsCollection, ifHyperhub, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, function (err, result) {
                    console.log("result", result)
                    if (err) {
                        callbackEach(err, null);
                    } else if (result !== null) {
                        communicationStatisticsResponse.push(result);
                        callbackEach(null, communicationStatisticsResponse);
                    } else {
                        callbackEach(null, communicationStatisticsResponse);
                    }
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else {
                    delete schedulerLogsData.results;
                    schedulerLogsData.results = communicationStatisticsResponse
                    callback(null, schedulerLogsData);

                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

/**
* @description - communication Stats
* @params - hyperSproutDetails, ifHyperhub, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback
* @return callback function
*/
function commStats(hyperSproutDetails, data, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback) {
    try {
        var deviceIndex = schedulerFlagsData.findIndex(function (item, i) {
            return item.DeviceID === hyperSproutDetails.DeviceID
        });
        var status;
        transactionDataCollection.find({ 'result.CellID': hyperSproutDetails.HypersproutID }).sort({ "_id": -1 }).limit(1).toArray(function (err, resp) {
            if (err) {
                callback(err, null);
            }
            else if (deviceIndex >= 0) {
                if (schedulerFlagsData[deviceIndex].Flag === 0)
                    status = "Completed";
                else if (schedulerFlagsData[deviceIndex].Flag < 2)
                    status = "Running";
                else
                    status = "Failed";
                if ((!data.ifHyperhub) && (resp.length > 0)) {
                    if (resp[0].result.Transformer.StatusTransformer === "CommonFault")
                        status = "Communication Fault";
                }
                var output = {
                    "SerialNumber": hyperSproutDetails.HypersproutSerialNumber
                }
                schedulerLogsCollection.find({ DeviceID: schedulerFlagsData[deviceIndex].DeviceID }).sort({ TimeStampResponse: -1 }).limit(1).toArray(function (err, response) {
                    if (err) {
                        callback(err, null);
                    } else if (response.length > 0 && response[0].TimeStampResponse) {
                        output.LastReadTime = response[0].TimeStampResponse;
                        output.Status = status;
                        callback(null, output);
                    } else {
                        output.LastReadTime = "NA";
                        output.Status = "NA";
                        callback(null, output);
                    }
                });
            } else
                callback(null, null)
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}


/**
* @description - communication Stats
* @params - hyperSproutDetails, ifHyperhub, schedulerFlagsData, schedulerLogsCollection, transactionDataCollection, callback
* @return callback function
*/
function commStatsFilter(schedulerLogsDetails, hypersproutsCollection, ifHyperhub, schedulerFlagsCollection, schedulerLogsCollection, transactionDataCollection, callback) {
    try {
        console.log("schedulerLogsDetails", schedulerLogsDetails.DeviceID)
        hypersproutsCollection.find({ "Status": "Registered", "DeviceID": schedulerLogsDetails.DeviceID, IsHyperHub: ifHyperhub }).toArray(function (err, hyperSproutDetails) {
            if (err)
                callback(err, null);
            else {
                console.log("hyperSproutDetails", hyperSproutDetails.length)
                if (hyperSproutDetails.length > 0) {
                    schedulerFlagsCollection.find({ "DeviceID": hyperSproutDetails.DeviceID }).toArray(function (err, schedulerFlagsData) {
                        if (err)
                            callback(err, null);
                        else {
                            if (schedulerFlagsData.length > 0) {
                                var status;
                                // transactionDataCollection.find({ $and: [{'result.CellID': hyperSproutDetails.HypersproutID}, {"result.Transformer.StatusTransformer":"CommonFault"}] }).sort({ DBTimestamp: -1 }).toArray(function (err, resp) {
                                //     console.log("resp", err)
                                //     if (err) {
                                //         callback(err, null);
                                //    } else{
                                // if (resp.length > 0) {
                                //     if (resp[0].result.Transformer.StatusTransformer === "CommonFault")
                                //         status = "Communication Fault";
                                // }
                                // else 
                                if (schedulerFlagsData[0].Flag === 0)
                                    status = "Completed";
                                else if (schedulerFlagsData[0].Flag < 2)
                                    status = "Running";
                                else
                                    status = "Failed";

                                var output = {
                                    "SerialNumber": hyperSproutDetails.HypersproutSerialNumber
                                }
                                schedulerLogsCollection.find({ DeviceID: hyperSproutDetails[0].DeviceID }).sort({ TimeStampResponse: -1 }).limit(1).toArray(function (err, response) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (response.length > 0 && response[0].TimeStampResponse) {
                                        output.LastReadTime = response[0].TimeStampResponse;
                                        output.Status = status;
                                        callback(null, output);
                                    } else {
                                        output.LastReadTime = "NA";
                                        output.Status = "NA";
                                        callback(null, output);
                                    }
                                });
                                // }

                                //  });
                            } else {
                                var output = {
                                    "SerialNumber": hyperSproutDetails.HypersproutSerialNumber,
                                    "LastReadTime": "NA",
                                    "Status": "NA"
                                }
                                callback(null, output);
                            }

                        }
                    });
                } else {
                    callback(null, null)
                }
            }
        })











        // var deviceIndex = schedulerFlagsData.findIndex(function (item, i) {
        //     return item.DeviceID === hyperSproutDetails.DeviceID
        // });
        // var status;
        // transactionDataCollection.find({ 'result.CellID': hyperSproutDetails.HypersproutID }).sort({ DBTimestamp: -1 }).limit(1).toArray(function (err, resp) {
        //     if (err) {
        //         callback(err, null);
        //     }
        //     else if (deviceIndex >= 0) {
        //         if (schedulerFlagsData[deviceIndex].Flag === 0)
        //             status = "Completed";
        //         else if (schedulerFlagsData[deviceIndex].Flag < 2)
        //             status = "Running";
        //         else
        //             status = "Failed";
        //         if ((!ifHyperhub) && (resp.length > 0)) {
        //             if (resp[0].result.Transformer.StatusTransformer === "CommonFault")
        //                 status = "Communication Fault";
        //         }
        //         var output = {
        //             "SerialNumber": hyperSproutDetails.HypersproutSerialNumber
        //         }
        //         schedulerLogsCollection.find({ DeviceID: schedulerFlagsData[deviceIndex].DeviceID }).sort({ TimeStampResponse: -1 }).limit(1).toArray(function (err, response) {
        //             if (err) {
        //                 callback(err, null);
        //             } else if (response.length > 0 && response[0].TimeStampResponse) {
        //                 output.LastReadTime = response[0].TimeStampResponse;
        //                 output.Status = status;
        //                 callback(null, output);
        //             } else {
        //                 output.LastReadTime = "NA";
        //                 output.Status = "NA";
        //                 callback(null, output);
        //             }
        //         });
        //     } else
        //         callback(null, null)
        // });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

/**
* @description - meter Communication Statistics Report
* @params - meterCollection, hypersproutsCollection, schedulerFlagsCollection, transactionDataCollection, callback
* @return callback function
*/
function meterCommunicationStatisticsReport(data, meterCollection, hypersproutsCollection, schedulerFlagsCollection, transactionDataCollection, callback) {
    try {
        let whereCondition = { "Status": "Registered" };
        paginatedResults.paginatedResults(meterCollection, whereCondition, data, "Meter", function (err, meterDetails) {
            var Meters = Object.assign({}, meterDetails);
            Meters.results = [];
            var communicationStatisticsResponse = Meters;
            if (err) {
                callback(err, null);
            } else {
                async.each(meterDetails.results,
                    function (meterDetail, callback1) {
                        meterCommStats(meterDetail, hypersproutsCollection, schedulerFlagsCollection, transactionDataCollection, function (err, result) {
                            if (err) {
                                callback1(err, null);
                            } else if (result !== null) {
                                communicationStatisticsResponse.results.push(result);
                                callback1(null, communicationStatisticsResponse);
                            } else {
                                callback1(null, communicationStatisticsResponse);

                            }

                        });
                    },
                    function (err) {
                        if (err)
                            callback(err, null);
                        else {
                            callback(null, communicationStatisticsResponse);

                        }
                    });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}


/**
* @description - meter Communication Stats
* @params - meterDetails, hypersproutsCollection, schedulerFlagsCollection, transactionDataCollection, callback
* @return callback function
*/
function meterCommStats(meterDetails, hypersproutsCollection, schedulerFlagsCollection, transactionDataCollection, callback) {
    try {
        var status;
        var output = {
            "SerialNumber": meterDetails.MeterSerialNumber
        };
        let query = { 'result.meters.DeviceID': meterDetails.MeterID };
        transactionDataCollection.find(query, { 'result.CellID': 1, 'result.meters.$': 1, 'DBTimestamp': 1 }).sort({ "_id": -1 }).limit(1).toArray(function (err, response) {
            if (err) {
                callback(err, null);
            } else if (response.length > 0) {
                output.LastReadTime = response[0].DBTimestamp;
                if (response[0].result.meters[0].Status === "CommonFault") {
                    output.Status = "Communication Fault";
                    callback(null, output);
                }
                else if (response[0].result.meters[0].Status != "Connected") {
                    if (response[0].result.meters[0].Status == "Data not requested by Admin") {
                        output.Status = "NA"
                        callback(null, output);
                    } else {
                        output.Status = response[0].result.meters[0].Status;
                        callback(null, output);
                    }
                }
                else {
                    output.Status = response[0].result.meters[0].Status;
                    if (response[0].result.CellID) {
                        hypersproutsCollection.find({ HypersproutID: response[0].result.CellID }).toArray(function (err, hsData) {
                            if (err)
                                callback(err, null);
                            else if (hsData.length > 0 && hsData[0].DeviceID) {
                                schedulerFlagsCollection.find({ DeviceID: hsData[0].DeviceID }).toArray(function (err, flagsData) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        if (!flagsData) {
                                            output.Status = "NA";
                                            callback(null, output);
                                        }
                                        else if (flagsData.length > 0 && flagsData[0].Flag) {
                                            if ((flagsData[0].Flag > 0) && (flagsData[0].Flag < 3)) {
                                                output.Status = "Running";
                                            }
                                            else if (flagsData[0].Flag >= 3) {
                                                output.Status = "Failed";
                                            }
                                            callback(null, output);
                                        } else {
                                            output.Status = "NA";
                                            callback(null, output);

                                        }
                                    }

                                });

                            } else {
                                output.Status = "NA";
                                callback(null, output);
                            }
                        });
                    } else {
                        output.Status = "NA";
                        callback(null, output);
                    }
                }
            } else {
                output.LastReadTime = "NA";
                output.Status = "NA";
                callback(null, output);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}
/**
* @description - system Audit Log Report
* @params - auditLogsCollection, startTime, endTime, callback
* @return callback function
*/
function systemAuditLogReport(auditLogsCollection, startTime, endTime, data, callback) {
    try {
        if (data.filter != undefined || data.filter != null) {
            data.filter = (data.filter == 'true') ? true : false;
            let query = { SuperUser: true };
            let whereCondition = { $and: [{ EventDateTime: { $gte: new Date(startTime) } }, { EventDateTime: { $lte: new Date(endTime) } }, query] }
            paginatedResults.paginatedResultsSort(auditLogsCollection, whereCondition, data, "User Operations", "EventDateTime", function (err, auditLogs) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, auditLogs)
                }
            })
        } else {
            let whereCondition = { $and: [{ EventDateTime: { $gte: new Date(startTime) } }, { EventDateTime: { $lte: new Date(endTime) } }] }
            paginatedResults.paginatedResultsSort(auditLogsCollection, whereCondition, data, "User Operations", "EventDateTime", function (err, auditLogs) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, auditLogs)
                }
            })
        }


    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}
/**
* @description - system Log Report
* @params - systemEventsCollection, hypersproutsCollection, meterCollection, startTime, endTime, callback
* @return callback function
*/
function systemLogReport(systemEventsCollection, hypersproutsCollection, meterCollection, startTime, endTime, data, callback) {
    try {
        if (data.search != undefined || data.search != null) {
            let HypersproutIDs = [];
            let MeterIDs = [];
            let query = { HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } };
            hypersproutsCollection.find(query).toArray(function (err, HSData) {
                if (err) {
                    callback(null, err)
                } else {
                    query = { MeterSerialNumber: { $regex: new RegExp(data.search, "i") } };
                    meterCollection.find(query).toArray(function (err, meterData) {
                        if (err) {
                            callback(null, err)
                        } else if (meterData.length == 0 && HSData.length > 0) {
                            for (var i in HSData) {
                                if (HSData.hasOwnProperty(i)) {
                                    let HypersproutID = HSData[i].HypersproutID;
                                    HypersproutIDs.push(HypersproutID);
                                }
                            }
                            // let whereCondition = { $and: [{ Action: {$in:["ON_DEMAND_METER_DATA", "METER_DOWNLOAD","METER_PING", "ACTION_FOR_DEVICE","EVENTS_ALARM_DATA","METER_FIRMWARE_UPGRADE","METER_EVENTS_ALARM_DATA","METER_MANAGERIAL_DATA", "METER_REGISTERATION","METER_TRANSACTION_DATA" ]} }, { DBTimestamp: { $gte: new Date(startTime) } }, { DBTimestamp: { $lte: new Date(endTime) } }] }
                            let whereCondition = { $and: [{ CellID: { $in: HypersproutIDs } }, { DBTimestamp: { $gte: new Date(startTime) } }, { DBTimestamp: { $lte: new Date(endTime) } }] }
                            paginatedResults.paginatedResultsSortSystemLog(systemEventsCollection, whereCondition, data, "System Events", "DBTimestamp", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    systemLogsSearch(res, hypersproutsCollection, meterCollection, data, callback);

                                }
                            })

                        } else if (meterData.length != 0 && HSData.length == 0) {
                            if (meterData.length > 0) {
                                for (var i in meterData) {
                                    if (meterData.hasOwnProperty(i)) {
                                        let MeterID = meterData[i].MeterID;
                                        MeterIDs.push(MeterID);
                                    }
                                }
                            }
                            Flag = 1;
                            let whereCondition = { $and: [{ MeterID: { $in: MeterIDs } }, { DBTimestamp: { $gte: new Date(startTime) } }, { DBTimestamp: { $lte: new Date(endTime) } }] }
                            paginatedResults.paginatedResultsSortSystemLog(systemEventsCollection, whereCondition, data, "System Events", "DBTimestamp", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    systemLogsSearch(res, hypersproutsCollection, meterCollection, data, callback);

                                }
                            })

                        } else if (meterData.length != 0 && HSData.length != 0) {
                            if (HSData.length > 0) {
                                for (var i in HSData) {
                                    if (HSData.hasOwnProperty(i)) {
                                        let HypersproutID = HSData[i].HypersproutID;
                                        HypersproutIDs.push(HypersproutID);
                                    }
                                }
                            }
                            if (meterData.length > 0) {
                                for (var i in meterData) {
                                    if (meterData.hasOwnProperty(i)) {
                                        let MeterID = meterData[i].MeterID;
                                        MeterIDs.push(MeterID);
                                    }
                                }
                            }
                            let whereCondition = { $or: [{ $and: [{ CellID: { $in: HypersproutIDs } }, { DBTimestamp: { $gte: new Date(startTime) } }, { DBTimestamp: { $lte: new Date(endTime) } }] }, { $and: [{ MeterID: { $in: MeterIDs } }, { DBTimestamp: { $gte: new Date(startTime) } }, { DBTimestamp: { $lte: new Date(endTime) } }] }] }
                            paginatedResults.paginatedResultsSortSystemLog(systemEventsCollection, whereCondition, data, "System Events", "DBTimestamp", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    systemLogsSearch(res, hypersproutsCollection, meterCollection, data, callback);

                                }
                            })
                        }
                        else {
                            callback("No System Events in this duration", null)
                        }

                    })
                }
            })
        } else {
            let whereCondition = { $and: [{ DBTimestamp: { $gte: new Date(startTime) } }, { DBTimestamp: { $lte: new Date(endTime) } }] }
            paginatedResults.paginatedResultsSortSystemLog(systemEventsCollection, whereCondition, data, "System Events", "DBTimestamp", function (err, res) {
                if (err) {
                    callback(err, null)
                } else {
                    systemLogs(res, hypersproutsCollection, meterCollection, data, callback);
                }
            })
        }

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}
/**
* @description - system Logs
* @params - systemLogDetails, HSData, meterData, callback
* @return callback function
*/
// function systemLogs(systemLogDetails, HSData, meterData, callback) {
//     try {
//         var systemLogReportArr = []
//         async.each(systemLogDetails.results,
//             function (systemLogDetail, callback) {
//                 systemLogsReport(systemLogDetail, HSData, meterData, function (err, result) {
//                     if (err) {
//                         callback(err, null);
//                     } else if (result != null) {
//                         systemLogReportArr.push(result);
//                         callback(null, systemLogReportArr);
//                     }
//                 });
//             },
//             function (err) {
//                 if (err)
//                     callback(err, null);
//                 else{
//                     delete systemLogDetails.results;
//                     systemLogDetails.results = systemLogReportArr;
//                     callback(null, systemLogDetails);

//                 }
//             });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// }


/**
* @description - system Logs
* @params - systemLogDetails, HSData, meterData, callback
* @return callback function
*/
// function systemLogs(systemLogDetails, HSData, meterData, callback) {
//     try {
//         var systemLogReportArr = []
//         async.each(systemLogDetails.results,
//             function (systemLogDetail, callback) {
//                 systemLogsReport(systemLogDetail, HSData, meterData, function (err, result) {
//                     if (err) {
//                         callback(err, null);
//                     } else if (result != null) {
//                         systemLogReportArr.push(result);
//                         callback(null, systemLogReportArr);
//                     }
//                 });
//             },
//             function (err) {
//                 if (err)
//                     callback(err, null);
//                 else{
//                     delete systemLogDetails.results;
//                     systemLogDetails.results = systemLogReportArr;
//                     callback(null, systemLogDetails);

//                 }
//             });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// }

function systemLogs(systemLogDetails, hypersproutsCollection, meterCollection, data, callback) {
    try {
        var systemLogReportArr = []
        async.each(systemLogDetails.results,
            function (systemLogDetail, callback) {
                systemLogsReport(systemLogDetail, hypersproutsCollection, meterCollection, data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else if (result != null) {
                        systemLogReportArr.push(result);
                        callback(null, systemLogReportArr);
                    }
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else {
                    delete systemLogDetails.results;
                    let sort_data = _.sortBy(systemLogReportArr, "EventDateTime").reverse()
                    systemLogDetails.results = sort_data;
                    //    systemLogDetails.results = systemLogReportArr;
                    callback(null, systemLogDetails);

                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

/**
* @description - system Logs
* @params - systemLogDetails, HSData, meterData, callback
* @return callback function
*/
function systemLogsSearch(systemLogDetails, hypersproutsCollection, meterCollection, data, callback) {
    try {
        var systemLogReportArr = []
        async.each(systemLogDetails.results,
            function (systemLogDetail, callback) {
                systemLogsReportSearch(systemLogDetail, hypersproutsCollection, meterCollection, data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else if (result != null) {
                        systemLogReportArr.push(result);
                        callback(null, systemLogReportArr);
                    } else {
                        callback()
                    }
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else {
                    delete systemLogDetails.results;
                    //systemLogDetails.results = systemLogReportArr;
                    let sort_data = _.sortBy(systemLogReportArr, "EventDateTime").reverse()
                    systemLogDetails.results = sort_data;
                    callback(null, systemLogDetails);

                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

/**
* @description - system Logs Report
* @params - systemLogDetails, hypersproutsData, meterData, callback
* @return callback function
*/
function systemLogsReport(systemLogDetails, hypersproutsCollection, meterCollection, data, callback) {
    var sysLog;
    sysLog = {
        "EventDateTime": systemLogDetails.DBTimestamp,
        "Action": systemLogDetails.Action,
        "Attribute": systemLogDetails.Attribute,
    }
    let query = { HypersproutID: systemLogDetails.CellID };
    hypersproutsCollection.find(query).toArray(function (err, HSData) {
        if (err) {
            callback(null, err)
        } else {
            query = { MeterID: systemLogDetails.MeterID };
            meterCollection.find(query).toArray(function (err, MMData) {
                if (err) {
                    callback(null, err)
                } else {
                    if (HSData.length > 0) {
                        if (MMData.length > 0) {
                            sysLog.HypersproutSerialNumber = HSData[0].HypersproutSerialNumber;
                            sysLog.MeterSerialNumber = MMData[0].MeterSerialNumber;

                        } else {
                            sysLog.HypersproutSerialNumber = HSData[0].HypersproutSerialNumber;
                            sysLog.MeterSerialNumber = "";

                        }
                        callback(null, sysLog);

                    } else if (MMData.length > 0) {
                        sysLog.HypersproutSerialNumber = "";
                        sysLog.MeterSerialNumber = MMData[0].MeterSerialNumber;
                        callback(null, sysLog);
                    } else {
                        sysLog.HypersproutSerialNumber = "";
                        sysLog.MeterSerialNumber == "";
                        callback(null, sysLog);

                    }
                    //  callback(null, sysLog);

                }
            })

        }
    })
}


/**
* @description - system Logs Report
* @params - systemLogDetails, hypersproutsData, meterData, callback
* @return callback function
*/
function systemLogsReportSearch(systemLogDetails, hypersproutsCollection, meterCollection, data, callback) {
    var sysLog;
    sysLog = {
        "EventDateTime": systemLogDetails.DBTimestamp,
        "Action": systemLogDetails.Action,
        "Attribute": systemLogDetails.Attribute,
    }
    // let query = { $and: [{ HypersproutID: systemLogDetails.CellID, HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } }] };
    let query = { HypersproutID: systemLogDetails.CellID };

    hypersproutsCollection.find(query).toArray(function (err, HSData) {
        if (err) {
            callback(null, err)
        } else {
            // query = { $and: [{ MeterID: systemLogDetails.MeterID, MeterSerialNumber: { $regex: new RegExp(data.search, "i") } }] };
            query = { MeterID: systemLogDetails.MeterID };

            meterCollection.find(query).toArray(function (err, MMData) {
                if (err) {
                    callback(null, err)
                } else {
                    if (HSData.length > 0) {
                        if (MMData.length > 0) {
                            sysLog.HypersproutSerialNumber = HSData[0].HypersproutSerialNumber;
                            sysLog.MeterSerialNumber = MMData[0].MeterSerialNumber;

                        } else {
                            sysLog.HypersproutSerialNumber = HSData[0].HypersproutSerialNumber;
                            sysLog.MeterSerialNumber = "";

                        }
                        callback(null, sysLog);


                    } else if (MMData.length > 0) {
                        sysLog.HypersproutSerialNumber = "";
                        sysLog.MeterSerialNumber = MMData[0].MeterSerialNumber;
                        callback(null, sysLog);
                    }
                    else {
                        callback()
                    }
                }
            })


        }
    })
}
/**
* @description - save User Operations
* @params - auditLogsCollection, userID, description, callback
* @return callback function
*/
function saveUserOperations(auditLogsCollection, userID, description, callback) {
    var doc = {
        "UserID": userID,
        "EventDateTime": new Date(),
        "EventDescription": description
    }
    auditLogsCollection.insertOne(doc, function (err, result) {
        if (err) {
            insertError.putErrorDetails(err, callback);
        } else {
            callback(null, "Inserted");
        }
    });
}

/* ========================= End : Added by Dhruv  ========================== */

/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by Dhruv  ============== */

    //DeviceFirmwareVersionReport Web Service
    deviceFirmwareVersion: deviceFirmwareVersion,

    //CommunicationStatisticsReport Web Service
    communicationStatistics: communicationStatistics,

    //SystemAuditLogReport Web Service
    systemAuditLog: systemAuditLog,

    //SystemLogReport Web Service
    systemLog: systemLog,

    //Save Audit Logs
    saveauditLog: saveauditLog,

    //MeterCommunicationsStatisticsReport Web Service
    meterCommunicationStatistics: meterCommunicationStatistics,

    /* ================ End : Added by Dhruv  =================== */

    /* ============== Start : Added by Shweta  ============== */

    //New Account Report Web Service
    newAccount: newAccount,

    //Changed Account Report Web Service
    // changedData: changedData

    /* ================ End : Added by Shweta  =================== */

};
