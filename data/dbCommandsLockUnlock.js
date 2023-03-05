//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var async = require('async');
var insertError = require('./insertErrorLogsToDB.js');
var sToIOT = require('./sendToiot.js');


/* *************** DB Commands SECTION 2 - EXPOSED METHODS ************************ */

/**
* @description - for the Webservice - FirmwareMgmtFirmGroupSubmit, Create Firmware Job in MONGODB
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createLockUnlockJobs(deviceId, DeviceType, Action, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else if (DeviceType === "meter") {
            createLockUnlockMeshJobsMongoDB(db, deviceId, DeviceType, Action, callback);
        } else {
            createLockUnlockJobsMongoDB(db, deviceId, DeviceType, Action, callback);
        }
    });
};

/**
* @description - save Meter Device Status
* @param meterID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveDeviceLockStatus(deviceId, status,flag,Action, DeviceType, messageid, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                return callback(err, null);
            } else {
                if (DeviceType == 'meter') {
                    var meterCollection = db.delta_Meters;
                    var jobsCollection = db.delta_Jobs;
                    saveMeterLockStatus(meterCollection, jobsCollection, deviceId, status,flag,Action, messageid, callback);
                } else {
                    var hsCollection = db.delta_Hypersprouts;
                    var jobsCollection = db.delta_Jobs;
                    saveHSLockStatus(hsCollection, jobsCollection, deviceId, status,flag,Action, messageid, callback);
                }
            }
        });
    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)
    }
};

/* ********** DB Commands SECTION 2 - NON-EXPOSED METHODS************************ */

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

function saveMeterLockStatus(meterCollection, jobsCollection, meterID, status,flag,Action, messageid, callback) {
    try {
        meterCollection.find({ MeterID: meterID }, { MeterSerialNumber: 1 }).toArray(function (err, metData) {
            if (err)
                callback(err, null);
            else if (metData.length > 0) {
                meterCollection.update({ MeterID: meterID }, { $set: { device_lock: flag } }, function (err, res) {
                    if (err)
                        callback(err, null);
                    else {
                        jobsCollection.updateMany({  SerialNumber: metData[0].MeterSerialNumber, "Status": "Pending",JobName:Action+" Job", EndTime: null }, { $set: { LockStatus: status } }, callback);
                    }
                });
            } else {
                callback(new Error("Invalid MeterID"), null);
            }
        });
    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)
    }
}

/**
* @description - save HS/HH status
* @param hsCollection
* @param jobsCollection
* @param HSID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveHSLockStatus(hsCollection, jobsCollection, HSID, status,flag,Action, messageid, callback) {
    try {
        hsCollection.find({ HypersproutID: HSID }, { HypersproutSerialNumber: 1 }).toArray(function (err, hsData) {
            if (err)
                callback(err, null);
            else if (hsData.length > 0) {
                hsCollection.update({ HypersproutID: HSID }, { $set: { device_lock: flag } }, function (err, hData) {
                    if (err)
                        callback(err, null);
                    else {
                        jobsCollection.updateMany({ SerialNumber: hsData[0].HypersproutSerialNumber, "Status": "Pending",JobName:Action+" Job", EndTime: null }, { $set: { LockStatus: status, EndTime: new Date() } }, callback);
                    }
                });
            } else {
                callback(new Error("Invalid HSID"), null);
            }
        });
    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)
    }
}


/**
* @description - create lockunlock job in mongoDB, For the Webservice - LockUnlockDevice
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createLockUnlockJobsMongoDB(dbConnection, DeviceId, DeviceType, Action, callback) {
    try {
        if (DeviceType == 'hh') {
            type = "HyperHub"
        } else {
            type = "HyperSprout"
        }
        var collectionName = dbConnection.delta_Jobs;
        var collectionName2 = dbConnection.delta_Hypersprouts;
        var collectionName3 = dbConnection.delta_SchedulerFlags;
        var hypersproutMeterDetails = [];
        var JobID = shortid.generate();
        regex = { HypersproutID: DeviceId, Status: "Registered" };
        collectionName2.find(regex).toArray(function (err, collectionArray) {
            if (!collectionArray) {
                var err = {};
                err.message = "Device Not Registered"
                callback(new Error("Device Not Registered"), null);
            } else if (collectionArray.length > 0) {
                result = collectionArray[0];
                var jobFirmware = {
                    "JobID": JobID,
                    "DeviceID": DeviceId,
                    "DeviceType": type,
                    "JobName": Action + " Job",
                    "JobType": "Collector " + Action + " Job",
                    "Status": "Pending",
                    "SerialNumber": result.HypersproutSerialNumber,
                    "CreatedDateTimestamp": new Date(),
                    "LockStatus":"LockUnlockDevice Unsuccessful"
                }
                collectionName.insertOne(jobFirmware, function (err, updated) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        createLockUnlockDeviceDetails(result.HypersproutID,
                            result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                            result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    hypersproutMeterDetails.push(response);
                                    callback(null, hypersproutMeterDetails);
                                }

                            });
                    }
                });

            } else {
                var err = {};
                err.message = "Device Not Registered"
                callback(new Error("Device Not Registered"), null);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - create unlock/lock Mesh Job in mongoDB
* @param dbConnection
* @param Deviceid
* @param DeviceType
* @param Action
* @param callback - callback function returns success or error response
* @return callback function
*/

