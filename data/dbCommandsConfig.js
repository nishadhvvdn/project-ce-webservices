//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var async = require('async');
var insertError = require('./insertErrorLogsToDB.js');
var sToIOT = require('./sendToiot.js');
var dbReg = require('./dbCommandsRegistration.js');
let gStatus = 0;

/* *************** DB Commands SECTION 2 - EXPOSED METHODS ************************ */

/**
* @description - setting backhaul setting of hs/hh jobs
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createBackHaulJobs(deviceId, deviceType,serialNo, ConfigType, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            createBackHaulJobsMongoDB(db, deviceId, deviceType,serialNo, ConfigType, callback);
        }
    });
};

/**
* @description - setting carrierlist fetch job
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createCarrierListJobs(deviceId, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            createCarrierListJobsMongoDB(db, deviceId, callback);
        }
    });
};

/**
* @description - setting mesh scan fetch job
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createMeshScanJobs(deviceId, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            createMeshScanJobsMongoDB(db, deviceId, callback);
        }
    });
};

/**
* @description - setting backhaul setting of hs/hh jobs
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createCloudConnectivityJobs(deviceId, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            createCloudConnectivityJobsMongoDB(db, deviceId, callback);
        }
    });
};

/**
* @description - setting fronthaul setting of hs/hh jobs
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFrontHaulJobs(deviceId, serialNo, deviceType, ConfigType, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            if (deviceType == 'meter') {
                createFrontHaulMeshJobsMongoDB(db, deviceId,serialNo, deviceType, ConfigType, callback);
            } else {
                createFrontHaulJobsMongoDB(db, deviceId,serialNo, deviceType, ConfigType, callback);
            }
        }
    });
};

/**
* @description - setting fronthaul setting of hs/hh jobs
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createSystemConfigurationJobs(deviceId, deviceType, ConfigType, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            if (deviceType == 'meter') {
                createSystemConfigurationJobsMeshMongoDB(db, deviceId, deviceType, ConfigType, callback);
            } else {
                createSystemConfigurationJobsMongoDB(db, deviceId, deviceType, ConfigType, callback);
            }
        }
    });
};
/**
* @description - setting fronthaul setting of hs/hh jobs
* @param deviceId
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function createMeterConfigurationJobs(deviceId, Type, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            createMeterConfigurationJobsMongoDB(db, deviceId, Type, callback);
        }
    });
};

/**
* @description - setting backhaul setting of hs/hh
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateBackHaul(DeviceId, Type, ConfigType, Data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateBackHaulMongoDB(db, DeviceId, Type, ConfigType, Data, callback);
        }
    });
};

/**
* @description - setting backhaul setting of hs/hh
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function onCarrierList(DeviceId, Type, ConfigType, Data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateBackHaulMongoDB(db, DeviceId, Type, ConfigType, Data, callback);
        }
    });
};

/**
* @description - setting backhaul setting of hs/hh
* @param deviceId
* @param url
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateCloudConnectivity(DeviceId, url, configTime, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateCloudConnectivityMongoDB(db, DeviceId, url, configTime, callback);
        }
    });
};
/**
* @description - setting backhaul setting of hs/hh
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateMeterConfig(DeviceId, ConfigType, Data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateMeterConfigMongoDB(db, DeviceId, ConfigType, Data, callback);
        }
    });
};
/**
* @description - setting fronthaul setting of hs/hh
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateFrontHaul(DeviceId, DeviceType, Type, ConfigType, Data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateFrontHaulMongoDB(db, DeviceId, DeviceType, Type, ConfigType, Data, callback);
        }
    });
};
/**
* @description - setting fronthaul setting of hs/hh
* @param deviceId
* @param deviceType
* @param ConfigType
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateSystemSettings(DeviceId, Type, ConfigType, Data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateSystemSettingsMongoDB(db, DeviceId, Type, ConfigType, Data, callback);
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
function saveDeviceConfigStatus(deviceId, status, DeviceType, messageid, FailureMsg, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            if (DeviceType == 'meter') {
                var meterCollection = db.delta_Meters;
                var jobsCollection = db.delta_Jobs;
                saveMeterConfigStatus(meterCollection, jobsCollection, deviceId, status, messageid, FailureMsg, callback);
            } else {
                var hsCollection = db.delta_Hypersprouts;
                var jobsCollection = db.delta_Jobs;
                saveHSConfigStatus(hsCollection, jobsCollection, deviceId, status, messageid, FailureMsg, callback);
            }
        }
    });
};

/**
* @description - save carrier details
* @param meterID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveDeviceCarriers(deviceId, CarrierStatus, Carrier, messageID, NoOfCarrier, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            var hsCollection = db.delta_Hypersprouts;
            var jobsCollection = db.delta_Jobs;
            var configCollection = db.delta_Config;
            saveHSCarrierList(hsCollection, jobsCollection, configCollection, deviceId, CarrierStatus, Carrier, messageID, NoOfCarrier, callback);

        }
    });
};

/**
* @description - save carrier details
* @param meterID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveDeviceMeshScan(deviceId, radio_band, scanList, messageID, scanCount, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            var MCollection = db.delta_Meters;
            var jobsCollection = db.delta_Jobs;
            var configCollection = db.delta_Config;
            saveMeterMEshScan(MCollection, jobsCollection, configCollection, deviceId, radio_band, scanList, messageID, scanCount, callback);
        }
    });
};

/* ********** DB Commands SECTION 2 - NON-EXPOSED METHODS************************ */
/**
* @description - create lockunlock job in mongoDB, For the Webservice - fronthaul
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createCloudConnectivityJobsMongoDB(dbConnection, DeviceId, callback) {
    var collectionName = dbConnection.delta_Jobs;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { HypersproutID: DeviceId };
    collectionName2.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {
                createConfigDeviceDetails(result.HypersproutID,
                    result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                    result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                        hypersproutMeterDetails.push(response);
                        msgId = response.MessageID;
                        msgId = msgId + 1;
                        var jobFirmware = {
                            "JobID": JobID,
                            "DeviceID": DeviceId,
                            "DeviceType": 'hs',
                            "JobName": "Cloud Connectivity Job",
                            "JobType": "Collector Cloud Connectivity Job",
                            "Status": "Pending",
                            "MessageID": msgId,
                            "SerialNumber": result.HypersproutSerialNumber,
                            "CreatedDateTimestamp": new Date(),
                        }
                        collectionName.insertOne(jobFirmware, function (err, updated) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else {
                                callback(null, hypersproutMeterDetails);
                            }
                        });
                    });

            } else {
                callback(null, []);
            }
        } else {
            callback(null, []);
        }
    });


};
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

function saveMeterConfigStatus(meterCollection, jobsCollection, meterID, status, messageid, FailureMsg, callback) {
    meterCollection.find({ MeterID: meterID }, { MeterSerialNumber: 1 }).toArray(function (err, metData) {
        if (err)
            callback(err, null);
        else if (metData) {
            jobsCollection.updateMany({ MessageID: messageid, SerialNumber: metData[0].MeterSerialNumber, "Status": "Pending", EndTime: null }, { $set: { ConfigStatus: status, "Reason": FailureMsg, "Status": "Completed" } }, callback);

        } else {
            callback("Invalid MeterID", null);
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

function saveHSConfigStatus(hsCollection, jobsCollection, HSID, status, messageid, FailureMsg, callback) {
    hsCollection.find({ HypersproutID: HSID }, { HypersproutSerialNumber: 1 }).toArray(function (err, hsData) {
        if (err)
            callback(err, null);
        else if (hsData) {
            jobsCollection.updateMany({ MessageID: messageid, SerialNumber: hsData[0].HypersproutSerialNumber, "Status": "Pending", EndTime: null }, { $set: { ConfigStatus: status, "Reason": FailureMsg, "Status": "Completed", EndTime: new Date() } }, callback);

        } else {
            callback("Invalid HSID", null);
        }
    });
}

/**
* @description - save carrier list
* @param hsCollection
* @param jobsCollection
* @param HSID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveHSCarrierList(hsCollection, jobsCollection, configCollection, deviceId, CarrierStatus, Carrier, messageID, NoOfCarrier, callback) {
    hsCollection.find({ HypersproutID: deviceId }, { HypersproutSerialNumber: 1 }).toArray(function (err, hsData) {
        if (err)
            callback(err, null);
        else if (hsData) {
            var saveCarrier = {
                "Status": CarrierStatus,
                "NoofCarrier": NoOfCarrier,
                "Carrier": Carrier
            }
            configCollection.updateOne({ HypersproutSerialNumber: hsData[0].HypersproutSerialNumber }, { $set: { "BackHaul.Cellular.CarrierList": Carrier } }, function (err, configUpdate) {
                if (err)
                    callback(err, null);
                else
                    jobsCollection.updateMany({ MessageID: messageID, "JobType": "Carrier List", SerialNumber: hsData[0].HypersproutSerialNumber, "Status": "Pending", EndTime: null }, { $set: { CarrierData: saveCarrier, "Status": "Completed", EndTime: new Date() } }, callback);
            });
        } else {
            callback("Invalid HSID", null);
        }
    });
}
/**
* @description - save carrier list
* @param hsCollection
* @param jobsCollection
* @param HSID
* @param status
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveMeterMEshScan(MCollection, jobsCollection, configCollection, deviceId, radio_band, scanList, messageID, scanCount, callback) {
    MCollection.find({ MeterID: deviceId }, { MeterSerialNumber: 1 }).toArray(function (err, hsData) {
        if (err)
            callback(err, null);
        else if (hsData) {
            jobsCollection.updateMany({ MessageID: messageID, "JobType": "Mesh Scan", SerialNumber: hsData[0].MeterSerialNumber, "Status": "Pending", EndTime: null }, { $set: { "scanList": scanList, "Status": "Completed", EndTime: new Date() } }, callback);
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

function updateCloudConnectivityMongoDB(dbConnection, DeviceId, url, configTime, callback) {

    var collectionName = dbConnection.delta_Config;
    regex = { HypersproutID: DeviceId };
    collectionName.update(regex, { $set: { "Cloud_Connectivity_Settings.cerFile": url, "config_UpdateTime": configTime } }, function (err, res) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (res.result.nModified === 0)
            return callback(new Error("Configuration couldn't be updated"), null);
        else
            return callback(null, res.result.nModified);
    });

};

/**
* @description - create lockunlock job in mongoDB, For the Webservice - LockUnlockDevice
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateBackHaulMongoDB(dbConnection, DeviceId, Type, ConfigType, Data, callback) {

    var collectionName = dbConnection.delta_Config;
    regex = { HypersproutID: DeviceId };
    var key = ConfigType + "." + Type;
    var config_time = Data.config_time;
    delete Data.config_time;
    if (Type == "Cellular") {
        collectionName.update(regex, { $set: { "BackHaul.Cellular": Data, "config_UpdateTime": config_time } }, function (err, res) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else if (res.result.nModified === 0)
                return callback(new Error("Configuration couldn't be updated"), null);
            else
                return callback(null, res);
        });
    } else if (Type == "Ethernet") {
        collectionName.update(regex, { $set: { "BackHaul.Ethernet": Data, "config_UpdateTime": config_time } }, function (err, res) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else if (res.result.nModified === 0)
                return callback(new Error("Configuration couldn't be updated"), null);
            else
                return callback(null, res);
        });
    } else {
        collectionName.update(regex, { $set: { "BackHaul.Advanced": Data, "config_UpdateTime": config_time } }, function (err, res) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else if (res.result.nModified === 0)
                return callback(new Error("Configuration couldn't be updated"), null);
            else
                return callback(null, res);
        });
    }
};

/**
* @description - create lockunlock job in mongoDB, For the Webservice - fronthaul
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateMeterConfigMongoDB(dbConnection, DeviceId, ConfigType, Data, callback) {

    var collectionName = dbConnection.delta_Config;
    regex = { MeterID: DeviceId };
    collectionName.update(regex, { $set: { "Meter_Configuration": Data, "config_UpdateTime": Date.now() } }, function (err, res) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (res.result.nModified === 0)
            return callback(new Error("Configuration couldn't be updated"), null);
        else
            return callback(null, res);
    });

};

/**
* @description - create lockunlock job in mongoDB, For the Webservice - LockUnlockDevice
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateSystemSettingsMongoDB(dbConnection, DeviceId, Type, ConfigType, Data, callback) {

    var collectionName = dbConnection.delta_Config;
    let countryCollection = dbConnection.delta_Default;
    if (Type == "meter")
        regex = { MeterID: DeviceId };
    else
        regex = { HypersproutID: DeviceId };

    var config_time = Data.config_time;
    delete Data.config_time;
    countryCollection.find({ "Country": Data.country }).toArray(function (err, result) {
        if (err) {
            callback(err, null)
        } else {
            if (result.length > 0) {
                let insertDocs;
                if (result[0].Country == "UZBEKISTAN") {
                    insertDocs = {
                        "System_Settings": Data,
                        "config_UpdateTime": config_time,
                        "FrontHaul.Radio_Configuration.two_four.channel": result[0].Config.two_four.Channels[0],
                        "FrontHaul.Radio_Configuration.two_four.txpower": result[0].Config.two_four.TransmitPower,
                        "FrontHaul.Radio_Configuration.five_low.channel": result[0].Config.five_low.Channels[0],
                        "FrontHaul.Radio_Configuration.five_low.txpower": result[0].Config.five_low.TransmitPower,
                    }
                } else {
                    insertDocs = {
                        "System_Settings": Data,
                        "config_UpdateTime": config_time,
                        "FrontHaul.Radio_Configuration.two_four.channel": result[0].Config.two_four.Channels[0],
                        "FrontHaul.Radio_Configuration.two_four.txpower": result[0].Config.two_four.TransmitPower,
                        "FrontHaul.Radio_Configuration.five_low.channel": result[0].Config.five_low.Channels[0],
                        "FrontHaul.Radio_Configuration.five_low.txpower": result[0].Config.five_low.TransmitPower,
                        "FrontHaul.Radio_Configuration.five_high.channel": result[0].Config.five_high.Channels[0],
                        "FrontHaul.Radio_Configuration.five_high.txpower": result[0].Config.five_high.TransmitPower

                    }
                }
                collectionName.update(regex, { $set: insertDocs }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else {
                        return callback(null, res);
                    }
                });
            } else {
                collectionName.update(regex, { $set: { "System_Settings": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else {
                        return callback(null, res);
                    }
                });
            }
        }
    })


};

/**
* @description - create lockunlock job in mongoDB, For the Webservice - LockUnlockDevice
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateFrontHaulMongoDB(dbConnection, DeviceId, DeviceType, Type, ConfigType, Data, callback) {
    var collectionName = dbConnection.delta_Config;
    var hsCollection = dbConnection.delta_Hypersprouts;
    var meterCollection = dbConnection.delta_Meters;
    var jobsCollection = dbConnection.delta_Jobs;

    if (DeviceType == "meter")
        regex = { MeterID: DeviceId };
    else
        regex = { HypersproutID: DeviceId };
    var key = ConfigType + "." + Type;
    var config_time = Data.config_time;
    delete Data.config_time;
    if (DeviceType != "meter") {
        if (ConfigType == "Radio") {
            if (Type == "2_4") {
                collectionName.update(regex, { $set: { "FrontHaul.Radio_Configuration.two_four": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            } else if (Type == "5_L") {
                collectionName.update(regex, { $set: { "FrontHaul.Radio_Configuration.five_low": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            } else {
                collectionName.update(regex, { $set: { "FrontHaul.Radio_Configuration.five_high": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            }

        } else if (ConfigType == "Mesh") {
            if (Type == "2_4") {
                collectionName.update(regex, { $set: { "FrontHaul.Mesh_Configuration.two_four": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            } else if (Type == "5_H") {
                collectionName.update(regex, { $set: { "FrontHaul.Mesh_Configuration.five_high": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            }
        } else if (ConfigType == "Hotspot") {
            if (Type == "2_4") {
                collectionName.update(regex, { $set: { "FrontHaul.Hotspot_Configuration.two_four": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            } else if (Type == "5") {
                collectionName.update(regex, { $set: { "FrontHaul.Hotspot_Configuration.five": Data, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            }
        } else {
            if ('Hotspot' in Data) {
                collectionName.update(regex, { $set: { "FrontHaul.DHCP.Hotspot": Data.Hotspot, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            }else{
                collectionName.update(regex, { $set: { "FrontHaul.DHCP.Mesh": Data.Mesh, "config_UpdateTime": config_time } }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.nModified === 0)
                        return callback(new Error("Configuration couldn't be updated"), null);
                    else
                        return callback(null, res);
                });
            }

        }
    } else {
        if (ConfigType == "Radio") {
            collectionName.update(regex, { $set: { "FrontHaul.Radio_Configuration": Data, "config_UpdateTime": config_time } }, function (err, res) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (res.result.nModified === 0)
                    return callback(new Error("Configuration couldn't be updated"), null);
                else
                    return callback(null, res);
            });
        } else if (ConfigType == "Mesh") {
            var hsCollection = dbConnection.delta_Hypersprouts;
            collectionName.findOneAndUpdate(regex, { $set: { "FrontHaul.Mesh_Configuration": Data, "config_UpdateTime": config_time } }, function (err, res) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (res.lastErrorObject.updatedExisting === false)
                    return callback(new Error("Configuration couldn't be updated"), null);
                else {
                    let HsDetails = [];
                    let flag = 0;
                    FetchFormDB(Data, flag, hsCollection, meterCollection, HsDetails).then((gStatus) => {
                        if (gStatus == 1) {
                            var MMacId = [];
                            MMacId.push(res.value.System_Info.wifi_mac_2);
                            var i = 0;
                            HsDetails.forEach(function (HSData) {
                                if ((HSData.MessageID == 255) || (HSData.MessageID == null) || (HSData.MessageID == undefined) || (isNaN(HSData.MessageID)))
                                    msgID = 0;
                                else
                                    msgID = ++HSData.MessageID;
                                var jobdoc = [];
                                JobType = "Mac ACl Meter Registration"
                                for (var key in MMacId) {
                                    jobdoc.push({
                                        "JobID": shortid.generate(),
                                        "DeviceID": HSData.DeviceID,
                                        "SerialNumber": HSData.HypersproutSerialNumber,
                                        "DeviceType": "Meter",
                                        "JobName": "Registration Job",
                                        "JobType": JobType,
                                        "Status": "Pending",
                                        "Group": "NA",
                                        "MessageID": msgID,
                                        "CreatedDateTimestamp": new Date(),
                                        "MacID": MMacId[key]
                                    });
                                }
                                dbReg.sendMacIDs(hsCollection, MMacId, msgID, HSData, JobType, function (err, resp) {
                                    for (var key in jobdoc) {
                                        jobdoc[key].PacketSent = resp;
                                    }
                                    jobsCollection.insertMany(jobdoc, function (err, response) {
                                        if (err) {
                                            callback(err, null)
                                        } else {
                                            i++;
                                            if (HsDetails.length == i)
                                                return callback(null, res);
                                        }
                                    });
                                });
                            });

                        } else {
                            return callback(null, res);
                        }
                    });

                }

            });
        } else if (ConfigType == "Hotspot") {
            collectionName.update(regex, { $set: { "FrontHaul.Hotspot_Configuration": Data, "config_UpdateTime": config_time } }, function (err, res) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (res.result.nModified === 0)
                    return callback(new Error("Configuration couldn't be updated"), null);
                else
                    return callback(null, res);
            });
        } else {
            collectionName.update(regex, { $set: { "FrontHaul.DHCP": Data, "config_UpdateTime": config_time } }, function (err, res) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (res.result.nModified === 0)
                    return callback(new Error("Configuration couldn't be updated"), null);
                else
                    return callback(null, res);
            });
        }
    }
};


function FetchFormDB(Data, flag, hsCollection, meterCollection, HsDetails) {
    return new Promise((resolve, reject) => {
        if ((Data.Primary.DeviceType == 0 || Data.Primary.DeviceType == 1) && (Data.Secondary.DeviceType == 0 || Data.Secondary.DeviceType == 1)) {
            hsCollection.find({ Status:"Registered", $or: [{ "Hypersprout_Communications.MAC_ID_MESH02": Data.Primary.Mac }, { "Hypersprout_Communications.MAC_ID_MESH12": Data.Primary.Mac }, { "Hypersprout_Communications.MAC_ID_MESH02": Data.Secondary.Mac }, { "Hypersprout_Communications.MAC_ID_MESH12": Data.Secondary.Mac }] }).toArray(function (err, transformerDetails) {
                if (err)
                reject(err)
                else if (transformerDetails.length === 0) {
                    resolve(gStatus=0)
                }
                else {
                    if (transformerDetails[0])
                        HsDetails.push(transformerDetails[0]);
                    if (transformerDetails[1])
                        HsDetails.push(transformerDetails[1]);
                    resolve(gStatus=1)
                }
            });
        } else if ((Data.Primary.DeviceType == 0 || Data.Primary.DeviceType == 1) && (Data.Secondary.DeviceType == 2)) {
            hsCollection.find({ Status:"Registered",$or: [{ "Hypersprout_Communications.MAC_ID_MESH02": Data.Primary.Mac }, { "Hypersprout_Communications.MAC_ID_MESH12": Data.Primary.Mac }] }).toArray(function (err, transformerDetails) {
                if (err)
                    reject(err)                
                else {
                    if (transformerDetails[0])
                        HsDetails.push(transformerDetails[0]);
                    meterCollection.find({ "Meters_Communications.MAC_ID_WiFi": Data.Secondary.Mac }).toArray(function (err, MeterDetails) {
                        if (err)
                        reject(err)
                        else if (MeterDetails.length === 0) {
                            if (HsDetails.length > 1)
                                resolve(gStatus = 1);
                            else
                                resolve(gStatus = 0);
                        }
                        else {
                            hsCollection.find({Status:"Registered", HypersproutID: MeterDetails[0].HypersproutID }).toArray(function (err, transformerDetails) {
                                if (err)
                                reject(err)
                                else {
                                    if (transformerDetails[0])
                                        HsDetails.push(transformerDetails[0]);
                                    flag = 1;
                                    resolve(gStatus=1);
                                }

                            });
                        }

                    });
                }
            });
        } else if ((Data.Secondary.DeviceType == 0 || Data.Secondary.DeviceType == 1) && (Data.Primary.DeviceType == 2)) {
            hsCollection.find({ Status:"Registered", $or: [{ "Hypersprout_Communications.MAC_ID_MESH02": Data.Secondary.Mac }, { "Hypersprout_Communications.MAC_ID_MESH12": Data.Secondary.Mac }] }).toArray(function (err, transformerDetails) {
                if (err)
                reject(err)                
                else {
                    if (transformerDetails[0])
                        HsDetails.push(transformerDetails[0]);
                    meterCollection.find({ "Meters_Communications.MAC_ID_WiFi": Data.Primary.Mac }).toArray(function (err, MeterDetails) {
                        if (err)
                        reject(err)
                        else if (MeterDetails.length === 0) {
                            flag = 1;
                            if (HsDetails.length > 1)
                                resolve(gStatus = 1);
                            else
                                resolve(gStatus = 0);
                        }
                        else {
                            hsCollection.find({Status:"Registered", HypersproutID: MeterDetails[0].HypersproutID }).toArray(function (err, transformerDetails) {
                                if (err)
                                reject(err)
                                else {
                                    if (transformerDetails[0])
                                        HsDetails.push(transformerDetails[0]);
                                    flag = 1;
                                    resolve(gStatus=1);
                                }

                            });
                        }

                    });
                }
            });
        } else {
            meterCollection.find({ $or: [{ "Meters_Communications.MAC_ID_WiFi": Data.Secondary.Mac }, { "Meters_Communications.MAC_ID_WiFi": Data.Primary.Mac }] }).toArray(function (err, MeterDetails) {
                if (err)
                reject(err)
                else if (MeterDetails.length === 0) {
                    resolve(gStatus=0);
                }
                else {
                    var MeterID = [];
                    if (MeterDetails[0])
                        MeterID.push(MeterDetails[0].HypersproutID);
                    if (MeterDetails[1])
                        MeterID.push(MeterDetails[1].HypersproutID);
                    hsCollection.find({Status:"Registered", HypersproutID: { $in: MeterID } }).toArray(function (err, transformerDetails) {
                        if (err)
                        reject(err)
                        else {
                            if (transformerDetails[0])
                                HsDetails.push(transformerDetails[0]);
                            if (transformerDetails[1])
                                HsDetails.push(transformerDetails[1]);
                            flag = 1;
                            resolve(gStatus=1);
                        }

                    });

                }

            });
        }
    })
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

function SendMacAcl(Data,DeviceId,callback){
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            SendMacAclReg(db, Data,DeviceId, callback);
        }
    });
}

function SendMacAclReg(dbConnection,Data,DeviceId,callback){
    var collectionName = dbConnection.delta_Config;
    var hsCollection = dbConnection.delta_Hypersprouts;
    var meterCollection = dbConnection.delta_Meters;
    var jobsCollection = dbConnection.delta_Jobs;

    regex = { MeterID: DeviceId };
    collectionName.findOne(regex ).toArray(function (err, res) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else {
            let HsDetails = [];
            let flag = 0;
            var FetchData = {};
            FetchData.Primary ={};
            FetchData.Secondary = {};
            FetchData.Primary.Mac = Data[0].MeshMac.toLowerCase();
            FetchData.Secondary.Mac = Data[0].MeshMac1.toLowerCase();
            FetchData.Primary.DeviceType = Data[0].MeshDeviceType;
            FetchData.Secondary.DeviceType = Data[0].MeshDeviceType1;
            FetchFormDB(FetchData, flag, hsCollection, meterCollection, HsDetails).then((gStatus) => {
                if (gStatus == 1) {
                    var MMacId = [];
                    MMacId.push(res.value.System_Info.wifi_mac_2);
                    var i = 0;
                    HsDetails.forEach(function (HSData) {
                        if ((HSData.MessageID == 255) || (HSData.MessageID == null) || (HSData.MessageID == undefined) || (isNaN(HSData.MessageID)))
                            msgID = 0;
                        else
                            msgID = ++HSData.MessageID;
                        var jobdoc = [];
                        JobType = "Mac ACl Meter Registration"
                        for (var key in MMacId) {
                            jobdoc.push({
                                "JobID": shortid.generate(),
                                "DeviceID": HSData.DeviceID,
                                "SerialNumber": HSData.HypersproutSerialNumber,
                                "DeviceType": "Meter",
                                "JobName": "Registration Job",
                                "JobType": JobType,
                                "Status": "Pending",
                                "Group": "NA",
                                "MessageID": msgID,
                                "CreatedDateTimestamp": new Date(),
                                "MacID": MMacId[key]
                            });
                        }
                        dbReg.sendMacIDs(hsCollection, MMacId, msgID, HSData, JobType, function (err, resp) {
                            for (var key in jobdoc) {
                                jobdoc[key].PacketSent = resp;
                            }
                            jobsCollection.insertMany(jobdoc, function (err, response) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    i++;
                                    if (HsDetails.length == i)
                                        return callback(null, res);
                                }
                            });
                        });
                    });

                } else {
                    return callback(null, res);
                }
            });

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

function createBackHaulJobsMongoDB(dbConnection, DeviceId, deviceType,serialNo, ConfigType, callback) {
    if (deviceType == 'hh') {
        type = "HyperHub"
    } else {
        type = "HyperSprout"
    }
    var collectionName = dbConnection.delta_Jobs;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { HypersproutID: DeviceId,"HypersproutSerialNumber":serialNo };
    collectionName2.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {
                createConfigDeviceDetails(result.HypersproutID,
                    result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                    result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                        hypersproutMeterDetails.push(response);
                        msgId = response.MessageID;
                        msgId = msgId + 1;
                        var jobFirmware = {
                            "JobID": JobID,
                            "DeviceID": DeviceId,
                            "DeviceType": type,
                            "JobName": "BackHaul Job",
                            "JobType": "Collector BackHaul Job",
                            "Status": "Pending",
                            "MessageID": msgId,
                            "SerialNumber": result.HypersproutSerialNumber,
                            "CreatedDateTimestamp": new Date(),
                        }
                        collectionName.insertOne(jobFirmware, function (err, updated) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else {
                                callback(null, hypersproutMeterDetails);
                            }
                        });
                    });
            } else {
                callback(null, []);
            }
        } else {
            callback(null, []);
        }

    });

};


/**
* @description - create lockunlock job in mongoDB, For the Webservice - LockUnlockDevice
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createCarrierListJobsMongoDB(dbConnection, DeviceId, callback) {

    type = "HyperSprout"

    var collectionName = dbConnection.delta_Jobs;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { HypersproutID: DeviceId };
    collectionName2.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {
                createConfigDeviceDetails(result.HypersproutID,
                    result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                    result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                        hypersproutMeterDetails.push(response);
                        msgId = response.MessageID;
                        msgId = msgId + 1;
                        var jobFirmware = {
                            "JobID": JobID,
                            "DeviceID": DeviceId,
                            "DeviceType": type,
                            "JobName": "BackHaul Job",
                            "JobType": "Carrier List",
                            "Status": "Pending",
                            "MessageID": msgId,
                            "SerialNumber": result.HypersproutSerialNumber,
                            "CreatedDateTimestamp": new Date(),
                        }
                        collectionName.insertOne(jobFirmware, function (err, updated) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else {
                                callback(null, hypersproutMeterDetails);
                            }
                        });
                    });
            } else {
                callback(null, []);
            }
        } else {
            callback(null, []);
        }

    });

};
/**
* @description - create lockunlock job in mongoDB, For the Webservice - LockUnlockDevice
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createMeshScanJobsMongoDB(dbConnection, DeviceId, callback) {

    type = "Meter"

    var collectionName = dbConnection.delta_Jobs;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var collectionName4 = dbConnection.delta_Meters;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { MeterID: DeviceId };
    collectionName4.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            Mresult = collectionArray[0];
            if (Mresult.Status == "Registered") {
                regex = { HypersproutID: Mresult.HypersproutID };
                collectionName2.find(regex).toArray(function (err, collectionArray1) {
                    if (collectionArray1.length == 0) {
                        var err = {};
                        err.message = "Device Not Found"
                        callback(err, null);
                    } else if (collectionArray1.length > 0) {
                        result = collectionArray1[0];
                        if (result.Status == "Registered") {
                            createConfigDeviceDetails(result.HypersproutID,
                                result.DeviceID, DeviceId, result.Hypersprout_DeviceDetails.CountryCode,
                                result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                                    hypersproutMeterDetails.push(response);
                                    msgId = response.MessageID;
                                    msgId = msgId + 1;
                                    var jobFirmware = {
                                        "JobID": JobID,
                                        "DeviceID": DeviceId,
                                        "DeviceType": type,
                                        "JobName": "FrontHaul Job",
                                        "JobType": "Mesh Scan",
                                        "Status": "Pending",
                                        "MessageID": msgId,
                                        "SerialNumber": Mresult.MeterSerialNumber,
                                        "CreatedDateTimestamp": new Date(),
                                    }
                                    collectionName.insertOne(jobFirmware, function (err, updated) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else {
                                            callback(null, hypersproutMeterDetails);
                                        }
                                    });
                                });
                        } else {
                            callback(null, []);
                        }
                    } else {
                        callback(null, []);
                    }
                });
            } else {
                callback(null, []);
            }
        } else {
            callback(null, []);
        }

    });

};
/**
* @description - create lockunlock job in mongoDB, For the Webservice - fronthaul
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFrontHaulJobsMongoDB(dbConnection, DeviceId,serialNo, deviceType, ConfigType, callback) {
    if (deviceType == 'hh') {
        type = "HyperHub"
    } else {
        type = "HyperSprout"
    }
    var collectionName = dbConnection.delta_Jobs;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { HypersproutID: DeviceId, "HypersproutSerialNumber":serialNo };
    collectionName2.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {
                createConfigDeviceDetails(result.HypersproutID,
                    result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                    result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                        hypersproutMeterDetails.push(response);
                        msgId = response.MessageID;
                        msgId = msgId + 1;
                        var jobFirmware = {
                            "JobID": JobID,
                            "DeviceID": DeviceId,
                            "DeviceType": type,
                            "JobName": "FrontHaul Job",
                            "JobType": "Collector FrontHaul Job",
                            "Status": "Pending",
                            "MessageID": msgId,
                            "SerialNumber": result.HypersproutSerialNumber,
                            "CreatedDateTimestamp": new Date(),
                        }
                        collectionName.insertOne(jobFirmware, function (err, updated) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else {
                                callback(null, hypersproutMeterDetails);
                            }
                        });
                    });
            } else {
                callback(null, []);
            }
        } else {
            callback(null, []);
        }

    });

};
/**
* @description - create lockunlock job in mongoDB, For the Webservice - fronthaul
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createSystemConfigurationJobsMongoDB(dbConnection, DeviceId, deviceType, ConfigType, callback) {
    if (deviceType == 'hh') {
        type = "HyperHub"
    } else {
        type = "HyperSprout"
    }
    var collectionName = dbConnection.delta_Jobs;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { HypersproutID: DeviceId };
    collectionName2.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {
                createConfigDeviceDetails(result.HypersproutID,
                    result.DeviceID, 0, result.Hypersprout_DeviceDetails.CountryCode,
                    result.Hypersprout_DeviceDetails.RegionCode, result.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                        hypersproutMeterDetails.push(response);
                        msgId = response.MessageID;
                        msgId = msgId + 1;
                        var jobFirmware = {
                            "JobID": JobID,
                            "DeviceID": DeviceId,
                            "DeviceType": type,
                            "JobName": "System Settings Job",
                            "JobType": "System Settings Job",
                            "Status": "Pending",
                            "MessageID": msgId,
                            "SerialNumber": result.HypersproutSerialNumber,
                            "CreatedDateTimestamp": new Date(),
                        }
                        collectionName.insertOne(jobFirmware, function (err, updated) {
                            if (err) {
                                insertError.putErrorDetails(err, callback);
                            } else {
                                callback(null, hypersproutMeterDetails);
                            }
                        });
                    });
            } else {
                callback(null, []);
            }
        } else {
            callback(null, []);
        }
    });

};

/**
* @description - create  job in mongoDB, For the Webservice - fronthaul
* @param DeviceId
* @param Type
* @param dbConnection
* @param callback - callback function returns success or error response
* @return callback function
*/

