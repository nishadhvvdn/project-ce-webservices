//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var sendToIOT = require('./sendToiot.js');
var insertError = require('./insertErrorLogsToDB.js');
var parser = require('../data/parser.js');
var shortid = require('shortid');
const async = require('async');

/* *************** DB Commands (System Management) SECTION 1 - EXPOSED METHODS ************************ */

/**
* @description - SMDeltalinkNodePing Web Service
* @param deltalinkID
* @param callback - callback function returns success or error response
* @return callback function
*/

function deltalinkDeviceStatus(deltalinkID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                return callback(err, null);
            } else {
                var deltalinkCollection = db.delta_DeltaLink;
                var meterCollection = db.delta_Meters;
                var hyperSproutCollection = db.delta_Hypersprouts;
                var jobsCollection = db.delta_Jobs;
                getDeltalinkHSDetails(hyperSproutCollection, meterCollection, deltalinkCollection, deltalinkID, function (err, response) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var data = {
                            "rev": response.Rev,
                            "messageid": Number(response.messageid) + 1,
                            "countrycode": response.CountryCode,
                            "regioncode": response.RegionCode,
                            "cellid": response.CellID,
                            "meterid": deltalinkID,
                            "action": "NODE_PING",
                            "attribute": "DELTALINK_PING",
                            "Purpose": "DeltalinkNodePing"
                        }
                        parser.hexaCreation(data, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                // sendToIOT.sendToIOT(result, response.DeviceID, function (err, success) {
                                //     if (err) {
                                //         callback(err, null);
                                //     } else {
                                var jobdoc = {
                                    "JobID": shortid.generate(),
                                    "SerialNumber": response.DeltalinkSerialNumber,
                                    "DeviceID": response.DeviceID,
                                    "DeviceType": "DeltaLink",
                                    "JobName": "Node Ping",
                                    "JobType": "DeltaLink Node Ping",
                                    "Status": "Pending",
                                    "CreatedDateTimestamp": new Date(),
                                    "MessageID": data.messageid,
                                    "EndTime": null,
                                    "NodePingStatus": [
                                        {
                                            "DeltalinkSerialNumber": response.DeltalinkSerialNumber,
                                            "IsMaster": true,
                                            "Status": "NotConnected"
                                        }]
                                };
                                console.log("Node Ping JobID :- " + jobdoc.JobID);
                                updateDeltalinkMessageIDAndCreateJob(jobsCollection, jobdoc, data.messageid, function (err, successResponse) {
                                    sendToIOT.sendToIOT(result, response.DeviceID, function (err, success) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            setTimeout(function () {
                                                getDeltalinkCurrentStatus(jobsCollection, deltalinkID, data.messageid, jobdoc.JobID, function (err, result) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        callback(null, result);
                                                    }
                                                });
                                            }, 6000);
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}


/* ********** DB Commands (System Management) SECTION 2 - NON-EXPOSED METHODS************************ */

/**
* @description - get Deltalink HS Details
* @param hyperSproutCollection
* @param meterCollection
* @param deltalinkCollection, 
* @param  deltalinkID,
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDeltalinkHSDetails(hyperSproutCollection, meterCollection, deltalinkCollection, deltalinkID, callback) {
    try {
        deltalinkCollection.find({ 'DeltalinkID': deltalinkID }).toArray(function (err, dlresult) {
            if (err) {
                callback(err, null);
            } else if (dlresult.length > 0) {
                if (dlresult[0].Status === "NotRegistered") {
                    callback("Deltalink Not Registered", null);
                } else {
                    meterCollection.find({ 'MeterID': dlresult[0].MeterID }).toArray(function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else if (result.length > 0) {
                            if (result[0].Status === "NotRegistered") {
                                callback("Meter Not Registered", null);
                            } else {
                                hyperSproutCollection.find({ 'HypersproutID': result[0].HypersproutID }).toArray(function (err, res) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (res.length > 0) {
                                        if (res[0].Status === "NotRegistered") {
                                            callback("Hypersprout Not Registered", null);
                                        } else {
                                            let rev = ((res[0].ProtocolVersion == undefined) || (res[0].ProtocolVersion == null) || (res[0].ProtocolVersion == "null")) ? 0 : res[0].ProtocolVersion;
                                            let countryCode = ((dlresult[0].DeltaLinks_DeviceDetails.CountryCode == undefined) || (dlresult[0].DeltaLinks_DeviceDetails.CountryCode == null) || (dlresult[0].DeltaLinks_DeviceDetails.CountryCode == "null")) ? 0 : dlresult[0].DeltaLinks_DeviceDetails.CountryCode;
                                            let regionCode = ((dlresult[0].DeltaLinks_DeviceDetails.RegionCode == undefined) || (dlresult[0].DeltaLinks_DeviceDetails.RegionCode == null) || (dlresult[0].DeltaLinks_DeviceDetails.RegionCode == "null")) ? 0 : dlresult[0].DeltaLinks_DeviceDetails.RegionCode

                                            var response = {
                                                "DeviceID": res[0].DeviceID,
                                                "Rev": rev,
                                                "CountryCode": countryCode,
                                                "RegionCode": regionCode,
                                                "CellID": res[0].HypersproutID,
                                                "MeterID": dlresult[0].DeltalinkID,
                                                "DeltalinkSerialNumber": dlresult[0].DeltalinkSerialNumber
                                            }
                                            if ((dlresult[0].NodePingMessageID === undefined) || (dlresult[0].NodePingMessageID === null) || (dlresult[0].NodePingMessageID === 255))
                                                response.messageid = 0;
                                            else
                                                response.messageid = result[0].NodePingMessageID;
                                            callback(null, response)
                                        }
                                    }
                                    else {
                                        callback("Hypersprout not available", null);
                                    }
                                });
                            }
                        } else {
                            callback("Meter not available", null);
                        }
                    })
                }
            } else {
                callback("Deltalink not available", null);
            }
        })

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

}

/**
* @description - update Deltalink Message ID And Create Job
* @param jobsCollection
* @param jobJSON
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateDeltalinkMessageIDAndCreateJob(jobsCollection, jobJSON, messageid, callback) {
    jobsCollection.insertOne(jobJSON, function (err, response) {
        callback(err, response);
    });
}



/**
* @description - get Deltalink Current Status
* @param jobsCollection
* @param deltalinkID
* @param messageid
* @param jobID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDeltalinkCurrentStatus(jobsCollection, deltalinkID, messageid, jobID, callback) {
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
* @description - save Deltalink Device Status
* @param deltalinkDetails
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveDeltalinkDeviceStatus(DLid,Mstatus,noofSlave,SlaveDetails, messageid, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            var deltaCollection = db.delta_DeltaLink;
            var jobsCollection = db.delta_Jobs;
            saveDeltalinkStatus(deltaCollection, jobsCollection, DLid,Mstatus,noofSlave,SlaveDetails,messageid, callback);
        }
    });
};


/**
* @description - save Deltalink status
* @param deltaCollection
* @param jobsCollection
* @param deltalinkDetails
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveDeltalinkStatus(deltaCollection, jobsCollection, DLid,Mstatus,noofSlave,SlaveDetails, messageid, callback) {
   let statusDetails = [];

    deltaCollection.find({ DeltalinkID: DLid }, { DeltalinkSerialNumber: 1, IsMaster: 1, DeltalinkID: 1 }).toArray(function (err, deltalinkData) {
        if (err)
            callback(err, null);
        else if (deltalinkData) {
            if (Mstatus == 1) {
                MasterStatus = "Connected"
            } else {
                MasterStatus = "NotConnected";
            }
            var JobStatus = {
                DeltalinkSerialNumber: deltalinkData[0].DeltalinkSerialNumber,
                IsMaster: deltalinkData[0].IsMaster,
                Status: MasterStatus
            };
            statusDetails.push(JobStatus);
            if (noofSlave > 0) {
                SlaveDetails.forEach(DLdata => {
                    if (DLdata.Status == "Success") {
                        slaveStatus = "Connected";
                    } else {
                        slaveStatus = "NotConnected";
                    }
                    DLdata.SerialNo = DLdata.SerialNo.replace(/\0/g, '');
                    JobStatus = {
                        DeltalinkSerialNumber: DLdata.SerialNo,
                        IsMaster: false,
                        Status: slaveStatus
                    };
                    statusDetails.push(JobStatus)
                });
                jobsCollection.updateMany({ MessageID: messageid, SerialNumber: deltalinkData[0].DeltalinkSerialNumber, JobName: "Node Ping", "Status": "Pending", EndTime: null }, { $set: { NodePingStatus: statusDetails } }, callback);
            } else{
                jobsCollection.updateMany({ MessageID: messageid, SerialNumber: deltalinkData[0].DeltalinkSerialNumber, JobName: "Node Ping", "Status": "Pending", EndTime: null }, { $set: { NodePingStatus: statusDetails } }, callback);
            }

        } else {
            callback("Invalid DeltalinkID", null);
        }
    });
}

module.exports = {
    deltalinkDeviceStatus: deltalinkDeviceStatus,
    saveDeltalinkDeviceStatus: saveDeltalinkDeviceStatus
}