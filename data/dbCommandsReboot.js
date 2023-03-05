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

function createRebootJobs(deviceId, DeviceType, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else if (DeviceType === "meter") {
            createRebootMeshJobsMongoDB(db, deviceId, DeviceType, callback);
        } else if (DeviceType === "deltalink") {
            createRebootDLJobsMongoDB(db, deviceId, DeviceType, callback);
        } else {
            createRebootJobsMongoDB(db, deviceId, DeviceType, callback);
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
function saveDeviceRebootStatus(deviceId, status, DeviceType, messageid, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            if (DeviceType == 'meter') {
                var meterCollection = db.delta_Meters;
                var jobsCollection = db.delta_Jobs;
                saveMeterRebootStatus(meterCollection, jobsCollection, deviceId, status, messageid, callback);
            } else if (DeviceType == 'DeltaLink') {
                var deltaLinkCollection = db.delta_DeltaLink;
                var jobsCollection = db.delta_Jobs;
                saveDLRebootStatus(deltaLinkCollection, jobsCollection, deviceId, status, messageid, callback);
            } else {
                var hsCollection = db.delta_Hypersprouts;
                var jobsCollection = db.delta_Jobs;
                saveHSRebootStatus(hsCollection, jobsCollection, deviceId, status, messageid, callback);
            }
        }
    });
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

