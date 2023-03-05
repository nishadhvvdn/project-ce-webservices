//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var async = require('async');
var insertError = require('./insertErrorLogsToDB.js');
var moment = require('moment');
var shortid = require('shortid');

/* *************** DB Commands (Transaction Scheduler) SECTION 1 - EXPOSED METHODS ************************ */

/* ====================== Start : Added by Dhruv  ========================= */

/**
* @description - Listing the list of Devices on the basis of DailySelfReadTime
* @params - callback
* @return callback function
*/
function ListDevicesAsReadTime(callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var collection = db.delta_Hypersprouts;
            var systemSettingsCollection = db.delta_SystemSettings;
            findDeviceIDs(collection, systemSettingsCollection, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result);
                }
            });
        }
    });
}
/**
* @description - device Connection Status
* @params - deviceID, status, callback
* @return callback function
*/
function deviceConnectionStatus(deviceID, status, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var collection = db.delta_SchedulerFlags;
            var systemSettingsCollection = db.delta_SystemSettings;
            getDeviceDetails(collection, systemSettingsCollection, deviceID, status, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result);
                }
            });
        }
    });
}
/**
* @description - store Scheduler Log
* @params - deviceID, messageID, data, time, callback
* @return callback function
*/
function storeSchedulerLog(deviceID, messageID, data, time, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var SchedulerLogscollection = db.delta_SchedulerLogs;
            var Hypersproutscollection = db.delta_Hypersprouts;
            var jobsCollection = db.delta_Jobs;
            saveSchedulerLogs(SchedulerLogscollection, Hypersproutscollection, jobsCollection, deviceID, messageID, data, time, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result);
                }
            });
        }
    });
}
/**
* @description - scheduler Log Update
* @params - input, timeres, callback
* @return callback function
*/
function schedulerLogUpdate(input, timeres, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var SchedulerLogscollection = db.delta_SchedulerLogs;
            var SchedulerFlagscollection = db.delta_SchedulerFlags;
            var HypersproutCollection = db.delta_Hypersprouts;
            var jobsCollection = db.delta_Jobs;
            updateSchedulerLogs(SchedulerLogscollection, SchedulerFlagscollection, HypersproutCollection, jobsCollection, input, timeres, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

/**
* @description - Save System Events - All Communicaion with the Devices
* @params - rev, cellid, meterid, messageid, action, attribute, data, callback
* @return callback function
*/
function systemEvents(rev, cellid, meterid, messageid, action, attribute, data, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var systemEventsCollection = db.delta_SystemEvents;
                saveSystemEvent(systemEventsCollection, rev, cellid, meterid, messageid, action, attribute, data, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/* =========================== End : Added by Dhruv  ========================= */


/* ********** DB Commands (Transaction Scheduler) SECTION 2 - NON-EXPOSED METHODS************************ */

/* ======================= Start : Added by Dhruv  ======================= */
/**
* @description - find Device IDs
* @params - collection, systemSettingsCollection, callback
* @return callback function
*/
function findDeviceIDs(collection, systemSettingsCollection, callback) {
    collection.find({ Status: "Registered" }, { DeviceID: 1, HypersproutID: 1, _id: 0 }).toArray(function (err, res) {
        if (err) {
            callback(err, null);
        } else if (res.length === 0) {
            callback(new Error("No Registered HyperSprouts avalaible"), null);
        } else {
            systemSettingsCollection.find({ Settings: "Communications", 'Type.Status': "Updated" }, { 'Type.Values.HypersproutTransactionPoolingInterval': 1, ScheduledTime: 1 }).toArray(function (err, pollingInterval) {
                if (err) {
                    callback(err, null);
                } else {
                    var d1 = new Date();
                    var d2 = new Date(pollingInterval[0].ScheduledTime);
                    var startDate = moment.utc(d2);
                    var endDate = moment.utc(d1);
                    var minsDiff = endDate.diff(startDate, 'seconds');
                    if (minsDiff >= 0) {
                        systemSettingsCollection.update({ Settings: "Communications", 'Type.Status': "Updated" }, { $set: { ScheduledTime: new Date(moment(startDate).add(pollingInterval[0].Type.Values.HypersproutTransactionPoolingInterval, 'minutes')) } }, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, res);
                            }
                        });
                    } else {
                        callback(new Error("No Device ID"), null);
                    }
                }
            });
        }
    });
};
/**
* @description - get Device Details
* @params - collection, systemSettingsCollection, deviceID, status, callback
* @return callback function
*/
function getDeviceDetails(collection, systemSettingsCollection, deviceID, status, callback) {
    collection.find({ DeviceID: deviceID }).toArray(function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result.length === 0) {
            var firstTimeDevice = {
                "Flag": 0,
                "DeviceID": deviceID,
                "MessageID": 0
            }
            collection.insertOne(firstTimeDevice, function (err, response) {
                if (err) {
                    insertError.putErrorDetails(err, callback);
                } else if (response.result.nModified === 0) {
                    callback(new Error("TryAgain"), null)
                } else {
                    callback(null, firstTimeDevice)
                }
            });
        } else {
            systemSettingsCollection.find({ Settings: "Communications", 'Type.Status': "Updated" }, { 'Type.Values.RetryAttemtCEtoHS': 1 }).toArray(function (err, systemDetails) {
                if (err)
                    callback(err, null)
                else {
                    collection.find({ DeviceID: deviceID, Flag: { $lt: systemDetails[0].Type.Values.RetryAttemtCEtoHS } }).toArray(function (err, response) {
                        if (err) {
                            callback(err, null);
                        } else if (response.length === 0) {
                            callback(new Error("Exceeded"), null);
                        } else {
                            var messageID;
                            if (status === "Connected") {
                                if ((response[0].MessageID === 255) || (response[0].MessageID === null)) {
                                    messageID = 0
                                } else {
                                    messageID = ++response[0].MessageID;
                                }
                            }
                            else
                                messageID = response[0].MessageID
                            var flag = ++response[0].Flag;
                            collection.update({ DeviceID: deviceID }, { $set: { MessageID: messageID, Flag: flag } }, function (err, res) {
                                if (err) {
                                    insertError.putErrorDetails(err, callback);
                                } else {
                                    collection.find({ DeviceID: deviceID }).toArray(function (err, success) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, success[0]);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}
/**
* @description - save Scheduler Logs
* @params - SchedulerLogscollection, Hypersproutscollection, jobsCollection, deviceID, messageID, data, time, callback
* @return callback function
*/
function saveSchedulerLogs(SchedulerLogscollection, Hypersproutscollection, jobsCollection, deviceID, messageID, data, time, callback) {
    var jobID = shortid.generate();
    Hypersproutscollection.findAndModify({ DeviceID: deviceID }, [], { $set: { PollingIntervalJobID: jobID } }, { remove: false, new: true, upsert: false, fields: { HypersproutID: 1, HypersproutSerialNumber: 1, IsHyperHub: 1 } }, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result.value === null) {
            callback(new Error("No HS attached to given DeviceID avalaible"), null);
        } else {
            var type = "HyperSprout";
            var Logs = {
                "CellID": result.value.HypersproutID,
                "DeviceID": deviceID,
                "MessageID": messageID,
                "RawData": data,
                "TimeStampRequest": new Date(time)
            }
            if (result.value.IsHyperHub)
                type = "Hyperhub";
            var jobDoc = {
                JobID: jobID,
                DeviceID: deviceID,
                DeviceType: type,
                SerialNumber: result.value.HypersproutSerialNumber,
                MessageID: messageID,
                JobName: "Interval Read Job",
                JobType: "Transactional Polling Interval",
                Status: "Pending",
                CreatedDateTimestamp: new Date(time)
            }
            SchedulerLogscollection.insertOne(Logs, function (err, response) {
                if (err) {
                    insertError.putErrorDetails(err, callback);
                } else {
                    jobsCollection.insertOne(jobDoc, function (err, success) {
                        callback(null, "DataAdded");
                    });
                }
            });
        }
    });
}
/**
* @description - update Scheduler Logs
* @params - SchedulerLogscollection, SchedulerFlagscollection, HypersproutCollection, jobsCollection, input, timeres, callback
* @return callback function
*/
function updateSchedulerLogs(SchedulerLogscollection, SchedulerFlagscollection, HypersproutCollection, jobsCollection, input, timeres, callback) {
    HypersproutCollection.find({ HypersproutID: input.CellID }).toArray(function (err, hsDetails) {
        SchedulerLogscollection.find({ CellID: input.CellID, MessageID: input.MessageID }).sort({ TimeStampRequest: -1 }).limit(2).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else if (result.length === 0) {
                callback(new Error("NoDevice"), null);
            } else {
                var lastConnectedMeterCount;
                if ((result.length > 1) && (result[1].NoOfMeters !== null) && (result[1].NoOfMeters !== undefined))
                    lastConnectedMeterCount = result[1].NoOfMeters
                else
                    lastConnectedMeterCount = 0;
                if (input.Transformer.NoOfConnectedMeter > lastConnectedMeterCount)
                    lastConnectedMeterCount = input.Transformer.NoOfConnectedMeter
                if ((result[0].TimeStampResponse === undefined) || (result[0].TimeStampResponse === null)) {
                    SchedulerLogscollection.findAndModify({ _id: result[0]._id }, [], { $set: { TimeStampResponse: new Date(timeres), NoOfMeters: lastConnectedMeterCount } }, { remove: false, new: true, upsert: false }, function (err, res) {
                        if (err) {
                            insertError.putErrorDetails(err, callback);
                        } else {
                            SchedulerFlagscollection.update({ DeviceID: res.value.DeviceID }, { $set: { Flag: 0 } }, function (err, output) {
                                if (err) {
                                    insertError.putErrorDetails(err, callback);
                                } else {
                                    jobsCollection.find({
                                        JobName: "Interval Read Job",
                                        JobType: "Transactional Polling Interval",
                                        MessageID: input.MessageID,
                                        Status: "Pending"
                                    }).sort({ "CreatedDateTimestamp": -1 }).limit(1).next(function (err, record) {
                                        if (err)
                                            callback(err, null)
                                        else if (record !== undefined) {
                                            jobsCollection.update({ JobID: record.JobID }, { $set: { Status: "Completed", EndTime: new Date() } }, function (err, jobsUpdated) {
                                                callback(null, "Data Updated");
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    callback(new Error("No Request Sent"), null);
                }
            }
        });
    });
}

/**
* @description - Save System Event
* @params - systemEventsCollection, rev, cellid, meterid, messageid, action, attribute, data, callback
* @return callback function
*/

function saveSystemEvent(systemEventsCollection, rev, cellid, meterid, messageid, action, attribute, data, callback) {
    var sysEvent;
    if ((action === "METER_REGISTERATION") || (action === "METER_TRANSACTION_DATA") || (action === "METER_MANAGERIAL_DATA") || (action === "METER_EVENTS_ALARM_DATA") || (action === "METER_FIRMWARE_UPGRADE") || (action === "EVENTS_ALARM_DATA") || (action === "ACTION_FOR_DEVICE")) {
        sysEvent = {
            "Rev": rev,
            "CellID": cellid,
            "MeterID": meterid,
            "MessageID": messageid,
            "Action": action,
            "Attribute": attribute,
            "DBTimestamp": new Date(),
            "Data": data
        }
    } else {
        sysEvent = {
            "Rev": rev,
            "CellID": cellid,
            "MessageID": messageid,
            "Action": action,
            "Attribute": attribute,
            "DBTimestamp": new Date(),
            "Data": data
        }
    }
    systemEventsCollection.insertOne(sysEvent, function (err, response) {
        if (err) {
            insertError.putErrorDetails(err, callback);
        } else {
            callback(null, "Success")
        }
    });
}

/* ========================= End : Added by Dhruv  ========================== */


/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by Dhruv  ============== */
    ListDevicesAsReadTime: ListDevicesAsReadTime,
    deviceConnectionStatus: deviceConnectionStatus,
    storeSchedulerLog: storeSchedulerLog,
    schedulerLogUpdate: schedulerLogUpdate,
    systemEvents: systemEvents
    /* ================ End : Added by Dhruv  =================== */
};