function createMeterConfigurationJobsMongoDB(dbConnection, DeviceId, Type, callback) {

    var type = "Meter"

    var collectionName = dbConnection.delta_Jobs;
    var collectionName1 = dbConnection.delta_Meters;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { MeterID: DeviceId };
    collectionName1.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {


                collectionName2.find({ "HypersproutID": result.HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                    .toArray(function (err, hyperresult) {
                        hyperresult = hyperresult[0];
                        if (err) {
                            insertError.putErrorDetails(err, callback);
                        } else if (hyperresult.length === 0) {
                            var err = {};
                            err.message = "HS is not Available"
                            callback(err, null);
                        } else {
                            createConfigDeviceDetails(hyperresult.HypersproutID,
                                hyperresult.DeviceID, DeviceId, hyperresult.Hypersprout_DeviceDetails.CountryCode,
                                hyperresult.Hypersprout_DeviceDetails.RegionCode, hyperresult.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                                    hypersproutMeterDetails.push(response);
                                    msgId = response.MessageID;
                                    msgId = msgId + 1;
                                    var jobFirmware = {
                                        "JobID": JobID,
                                        "DeviceID": DeviceId,
                                        "DeviceType": type,
                                        "JobName": "FrontHaul Job",
                                        "JobType": "Meter Configuration Job",
                                        "Status": "Pending",
                                        "MessageID": msgId,
                                        "SerialNumber": result.MeterSerialNumber,
                                        "CreatedDateTimestamp": new Date(),
                                    }
                                    collectionName.insertOne(jobFirmware, function (err, updated) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else {
                                            callback(null, hypersproutMeterDetails);
                                        }
                                    });
                                });
                        }
                    });
            } else {
                callback(null, []);
            }
        } else {
            callback(null, []);
        }
    });

};