function createLockUnlockMeshJobsMongoDB(dbConnection, Deviceid, DeviceType, Action, callback) {
    try {
        var collectionName = dbConnection.delta_Jobs;
        var collectionName1 = dbConnection.delta_Meters;
        var collectionName2 = dbConnection.delta_Hypersprouts;
        var collectionName3 = dbConnection.delta_SchedulerFlags;
        var hypersproutMeterDetails = [];
        var JobID = shortid.generate();
        regex = { MeterID: Deviceid, Status: "Registered" };
        collectionName1.find(regex).toArray(function (err, collectionArray) {
            if (collectionArray.length > 0) {
                result = collectionArray[0];
                if (!result.Meters_FirmwareDetails) {
                    result.Meters_FirmwareDetails = {};
                }
                if (!result.Meters_FirmwareDetails.MeshCardFirmwareVersion) {
                    result.Meters_FirmwareDetails.MeshCardFirmwareVersion = null;
                }
                if (!result.Meters_FirmwareDetails.MeterCardFirmwareVersion) {
                    result.Meters_FirmwareDetails.MeterCardFirmwareVersion = null;
                }
                var jobFirmware = {
                    "JobID": JobID,
                    "DeviceType": "Meter",
                    "JobName": Action + " Job",
                    "JobType": "Mesh " + Action + " Job",
                    "Status": "Pending",
                    "SerialNumber": result.MeterSerialNumber,
                    "CreatedDateTimestamp": new Date(),
                    "LockStatus":"LockUnlockDevice Unsuccessful"                    
                }
                collectionName.insertOne(jobFirmware, function (err, updated) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName2.find({ "HypersproutID": result.HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                            .toArray(function (err, hyperresult) {
                                if (err) {
                                    insertError.putErrorDetails(err, callback);
                                } else if (hyperresult.length === 0) {
                                    callback(new Error('Hypersprout not available'),null );
                                } else {
                                    createLockUnlockDeviceDetails(result.HypersproutID,
                                        hyperresult[0].DeviceID, result.MeterID, hyperresult[0].Hypersprout_DeviceDetails.CountryCode,
                                        hyperresult[0].Hypersprout_DeviceDetails.RegionCode, result.MeterSerialNumber, JobID, collectionName3, function (err, response) {
                                            if (err) {
                                                callback(err, null)
                                            } else {
                                                hypersproutMeterDetails.push(response);
                                                callback(null, hypersproutMeterDetails);
                                            }

                                        });
                                }
                            });
                    }
                });

            } else {
                var err = {};
                err.message = "Device Not Registered"
                callback(err, null);
            }
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - create lock/unlock device details
* @param HypersproutID
* @param DeviceID
* @param MeterID
* @param CountryCode
* @param RegionCode
* @param SerialNumber
* @param collectionName3
* @param callback - callback function returns success or error response
* @return callback function
*/

function createLockUnlockDeviceDetails(HypersproutID,
    DeviceID, MeterID, CountryCode, RegionCode, SerialNumber, JobID, collectionName3, callback) {
    try {
        CountryCode = (CountryCode == null || CountryCode == "null" || CountryCode == undefined || CountryCode == "") ? 0 : CountryCode;
        RegionCode = (RegionCode == null || RegionCode == "null" || RegionCode == undefined || RegionCode == "") ? 0 : RegionCode;
        var data = {
            CELLID: HypersproutID,
            DeviceID: DeviceID,
            MeterID: MeterID,
            CountryCode: CountryCode,
            RegionCode: RegionCode,
            SerialNumber: SerialNumber,
            JobID: JobID
        }
        if (DeviceID) {
            collectionName3.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 })
                .toArray(function
                    (err, messageIDdetails) {
                    if (err)
                        callback(err, null);
                    else {
                        if (messageIDdetails.length > 0) {
                            if (messageIDdetails[0].MessageID) {
                                data["MessageID"] = messageIDdetails[0].MessageID;
                            } else {
                                data["MessageID"] = 0;
                            }
                        } else {
                            data["MessageID"] = 0;

                        }
                        callback(null, data);
                    }
                });
        } else {
            callback(new Error("Device ID not found!!"), null)
        }
    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)

    }
}

/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by Surya  ============== */

    createLockUnlockJobs: createLockUnlockJobs,
    saveDeviceLockStatus: saveDeviceLockStatus

    /* ================ End : Added by Surya  =================== */
};