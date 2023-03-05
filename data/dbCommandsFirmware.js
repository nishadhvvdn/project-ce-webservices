//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var async = require('async');
var insertError = require('./insertErrorLogsToDB.js');
var sToIOT = require('./sendToiot.js');
let paginatedResults = require('../config/Helpers/Pagination')
var FCM = require('./fcmIntialize');
let dao = require('../dao/MongoDAO')

/* *************** DB Commands SECTION 2 - EXPOSED METHODS ************************ */

/**
* @description - For the Webservice - FirmwareMgmtJobStatus , SELECT Firmware Job Status details FROM MONGODB
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectJobStatusFirmware(DeviceType, data, callback) {
    try {
        // dbCon.getDb(function (err, db) {
        //     if (err) {
        //         callback(err, null);
        //     } else {
        selectJobStatusFirmwareMongoDB("delta_Jobs", "delta_AppGroups", DeviceType, data, callback);
        //     }
        // });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - FirmwareMgmtFirmGroup, SELECT Firmware & Group details FROM MONGODB
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectFirmwareAndGroup(DeviceType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                selectFirmwareAndGroupMongoDB(db.delta_FirmwareManagement, db.delta_AppGroups, DeviceType, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - for the Webservice - FirmwareMgmtResponse, Updating Firmware management status in Mongodb
* @param DeviceId
* @param status
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updatingHHFirmwareMgmtStatus(DeviceId, status, DeviceType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                updatingHHFirmwareMgmtStatusMongoDB(db.delta_Hypersprouts, db.delta_Jobs, DeviceId, status, DeviceType, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - Resend Firmware Management JOb
* @param JobID
* @param CardType
* @param callback - callback function returns success or error response
* @return callback function
*/