/**
* @description - create lockunlock job in mongoDB, For the Webservice - fronthaul
* @param dbConnection
* @param DeviceId
* @param ConfigType
* @param callback - callback function returns success or error response
*/

function createSystemConfigurationJobsMeshMongoDB(dbConnection, DeviceId, deviceType, ConfigType, callback) {

    var type = "Meter"

    var collectionName = dbConnection.delta_Jobs;
    var collectionName1 = dbConnection.delta_Meters;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { MeterID: DeviceId };
    collectionName1.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {

                collectionName2.find({ "HypersproutID": result.HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                    .toArray(function (err, hyperresult) {
                        hyperresult = hyperresult[0]
                        if (err) {
                            insertError.putErrorDetails(err, callback);
                        } else if (hyperresult.length === 0) {
                            var err = {};
                            err.message = "HS is not Available"
                            callback(err, null);
                        } else {
                            createConfigDeviceDetails(hyperresult.HypersproutID,
                                hyperresult.DeviceID, DeviceId, hyperresult.Hypersprout_DeviceDetails.CountryCode,
                                hyperresult.Hypersprout_DeviceDetails.RegionCode, hyperresult.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                                    hypersproutMeterDetails.push(response);
                                    msgId = response.MessageID;
                                    msgId = msgId + 1;
                                    var jobFirmware = {
                                        "JobID": JobID,
                                        "DeviceID": DeviceId,
                                        "DeviceType": type,
                                        "JobName": "System Settings Job",
                                        "JobType": "System Settings Job",
                                        "Status": "Pending",
                                        "MessageID": msgId,
                                        "SerialNumber": result.MeterSerialNumber,
                                        "CreatedDateTimestamp": new Date(),
                                    }
                                    collectionName.insertOne(jobFirmware, function (err, updated) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else {
                                            callback(null, hypersproutMeterDetails);
                                        }
                                    });
                                });
                        }
                    });

            } else {
                callback(null, []);
            }

        } else {
            callback(null, []);
        }
    });

};