function saveMeterRebootStatus(meterCollection, jobsCollection, meterID, status, messageid, callback) {
    meterCollection.find({ MeterID: meterID }, { MeterSerialNumber: 1 }).toArray(function (err, metData) {
        if (err)
            callback(err, null);
        else if (metData.length > 0) {
            endTime = null;
            if (status == 1) {
                status = "Reboot Initiated"
                endTime = new Date();
            } else if (status == 3) {
                status = "Success";
                endTime = new Date();
            } else {
                status = "Failed";
                endTime = new Date();
            }
            jobsCollection.updateMany({ SerialNumber: metData[0].MeterSerialNumber, JobName:"Reboot Job", EndTime: null }, { $set: { Status: status, EndTime: endTime } }, callback);

        } else {
            callback(new Error("Invalid MeterID"), null);
        }
    });
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

function saveHSRebootStatus(hsCollection, jobsCollection, HSID, status, messageid, callback) {
    hsCollection.find({ HypersproutID: HSID }, { HypersproutSerialNumber: 1 }).toArray(function (err, hsData) {
        if (err)
            callback(err, null);
        else if (hsData.length > 0) {
            endTime = null;
            if (status == 1) {
                status = "Reboot Initiated"
                endTime = new Date();

            } else if (status == 3) {
                status = "Success";
                endTime = new Date();
            } else {
                status = "Failed";
                endTime = new Date();
            }
            jobsCollection.updateMany({ SerialNumber: hsData[0].HypersproutSerialNumber, JobName:"Reboot Job", EndTime: null }, { $set: { Status: status, EndTime: endTime } }, callback);

        } else {
            callback(new Error("Invalid HSID"), null);
        }
    });
}

/**
* @description - save DLstatus
* @param hsCollection
* @param jobsCollection
* @param HSID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveDLRebootStatus(dlCollection, jobsCollection, HSID, status, messageid, callback) {
    dlCollection.find({ DeltalinkID: HSID }, { DeltaLinkSerialNumber: 1 }).toArray(function (err, dlData) {
        if (err)
            callback(err, null);
        else if (dlData.length > 0) {
            endTime = null;
            if (status == 1) {
                status = "Reboot Initiated"
                endTime = new Date();
            } else if (status == 3) {
                status = "Success";
                endTime = new Date();
            } else {
                status = "Failed";
                endTime = new Date();
            }
            jobsCollection.updateMany({ SerialNumber: dlData[0].DeltalinkSerialNumber, JobName:"Reboot Job", EndTime: null }, { $set: { Status: status, EndTime: endTime } }, callback);

        } else {
            callback(new Error("Invalid DLID"), null);
        }
    });
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

function createRebootJobsMongoDB(dbConnection, DeviceId, DeviceType, callback) {
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
                err.message = "No device available"
                callback(err, null);
            } else if (collectionArray.length > 0) {
                result = collectionArray[0];
                var jobReboot = {
                    "JobID": JobID,
                    "DeviceID": DeviceId,
                    "DeviceType": type,
                    "JobName": "Reboot Job",
                    "JobType": "Collector Reboot Job",
                    "Status": "Pending",
                    "SerialNumber": result.HypersproutSerialNumber,
                    "CreatedDateTimestamp": new Date(),
                }
                collectionName.insertOne(jobReboot, function (err, updated) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        createRebootDeviceDetails(result.HypersproutID,
                            result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                            result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                                hypersproutMeterDetails.push(response);
                                callback(null, hypersproutMeterDetails);
                            });
                    }
                });

            } else {
                callback(new Error("Hypersprout not available"), null);
            }
        });
    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)

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

function createRebootMeshJobsMongoDB(dbConnection, Deviceid, DeviceType, callback) {
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
                var jobReboot = {
                    "JobID": JobID,
                    "DeviceType": "Meter",
                    "JobName": "Reboot Job",
                    "JobType": "Mesh Reboot Job",
                    "Status": "Pending",
                    "SerialNumber": result.MeterSerialNumber,
                    "CreatedDateTimestamp": new Date(),
                }
                collectionName.insertOne(jobReboot, function (err, updated) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName2.find({ "HypersproutID": result.HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                            .toArray(function (err, hyperresult) {
                                if (err) {
                                    insertError.putErrorDetails(err, callback);
                                } else if (hyperresult.length > 0) {
                                    createRebootDeviceDetails(result.HypersproutID,
                                        hyperresult[0].DeviceID, result.MeterID, hyperresult[0].Hypersprout_DeviceDetails.CountryCode,
                                        hyperresult[0].Hypersprout_DeviceDetails.RegionCode, result.MeterSerialNumber, JobID, collectionName3, function (err, response) {
                                            hypersproutMeterDetails.push(response);
                                            callback(null, hypersproutMeterDetails);
                                        });
                                } else {
                                    callback(new Error("Hypersprout not available"), null);
                                }
                            });
                    }
                });

            } else {
                var err = {};
                err.message = "No device available"
                callback(err, null);
            }
        });

    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)

    }
};

/**
* @description - create reboot DL Job in mongoDB
* @param dbConnection
* @param Deviceid
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createRebootDLJobsMongoDB(dbConnection, Deviceid, DeviceType, callback) {
    try {
        var collectionName = dbConnection.delta_Jobs;
        var collectionName1 = dbConnection.delta_DeltaLink;
        var collectionName2 = dbConnection.delta_Hypersprouts;
        var collectionName3 = dbConnection.delta_SchedulerFlags;
        var collectionName4 = dbConnection.delta_Meters;
        var hypersproutMeterDetails = [];
        var JobID = shortid.generate();
        regex = { DeltalinkID: Deviceid, Status: "Registered" };
        collectionName1.find(regex).toArray(function (err, collectionArray) {
            if (collectionArray.length > 0) {
                result = collectionArray[0];
                var jobFirmware = {
                    "JobID": JobID,
                    "DeviceType": "DeltaLink",
                    "JobName": "Reboot Job",
                    "JobType": "DL Reboot Job",
                    "Status": "Pending",
                    "SerialNumber": result.DeltalinkSerialNumber,
                    "CreatedDateTimestamp": new Date(),
                }
                collectionName.insertOne(jobFirmware, function (err, updated) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName4.find({ "MeterID": result.MeterID, Status: "Registered" }).toArray(function (err, Mresult) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else if (Mresult.length > 0) {
                                collectionName2.find({ "HypersproutID": Mresult[0].HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                                    .toArray(function (err, hyperresult) {

                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else if (hyperresult.length > 0) {
                                            createRebootDeviceDetails(hyperresult[0].HypersproutID,
                                                hyperresult[0].DeviceID, result.DeltalinkID, hyperresult[0].Hypersprout_DeviceDetails.CountryCode,
                                                hyperresult[0].Hypersprout_DeviceDetails.RegionCode, result.MeterSerialNumber, JobID, collectionName3, function (err, response) {
                                                    hypersproutMeterDetails.push(response);
                                                    callback(null, hypersproutMeterDetails);
                                                });
                                        } else {
                                            callback(new Error("Hypersprout not available"), null);
                                        }
                                    });
                            } else {
                                callback(new Error("Meter not available"), null);
                            }
                        });
                    }
                });

            } else {
                var err = {};
                err.message = "No device available"
                callback(err, null);
            }
        });

    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)

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

function createRebootDeviceDetails(HypersproutID,
    DeviceID, MeterID, CountryCode, RegionCode, SerialNumber, JobID, collectionName3, callback) {
    try {
        var data = {
            CELLID: HypersproutID,
            DeviceID: DeviceID,
            MeterID: MeterID,
            CountryCode: CountryCode,
            RegionCode: RegionCode,
            SerialNumber: SerialNumber,
            JobID: JobID
        }
        collectionName3.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 })
            .toArray(function
                (err, messageIDdetails) {
                if (err)
                    callback(err, null);
                else {
                    if (messageIDdetails.length > 0) {
                        data["MessageID"] = messageIDdetails[0].MessageID;
                    } else {
                        data["MessageID"] = 0;
                    }
                    callback(null, data);
                }
            });
    } catch (e) {
        callback(new Error("Something went wrong : " + e.name + " " + e.message), null)

    }
}

/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by Surya  ============== */

    createRebootJobs: createRebootJobs,
    saveDeviceRebootStatus: saveDeviceRebootStatus,
    createRebootDeviceDetails: createRebootDeviceDetails

    /* ================ End : Added by Surya  =================== */
};