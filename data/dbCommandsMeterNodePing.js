//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var sendToIOT = require('./sendToiot.js');
var insertError = require('./insertErrorLogsToDB.js');
var parser = require('../data/parser.js');
var shortid = require('shortid');
var async = require('async');

/* *************** DB Commands (System Management) SECTION 1 - EXPOSED METHODS ************************ */

/**
* @description - SMMeterNodePing Web Service
* @param meterID
* @param callback - callback function returns success or error response
* @return callback function
*/

function meterDeviceStatus(meterID, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            var meterCollection = db.delta_Meters;
            var hyperSproutCollection = db.delta_Hypersprouts;
            var jobsCollection = db.delta_Jobs;
            getMeterHSDetails(hyperSproutCollection, meterCollection, meterID, function (err, response) {
                if (err) {
                    callback(err, null);
                } else {
                    var data = {
                        "rev": response.Rev,
                        "messageid": Number(response.messageid) + 1,
                        "countrycode": response.CountryCode,
                        "regioncode": response.RegionCode,
                        "cellid": response.CellID,
                        "meterid": meterID,
                        "action": "NODE_PING",
                        "attribute": "METER_PING",
                        "Purpose": "MeterNodePing"
                    }
                    console.log('data', data);
                    parser.hexaCreation(data, function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var jobdoc = {
                                "JobID": shortid.generate(),
                                "SerialNumber": response.MeterSerialNumber,
                                "DeviceID": response.DeviceID,
                                "DeviceType": "Meter",
                                "JobName": "Node Ping",
                                "JobType": "Meter Node Ping",
                                "Status": "Pending",
                                "CreatedDateTimestamp": new Date(),
                                "MessageID": data.messageid,
                                "EndTime": null,
                                "NodePingStatus": "NotConnected"
                            };
                            updateMeterMessageIDAndCreateJob(jobsCollection, jobdoc, data.messageid, function (err, successResponse) {
                                sendToIOT.sendToIOT(result, response.DeviceID, function (err, success) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        console.log("Node Ping JobID :- " + jobdoc.JobID);
                                        setTimeout(function () {
                                            getMeterCurrentStatus(jobsCollection, meterID, data.messageid, jobdoc.JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                   callback(null, result);
                                                }
                                            });
                                        }, 5000);
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    });
}
/**
* @description - save Meter Device Status
* @param meterID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveMeterDeviceStatus(meterID, status, messageid, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            var meterCollection = db.delta_Meters;
            var jobsCollection = db.delta_Jobs;
            saveMeterStatus(meterCollection, jobsCollection, meterID, status, messageid, callback);
        }
    });
};


/* ********** DB Commands (System Management) SECTION 2 - NON-EXPOSED METHODS************************ */

/**
* @description - get Meter HS Details
* @param hyperSproutCollection
* @param meterCollection
* @param meterID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getMeterHSDetails(hyperSproutCollection, meterCollection, meterID, callback) {
    meterCollection.find({ 'MeterID': meterID }).toArray(function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result.length > 0) {
            console.log('result', result);
            if (result[0].Status === "NotRegistered") {
                callback(new Error("Meter Not Registered"), null);
            } else {
                hyperSproutCollection.find({ 'HypersproutID': result[0].HypersproutID }).toArray(function (err, res) {
                    if (err) {
                        callback(err, null);
                    } else if (res.length > 0) {
                        if (res[0].Status === "NotRegistered") {
                            callback(new Error("Meter Not Registered"), null);
                        } else {
                            var response = {
                                "DeviceID": res[0].DeviceID,
                                "Rev": res[0].ProtocolVersion,
                                "CountryCode": result[0].Meters_DeviceDetails.CountryCode,
                                "RegionCode": result[0].Meters_DeviceDetails.RegionCode,
                                "CellID": res[0].HypersproutID,
                                "MeterID": result[0].MeterID,
                                "MeterSerialNumber": result[0].MeterSerialNumber
                            }
                            if ((result[0].NodePingMessageID === undefined) || (result[0].NodePingMessageID === null) || (result[0].NodePingMessageID === 255))
                                response.messageid = 0;
                            else
                                response.messageid = result[0].NodePingMessageID;
                            callback(null, response)
                        }
                    }
                    else {
                        callback(new Error("Hypersprout not available"), null);
                    }
                });
            }
        } else {
            callback(new Error("Meter not available"), null);
        }
    });
}

/**
* @description - update Meter Message ID And Create Job
* @param jobsCollection
* @param jobJSON
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateMeterMessageIDAndCreateJob(jobsCollection, jobJSON, messageid, callback) {
    jobsCollection.insertOne(jobJSON, function (err, response) {
        callback(err, response);
    });
}

/**
* @description - get Meter Current Status
* @param jobsCollection
* @param meterID
* @param messageid
* @param jobID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getMeterCurrentStatus(jobsCollection, meterID, messageid, jobID, callback) {
    jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Completed", "EndTime": new Date } }, function (err, insertResponse) {
        jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "Status": "Completed", "EndTime": new Date } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, NodePingStatus: 1 } }, function (err, result) {
            if (err)
                callback(err, null);
            else
                callback(null, result.value.NodePingStatus)
        });
    });
}

/**
* @description - save Meter status
* @param meterCollection
* @param jobsCollection
* @param meterID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveMeterStatus(meterCollection, jobsCollection, meterID, status, messageid, callback) {
    try {
        meterCollection.find({ MeterID: meterID }, { MeterSerialNumber: 1 }).toArray(function (err, metData) {
            if (err)
                callback(err, null);
            else if (metData.length) {
                jobsCollection.updateMany({ MessageID: messageid, SerialNumber: metData[0].MeterSerialNumber, JobName: "Node Ping", "Status": "Pending", EndTime: null }, { $set: { NodePingStatus: status } }, callback);
            } else {
                callback("Invalid MeterID", null);
            }
        });
    }
    catch (exc) {
        callback("Something Went wrong!!", null);
    }
}

/**
 * Check meters connection for removing meters from transformer
 * @param {*} hyperSproutCollection 
 * @param {*} meterCollection 
 * @param {*} meterID 
 * @param {*} callback 
 */
function checkMultipleMeterConnection(meterUnGroupFetched,Meters,rev,MessageID,CountryCode,RegionCode,HypersproutID,DeviceID,callback) {
  
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            var jobsCollection = db.delta_Jobs;
            var jobDocuments = [];

            async.each(Meters, function (meter, callbackEach) {

                var data = {
                    "rev": rev,
                    "messageid": MessageID + 1,
                    "countrycode": CountryCode,
                    "regioncode": RegionCode,
                    "cellid": HypersproutID,
                    "meterid": meter.meterID,
                    "action": "NODE_PING",
                    "attribute": "METER_PING",
                    "Purpose": "MeterNodePing"
                };

                parser.hexaCreation(data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sendToIOT.sendToIOT(result, DeviceID, function (err, success) {
                            if (err) {
                                callback(err, null);
                            } else {
                                console.log(success)
                                var jobdoc = {
                                    "JobID": shortid.generate(),
                                    "SerialNumber": meter.meterSerialNo,
                                    "DeviceID": DeviceID,
                                    "DeviceType": "Meter",
                                    "JobName": "Node Ping",
                                    "JobType": "Meter Node Ping",
                                    "Status": "Pending",
                                    "CreatedDateTimestamp": new Date(),
                                    "MessageID": MessageID + 1,
                                    "EndTime": null,
                                    "NodePingStatus": "NotConnected"
                                };
                                jobDocuments.push(jobdoc);
                                meter.JobID = jobdoc.JobID;
                                    callbackEach();
                            }
                        });
                    }
                })
            }, function (err) {
                    createMultipleJobs(jobsCollection, jobDocuments, function (err, response) {
                        if (err) {
                            callback(err);
                        } else {
                            var connectedMeters = [];
                            var disconnectedMeters = [];
                            setTimeout(function () {
                                for (var i = 0; i < Meters.length; i++) {
                                    fetchMeterStatus(Meters[i], i, jobsCollection, function (err, result, i) {
                                        if (err)
                                            callback(err, null,null,null);
                                        else {
                                            Meters[i].Status = result.value.NodePingStatus;
                                            if(Meters[i].Status == 'Connected'){
                                                connectedMeters.push(Meters[i].meterID);
                                            }else{
                                                disconnectedMeters.push(Meters[i].meterID);
                                            }
                                            if (i == Meters.length - 1) {
                                                callback(null, Meters,connectedMeters,disconnectedMeters);
                                            }
                                        }
                                    });
                                }
                            }, 5000);
                        }
                    });
            })
        }
    });
}

function fetchMeterStatus(Meter,i,jobsCollection,callback){
    jobsCollection.findOneAndUpdate({ JobID: Meter.JobID}, { $set: { "Status": "Completed", "EndTime": new Date } }, { SerialNumber: 1, NodePingStatus: 1 } , function (err, result) {
        if(err){
            callback(err,null,i);
        }else{
            callback(null,result,i);
        }
    });
}

function createMultipleJobs(jobsCollection, jobDocuments, callback) {
    jobsCollection.insertMany(jobDocuments, function (err, response) {
        callback(err, response);
    });
}

/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    //System Management -> Meter Node Ping Web Service
    meterDeviceStatus: meterDeviceStatus,
    saveMeterDeviceStatus: saveMeterDeviceStatus,
    checkMultipleMeterConnection: checkMultipleMeterConnection
};