/**
* @description - create lockunlock job in mongoDB, For the Webservice - fronthaul
* @param dbConnection
* @param CardType
* @param Firmware
* @param Group
* @param callback - callback function returns success or error response
* @return callback function
*/

function createFrontHaulMeshJobsMongoDB(dbConnection, DeviceId,serialNo, deviceType, ConfigType, callback) {

    var type = "Meter"

    var collectionName = dbConnection.delta_Jobs;
    var collectionName1 = dbConnection.delta_Meters;
    var collectionName2 = dbConnection.delta_Hypersprouts;
    var collectionName3 = dbConnection.delta_SchedulerFlags;
    var hypersproutMeterDetails = [];
    var JobID = shortid.generate();
    regex = { MeterID: DeviceId, "MeterSerialNumber":serialNo };
    collectionName1.find(regex).toArray(function (err, collectionArray) {
        if (collectionArray.length == 0) {
            var err = {};
            err.message = "Device Not Found"
            callback(err, null);
        } else if (collectionArray.length > 0) {
            result = collectionArray[0];
            if (result.Status == "Registered") {
                collectionName2.find({ "HypersproutID": result.HypersproutID, DeviceID: { $exists: true }, Status: "Registered" })
                    .toArray(function (err, hyperresult) {
                        hyperresult = hyperresult[0];
                        if (err) {
                            insertError.putErrorDetails(err, callback);
                        } else if (hyperresult.length === 0) {
                            var err = {};
                            err.message = "HS is not Available"
                            callback(err, null);
                        } else {
                            createConfigDeviceDetails(hyperresult.HypersproutID,
                                hyperresult.DeviceID, DeviceId, hyperresult.Hypersprout_DeviceDetails.CountryCode,
                                hyperresult.Hypersprout_DeviceDetails.RegionCode, hyperresult.HypersproutSerialNumber, JobID, collectionName3, function (err, response) {
                                    hypersproutMeterDetails.push(response);
                                    msgId = response.MessageID;
                                    msgId = msgId + 1;
                                    var jobFirmware = {
                                        "JobID": JobID,
                                        "DeviceID": DeviceId,
                                        "DeviceType": type,
                                        "JobName": "FrontHaul Job",
                                        "JobType": "Meter FrontHaul Job",
                                        "Status": "Pending",
                                        "MessageID": msgId,
                                        "SerialNumber": result.MeterSerialNumber,
                                        "CreatedDateTimestamp": new Date(),
                                    }
                                    collectionName.insertOne(jobFirmware, function (err, updated) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else {
                                            callback(null, hypersproutMeterDetails);
                                        }
                                    });
                                });
                        }
                    });

            } else {
                callback(null, hypersproutMeterDetails);
            }

        } else {
            callback(null, hypersproutMeterDetails);
        }

    });

};


