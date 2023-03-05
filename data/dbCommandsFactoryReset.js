const dbCon = require('./dbConnection.js');
const shortid = require('shortid');
const insertError = require('./insertErrorLogsToDB.js');
const dbCommandLogs = require('./dbCommandsDeviceLogs');

/**
* @description - for the Webservice - FirmwareMgmtFirmGroupSubmit, Create Firmware Job IN MONGODB FOR FACTORY RESET
* @param deviceId
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function createFactoryResetJobs(deviceId, DeviceType,factoryResetType, serialNumber, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else if (DeviceType === "Meter") {
                createResetMeshJobsMongoDB(db, deviceId, DeviceType,factoryResetType, serialNumber, callback);
            } else if (DeviceType === "DeltaLink") {
                createResetDLJobsMongoDB(db, deviceId, DeviceType, factoryResetType,serialNumber, callback);
            } else {
                createHHResetJobsMongoDB(db, deviceId, DeviceType,factoryResetType, serialNumber, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

function createHHResetJobsMongoDB(dbConnection, DeviceId, DeviceType, factoryResetType, serialNumber, callback){
    try {
        //Need to check is any meter is associated with HH/HS
        var MeterCollection = dbConnection.delta_Meters;
        MeterCollection.find({TransformerID : DeviceId}, {'MeterSerialNumber' : 1}).toArray((err, isMeterExist) => {
            if(err)
                callback(err, null);
            else if((isMeterExist.length && factoryResetType == 'full')){
                var err = {};            
                err.message = "Please ungroup all the meters from HS/HH"
                callback(err, null);
            }
            else{
                
                var collectionName = dbConnection.delta_Jobs;
                var collectionName2 = dbConnection.delta_Hypersprouts;
                var collectionName3 = dbConnection.delta_SchedulerFlags;
                var hypersproutMeterDetails = [];
                var JobID = shortid.generate();
                regex = { HypersproutID: DeviceId, Status: "Registered" , "HypersproutSerialNumber" : serialNumber};
                collectionName2.find(regex).toArray(function (err, collectionArray) {
                    if (!collectionArray) {
                        err.message = "No device available"
                        callback(err, null);
                    } else if (collectionArray.length > 0) {
                        result = collectionArray[0];
                        var jobReset = {
                            "JobID": JobID,
                            "DeviceID": result.DeviceID,
                            "DeviceType": DeviceType,
                            "JobName": "Factory Reset Job",
                            "JobType": `${factoryResetType} factory reset for ${DeviceType}`, //"Device Factory Reset Job",
                            "Status": "Pending",
                            "SerialNumber": result.HypersproutSerialNumber,
                            "CreatedDateTimestamp": new Date(),
                        }
                        collectionName.insertOne(jobReset, function (err, updated) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else {
                                createResetDeviceDetails(result.HypersproutID,
                                    result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                                    result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, DeviceType, function (err, response) {
                                        hypersproutMeterDetails.push(response);
                                        callback(null, hypersproutMeterDetails);
                                    });
                            }
                        });
                    } else {
                        callback(new Error("Hypersprout not available"), null);
                    }
                });
            }    
        })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - create Factory Reset Job in mongoDB
* @param dbConnection
* @param Deviceid
* @param DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function createResetMeshJobsMongoDB(dbConnection, Deviceid, DeviceType,factoryResetType, serialNumber, callback) {
    try {
        //Need to check is any deltalink is associated with Meter
        var DeltaLinkCollection = dbConnection.delta_DeltaLink;
        DeltaLinkCollection.find({ MeterID: Deviceid }, { 'DeltalinkSerialNumber': 1 }).toArray((err, isMeterExist) => {
            if (err)
                callback(err, null);
            else if ((isMeterExist.length && factoryResetType == 'full')) {
                var err = {};
                err.message = "Please ungroup all the deltalinks from meters"
                callback(err, null);
            }
            else {
                let collectionName = dbConnection.delta_Jobs;
                let collectionName1 = dbConnection.delta_Meters;
                let collectionName2 = dbConnection.delta_Hypersprouts;
                let collectionName3 = dbConnection.delta_SchedulerFlags;
                let hypersproutMeterDetails = [];
                let JobID = shortid.generate();
                regex = { MeterID: Deviceid, Status: "Registered", "MeterSerialNumber": serialNumber };
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
                        let jobReset = {
                            "JobID": JobID,
                            "DeviceType": DeviceType,
                            "JobName": "Factory Reset Job",
                            "JobType": `${factoryResetType} factory reset for ${DeviceType}`, //"Device Factory Reset Job",
                            "Status": "Pending",
                            "SerialNumber": result.MeterSerialNumber,
                            "CreatedDateTimestamp": new Date(),
                        }

                        collectionName2.find({ "HypersproutID": result.HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                            .toArray(function (err, hyperresult) {
                                if (err) {
                                    insertError.putErrorDetails(err, callback);
                                } else if (hyperresult.length > 0) {
                                    //insert job
                                    jobReset.DeviceID = hyperresult[0].DeviceID;
                                    collectionName.insertOne(jobReset, function (err, updated) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else {
                                            createResetDeviceDetails(result.HypersproutID,
                                                hyperresult[0].DeviceID, result.MeterID, hyperresult[0].Hypersprout_DeviceDetails.CountryCode,
                                                hyperresult[0].Hypersprout_DeviceDetails.RegionCode, result.MeterSerialNumber, JobID, collectionName3, DeviceType, function (err, response) {
                                                    hypersproutMeterDetails.push(response);
                                                    callback(null, hypersproutMeterDetails);
                                                });
                                        }
                                    });
                                } else {
                                    callback(new Error("Hypersprout not available"), null);
                                }
                            });


                    } else {
                        var err = {};
                        err.message = "Invalid Meter"
                        callback(err, null);
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - create reset DL Job in mongoDB
* @param dbConnection
* @param Deviceid
* @param DeviceType
* @param factoryResetType
* @param callback - callback function returns success or error response
* @return callback function
*/
function createResetDLJobsMongoDB(dbConnection, Deviceid, DeviceType, factoryResetType, serialNumber, callback) {
    try {
        var collectionName = dbConnection.delta_Jobs;
        var collectionName1 = dbConnection.delta_DeltaLink;
        var collectionName2 = dbConnection.delta_Hypersprouts;
        var collectionName3 = dbConnection.delta_SchedulerFlags;
        var hypersproutMeterDetails = [];
        var JobID = shortid.generate();
        collectionName1.aggregate([
            {
                $match: { $and: [{ DeltalinkID: Deviceid }, { Status: "Registered" }, {"DeltalinkSerialNumber" : serialNumber}] }
            },
            {
                $lookup:
                {
                    from: "DELTA_Meters",
                    localField: "MeterID",
                    foreignField: "MeterID",
                    as: "MeterObjects"
                }
            },
            {
                $unwind: {
                    path: "$MeterObjects",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $project:
                {
                    "DeltalinkSerialNumber": 1,
                    "DeltalinkID" : 1,
                    "MeterID": "$MeterObjects.MeterID",
                    "HypersproutID": "$MeterObjects.HypersproutID",
                    "MeterSerialNumber": "$MeterObjects.MeterSerialNumber"
                }
            },
        ]).toArray(function (err, collectionArray) {
            if (collectionArray.length > 0) {
                result = collectionArray[0];
                let jobReset = {
                    "JobID": JobID,
                    "DeviceType": DeviceType,
                    "JobName": "Factory Reset Job",
                    "JobType": `${factoryResetType} factory reset for ${DeviceType}`, //"Device Factory Reset Job",
                    "Status": "Pending",
                    "SerialNumber": result.DeltalinkSerialNumber,
                    "CreatedDateTimestamp": new Date(),
                }
                collectionName.insertOne(jobReset, function (err, updated) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName2.find({ "HypersproutID": result.HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                            .toArray(function (err, hyperresult) {
                                if (err) {
                                    insertError.putErrorDetails(err, callback);
                                } else if (hyperresult.length > 0) {
                                    createResetDeviceDetails(result.HypersproutID,
                                        hyperresult[0].DeviceID, result.DeltalinkID, hyperresult[0].Hypersprout_DeviceDetails.CountryCode,
                                        hyperresult[0].Hypersprout_DeviceDetails.RegionCode, result.MeterSerialNumber, JobID, collectionName3,DeviceType, function (err, response) {
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
        })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null); 
    }
};


/**
* @description - Save Factory Reset Device Status
* @param factoryResetValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveFactoryResetResponse(factoryResetValues, callback){
   try {
       let jobSetCondition = { ResetStatus: factoryResetValues.ResetStatus , Status : factoryResetValues.Status , EndTime : factoryResetValues.EndTime}
       dbCon.getDb(function (err, db) {
           if (err) {
               return callback(err, null);
           } else {
               var meterCollection = db.delta_Meters;
               var hyperSproutCollection = db.delta_Hypersprouts;
               var DeltalinkCollection = db.delta_DeltaLink;
               var jobsCollection = db.delta_Jobs;
               saveFactoryResetStatusMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, factoryResetValues, jobSetCondition, callback);
           }
       });
   } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
   }
}

function saveFactoryResetStatusMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, data, jobSetCondition, callback){
    try {
        let jobCondition;
        if (data.Attribute == "HS_FULL_FACTORY_RESET" || data.Attribute == "HS_SHALLOW_FACTORY_RESET") {
            hyperSproutCollection.find({ HypersproutID: data.CellID }, { "HypersproutID": 1, "HypersproutSerialNumber": 1 }).toArray(function (err, res) {
                if (err)
                    callback(err, null)
                else {
                    if (res.length > 0) {
                        if (data.Attribute == "HS_FULL_FACTORY_RESET" && data.Status === "Success") {
                            hyperSproutCollection.updateOne({ HypersproutSerialNumber: res[0].HypersproutSerialNumber }, { $set: { Status: 'NotRegistered', device_lock: 0 } }, function (err, result) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    jobCondition = { SerialNumber: res[0].HypersproutSerialNumber, JobName: "Factory Reset Job", "Status": "Pending", EndTime: null };
                                    dbCommandLogs.updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, result)
                                        }
                                    })
                                }
                            });
                        } else {
                            hyperSproutCollection.updateOne({ HypersproutSerialNumber: res[0].HypersproutSerialNumber }, { $set: { device_lock: 0 } }, function (err, result) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    jobCondition = { SerialNumber: res[0].HypersproutSerialNumber, JobName: "Factory Reset Job", "Status": "Pending", EndTime: null };
                                    dbCommandLogs.updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, result)
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        callback("No Record Found", null);
                    }
                }
            })
        } else if (data.Attribute == "METER_FULL_FACTORY_RESET" || data.Attribute == "METER_SHALLOW_FACTORY_RESET") {
            meterCollection.find({ MeterID: data.MeterID }, { "MeterID": 1, "MeterSerialNumber": 1 }).toArray(function (err, res) {
                if (err)
                    callback(err, null)
                else {
                    if (res.length > 0) {
                        if (data.Attribute == "METER_FULL_FACTORY_RESET" && data.Status === "Success") {
                            meterCollection.updateOne({ MeterSerialNumber: res[0].MeterSerialNumber }, { $set: { Status: 'NotRegistered', device_lock: 0 } }, function (err, result) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    jobCondition = { SerialNumber: res[0].MeterSerialNumber, JobName: "Factory Reset Job", "Status": "Pending", DeviceType: "Meter", EndTime: null };
                                    dbCommandLogs.updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, result)
                                        }
                                    })
                                }
                            });
                        } else {
                            meterCollection.updateOne({ MeterSerialNumber: res[0].MeterSerialNumber }, { $set: { device_lock: 0 } }, function (err, result) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    jobCondition = { SerialNumber: res[0].MeterSerialNumber, JobName: "Factory Reset Job", "Status": "Pending", DeviceType: "Meter", EndTime: null };
                                    dbCommandLogs.updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, result)
                                        }
                                    })
                                }
                            });
                        }
                    } else {
                        callback("No Record Found", null);
                    }
                }
            })
        }else if(data.Attribute == "DL_FULL_FACTORY_RESET" ||  data.Attribute == "DL_SHALLOW_FACTORY_RESET"){
            DeltalinkCollection.find({ DeltalinkID: data.MeterID },{"DeltalinkID" :1, "DeltalinkSerialNumber" : 1}).toArray(function (err, res) {
                if (err)
                    callback(err, null)
                else{
                    if (res.length > 0) {
                        if (data.Attribute == "DL_FULL_FACTORY_RESET" && data.Status === "Success") {
                            DeltalinkCollection.updateOne({ DeltalinkSerialNumber: res[0].DeltalinkSerialNumber }, { $set: { Status: 'NotRegistered' } }, function (err, result) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    jobCondition = { SerialNumber: res[0].DeltalinkSerialNumber, JobName: "Factory Reset Job", "Status": "Pending", DeviceType: "DeltaLink", EndTime: null };
                                    dbCommandLogs.updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, result)
                                        }
                                    })
                                }
                            });
                        } else {
                            jobCondition = { SerialNumber: res[0].DeltalinkSerialNumber, JobName: "Factory Reset Job", "Status": "Pending", DeviceType: "DeltaLink", EndTime: null };
                            dbCommandLogs.updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, result)
                                }
                            })
                        }
                    } else {
                        callback("No Record Found", null);
                    }
                }
            })
        } else {
            callback("Invalid Attribute", null);
        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - create Factory reset device details
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

function createResetDeviceDetails(HypersproutID,
    DeviceID, MeterID, CountryCode, RegionCode, SerialNumber, JobID, collectionName3, DeviceType, callback) {
        try {
            var data = {
                CELLID: HypersproutID,
                DeviceID: DeviceID,
                CountryCode: CountryCode,
                RegionCode: RegionCode,
                SerialNumber: SerialNumber,
                JobID: JobID
            }
           if(DeviceType == 'Meter' || DeviceType == 'DeltaLink'){
                data.MeterID = MeterID;  
            }else{
                data.MeterID = 0;
            }
            
            collectionName3.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 })
                .toArray(function
                    (err, messageIDdetails) {
                    if (err)
                        callback(err, null);
                    else {
                        if (messageIDdetails.length > 0) {
                            data["MessageID"] = messageIDdetails[0].MessageID;
                        }else{
                            data["MessageID"] = 0;
                        }
                        callback(null, data);
                    }
            });
        } catch (error) {
            callback(`Something went wrong : ${error.name} ${error.message}`, null);
        }
}





module.exports = {
    createFactoryResetJobs: createFactoryResetJobs,
    saveFactoryResetResponse : saveFactoryResetResponse,
    createResetDeviceDetails : createResetDeviceDetails
};