function findResendJobAndUpdate(JobID, CardType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                findResendJobAndUpdateMongodb(db.delta_Jobs, JobID, CardType, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - for the Webservice - FirmwareMgmtMeshResponse, Updating Firmware management status in Mongodb
* @param DeviceId
* @param MeterId
* @param status
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updatingMeshFirmwareMgmtStatus(DeviceId, MeterId, status, DeviceType,firmwareVersion, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                updatingMeshFirmwareStatusMongoDB(db.delta_Meters, db.delta_Jobs, DeviceId, MeterId, status, DeviceType, firmwareVersion, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - for the Webservice - FirmwareMgmtResponse, Updating Firmware management status in Mongodb when version update
* @param serialno
* @param DeviceType
* @param version
* @param status
* @param callback - callback function returns success or error response
* @return callback function
*/

function compareHHFirmwareVersion(serialno, DeviceType, version, status, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                compareHHFirmwareVersionMongoDB(db.delta_Jobs, serialno, version, DeviceType, status, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}


/**
* @description - for the Webservice - FirmwareMgmtFirmGroupSubmit, Create Firmware Job in MONGODB
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFirmwareJob(CardType, Firmware, Group, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else if (CardType === "MeshCard" || CardType === "MeterCard") {
                createFirmwareMeshJobMongoDB(db, CardType, Firmware, Group, callback);
            } else if (CardType === "DeltaLink") {
                createFirmwareDeltaLinkJobMongoDB(db, CardType, Firmware, Group, callback);
            } else {
                createFirmwareJobMongoDB(db, CardType, Firmware, Group, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - create Firmware Management
* @param DeviceType
* @param FirmwareName
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFirmwareManagement(DeviceType, FirmwareName, URL, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                createFirmwareManagementMongoDB(db.delta_FirmwareManagement, DeviceType, FirmwareName, URL, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - fetch Firmware Data
* @param FirmwareID
* @return callback function
*/

function fetchFirmwareData(FirmwareID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                fetchFirmwareDataMongoDB(db.delta_FirmwareManagement, FirmwareID, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - fetch Firmware latest data
* @param FirmwareID
* @return callback function
*/

function fetchFirmwareID(callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                fetchFirmwareIDMongoDB(db.delta_FirmwareManagement, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - add Packet To Firmware Job - Add packet to job for Firmware Upload
* @param SerialNumber
* @param packet
* @param DeviceID
* @param callback - callback function returns success or error response
* @return callback function
*/

function addPacketToFirmwareJob(SerialNumber, packet, DeviceID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                addPacketToFirmwareJobMongoDB(db.delta_Jobs, SerialNumber, packet, DeviceID, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/* ********** DB Commands SECTION 2 - NON-EXPOSED METHODS************************ */

/**
* @description - Resend Job , find Resend Job And Update to Mongodb
* @param collection
* @param JobID
* @param CardType
* @param callback - callback function returns success or error response
* @return callback function
*/

function findResendJobAndUpdateMongodb(collection, JobID, CardType, callback) {
    try {
        collection.find({ JobID: JobID, CardType: CardType, Status: "Failed" })
            .toArray(function (err, dataJob) {
                if (dataJob.length) {
                    async.each(dataJob,
                        function (jobDetails, callbackEach) {
                            if (jobDetails.SentPacket && jobDetails.DeviceID) {
                                collection.update({
                                    SerialNumber: jobDetails.SerialNumber,
                                    JobID: JobID, CardType: CardType, Status: 'Failed'
                                }, { $set: { Status: "Pending", CreatedDateTimestamp: new Date(), EndTime: null } },
                                    function (err, dataUpdated) {
                                        if (err) {
                                            callbackEach(err, null);
                                        } else {
                                            sToIOT.sendToIOT(jobDetails.SentPacket,
                                                jobDetails.DeviceID, function (err, out) {
                                                    if (err) {
                                                        callbackEach(err, null);
                                                    } else {
                                                        callbackEach(null, "Resend Job Successfully");
                                                    }
                                                });
                                        }
                                    });
                            } else {
                                callbackEach("Message ID/Device ID not found!!", null);
                            }
                        }, function (err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, "Resend Job Successfully");
                            }
                        });
                } else {
                    callback("Job not found", null);
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - Adding packet of Firmare Jobs to MongoDb
* @param collectionName
* @param SerialNumber
* @param packet
* @param DeviceID
* @param callback - callback function returns success or error response
* @return callback function
*/

function addPacketToFirmwareJobMongoDB(collectionName, SerialNumber,
    packet, DeviceID, callback) {
    try {
        collectionName.find({
            'SerialNumber': SerialNumber, 'JobName': "Firmware Job", Status:{$in:["Pending","Upgrade Failed"]}
        }).sort({ CreatedDateTimestamp: -1 }).toArray(function (err, addPacket) {
            if (err) {
                callback(err, null)
            } else {
                if (addPacket.length) {
                    collectionName.update({ SerialNumber: SerialNumber, JobName: "Firmware Job", JobID: addPacket[0].JobID }, {
                        $set: {
                            SentPacket: packet,
                            DeviceID: DeviceID
                        }
                    }, function (err, updated) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, "Firmware Uploaded Successfully")
                        }
                    })
                } else {
                    callback('Firmware job not found', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - Firmware management job status
* @param collectionName
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectJobStatusFirmwareMongoDB(collectionName, appCollection, DeviceType, data, callback) {
    try {
        if (!data.filter || data.filter == null || data.filter == "null" || data.filter != "DownloadInProgress") {
            let whereCondition = { "DeviceType": DeviceType, "JobName": "Firmware Job" };
            dao.findJobAndAppGroupPaginationAndSearch(collectionName, appCollection, data, whereCondition, DeviceType + " Firmware", DeviceType, callback);
        }
        else {
            let whereCondition = { "DeviceType": DeviceType, "JobName": "Firmware Job", "Status": "Download in Progress" };
            dao.findJobAndAppGroupPaginationAndSearch(collectionName, appCollection, data, whereCondition, DeviceType + " Firmware", DeviceType, callback);
        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -For the Webservice - FirmwareMgmtFirmGroup
* @param collectionName
* @param collectionName1
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectFirmwareAndGroupMongoDB(collectionName, collectionName1, DeviceType, callback) {
    try {
        collectionName.find({ "Type": DeviceType }, { FirmwareID: 1, Type: 1, CardType: 1, FirmwareName: 1 }).toArray(function (err, firmwareSelected) {
            if (err) {
                callback(err, null, null);
            } else {
                collectionName1.find({ "Type": DeviceType }).toArray(function (err, groupSelected) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        callback(null, firmwareSelected, groupSelected);
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - Updating status of Firmware Mgmt Job in hypersprouts and Meter
* @param collection
* @param collectionName1
* @param DeviceID
* @param status
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updatingHHFirmwareMgmtStatusMongoDB(collection, collectionName1, DeviceID, status, DeviceType, callback) {
    try {
        collection.find({ "HypersproutID": DeviceID }).toArray(function (err, hypersproutDetails) {
            if (err) {
                callback(err, null);
            } else {
                if (hypersproutDetails.length) {
                    collectionName1.find({
                        "SerialNumber": hypersproutDetails[0].HypersproutSerialNumber, "JobName": "Firmware Job",
                        "CardType": DeviceType,Status: { $nin: ["Completed", "Failed","Upgrade Failed" ]}
                    }).sort({ "CreatedDateTimestamp": -1 }).toArray(function (err, firmwareJobDetails) {
                        if (err) {
                            callback(err, null)
                        } else {
                            if (firmwareJobDetails.length > 0) {
                                collectionName1.update({
                                    "SerialNumber": hypersproutDetails[0].HypersproutSerialNumber,
                                    "JobID": firmwareJobDetails[0].JobID
                                }, {
                                    $set: {
                                        Status: status
                                    }
                                }, function (err, JobDetails) {
                                    if (err) {
                                        insertError.putErrorDetails(err, callback);
                                    } else {
                                        callback(null, "Firmware Update Status!");
                                    }
                                });
                            } else {
                                callback('No data available', null);
                            }
                        }
                    });
                } else {
                    callback('No data available', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - Updating status of Firmware management Job in hypersprouts and Meter
* @param collection
* @param collectionName1
* @param DeviceID
* @param MeterID
* @param status
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function updatingMeshFirmwareStatusMongoDB(collection, collectionName1, DeviceID, MeterID, status, DeviceType, firmwareVersion, callback) {
    try {
        collection.find({ "MeterID": MeterID }).toArray(function (err, MeterDetails) {
            if (err) {
                callback(err, null);
            } else {
                if (MeterDetails.length) {
                    collectionName1.find({
                        "SerialNumber": MeterDetails[0].MeterSerialNumber, "JobName": "Firmware Job",
                        "CardType": DeviceType,Status: { $nin: ["Completed", "Failed","Upgrade Failed"]}
                    }).sort({ "CreatedDateTimestamp": -1 }).toArray(function (err, firmwareJobDetails) {
                        if (err) {
                            callback(err, null)
                        } else {
                            if (firmwareJobDetails.length) {
                                let fwVersion1;
                                if (DeviceType == "MeshCard") {
                                    fwVersion1 = (firmwareVersion == "0.0.0.0" || !firmwareVersion) ? MeterDetails[0].Meters_FirmwareDetails.MeshCardFirmwareVersion : firmwareVersion;
                                } else {
                                    fwVersion1 = (firmwareVersion == "0.0.0.0" || !firmwareVersion) ? MeterDetails[0].Meters_FirmwareDetails.MeterCardFirmwareVersion : firmwareVersion;
                                }   
                                collectionName1.update({ "SerialNumber": MeterDetails[0].MeterSerialNumber, "JobID": firmwareJobDetails[0].JobID }, {
                                    $set: {
                                        Status: status,
                                        "FirmwareID" : fwVersion1
                                    }
                                }, function (err, JobDetails) {
                                    if (err) {
                                        insertError.putErrorDetails(err, callback);
                                    } else {
                                        let setFW;
                                        let fwVersion;
                                        if (DeviceType == "MeshCard") {
                                            fwVersion = (firmwareVersion == "0.0.0.0" || !firmwareVersion) ? MeterDetails[0].Meters_FirmwareDetails.MeshCardFirmwareVersion : firmwareVersion;
                                            setFW = {
                                                "Meters_FirmwareDetails.MeshCardFirmwareVersion": fwVersion
                                            }
                                        } else {
                                            fwVersion = (firmwareVersion == "0.0.0.0" || !firmwareVersion) ? MeterDetails[0].Meters_FirmwareDetails.MeterCardFirmwareVersion : firmwareVersion;

                                            setFW = {
                                                "Meters_FirmwareDetails.MeterCardFirmwareVersion": fwVersion
                                            }
                                        }
                                        collection.update({ "MeterID": MeterID }, {
                                            $set: setFW
                                            
                                        }, function (err, meterDetails) {
                                            if (err) {
                                                insertError.putErrorDetails(err, callback);
                                            } else {
                                                callback(null, "Firmware Update Status!");
                                            }
                                        })
                                    }
                                });
                            } else {
                                callback('No data available', null);
                            }
                        }
                    });
                } else {
                    callback('Meter data not available', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - Compare Firmware Version in mongoDB
* @param collection1
* @param serialno
* @param version
* @param DeviceType
* @param status
* @param callback - callback function returns success or error response
* @return callback function
*/

function compareHHFirmwareVersionMongoDB(collection1, serialno, version, DeviceType, status, callback) {
    try {
        collection1.find({ "SerialNumber": serialno, "JobName": "Firmware Job", "CardType": DeviceType, "Status": { $nin: ["Completed","Failed","Upgrade Failed"]} })
            .sort({ "CreatedDateTimestamp": -1 }).toArray(function (err, firmwareJobDetails) {
                if (err) {
                    callback(err, null)
                }
                else {
                    if (firmwareJobDetails.length) {
                        collection1.update({ "SerialNumber": serialno, "JobName": "Firmware Job", JobID: firmwareJobDetails[0].JobID }, {
                            $set: {
                                FirmwareID: version,
                                Status: status,
                                EndTime: new Date()
                            }
                        }, function (err, res) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, "Firmware Update Status!");
                            }
                        });
                    } else {
                        callback('No data available', null);
                    }
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - create Firmware Job in mongoDB, For the Webservice - FirmwareMgmtFirmGroupSubmit
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFirmwareJobMongoDB(dbConnection, CardType, Firmware, Group, callback) {
    try {
        var collectionName = dbConnection.delta_Jobs;
        var collectionName2 = dbConnection.delta_Hypersprouts;
        var collectionName3 = dbConnection.delta_SchedulerFlags;
        var hypersproutMeterDetails = [];
        var JobID = shortid.generate();
        regex = { AppIDs: Group, Status: "Registered" };
        collectionName2.find(regex).toArray(function (err, collectionArray) {
            if (!collectionArray) {
                var err = {};
                err.message = "No device available"
                callback(err, null);
            } else if (collectionArray.length > 0) {
                async.each(collectionArray, function (result, callback) {
                    let iNCFirmwareVersion = (!result.Hypersprout_FirmwareDetails || !result.Hypersprout_FirmwareDetails.iNCFirmwareVersion) ? null : result.Hypersprout_FirmwareDetails.iNCFirmwareVersion;
                    let iTMFirmwareVersion = (!result.Hypersprout_FirmwareDetails || !result.Hypersprout_FirmwareDetails.iTMFirmwareVersion) ? null : result.Hypersprout_FirmwareDetails.iTMFirmwareVersion;
                    var jobFirmware = {
                        "JobID": JobID,
                        "FirmwareID": CardType === "iNC" ? iNCFirmwareVersion : iTMFirmwareVersion,
                        "CardType": CardType,
                        "DeviceType": "HyperSprout",
                        "JobName": "Firmware Job",
                        "JobType": "Collector Firmware Job",
                        "Status": "Pending",
                        "GroupID": Group,
                        "SerialNumber": result.HypersproutSerialNumber,
                        "CreatedDateTimestamp": new Date(),
                    }
                    collectionName.insertOne(jobFirmware, function (err, updated) {
                        if (err) {
                            insertError.putErrorDetails(err, callback);
                        } else if (!result.DeviceID) {
                            callback("DeviceID not found!!", null)
                        } else {
                            result.Hypersprout_DeviceDetails.CountryCode = (result.Hypersprout_DeviceDetails.CountryCode) ? result.Hypersprout_DeviceDetails.CountryCode : 0;
                            result.Hypersprout_DeviceDetails.RegionCode = (result.Hypersprout_DeviceDetails.RegionCode) ? result.Hypersprout_DeviceDetails.RegionCode : 0;
                            createFirmwareUploadDeviceDetails(result.HypersproutID,
                                result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                                result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, collectionName3, JobID, function (err, response) {
                                    hypersproutMeterDetails.push(response);
                                    callback(null, hypersproutMeterDetails);
                                });
                        }
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, hypersproutMeterDetails);
                    }
                });
            } else {
                var err = {};
                err.message = "No device available"
                callback(err, null);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - create Firmware Mesh Job in mongoDB
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFirmwareMeshJobMongoDB(dbConnection, CardType, Firmware, Group, callback) {
    try {
        var collectionName = dbConnection.delta_Jobs;
        var collectionName1 = dbConnection.delta_Meters;
        var collectionName2 = dbConnection.delta_Hypersprouts;
        var collectionName3 = dbConnection.delta_SchedulerFlags;
        var hypersproutMeterDetails = [];
        var JobID = shortid.generate();
        regex = { AppIDs: Group, Status: "Registered" };
        collectionName1.find(regex).toArray(function (err, collectionArray) {
            if (collectionArray.length > 0) {
                async.each(collectionArray, function (result, callback) {
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
                        "FirmwareID": CardType === "MeshCard" ? result.Meters_FirmwareDetails.MeshCardFirmwareVersion :
                            result.Meters_FirmwareDetails.MeterCardFirmwareVersion,
                        "CardType": CardType,
                        "DeviceType": "Meter",
                        "JobName": "Firmware Job",
                        "JobType": "Mesh Firmware Job",
                        "Status": "Pending",
                        "GroupID": Group,
                        "SerialNumber": result.MeterSerialNumber,
                        "CreatedDateTimestamp": new Date(),
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
                                        callback(null, 'Data Not Found');
                                    } else if (!hyperresult[0].DeviceID) {
                                        callback("Device Not Found!!", null)
                                    }
                                    else {
                                        hyperresult[0].Hypersprout_DeviceDetails.CountryCode = (hyperresult[0].Hypersprout_DeviceDetails.CountryCode) ? hyperresult[0].Hypersprout_DeviceDetails.CountryCode : 0;
                                        hyperresult[0].Hypersprout_DeviceDetails.RegionCode = (hyperresult[0].Hypersprout_DeviceDetails.RegionCode) ? hyperresult[0].Hypersprout_DeviceDetails.RegionCode : 0;
                                        createFirmwareUploadDeviceDetails(result.HypersproutID,
                                            hyperresult[0].DeviceID, 0,
                                            hyperresult[0].Hypersprout_DeviceDetails.CountryCode,
                                            hyperresult[0].Hypersprout_DeviceDetails.RegionCode,
                                            result.MeterSerialNumber, collectionName3, JobID,
                                            function (err, response) {
                                                if (!hypersproutMeterDetails.some(item => item.DeviceID
                                                    === hyperresult[0].DeviceID)) {
                                                    response["MeterList"] = [result.MeterID];
                                                    hypersproutMeterDetails.push(response);
                                                } else {
                                                    var indexHH = hypersproutMeterDetails.findIndex(item => item.DeviceID === hyperresult[0].DeviceID);
                                                    hypersproutMeterDetails[indexHH].MeterList.push(result.MeterID);
                                                }
                                                callback(null, hypersproutMeterDetails);
                                            });
                                    }
                                });
                        }
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, hypersproutMeterDetails);
                    }
                });
            } else {
                var err = {};
                err.message = "No device available"
                callback(err, null);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - create Firmware upload device details
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

function createFirmwareUploadDeviceDetails(HypersproutID,
    DeviceID, MeterID, CountryCode, RegionCode, SerialNumber, collectionName3, JobID, callback) {
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
                    if ((messageIDdetails != null)) {
                        data["MessageID"] = messageIDdetails.length > 0 ? messageIDdetails[0].MessageID : 0;
                        callback(null, data);
                    }
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - create Firmware Management
* @param collectionName
* @param cardType
* @param FirmwareName
* @param callback - callback function returns success or error response
* @return callback function
*/
function createFirmwareManagementMongoDB(collectionName, cardType, FirmwareName, URL, callback) {
    try {
        var deviceType;
        if (cardType === "MeshCard" || cardType === "MeterCard") {
            deviceType = "Meter";
        } else if (cardType == "DeltaLink") {
            deviceType = "DeltaLink"
        } else {
            deviceType = "HyperSprout"
        }
        collectionName.find().sort({ "FirmwareID": -1 }).limit(1).next(function (err, record) {
            if (err)
                callback(err, null);
            else {
                var count;
                if (!record)
                    count = 0;
                else
                    count = record.FirmwareID;
                var doc = {
                    "FirmwareID": ++count,
                    "Type": deviceType,
                    "CardType": cardType,
                    "FirmwareName": FirmwareName,
                    "Url": URL,
                    "CreatedDate": new Date()
                };
                collectionName.insertOne(doc, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, "Firmware Imported Successfully");
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - fetch Firmware Data
* @param collectionName
* @param FirmwareID
* @return callback function
*/
function fetchFirmwareDataMongoDB(collectionName, FirmwareID, callback) {
    try {
        collectionName.find({ FirmwareID: FirmwareID }).toArray(function (err, record) {
            if (err)
                callback(err, null);
            else {
                callback(null, record);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - fetch Firmware ID
* @param collectionName
* @param FirmwareID
* @return callback function
*/
function fetchFirmwareIDMongoDB(collectionName, callback) {
    try {
        collectionName.find().sort({ "FirmwareID": -1 }).limit(1).next(function (err, record) {
            if (err)
                callback(err, null);
            else {
                var count;
                if (!record)
                    count = 0;
                else
                    count = record.FirmwareID;
                ID = ++count;
                callback(null, ID);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - For the Webservice - FirmwareMgmtJobStatus , SELECT Firmware Job Status details FROM MONGODB
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectDeltalinkJobStatusFirmware(DeviceType, filter, queryParams, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            selectDeltalinkJobStatusFirmwareMongoDB(db.delta_Jobs, db.delta_AppGroups, DeviceType, filter, queryParams, callback);
        }
    });
};

function selectDeltalinkJobStatusFirmwareMongoDB(collectionName, appCollection, DeviceType, filter, queryParams, callback) {
    let appGroup = [];
    let appGroup1 = [];
    let data = {};
    let data1 = {};
    let groupId = [];
    let whereCondition = {};
    if (filter == true || filter == 'true') {
        whereCondition = { "DeviceType": DeviceType, "JobName": "Firmware Job", "Status": { $in: ["Download in Progress", "Download Success", "MD5Sum Valid", "Firmware Upgrade in Progress", "Device Rebooting"] } }
    } else {
        whereCondition = { "DeviceType": DeviceType, "JobName": "Firmware Job" }
    }
    paginatedResults.paginatedResultsJobStatus(collectionName, appCollection, whereCondition, queryParams, "Deltalink Job", DeviceType, function (err, List) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, List)
        }
    })
};

/**
* @description - create Firmware Mesh Job in mongoDB
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFirmwareDeltaLinkJobMongoDB(dbConnection, CardType, Firmware, Group, callback) {
    try {
        var deltalinkCollectionNam = dbConnection.delta_DeltaLink;
        var collectionName = dbConnection.delta_Jobs;
        var meterCollection = dbConnection.delta_Meters;
        var hypersproutCollection = dbConnection.delta_Hypersprouts;
        var schedulerFlagsCollection = dbConnection.delta_SchedulerFlags;
        var hypersproutMeterDetails = [];
        var JobID = shortid.generate();
        regex = { AppIDs: Group, Status: "Registered" };
        deltalinkCollectionNam.find(regex).toArray(function (err, deltalinkResult) {
            if (err) {
                callback(err, null)
            } else if (deltalinkResult.length > 0) {
                async.each(deltalinkResult, function (result, callback) {
                    if (!result.DeltaLinks_DeviceDetails) {
                        result.DeltaLinks_DeviceDetails = {};
                    }
                    if (!result.DeltaLinks_DeviceDetails.DeltalinkVersion) {
                        result.DeltaLinks_DeviceDetails.DeltalinkVersion = null;
                    }
                    var jobFirmware = {
                        "JobID": JobID,
                        "FirmwareID": result.DeltaLinks_DeviceDetails.DeltalinkVersion,
                        "CardType": CardType,
                        "DeviceType": "DeltaLink",
                        "JobName": "Firmware Job",
                        "JobType": "DeltaLink Firmware Job",
                        "Status": "Pending",
                        "GroupID": Group,
                        "SerialNumber": result.DeltalinkSerialNumber,
                        "CreatedDateTimestamp": new Date(),
                    }
                    collectionName.insertOne(jobFirmware, function (err, updated) {
                        if (err) {
                            callback(err, null);
                        } else {
                            meterCollection.find({ "MeterID": result.MeterID, Status: "Registered" })
                                .toArray(function (err, meterResult) {
                                    if (err) {
                                        insertError.putErrorDetails(err, callback);
                                    } else if (meterResult.length === 0) {
                                        callback(null, 'Data Not Found');
                                    } else {
                                        hypersproutCollection.find({ "HypersproutID": meterResult[0].HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                                            .toArray(function (err, hyperresult) {
                                                if (err) {
                                                    insertError.putErrorDetails(err, callback);
                                                } else if (hyperresult.length === 0) {
                                                    callback(null, 'Data Not Found');
                                                } else if (!hyperresult[0].DeviceID) {
                                                    callback("DeviceID not found!!", null);

                                                } else {
                                                    hyperresult[0].Hypersprout_DeviceDetails.CountryCode = (hyperresult[0].Hypersprout_DeviceDetails.CountryCode) ? hyperresult[0].Hypersprout_DeviceDetails.CountryCode : 0;
                                                    hyperresult[0].Hypersprout_DeviceDetails.RegionCode = (hyperresult[0].Hypersprout_DeviceDetails.RegionCode) ? hyperresult[0].Hypersprout_DeviceDetails.RegionCode : 0;

                                                    createDeltalinkFirmwareUploadDeviceDetails(meterResult[0].HypersproutID,
                                                        hyperresult[0].DeviceID, 0,
                                                        hyperresult[0].Hypersprout_DeviceDetails.CountryCode,
                                                        hyperresult[0].Hypersprout_DeviceDetails.RegionCode,
                                                        result.DeltalinkSerialNumber, schedulerFlagsCollection, JobID,
                                                        function (err, response) {
                                                            if (!hypersproutMeterDetails.some(item => item.DeviceID
                                                                === hyperresult[0].DeviceID)) {
                                                                response["DeltaLinkList"] = [result.DeltalinkID];
                                                                hypersproutMeterDetails.push(response);
                                                            }
                                                            else {
                                                                var indexHH = hypersproutMeterDetails.findIndex(item => item.DeviceID === hyperresult[0].DeviceID);
                                                                hypersproutMeterDetails[indexHH].DeltaLinkList.push(result.DeltalinkID);

                                                            }
                                                            callback(null, hypersproutMeterDetails);

                                                        });
                                                }
                                            });
                                    }
                                })

                        }
                    })
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, hypersproutMeterDetails);
                    }
                });

            } else {
                var err = {};
                err.message = "No device available"
                callback(err, null);
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

};


/**
* @description - create Firmware upload device details
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

function createDeltalinkFirmwareUploadDeviceDetails(HypersproutID,
    DeviceID, MeterID, CountryCode, RegionCode, SerialNumber, collectionName3, JobID, callback) {
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
                    if (messageIDdetails != null) {
                        data["MessageID"] = messageIDdetails.length > 0 ? messageIDdetails[0].MessageID : 0;
                        callback(null, data);
                    }
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - for the Webservice - FirmwareMgmtDeltalinkResponse, Updating Firmware management status in Mongodb
* @param deltalinkId
* @param MeterId
* @param status
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updatingDeltalinkFirmwareMgmtStatus(DeviceId, deltalinkId, status, DeviceType, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updatingDeltalinkFirmwareMgmtStatusMongoDB(db.delta_DeltaLink, db.delta_Jobs, DeviceId, deltalinkId, status, DeviceType, db.delta_Meters, db.delta_Notification, db.delta_User,db.delta_token, callback);
        }
    });
}


/**
* @description - Updating status of Firmware management Job in Deltalink .
* @param collection
* @param collectionName1
* @param DeviceID
* @param DeltalinkID
* @param status
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function updatingDeltalinkFirmwareMgmtStatusMongoDB(deltalinkCollection, jobCollection, DeviceID, DeltalinkID, status, DeviceType, meterCollection, notificationCollection, userCollection, tokenCollection, callback) {
    deltalinkCollection.find({ "DeltalinkID": DeltalinkID }).toArray(function (err, deltalinkDetails) {
        if (err) {
            callback(err, null);
        } else {
            if (deltalinkDetails.length > 0) {
                jobCollection.find({
                    "SerialNumber": deltalinkDetails[0].DeltalinkSerialNumber, "JobName": "Firmware Job",
                    "CardType": DeviceType, EndTime: null, Status: { $nin: ["Completed", "Failed", "Upgrade Failed"] }
                }).sort({ "CreatedDateTimestamp": -1 }).toArray(function (err, firmwareJobDetails) {
                    if (err) {
                        callback(err, null)
                    } else {
                        jobCollection.update({ "SerialNumber": deltalinkDetails[0].DeltalinkSerialNumber, "JobID": firmwareJobDetails[0].JobID }, {
                            $set: {
                                Status: status
                            }
                        }, function (err, JobDetails) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else {
                                if (deltalinkDetails[0].MeterID == null || deltalinkDetails[0].MeterID == "null") {
                                    console.log("Notification not sent!!")
                                } else {

                                    let condition = { "MeterID": deltalinkDetails[0].MeterID }
                                    meterCollection.find(condition).toArray(function (err, meterDetails) {
                                        if (err) {
                                            console.log("Notification not sent !!", err);
                                        } else {
                                            if (meterDetails.length > 0) {
                                                let condition = { "UserID": meterDetails[0].Meters_Billing["MeterConsumerNumber"] }
                                                userCollection.find(condition).toArray(function (err, userDetails) {
                                                    if (err) {
                                                        console.log("Notification not sent !!", err);
                                                    } else {
                                                        if (userDetails.length > 0) {
                                                            tokenCollection.find(condition).toArray(function (err, tokenDetails) {
                                                                if (tokenDetails.length > 0) {
                                                                    let count = 0;
                                                                    tokenDetails.forEach(function (tokenDetail) {
                                                                        if (tokenDetail.DeviceType == "iOS") {
                                                                            let notification = {};
                                                                            notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                                                                            notification.badge = 3;
                                                                            notification.sound = "ping.aiff";
                                                                            // notification.alert = 'Firmware Upgrade';
                                                                            let bodyMessage;
                                                                            let title = "Firmware Upgrade"
                                                                            if (tokenDetail.DeviceLang == "SPA") {
                                                                                let title = "Firmware Upgrade"
                                                                                if (status == "Download in Progress") {
                                                                                    notification.alert = {
                                                                                        title: '¡Actualización de firmware!',
                                                                                        body: "Firmware iniciado"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'Firmware iniciado' };
                                                                                    bodyMessage = "Firmware iniciado";

                                                                                } else if (status == "Upgrade Success") {
                                                                                    notification.alert = {
                                                                                        title: '¡Actualización de firmware!',
                                                                                        body: "Firmware completado"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'Firmware completado' };
                                                                                    bodyMessage = "Firmware completado"

                                                                                } else {
                                                                                    notification.alert = {
                                                                                        title: '¡Actualización de firmware!',
                                                                                        body: "Error de firmware"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'Error de firmware' };
                                                                                    bodyMessage = "Error de firmware"
                                                                                }
                                                                            }else{

                                                                            if (status == "Download in Progress") {
                                                                                notification.alert = {
                                                                                    title: 'Firmware Upgrade!',
                                                                                    body: "Firmware Intitiated"
                                                                                }
                                                                                notification.payload = { 'Message': 'Firmware Intitiated' };
                                                                                bodyMessage = "Firmware Intitiated";

                                                                            } else if (status == "Upgrade Success") {
                                                                                notification.alert = {
                                                                                    title: 'Firmware Upgrade!',
                                                                                    body: "Upgrade Completed"
                                                                                }
                                                                                notification.payload = { 'Message': 'Firmware Completed' };
                                                                                bodyMessage = "Firmware Completed"

                                                                            } else {
                                                                                notification.alert = {
                                                                                    title: 'Firmware Upgrade!',
                                                                                    body: "Firmware Failed"
                                                                                }
                                                                                notification.payload = { 'Message': 'Firmware Failed' };
                                                                                bodyMessage = "Firmware Failed"

                                                                            }
                                                                        }
                                                                            var Tokens = tokenDetail.DeviceToken;
                                                                            FCM.sendNotificationAPN(notification, Tokens, function (err, response) {
                                                                                if (err) {
                                                                                    console.log("error in push notification ", err)
                                                                                } else {
                                                                                    count = count+1;
                                                                                    if(count ==1){
                                                                                    let insertData = {
                                                                                        "UserID": tokenDetail.UserID,
                                                                                        "CreatedDateTimestamp": new Date(),
                                                                                        "ID": 1,
                                                                                        "title": title,
                                                                                        "body": bodyMessage,

                                                                                    }
                                                                                    notificationCollection.insert(insertData, function (err, result) {
                                                                                        if (err) {
                                                                                            console.log("Notification sent successfully but Notification detials is not saved in database!! ", err)
                                                                                        }
                                                                                        else {
                                                                                            console.log("Notification sent successfully!!")
                                                                                        }
                                                                                    });
                                                                                }
                                                                                }
                                                                            });

                                                                        } else {
                                                                            let bodyMessage;
                                                                            let title = 'Firmware Upgrade'
                                                                            if (status == "Download in Progress") {
                                                                                bodyMessage = "Firmware Intitiated"
                                                                            } else if (status == "Upgrade Success") {
                                                                                bodyMessage = "Firmware Completed"
                                                                            } else {
                                                                                bodyMessage = "Firmware Failed"
                                                                            }
                                                                            var Tokens = tokenDetail.DeviceToken;
                                                                            var message = {
                                                                                data: {
                                                                                    title: title,
                                                                                    message: bodyMessage
                                                                                },
                                                                                notification: {
                                                                                    title: title,
                                                                                    body: bodyMessage
                                                                                }
                                                                            };
                                                                            FCM.sendNotification(message, Tokens, function (err, response) {
                                                                                if (err) {
                                                                                    console.log("error in push notification ", err)
                                                                                } else {
                                                                                    count = count+1;
                                                                                    if(count == 1){
                                                                                    let insertData = {
                                                                                        "UserID": tokenDetail.UserID,
                                                                                        "CreatedDateTimestamp": new Date(),
                                                                                        "ID": 1,
                                                                                        "title": title,
                                                                                        "body": bodyMessage,

                                                                                    }
                                                                                    notificationCollection.insert(insertData, function (err, result) {
                                                                                        if (err) {
                                                                                            console.log("Notification sent successfully but Notification detials is not saved in database!! ", err)
                                                                                        }
                                                                                        else {
                                                                                            console.log("Notification sent successfully!!")
                                                                                        }
                                                                                    });
                                                                                }
                                                                                }
                                                                            });
                                                                        }
                                                                    });

                                                                } else {
                                                                    console.log("Notification not sent !!")
                                                                }
                                                            });
                                                        } else {
                                                            console.log("Notification not sent !!")
                                                        }
                                                    }
                                                });
                                            } else {
                                                console.log("Notification not sent!!")

                                            }
                                            callback(null, "Firmware Update Status!");
                                        }
                                    })
                                }
                            }
                        });
                    }
                });
            } else {
                callback("Deltalink Details not available in the system", null)
            }

        }
    });
}

//Below is the function for update Job
function updateFirmwareJob(jobData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                jobsCollection = db.delta_Jobs;
                jobsCollection.updateMany({
                    $or: [
                        { "CreatedDateTimestamp": { $lte: new Date(new Date().getTime() - 1000 * 60 * 60) } },
                        { "JobID": jobData.JobID }
                    ],
                    "JobName": 'Firmware Job',
                    "SerialNumber": jobData.SerialNumber, "Status": 'Pending'
                }, { "$set": { "Status": 'Failed', "EndTime": new Date() } }, function (err, insertResponse) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, insertResponse)
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}



/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by F H Khan  ============== */

    selectJobStatusFirmware: selectJobStatusFirmware,
    selectFirmwareAndGroup: selectFirmwareAndGroup,
    createFirmwareJob: createFirmwareJob,
    updatingHHFirmwareMgmtStatus: updatingHHFirmwareMgmtStatus,
    createFirmwareManagement: createFirmwareManagement,
    compareHHFirmwareVersion: compareHHFirmwareVersion,
    updatingMeshFirmwareMgmtStatus: updatingMeshFirmwareMgmtStatus,
    findResendJobAndUpdate: findResendJobAndUpdate,
    addPacketToFirmwareJob: addPacketToFirmwareJob,
    fetchFirmwareData: fetchFirmwareData,
    fetchFirmwareID: fetchFirmwareID,
    selectDeltalinkJobStatusFirmware: selectDeltalinkJobStatusFirmware,
    createDeltalinkFirmwareUploadDeviceDetails: createDeltalinkFirmwareUploadDeviceDetails,
    updatingDeltalinkFirmwareMgmtStatus: updatingDeltalinkFirmwareMgmtStatus,
    updateFirmwareJob: updateFirmwareJob
    /* ================ End : Added by F H Khan  =================== */
};