/**
* @description - create config details device details
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

function createConfigDeviceDetails(HypersproutID,
    DeviceID, MeterID, CountryCode, RegionCode, SerialNumber, JobID, collectionName3, callback) {
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
}

/* DB Commands SECTION 3 - MODULE EXPORTS*/

function updateAlarmsEvent(DeviceId, deviceType, Data, callback) {

    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateAlarmsEventMongoDB(db, DeviceId, deviceType, Data, callback);
        }
    });
};

function updateAlarmsEventMongoDB(dbConnection, DeviceId, deviceType, Data, callback) {
    var collectionName = dbConnection.delta_Config;
    if (deviceType == 'hs' || deviceType == 'hh')
        regex = { HypersproutID: DeviceId };
    else
        regex = { MeterID: DeviceId };
    collectionName.update(regex, { $set: { "Alarm": Data } }, function (err, res) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (res.result.nModified === 0)
            return callback(new Error("AlarmEvents Configurations couldn't be updated!"), null);
        else
            return callback(null, res);
    });
};

module.exports = {
    /* ============== Start : Added by Surya  ============== */

    createBackHaulJobs: createBackHaulJobs,
    updateBackHaul: updateBackHaul,
    createFrontHaulJobs: createFrontHaulJobs,
    updateFrontHaul: updateFrontHaul,
    saveDeviceConfigStatus: saveDeviceConfigStatus,
    createMeterConfigurationJobs: createMeterConfigurationJobs,
    updateMeterConfig: updateMeterConfig,
    createSystemConfigurationJobs: createSystemConfigurationJobs,
    updateSystemSettings: updateSystemSettings,
    updateCloudConnectivity: updateCloudConnectivity,
    createCloudConnectivityJobs: createCloudConnectivityJobs,
    updateAlarmsEvent: updateAlarmsEvent,
    createCarrierListJobs: createCarrierListJobs,
    saveDeviceCarriers: saveDeviceCarriers,
    createMeshScanJobs: createMeshScanJobs,
    saveDeviceMeshScan: saveDeviceMeshScan,
    SendMacAcl: SendMacAcl

    /* ================ End : Added by Surya  =================== */
};