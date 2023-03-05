//REQUIRED PACKAGES AND FILES.
const dbCon = require('./dbConnection.js');
const sendToIOT = require('./sendToiot.js');
const insertError = require('./insertErrorLogsToDB.js');
const parser = require('../data/parser.js');
const shortid = require('shortid');
const paginatedResults = require('../config/Helpers/Pagination')
const azureStorage = require('azure-storage');
const connectionString = process.env.BlobConnectionString;
const account = process.env.Account;
const key = process.env.BlobKey;
const container = process.env.DeviceLogContainer;
const blobService = azureStorage.createBlobService(account, key);
let webHost = process.env.webservicehost;
let protocol = process.env.protocol;
const async = require('async');

// get blob url to upload file

function getBlobTempPublicUrl(container, DeviceValues, FileName, callback) {
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 100);
    startDate.setMinutes(startDate.getMinutes() - 100);
    const sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.WRITE,
            Start: startDate,
            Expiry: expiryDate
        }
    };
    var blobPath = "deviceLogs" + '/' + DeviceValues.DeviceType + '/' + DeviceValues.DeviceId + '/' + FileName;
    const token = blobService.generateSharedAccessSignature(container, blobPath, sharedAccessPolicy);
    let url = blobService.getUrl(container, blobPath, token, true);
    callback(null, token)
}


/**
* @description - For the Webservice - getDeviceLogsList, SELECT All Device logs lists details FROM MONGODB 
* @param DeviceLogsDetails object 
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDeviceLogsList(deviceLogsDetails, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                findCollection(db, deviceLogsDetails.deviceType, function (err, collection) {
                    if (!err) {
                        getDeviceLogsListFromMongoDB(db.delta_DeviceLogs, collection, deviceLogsDetails, callback);
                    } else {
                        callback("inavlid condition !!", null)
                    }
                })

            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description - For the Webservice - getDeviceLogsList, SELECT All Device logs lists details FROM MONGODB after query
* @param DeviceLogsDetails object 
* @param DeviceLogsCollection collection name
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDeviceLogsListFromMongoDB(DeviceLogsCollection, CollectionName, DeviceLogsDetails, callback) {
    try {
        findCondition(DeviceLogsDetails.deviceType, DeviceLogsDetails.deviceId, function (err, condition) {
            if (!err) {
                collectionStatus(CollectionName, condition, DeviceLogsDetails, function (err, result) {
                    if (err) {
                        callback(err, null)
                    } else {
                        let whereCondition = { DeviceType: DeviceLogsDetails.deviceType, DeviceId: DeviceLogsDetails.deviceId }
                        paginatedResults.paginatedResultsSort(DeviceLogsCollection, whereCondition, DeviceLogsDetails, DeviceLogsDetails.deviceType, "CreatedDate", function (err, List) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, List)
                            }
                        })
                    }
                })
            } else {
                callback("inavlid condition !!", null)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }


}
/**
* @description - For the Webservice - collectionStatus, SELECT All Device  details which is registered FROM MONGODB after query
* @param CollectionName MongodbCollection 
* @param condition condition used for mongodb query
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function collectionStatus(CollectionName, condition, Device, callback) {
    try {
        CollectionName.find(condition).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length > 0) {
                    callback(null, result);
                } else {
                    callback(Device.deviceType + " not Registered", null);
                }
            }
        });
    } catch (e) {

        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - For the Webservice - collectionStatus, SELECT All Device  details which is registered FROM MONGODB after query
* @param CollectionName MongodbCollection 
* @param condition condition used for mongodb query
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function collectionStatusDeltalink(CollectionName, condition, Device, callback) {
    try {
        CollectionName.find(condition).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length > 0) {
                    callback(null, result);
                } else {
                    callback(Device + " not Registered", null);
                }
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - For the Webservice - findCollection, SELECT Collection Name on the basis of Device Type
* @param db database parameter
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function findCollection(db, Device, callback) {
    try {
        var collectionName;
        if (Device == "Meter") {
            collectionName = db.delta_Meters
        } else if (Device == "HyperSprout" || Device == "HyperHub") {
            collectionName = db.delta_Hypersprouts
        } else {
            collectionName = db.delta_DeltaLink
        }

        callback(null, collectionName)
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}
/**
* @description - For the Webservice - find where condition on the basis of where condition , query from mongodb
* @param Device DeviceDetails i.e DeviceType
* @param DeviceId Device Id i.e MeterID, HypersproutID, DeltalinkID
* @param callback - callback function returns success or error response
* @return callback function
*/

function findCondition(Device, DeviceId, callback) {
    try {
        let condition;
        switch (Device) {
            case "Meter": condition = { MeterID: DeviceId, Status: "Registered" }
                callback(null, condition)
                break;
            case "HyperSprout": condition = { HypersproutID: DeviceId, Status: "Registered", IsHyperHub: false }
                callback(null, condition)
                break;
            case "HyperHub":
                condition = { HypersproutID: DeviceId, Status: "Registered", IsHyperHub: true }
                callback(null, condition)
                break;
            case "DeltaLink": condition = { DeltalinkID: DeviceId, Status: "Registered" }
                callback(null, condition)
                break;
            default:
                callback("Invalid Condition!!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

//Clear Logs

/**
* @description - Clear logs Web Service
* @param ClearLogsValues contains DeviceType and DeviceId 
* @param callback - callback function returns success or error response
* @return callback function
*/

function clearLogsStatus(clearLogsValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                let meterCollection = db.delta_Meters;
                let hyperSproutCollection = db.delta_Hypersprouts;
                let deltalinkCollection = db.delta_DeltaLink;
                let jobsCollection = db.delta_Jobs;
                findCollection(db, clearLogsValues.deviceType, function (err, collection) {
                    if (!err) {
                        getClearLogsStatusFromMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, collection, clearLogsValues, callback);
                    } else {
                        callback("inavlid condition !!", null)
                    }
                })
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}
/**
* @description -Query from mongoDB , parse the data , send the parsed data to IOT, create a job, save the System Event logs .
* @param  ClearLogsValues contains DeviceType and DeviceId
* @param  meterCollection
* @param  hyperSproutCollection
* @param  DeltalinkCollection,
* @param jobsCollection,
* @param CollectionName
* @param  callback - callback function returns success or error response
* @return callback function
*/


function getClearLogsStatusFromMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, CollectionName, ClearLogsValues, callback) {
    try {
        getDeviceHSDetails(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, CollectionName, ClearLogsValues, function (err, response) {
            if (err) {
                callback(err, null);
            } else {
                let action, attribute, Purpose;
                switch (ClearLogsValues.deviceType) {
                    case "Meter":
                        action = 'LOGS';
                        attribute = 'METER_CLEAR_LOGS';
                        Purpose = 'METER_CLEAR_LOGS'
                        break;
                    case "HyperHub":
                        action = 'LOGS';
                        attribute = 'HH_CLEAR_LOGS';
                        Purpose = 'HH_CLEAR_LOGS'
                        break;
                    case "HyperSprout":
                        action = 'LOGS';
                        attribute = 'HS_CLEAR_LOGS';
                        Purpose = 'HS_CLEAR_LOGS'
                        break;
                    case "DeltaLink":
                        action = 'LOGS';
                        attribute = 'DL_CLEAR_LOGS';
                        Purpose = 'DL_CLEAR_LOGS'
                        break;

                    default:
                        callback("Invalid data !!", null)
                }
                getDataToParse(ClearLogsValues, response, action, attribute, Purpose, "", function (err, data) {
                    if (err) {
                        callback(err, null)
                    } else {
                        parser.hexaCreation(data, function (err, Hexresult) {
                            if (err) {
                                callback(err, null);
                            } else {
                                sendToIOT.sendToIOT(Hexresult, response.DeviceID, function (err, success) {
                                    if (err) {
                                        callback(err.name, null);
                                    } else {
                                        getjobdoc(response, data, ClearLogsValues, Purpose, function (err, jobdoc) {
                                            updateMessageIDAndCreateJob(jobsCollection, jobdoc, data.messageid, function (err, successResponse) {
                                                setTimeout(function () {
                                                    getCurrentStatus(jobsCollection, ClearLogsValues.deviceId, data.messageid, jobdoc.JobID, "ClearLogs", function (err, result) {
                                                        if (err) {
                                                            callback(err, null);
                                                        } else {
                                                            systemEvents(data.rev, data.cellid, ClearLogsValues.deviceId, data.messageid, data.action, data.attribute, Hexresult, ClearLogsValues.deviceType, function (err, _successEve) {
                                                                if (err) {
                                                                    callback(err, null)
                                                                } else {
                                                                    callback(null, result);
                                                                }
                                                            })

                                                        }
                                                    });
                                                }, 3000);
                                            })
                                        })


                                    }
                                })
                            }
                        })

                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - get Device HS Details
* @param hyperSproutCollection
* @param meterCollection
* @param DeltalinkCollection
* @param DeviceId
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDeviceHSDetails(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, CollectionName, LogsValues, callback) {
    try {
        findCondition(LogsValues.deviceType, LogsValues.deviceId, function (err, condition) {
            if (!err) {
                collectionStatus(CollectionName, condition, LogsValues, function (err, result) {
                    if (err) {
                        callback(err, null)
                    } else {
                        let whereCondition;
                        if (LogsValues.deviceType == "Meter") {
                            whereCondition = { "HypersproutID": result[0].HypersproutID, Status: "Registered" }
                            findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else if (res.length > 0) {
                                    if (res[0].Status === "NotRegistered") {
                                        callback(LogsValues.deviceType + " Not Registered", null);
                                    } else {
                                        HSDetails(res, result, LogsValues.deviceType, function (err, response) {
                                            if (err) {
                                                callback(err, null)
                                            } else {
                                                if ((res[0].MessageID === undefined) || (res[0].MessageID === null) || (res[0].MessageID === 255))
                                                    response.messageid = 0;
                                                else
                                                    response.messageid = res[0].MessageID;
                                                callback(null, response)
                                            }
                                        })
                                    }
                                } else {
                                    callback("Hypersprout not available", null);
                                }
                            })
                        }
                        else if (LogsValues.deviceType == "HyperSprout" || LogsValues.deviceType == "HyperHub") {
                            whereCondition = { 'HypersproutID': result[0].HypersproutID }
                            findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else if (res.length > 0) {
                                    if (res[0].Status === "NotRegistered") {
                                        callback(LogsValues.deviceType + " Not Registered", null);
                                    } else {
                                        HSDetails(res, result, LogsValues.deviceType, function (err, response) {
                                            if (err) {
                                                callback(err, null)
                                            } else {
                                                if ((res[0].MessageID === undefined) || (res[0].MessageID === null) || (res[0].MessageID === 255))
                                                    response.messageid = 0;
                                                else
                                                    response.messageid = res[0].MessageID;
                                                callback(null, response)
                                            }
                                        })
                                    }
                                } else {
                                    callback("Hypersprout not available", null);
                                }
                            })
                        } else {
                            if (result[0].MeterID) {
                                let condition = { 'MeterID': result[0].MeterID, "Status": "Registered" }
                                collectionStatusDeltalink(meterCollection, condition, "DeltaLink", function (err, Meterresult) {
                                    if (err) {
                                        callback(err, null)
                                    } else if (Meterresult.length > 0) {
                                        whereCondition = { 'HypersproutID': Meterresult[0].HypersproutID, Status: "Registered" }
                                        findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                            if (err) {
                                                callback(err, null)
                                            } else if (res.length > 0) {
                                                if (res[0].Status === "NotRegistered") {
                                                    callback(LogsValues.deviceType + " Not Registered", null);
                                                } else {
                                                    HSDetails(res, result, LogsValues.deviceType, function (err, response) {
                                                        if (err) {
                                                            callback(err, null)
                                                        } else {
                                                            if ((res[0].MessageID === undefined) || (res[0].MessageID === null) || (res[0].MessageID === 255))
                                                                response.messageid = 0;
                                                            else
                                                                response.messageid = res[0].MessageID;
                                                            callback(null, response)
                                                        }
                                                    })
                                                }
                                            } else {
                                                callback("Hypersprout not available", null);
                                            }
                                        })
                                    } else {
                                        callback("Meter not Grouped to the Transformer !!", null)
                                    }
                                })
                            } else {
                                callback("Deltalink not Grouped to the Meter !!", null)
                            }
                        }

                    }
                })
            } else {
                callback("inavlid condition !!", null)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}

/**
* @description -find the query result on the basis of condtion and Device Type
* @param collectionName
* @param condition 
* @param DeviceType - (Meter/Hyperhub/Hypersprout/Deltalink)
* @param callback - callback function returns success or error response
* @return callback function
*/

function findCursor(collectionName, condition, DeviceType, callback) {
    try {
        collectionName.find(condition).toArray(function (err, res) {
            if (err) {
                callback(err, null);
            } else if (res.length > 0) {
                callback(null, res)
            } else {
                callback(DeviceType + " not available", null);
            }

        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description -get response deatils object from hypersprout
* @param HSResponse
* @param DeviceResponse -( Response from Meter/Hyperhub/Hypersprout/Deltalink)
* @param DeviceType - (Meter/Hyperhub/Hypersprout/Deltalink)
* @param callback - callback function returns success or error response
* @return callback function
*/
function HSDetails(HSResponse, DeviceResponse, DeviceType, callback) {
    try {
        var response;
        switch (DeviceType) {
            case "Meter":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].Meters_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].Meters_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "MeterID": DeviceResponse[0].MeterID,
                    "MeterSerialNumber": DeviceResponse[0].MeterSerialNumber
                }
                callback(null, response)
                break;
            case "HyperSprout":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].Hypersprout_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].Hypersprout_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "HypersproutID": DeviceResponse[0].HypersproutID,
                    "HypersproutSerialNumber": DeviceResponse[0].HypersproutSerialNumber
                }
                callback(null, response)
                break;
            case "HyperHub":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].Hypersprout_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].Hypersprout_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "HypersproutID": DeviceResponse[0].HypersproutID,
                    "HypersproutSerialNumber": DeviceResponse[0].HypersproutSerialNumber
                }
                callback(null, response)
                break;
            case "DeltaLink":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].DeltaLinks_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].DeltaLinks_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "DeltalinkID": DeviceResponse[0].DeltalinkID,
                    "DeltalinkSerialNumber": DeviceResponse[0].DeltalinkSerialNumber
                }
                callback(null, response)
                break;
            default:
                callback("Invalid Hypersprout details!!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - Insert Message ID And Create Job
* @param jobsCollection
* @param jobJSON
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateMessageIDAndCreateJob(jobsCollection, jobJSON, messageid, callback) {
    try {
        jobsCollection.insertOne(jobJSON, function (err, response) {
            callback(err, response);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - get Current Status
* @param jobsCollection
* @param jobdoc
* @param callback - callback function returns success or error response
* @return callback function
*/


function updateDeviceLogJob(jobsCollection, jobData, callback) {
    try {
        jobsCollection.updateMany({
            $or: [
                { "CreatedDateTimestamp": { $lte: new Date(new Date().getTime() - 1000 * 60 * 60) } },
                { "JobID": jobData.JobID }
            ],
            "JobName": "Fetch Logs",
            "SerialNumber": jobData.SerialNumber, "Status": 'Pending'
        }, { "$set": { "Status": 'Failed', "EndTime": new Date() } }, function (err, insertResponse) {
            if (err)
                callback(err, null);
            else
                callback(null, insertResponse)
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - get Current Status
* @param jobsCollection
* @param meterID
* @param messageid
* @param jobID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getCurrentStatus(jobsCollection, meterID, messageid, jobID, LogType, callback) {
    try {
        switch (LogType) {
            case "ClearLogs":
                jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "Status": "Completed", "EndTime": new Date } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, ClearLogStatus: 1 } }, function (err, result) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, result.value.ClearLogStatus)
                });
                break;
            case "VerbosityLogs":
                jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "Status": "Completed", "EndTime": new Date } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, VerbosityLogStatus: 1 } }, function (err, result) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, result.value.VerbosityLogStatus)
                });
                break;
            case "FetchLogs":
                jobsCollection.find({ JobID: jobID }).toArray(function (err, result) {
                    if (err)
                        callback(err, null);
                    else {
                        callback(null, result[0].FetchLogStatus)

                    }
                });
                break;

            default:
                callback("Invalid jobStatus!!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}

/**
* @description - Save System Event
* @params - systemEventsCollection, rev, cellid, meterid, messageid, action, attribute, data, callback
* @return callback function
*/

function saveSystemEvent(systemEventsCollection, rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, callback) {
    try {
        getSystemEventData(rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, function (err, sysEvent) {
            if (err) {
                callback(err, null)
            } else {
                systemEventsCollection.insertOne(sysEvent, function (err, response) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        callback(null, "Success")
                    }
                });
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - Save System Events - All Communicaion with the Devices
* @params - rev, cellid, meterid, messageid, action, attribute, data, callback
* @return callback function
*/
function systemEvents(rev, cellid, meterid, messageid, action, attribute, data, DeviceType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var systemEventsCollection = db.delta_SystemEvents;
                saveSystemEvent(systemEventsCollection, rev, cellid, meterid, messageid, action, attribute, data, DeviceType, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}
/**
* @description - get data to parse - parse the data to send at Devices end 
* @params - ClearLogsValues, response, action, attribute, purpose, callback
* @return callback function
*/

function getDataToParse(LogsValues, response, action, attribute, purpose, AdditionalParam, callback) {
    try {
        let data;
        let rev = response.Rev ? response.Rev : 0;
        let countryCode = response.RegionCode ? response.RegionCode : 0;
        let regionCode = response.RegionCode ? response.RegionCode : 0;
        if ((purpose == "METER_CHANGE_VERBOSITY") || (purpose == "HH_CHANGE_VERBOSITY") || (purpose == "HS_CHANGE_VERBOSITY") || (purpose == "DL_CHANGE_VERBOSITY")) {
            data = {
                "rev": rev,
                "messageid": Number(response.messageid) + 1,
                "countrycode": countryCode,
                "regioncode": regionCode,
                "cellid": response.CellID,
                'LogType': AdditionalParam
            }
        } else if ((purpose == "METER_FETCH_LOG") || (purpose == "HH_FETCH_LOG") || (purpose == "HS_FETCH_LOG") || (purpose == "DL_FETCH_LOG")) {
            data = {
                "rev": rev,
                "messageid": Number(response.messageid) + 1,
                "countrycode": countryCode,
                "regioncode": regionCode,
                "cellid": response.CellID,
                'url': AdditionalParam
            }
        } else {
            data = {
                "rev": rev,
                "messageid": Number(response.messageid) + 1,
                "countrycode": countryCode,
                "regioncode": regionCode,
                "cellid": response.CellID
            }
        }
        switch (LogsValues.deviceType) {
            case "Meter":
                data.meterid = LogsValues.deviceId;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            case "HyperHub":
                data.meterid = 0;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            case "HyperSprout":
                data.meterid = 0;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            case "DeltaLink":
                data.meterid = LogsValues.deviceId;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            default:
                callback("Invalid data !!", null)
        }

        callback(null, data)
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - get data to job status - Get the jobdoc to create job 
* @params - response(HS details), data(data to parse), DeviceValues , purpose, callback)
* @return callback function
*/


function getjobdoc(response, data, DeviceValues, purpose, callback) {
    try {
        let jobdoc;
        if (DeviceValues.deviceType == "Meter" && purpose == 'METER_CLEAR_LOGS') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.MeterSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "Meter",
                "JobName": "Clear Logs",
                "JobType": "Meter Clear Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "ClearLogStatus": "Device Log Clear Unsuccessful"
            };
        } else if (DeviceValues.deviceType == "HyperHub" && purpose == 'HH_CLEAR_LOGS') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperHub",
                "JobName": "Clear Logs",
                "JobType": "HyperHub Clear Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "ClearLogStatus": "Device Log Clear Unsuccessful"
            };
        } else if (DeviceValues.deviceType == "HyperSprout" && purpose == 'HS_CLEAR_LOGS') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperSprout",
                "JobName": "Clear Logs",
                "JobType": "HyperSprout Clear Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "ClearLogStatus": "Device Log Clear Unsuccessful"
            };
        } else if ((DeviceValues.deviceType == "DeltaLink") && purpose == 'DL_CLEAR_LOGS') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.MeterSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "DeltaLink",
                "JobName": "Clear Logs",
                "JobType": "DeltaLink Clear Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "ClearLogStatus": "Device Log Clear Unsuccessful"
            };
        } else if (DeviceValues.deviceType == "Meter" && purpose == 'METER_CHANGE_VERBOSITY') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.MeterSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "Meter",
                "JobName": "Verbosity Logs",
                "JobType": "Meter Verbosity Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "VerbosityLogStatus": "Device Log Verbosity Unsuccessful"
            };
        } else if (DeviceValues.deviceType == "HyperHub" && purpose == 'HH_CHANGE_VERBOSITY') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperHub",
                "JobName": "Verbosity Logs",
                "JobType": "HyperHub Verbosity Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "VerbosityLogStatus": "Device Log Verbosity Unsuccessful"
            };
        } else if ((DeviceValues.deviceType == "HyperSprout") && purpose == 'HS_CHANGE_VERBOSITY') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperSprout",
                "JobName": "Verbosity Logs",
                "JobType": "HyperSprout Verbosity Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "VerbosityLogStatus": "Device Log Verbosity Unsuccessful"
            };
        } else if ((DeviceValues.deviceType == "DeltaLink") && purpose == 'DL_CHANGE_VERBOSITY') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.DeltalinkSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "DeltaLink",
                "JobName": "Verbosity Logs",
                "JobType": "DeltaLink Verbosity Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "VerbosityLogStatus": "Device Log Verbosity Unsuccessful"
            };
        }
        else if (DeviceValues.deviceType == "Meter" && purpose == 'METER_FETCH_LOG') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.MeterSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "Meter",
                "JobName": "Fetch Logs",
                "JobType": "Meter Fetch Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "FetchLogStatus": "Device Log Fetch Unsuccessful"
            };
        } else if (DeviceValues.deviceType == "HyperHub" && purpose == 'HH_FETCH_LOG') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperHub",
                "JobName": "Fetch Logs",
                "JobType": "HyperHub Fetch Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "FetchLogStatus": "Device Log Fetch Unsuccessful"
            };
        } else if (DeviceValues.deviceType == "HyperSprout" && purpose == 'HS_FETCH_LOG') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperSprout",
                "JobName": "Fetch Logs",
                "JobType": "HyperSprout Fetch Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "FetchLogStatus": "Device Log Fetch Unsuccessful"
            };
        } else if ((DeviceValues.deviceType == "DeltaLink") && purpose == 'DL_FETCH_LOG') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.DeltalinkSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "DeltaLink",
                "JobName": "Fetch Logs",
                "JobType": "DeltaLink Fetch Logs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "FetchLogStatus": "Device Log Fetch Unsuccessful"
            };
        }
        else {
            callback("invalid job details !!", null)
        }
        callback(null, jobdoc)
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - system event data on the basis of Device Type
* @params - rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, callback)
* @return callback function
*/
function getSystemEventData(rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, callback) {
    try {
        var sysEvent;
        switch (DeviceType) {
            case "Meter":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "MeterID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            case "HyperSprout":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "HypersproutID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            case "HyperHub":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "HypersproutID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            case "DeltaLink":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "DeltalinkID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            default:
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}


//Verbosity

/**
* @description - Verbosity logs Web Service
* @param VerbosityLogsValues contains DeviceType and DeviceId 
* @param callback - callback function returns success or error response
* @return callback function
*/

function verbosityLogsStatus(VerbosityLogsValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                let meterCollection = db.delta_Meters;
                let hyperSproutCollection = db.delta_Hypersprouts;
                let deltalinkCollection = db.delta_DeltaLink;
                let jobsCollection = db.delta_Jobs;
                findCollection(db, VerbosityLogsValues.deviceType, function (err, collection) {
                    if (!err) {
                        verbosityLogsStatusFromMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, collection, VerbosityLogsValues, callback);

                    } else {
                        callback("inavlid condition !!", null)
                    }
                })
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -Query from mongoDB , parse the data , send the parsed data to IOT, create a job, save the System Event logs and update the Verbosity in the Device log collection
* @param  VerbosityLogsValues contains DeviceType and DeviceId
* @param  meterCollection
* @param  hyperSproutCollection
* @param  DeltalinkCollection,
* @param jobsCollection,
* @param CollectionName
* @param  callback - callback function returns success or error response
* @return callback function
*/

function verbosityLogsStatusFromMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, CollectionName, VerbosityLogsValues, callback) {
    try {
        getDeviceHSDetails(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, CollectionName, VerbosityLogsValues, function (err, response) {
            if (err) {
                callback(err, null);
            } else {
                let action, attribute, Purpose;
                switch (VerbosityLogsValues.deviceType) {
                    case "Meter":
                        action = 'LOGS';
                        attribute = 'METER_VERBOSITY';
                        Purpose = 'METER_CHANGE_VERBOSITY'
                        break;
                    case "HyperHub":
                        action = 'LOGS';
                        attribute = 'HH_VERBOSITY';
                        Purpose = 'HH_CHANGE_VERBOSITY'
                        break;
                    case "HyperSprout":
                        action = 'LOGS';
                        attribute = 'HS_VERBOSITY';
                        Purpose = 'HS_CHANGE_VERBOSITY'
                        break;
                    case "DeltaLink":
                        action = 'LOGS';
                        attribute = 'DL_VERBOSITY';
                        Purpose = 'DL_CHANGE_VERBOSITY'
                        break;

                    default:
                        callback("Invalid data !!", null)
                }
                getDataToParse(VerbosityLogsValues, response, action, attribute, Purpose, VerbosityLogsValues.logType, function (err, data) {
                    if (err) {
                        callback(err, null)
                    } else {
                        if (response.DeviceID) {
                            getjobdoc(response, data, VerbosityLogsValues, Purpose, function (err, jobdoc) {
                                updateMessageIDAndCreateJob(jobsCollection, jobdoc, data.messageid, function (err, successResponse) {
                                    sendToIOT.checkDeviceConnectionState(response.DeviceID, function (err, status) {
                                        if (err) {
                                            callback(err.name != undefined ? err.name : err, null);
                                        } else {
                                            if (status == 'Connected') {
                                                parser.hexaCreation(data, function (err, Hexresult) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        sendToIOT.sendToIOT(Hexresult, response.DeviceID, function (err, success) {
                                                            if (err) {
                                                                callback(err.name, null);
                                                            } else {
                                                                setTimeout(function () {
                                                                    getCurrentStatus(jobsCollection, VerbosityLogsValues.deviceId, data.messageid, jobdoc.JobID, "VerbosityLogs", function (err, result) {
                                                                        if (err) {
                                                                            callback(err, null);
                                                                        } else {
                                                                            systemEvents(data.rev, data.cellid, VerbosityLogsValues.deviceId, data.messageid, data.action, data.attribute, Hexresult, VerbosityLogsValues.deviceType, function (err, _successEve) {
                                                                                if (err) {
                                                                                    callback(err, null)
                                                                                } else {
                                                                                    updateVerbosity(CollectionName, VerbosityLogsValues, function (err, updatedResult) {
                                                                                        callback(null, result);
                                                                                    })

                                                                                }
                                                                            })

                                                                        }
                                                                    });
                                                                }, 3000);
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        }
                                    })

                                })
                            })
                        } else {
                            callback("Device ID not found", null)
                        }
                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - get Verbosity logs Web Service
* @param VerbosityLogsValues contains DeviceType and DeviceId 
* @param callback - callback function returns success or error response
* @return callback function
*/

function getVerbosity(VerbosityLogsValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                findCollection(db, VerbosityLogsValues.deviceType, function (err, collection) {
                    if (!err) {
                        checkVerbosity(collection, VerbosityLogsValues, function (err, result) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, result)
                            }
                        })
                    } else {
                        callback("inavlid condition !!", null)
                    }
                })
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - check Verbosity deatils exists in mongodb or not , if not then insert Verbostity from query from  MongoDB and if extsts then fetch the Details from MongoDB  .
* @param  DeviceValues contains DeviceType, DeviceId and LogType 
* @param  callback - callback function returns success or error response
* @return callback function
*/
function checkVerbosity(CollectionName, DeviceValues, callback) {
    try {
        let condition;
        switch (DeviceValues.deviceType) {
            case "Meter":
                condition = { "MeterID": DeviceValues.deviceId, "Status": "Registered" }
                break;
            case "HyperHub":
                condition = { "HypersproutID": DeviceValues.deviceId, "IsHyperHub": true, "Status": "Registered" }
                break;
            case "HyperSprout":
                condition = { "HypersproutID": DeviceValues.deviceId, "IsHyperHub": false, "Status": "Registered" }
                break;
            case "DeltaLink":
                condition = { "DeltalinkID": DeviceValues.deviceId, "Status": "Registered" }
                break;
            default:
                callback("Invalid condition!!", null)
        }
        findCursor(CollectionName, condition, DeviceValues.deviceType, function (err, result) {
            if (err) {
                callback(err, null)
            } else {
                if (result.length > 0) {
                    if (!result[0].LogType) {
                        CollectionName.update(condition, { "$set": { "LogType": 1 } }, function (err, insertResponse) {
                            if (err) {
                                callback(err, null)
                            } else {
                                CollectionName.find(condition).toArray(function (err, res) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (res.length > 0) {
                                        callback(null, res[0].LogType)
                                    } else {
                                        callback(DeviceValues.deviceType + " not available", null);
                                    }

                                })
                            }
                        })

                    } else {
                        CollectionName.find(condition).toArray(function (err, res) {
                            if (err) {
                                callback(err, null);
                            } else if (res.length > 0) {
                                callback(null, res[0].LogType)
                            } else {
                                callback(DeviceValues.deviceType + " not available", null);
                            }

                        })
                    }

                }
            }

        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - Update Verbosity query from  MongoDB  .
* @param  DeviceValues contains DeviceType, DeviceId and LogType 
* @param  callback - callback function returns success or error response
* @return callback function
*/
function updateVerbosity(CollectionName, DeviceValues, callback) {
    try {
        let condition;
        switch (DeviceValues.deviceType) {
            case "Meter":
                condition = { "MeterID": DeviceValues.deviceId, "Status": "Registered" }
                break;
            case "HyperHub":
                condition = { "HypersproutID": DeviceValues.deviceId, "IsHyperHub": true, "Status": "Registered" }
                break;
            case "HyperSprout":
                condition = { "HypersproutID": DeviceValues.deviceId, "IsHyperHub": false, "Status": "Registered" }
                break;
            case "DeltaLink":
                condition = { "DeltalinkID": DeviceValues.deviceId, "Status": "Registered" }
                break;
            default:
                callback("Invalid condition!!", null)
        }
        findCursor(CollectionName, condition, DeviceValues.deviceType, function (err, result) {
            if (err) {
                callback(err, null)
            } else {
                let setValues;
                if (result.length > 0) {
                    switch (DeviceValues.logType) {
                        case 1:
                            setValues = { "LogType": 1 }
                            break;
                        case 2:
                            setValues = { "LogType": 2 }
                            break;
                        case 3:
                            setValues = { "LogType": 3 }
                            break;
                        case 4:
                            setValues = { "LogType": 4 }
                            break;
                        default:
                            callback("Invalid set!!", null)
                    }
                    CollectionName.update(condition, { "$set": setValues }, function (err, insertResponse) {
                        if (err) {
                            callback(err, null)
                        } else {
                            callback(null, "Verbosity Logs Updated")
                        }
                    })

                }
            }

        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



//Delete Device Logs Details
/**
* @description -For the Webservice - DeviceLogDetails, DELETE Device Log details IN MONGODB
* @param DeviceLogDetails 
* @param callback - callback function returns success or error response
* @return callback function
*/

function deleteDeviceLogDetails(DeviceLogDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            deleteDeviceLogDetailsFromMongoDB(db.delta_DeviceLogs, DeviceLogDetails, callback);
        }
    });
}

/**
* @description -For the Webservice - deleteDeviceLogDetailsFromMongoDB, DELETE Device Log details IN MONGODB
* @param DeviceLogDetails 
* @param callback - callback function returns success or error response
* @return callback function
*/

function deleteDeviceLogDetailsFromMongoDB(collectionName, DeviceLogDetails, callback) {
    try {
        let logIdtoDelete = [];
        let errorFinal = [];
        // map() return a new array of LogID having only integer values and  integerValue function return an Integer values
        let logId = (DeviceLogDetails.logID).map(integerValue);
        let blobName = 'deviceLogs' + '/' + DeviceLogDetails.deviceType + '/' + DeviceLogDetails.deviceId;
        collectionName.find({ DeviceId: DeviceLogDetails.deviceId, DeviceType: DeviceLogDetails.deviceType, LogID: { $in: logId } }, { _id: 0, DeviceId: 1, DeviceType: 1, LogID: 1, FileName: 1 }).toArray(function (err, LogIDToDeleteResult) {
            if (err)
                callback(err, null);
            else {
                if (LogIDToDeleteResult.length > 0) {
                    for (var i in LogIDToDeleteResult) {
                        logIdtoDelete.push(LogIDToDeleteResult[i].LogID)
                        let name = LogIDToDeleteResult[i].FileName;
                        let blobToDelete = blobName + '/' + LogIDToDeleteResult[i].LogID + '/' + name;
                        blobService.deleteBlobIfExists(container, blobToDelete, function (error, response) {
                            if (!error) {
                                // Blob has been deleted
                                console.log("bob delete")
                            }
                        });
                    }
                    let msg = "Device Log Details Successfully Deleted!";
                    collectionName.deleteMany({ DeviceId: DeviceLogDetails.deviceId, DeviceType: DeviceLogDetails.deviceType, LogID: { $in: logId } }, function (err, devicelogDelete) {
                        if (err) {
                            insertError.putErrorDetails(err, callback);
                        } else {
                            for (var i in logId) {
                                if (!logIdtoDelete.includes(logId[i])) {
                                    errorFinal.push(logId[i] + ": Invalid FileName !!")
                                }
                            }
                            callback(null, msg, errorFinal);
                        }
                    });

                }
                else {
                    callback("Invalid FileName !!", null);
                }
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

// function return an Integer values

function integerValue(x) {
    return parseInt(x);
}

/**
* @description - fetch Device Log latest data
* @param LogID
* @return callback function
*/

function fetchLogID(callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            fetchLogIDMongoDB(db.delta_DeviceLogs, callback);
        }
    });
}

/**
* @description - fetch Log ID
* @param collectionName
* @param LogID
* @return callback function
*/
function fetchLogIDMongoDB(collectionName, callback) {
    try {
        collectionName.find().sort({ "LogID": -1 }).limit(1).next(function (err, record) {
            if (err)
                callback(err, null);
            else {
                var count;
                if (!record)
                    count = 0;
                else
                    count = record.LogID;
                ID = ++count;
                callback(null, ID);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - create Device Logs
* @param DeviceId
* @param DeviceType
* @param FileName
* @param url
* @param callback - callback function returns success or error response
* @return callback function
*/

function createDeviceLogs(DeviceId, DeviceType, FileName, Url, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            createDeviceLogsMongoDB(db.delta_DeviceLogs, DeviceId, DeviceType, FileName, Url, callback);
        }
    });
}

/**
* @description - create Firmware Management
* @param CollectionName
* @param DeviceId
* @param DeviceType
* @param FileName
* @param URL
* @param callback - callback function returns success or error response
* @return callback function
*/
function createDeviceLogsMongoDB(CollectionName, DeviceId, DeviceType, FileName, URL, callback) {
    try {
        CollectionName.find().sort({ "LogID": -1 }).limit(1).next(function (err, record) {
            if (err)
                callback(err, null);
            else {
                var count; function fetchLogIDMongoDB(collectionName, callback) {
                    try {
                        collectionName.find().sort({ "LogID": -1 }).limit(1).next(function (err, record) {
                            if (err)
                                callback(err, null);
                            else {
                                var count;
                                if (!record)
                                    count = 0;
                                else
                                    count = record.LogID;
                                ID = ++count;
                                callback(null, ID);
                            }
                        });
                    } catch (e) {
                        callback("Something went wrong : " + e.name + " " + e.message, null)

                    }
                }
                if (!record)
                    count = 0;
                else
                    count = record.LogID;
                var doc = {
                    "LogID": ++count,
                    "DeviceType": DeviceType,
                    "DeviceId": DeviceId,
                    "FileName": FileName,
                    "Url": URL,
                    "CreatedDate": new Date()
                };
                CollectionName.insertOne(doc, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, "Device Logs Imported Successfully");
                    }
                });
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - Fetch Device Log Status 
* @param DeviceLogUploadValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function deviceLogUploadStatus(DeviceLogUploadValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                let meterCollection = db.delta_Meters;
                let hyperSproutCollection = db.delta_Hypersprouts;
                let deltalinkCollection = db.delta_DeltaLink;
                let jobsCollection = db.delta_Jobs;
                let deviceLogCollection = db.delta_DeviceLogs;
                findCollection(db, DeviceLogUploadValues.deviceType, function (err, collection) {
                    if (!err) {
                        deviceLogUploadStatusMongoDB(deviceLogCollection, meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, collection, DeviceLogUploadValues, callback);
                    } else {
                        callback("inavlid condition !!", null)
                    }
                })
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - Fetch Device Log Status from Mongo DB query
* @param deviceLogCollection
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param collection
* @param DeviceLogUploadValues
* @param callback - callback function returns success or error response
* @return callback function
*/


function deviceLogUploadStatusMongoDB(deviceLogCollection, meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, collection, DeviceLogUploadValues, callback) {
    try {
        let url = "https" + '://' + webHost + '/' + "UploadLogFile" + "?" + "DeviceType" + "=" + DeviceLogUploadValues.deviceType + "&" + "DeviceId" + "=" + DeviceLogUploadValues.deviceId;
        getDeviceHSDetails(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, collection, DeviceLogUploadValues, function (err, response) {
            if (err) {
                callback(err, null);
            } else {
                let action, attribute, Purpose;
                switch (DeviceLogUploadValues.deviceType) {
                    case "Meter":
                        action = 'LOGS';
                        attribute = 'METER_FETCH';
                        Purpose = 'METER_FETCH_LOG';
                        break;
                    case "HyperHub":
                        action = 'LOGS';
                        attribute = 'HH_FETCH';
                        Purpose = 'HH_FETCH_LOG';
                        break;
                    case "HyperSprout":
                        action = 'LOGS';
                        attribute = 'HS_FETCH';
                        Purpose = 'HS_FETCH_LOG';
                        break;
                    case "DeltaLink":
                        action = 'LOGS';
                        attribute = 'DL_FETCH';
                        Purpose = 'DL_FETCH_LOG';
                        break;
                    default:
                        callback("Invalid data!!", null)
                }
                getDataToParse(DeviceLogUploadValues, response, action, attribute, Purpose, url, function (err, data) {
                    if (err) {
                        callback(err, null)
                    } else {
                        getjobdoc(response, data, DeviceLogUploadValues, Purpose, function (err, jobdoc) {
                            updateMessageIDAndCreateJob(jobsCollection, jobdoc, data.messageid, function (err, successResponse) {
                                sendToIOT.checkDeviceConnectionState(response.DeviceID, function (err, status) {
                                    if (err) {
                                        callback(err.name != undefined ? err.name : err, null);
                                    } else {
                                        if (status == 'Connected') {
                                            parser.hexaCreation(data, function (err, Hexresult) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    sendToIOT.sendToIOT(Hexresult, response.DeviceID, function (err, success) {
                                                        if (err) {
                                                            callback(err.name, null);
                                                        } else {
                                                            setTimeout(function () {
                                                                getCurrentStatus(jobsCollection, DeviceLogUploadValues.deviceId, data.messageid, jobdoc.JobID, "FetchLogs", function (err, result) {
                                                                    if (err) {
                                                                        callback(err, null);
                                                                    } else {
                                                                        systemEvents(data.rev, data.cellid, DeviceLogUploadValues.deviceId, data.messageid, data.action, data.attribute, Hexresult, DeviceLogUploadValues.deviceType, function (err, _successEve) {
                                                                            if (err) {
                                                                                callback(err, null)
                                                                            } else {
                                                                                callback(null, result);
                                                                            }
                                                                        })

                                                                    }
                                                                });
                                                            }, 8000);
                                                        }
                                                    })
                                                }
                                            })
                                        } else {
                                            //Device is not connected
                                            updateDeviceLogJob(jobsCollection, jobdoc, function (err, result) {
                                                callback("Device Log Fetch Unsuccessful", true);
                                            });


                                        }
                                    }
                                })
                            })
                        })
                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - save  Device Clear log Status
* @param ClearLogStatusValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveDeviceClearLogStatus(ClearLogStatusValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                return callback(err, null);
            } else {
                var meterCollection = db.delta_Meters;
                var hyperSproutCollection = db.delta_Hypersprouts;
                var DeltalinkCollection = db.delta_DeltaLink;
                var jobsCollection = db.delta_Jobs;
                saveClearLogsStatusMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, ClearLogStatusValues, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - save Clear log status
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param jobsCollection
* @param data i.e MeterID, CellID, MessageID, Status, Action and Attribute
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveClearLogsStatusMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, data, callback) {
    try {
        let jobSetCondition = { ClearLogStatus: data.Status }

        if (data.Action == 'LOGS') {
            switchCaseDeviceResponse(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, data, jobSetCondition, function (err, switchresult) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, switchresult)
                }
            })

        } else {
            callback("inavalid Action !!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - function to update the Job Status
* @param jobsCollection
* @param JobSetCondition
* @param JobCondition
* @param callback - callback function returns success or error response
* @return callback function
*/
function updatejobStatus(jobsCollection, JobCondition, JobSetCondition, callback) {
    try {
        jobsCollection.updateMany(JobCondition, { $set: JobSetCondition }, function (err, result) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, result)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}
/**
* @description - save Clear log status
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param jobsCollection
* @param data i.e MeterID, CellID, MessageID, Status, Action and Attribute
* @param JobSetCondition  set job status parameter
* @param callback - callback function returns success or error response
* @return callback function
*/

function switchCaseDeviceResponse(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, data, JobSetCondition, callback) {
    try {
        let deviceCondition;
        let jobCondition;
        switch (data.Attribute) {
            case 'METER_CLEAR_LOGS':
                deviceCondition = { MeterID: data.MeterID };
                findCursor(meterCollection, deviceCondition, "Meter", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].MeterSerialNumber, JobName: "Clear Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })

                break;
            case 'HS_CLEAR_LOGS':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: false };
                findCursor(hyperSproutCollection, deviceCondition, "HyperSprout", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].HypersproutSerialNumber, JobName: "Clear Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })

                break;

            case 'HH_CLEAR_LOGS':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: true };
                findCursor(hyperSproutCollection, deviceCondition, "HyperHub", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].HypersproutSerialNumber, JobName: "Clear Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })
                break;

            case 'DL_CLEAR_LOGS':
                deviceCondition = { DeltalinkID: data.MeterID };
                findCursor(DeltalinkCollection, deviceCondition, "DeltaLink", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].DeltalinkSerialNumber, JobName: "Clear Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })

                    }
                })
            case 'METER_VERBOSITY':
                deviceCondition = { MeterID: data.MeterID };
                findCursor(meterCollection, deviceCondition, "Meter", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].MeterSerialNumber, JobName: "Verbosity Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })

                break;
            case 'HS_VERBOSITY':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: false };
                findCursor(hyperSproutCollection, deviceCondition, "HyperSprout", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].HypersproutSerialNumber, JobName: "Verbosity Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })

                break;

            case 'HH_VERBOSITY':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: true };
                findCursor(hyperSproutCollection, deviceCondition, "HyperHub", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].HypersproutSerialNumber, JobName: "Verbosity Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })
                break;

            case 'DL_VERBOSITY':
                deviceCondition = { DeltalinkID: data.MeterID };
                findCursor(DeltalinkCollection, deviceCondition, "DeltaLink", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].DeltalinkSerialNumber, JobName: "Verbosity Logs", "Status": "Pending", EndTime: null };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })

                    }
                })
                break;
            case 'METER_FETCH':
                deviceCondition = { MeterID: data.MeterID };
                findCursor(meterCollection, deviceCondition, "Meter", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].MeterSerialNumber, JobName: "Fetch Logs", $or: [{ "Status": "Pending" }, { "Status": "In Progress" }] };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })

                break;
            case 'HS_FETCH':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: false };
                findCursor(hyperSproutCollection, deviceCondition, "HyperSprout", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].HypersproutSerialNumber, JobName: "Fetch Logs", $or: [{ "Status": "Pending" }, { "Status": "In Progress" }] };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })

                break;

            case 'HH_FETCH':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: true };
                findCursor(hyperSproutCollection, deviceCondition, "HyperHub", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].HypersproutSerialNumber, JobName: "Fetch Logs", $or: [{ "Status": "Pending" }, { "Status": "In Progress" }] };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })
                break;

            case 'DL_FETCH':
                deviceCondition = { DeltalinkID: data.MeterID };
                findCursor(DeltalinkCollection, deviceCondition, "DeltaLink", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        jobCondition = { MessageID: data.MessageID, SerialNumber: res[0].DeltalinkSerialNumber, JobName: "Fetch Logs", $or: [{ "Status": "Pending" }, { "Status": "In Progress" }] };
                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })

                    }
                })
                break;

            default:
                callback("Invalid Attribute!!", null)

        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - save Verbosity Device Status
* @param VerbosityLogStatusValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveDeviceVerbosityLogStatus(VerbosityLogStatusValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                return callback(err, null);
            } else {
                var meterCollection = db.delta_Meters;
                var hyperSproutCollection = db.delta_Hypersprouts;
                var deltalinkCollection = db.delta_DeltaLink;
                var jobsCollection = db.delta_Jobs;
                saveDeviceVerbosityLogStatusMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, VerbosityLogStatusValues, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - save Verbosity log status
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param jobsCollection
* @param data i.e MeterID, CellID, MessageID, Status, Action and Attribute
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveDeviceVerbosityLogStatusMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, data, callback) {
    try {
        let jobSetCondition = { VerbosityLogStatus: data.Status }

        if (data.Action == 'LOGS') {
            switchCaseDeviceResponse(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, data, jobSetCondition, function (err, switchresult) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, switchresult)
                }
            })

        } else {
            callback("inavalid Action !!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - save  Device  fetch log Status
* @param FetchLogStatusValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveDeviceFetchLogStatus(fetchLogStatusValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                return callback(err, null);
            } else {
                var meterCollection = db.delta_Meters;
                var hyperSproutCollection = db.delta_Hypersprouts;
                var deltalinkCollection = db.delta_DeltaLink;
                var jobsCollection = db.delta_Jobs;
                saveDeviceFetchLogStatusMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, fetchLogStatusValues, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - save fetch log status
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param jobsCollection
* @param data i.e MeterID, CellID, MessageID, Status, Action and Attribute
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveDeviceFetchLogStatusMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, data, callback) {
    try {
        let jobSetCondition;
        if (data.Status == "Success") {
            jobSetCondition = { FetchLogStatus: data.Status1, Status: "Completed", "EndTime": new Date }
        } else {
            jobSetCondition = { FetchLogStatus: data.Status1, Status: data.Status }
        }
        if (data.Action == 'LOGS') {
            switchCaseDeviceResponse(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, data, jobSetCondition, function (err, switchresult) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, switchresult)
                }
            })

        } else {
            callback("inavalid Action !!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

module.exports = {
    getDeviceLogsList: getDeviceLogsList,
    getDeviceLogsListFromMongoDB: getDeviceLogsListFromMongoDB,
    collectionStatus: collectionStatus,
    findCollection: findCollection,
    findCondition: findCondition,
    clearLogsStatus: clearLogsStatus,
    getClearLogsStatusFromMongoDB: getClearLogsStatusFromMongoDB,
    getDeviceHSDetails: getDeviceHSDetails,
    findCursor: findCursor,
    HSDetails: HSDetails,
    updateMessageIDAndCreateJob: updateMessageIDAndCreateJob,
    getCurrentStatus: getCurrentStatus,
    saveSystemEvent: saveSystemEvent,
    systemEvents: systemEvents,
    getDataToParse: getDataToParse,
    getjobdoc: getjobdoc,
    getSystemEventData: getSystemEventData,
    verbosityLogsStatus: verbosityLogsStatus,
    verbosityLogsStatusFromMongoDB: verbosityLogsStatusFromMongoDB,
    updateVerbosity: updateVerbosity,
    deleteDeviceLogDetails: deleteDeviceLogDetails,
    deleteDeviceLogDetailsFromMongoDB: deleteDeviceLogDetailsFromMongoDB,
    getVerbosity: getVerbosity,
    checkVerbosity: checkVerbosity,
    fetchLogID: fetchLogID,
    fetchLogIDMongoDB: fetchLogIDMongoDB,
    createDeviceLogs: createDeviceLogs,
    createDeviceLogsMongoDB: createDeviceLogsMongoDB,
    deviceLogUploadStatus: deviceLogUploadStatus,
    deviceLogUploadStatusMongoDB: deviceLogUploadStatusMongoDB,
    getBlobTempPublicUrl: getBlobTempPublicUrl,
    saveDeviceClearLogStatus: saveDeviceClearLogStatus,
    saveClearLogsStatusMongoDB: saveClearLogsStatusMongoDB,
    saveDeviceVerbosityLogStatus: saveDeviceVerbosityLogStatus,
    saveDeviceVerbosityLogStatusMongoDB: saveDeviceVerbosityLogStatusMongoDB,
    switchCaseDeviceResponse: switchCaseDeviceResponse,
    updatejobStatus: updatejobStatus,
    saveDeviceFetchLogStatus: saveDeviceFetchLogStatus,
    saveDeviceFetchLogStatusMongoDB: saveDeviceFetchLogStatusMongoDB,
    updatejobStatus: updatejobStatus

};