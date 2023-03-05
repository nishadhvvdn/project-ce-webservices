
const dbCon = require('./dbConnection.js');
const sendtoiot = require('../data/sendToiot.js');
const parser = require('../data/parser.js');
const shortid = require('shortid');
const async = require('async');
const express = require('express');
const router = express.Router();




/**
* @description - update bandwidth
* @param bandwidthData
* @param callback - callback function returns success or error response
* @return callback function
*/

function editBandwidthChangeDetails(bandwidthData, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            let meterCollection = db.delta_Meters;
            let hyperSproutCollection = db.delta_Hypersprouts;
            let deltalinkCollection = db.delta_DeltaLink;
            let jobsCollection = db.delta_Jobs;
            findCollection(db, bandwidthData.DeviceType, function (err, collection) {
                if (!err) {
                    editBandwidthChangeDetailsFromMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, collection, bandwidthData, callback);
                } else {
                    callback("inavlid condition !!", null)
                }
            })

        }
    });
};
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
* @description - For the Webservice - findCollection, SELECT Collection Name on the basis of Device Type
* @param db database parameter
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function editBandwidthChangeDetailsFromMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, CollectionName, bandwidthData, callback) {
    try {
        getDeviceHSDetails(hyperSproutCollection, CollectionName, bandwidthData, function (err, response) {
            if (err) {
                callback(err, null);
            } else {

                let action, attribute, Purpose;
                switch (bandwidthData.DeviceType) {
                    case "Meter":
                        action = 'CONFIGURATION';
                        attribute = 'METER_BANDWIDTH';
                        Purpose = 'METER_BANDWIDTH'
                        break;
                    case "HyperHub":
                        action = 'CONFIGURATION';
                        attribute = 'HH_BANDWIDTH';
                        Purpose = 'HH_BANDWIDTH'
                        break;
                    case "HyperSprout":
                        action = 'CONFIGURATION';
                        attribute = 'HS_BANDWIDTH';
                        Purpose = 'HS_BANDWIDTH'
                        break;

                    default:
                        callback("Invalid data !!", null)
                }
                getDataToParse(bandwidthData, response, action, attribute, Purpose, function (err, data) {
                    if (err) {
                        callback(err, null)
                    } else {
                        getjobdoc(response, data, bandwidthData, Purpose, function (err, jobdoc) {
                            updateMessageIDAndCreateJob(jobsCollection, jobdoc, data.messageid, function (err, successResponse) {
                                findCondition(bandwidthData.DeviceType, bandwidthData.deviceId, function (err, condition) {
                                    if (!err) {
                                        let setData = { "BandwidthEditJobID": jobdoc.JobID }
                                        updateData(CollectionName, condition, setData, function (err, resp) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                sendtoiot.checkDeviceConnectionState(response.DeviceID, function (err, status) {
                                                    if (err) {
                                                        callback(err.name != undefined ? err.name : err, null);
                                                    } else {
                                                        if (status == 'Connected') {
                                                            parser.hexaCreation(data, function (err, Hexresult) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    sendtoiot.sendToIOT(Hexresult, response.DeviceID, function (err, success) {
                                                                        if (err) {
                                                                            callback(err.name, null);
                                                                        } else {
                                                                            setTimeout(function () {
                                                                                getCurrentStatus(jobsCollection, jobdoc.JobID, function (err, result) {
                                                                                    if (err) {
                                                                                        callback(err, null);
                                                                                    } else {
                                                                                        systemEvents(data.rev, data.cellid, bandwidthData.deviceId, data.messageid, data.action, data.attribute, Hexresult, bandwidthData.DeviceType, function (err, _successEve) {
                                                                                            if (err) {
                                                                                                callback(err, null)
                                                                                            } else {
                                                                                                callback(null, result);

                                                                                            }
                                                                                        })

                                                                                    }
                                                                                });
                                                                            }, 5000);



                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        } else {
                                                            //Device is not connected
                                                            updateDeviceLogJob(jobsCollection, jobdoc, function (err, result) {
                                                                callback("Bandwidth Limitations Failed", true);
                                                            });


                                                        }
                                                    }
                                                })
                                            }
                                        })
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


function updateDeviceLogJob(jobsCollection, jobData, callback) {
    try {
        jobsCollection.updateMany({
            $or: [
                { "CreatedDateTimestamp": { $lte: new Date(new Date().getTime() - 1000 * 60 * 60) } },
                { "JobID": jobData.JobID }
            ],
            "JobName": "Bandwidth Limitations",
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
function updateData(collectionName, condition, setCondition, callback) {
    try {
        collectionName.update(condition, { "$set": setCondition }, function (err, insertResponse) {
            if (err)
                callback(err, null);
            else
                callback(null, insertResponse)
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

function getDataToParse(bandwidthData, response, action, attribute, purpose, callback) {
    try {
        let data;
        let rev = response.Rev ? response.Rev : 0;
        let countryCode = response.RegionCode ? response.RegionCode : 0;
        let regionCode = response.RegionCode ? response.RegionCode : 0;
        if ((purpose == "METER_BANDWIDTH") || (purpose == "HH_BANDWIDTH") || (purpose == "HS_BANDWIDTH")) {
            data = {
                "rev": rev,
                "messageid": Number(response.messageid) + 1,
                "countrycode": countryCode,
                "regioncode": regionCode,
                "cellid": response.CellID,
                "Status": bandwidthData.Status,
                "UploadBandwidth": bandwidthData.UploadBandwidth,
                "DownloadBandwidth": bandwidthData.DownloadBandwidth,
                "config_time": bandwidthData.config_time
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
        switch (bandwidthData.DeviceType) {
            case "Meter":
                data.meterid = bandwidthData.deviceId;
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
            default:
                callback("Invalid data !!", null)
        }

        callback(null, data)
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


function getjobdoc(response, data, DeviceValues, purpose, callback) {
    try {
        let jobdoc;
        if (DeviceValues.DeviceType == "Meter" && purpose == 'METER_BANDWIDTH') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.MeterSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "Meter",
                "JobName": "Bandwidth Limitations",
                "JobType": "Meter BandwidthChangeJobs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "BandwidthChangeStatus": "Sent"
            };

        } else if (DeviceValues.DeviceType == "HyperHub" && purpose == 'HH_BANDWIDTH') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperHub",
                "JobName": "Bandwidth Limitations",
                "JobType": "HyperHub BandwidthChangeJobs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "BandwidthChangeStatus": "Sent"
            };
        } else if (DeviceValues.DeviceType == "HyperSprout" && purpose == 'HS_BANDWIDTH') {

            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperSprout",
                "JobName": "Bandwidth Limitations",
                "JobType": "HyperSprout BandwidthChangeJobs",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "BandwidthChangeStatus": "Sent"
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



function getCurrentStatus(jobCollection, JobID, callback) {
    try {
        jobCollection.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, BandwidthJobStatus) {
            if (err)
                callback(err, null);
            else {
                console.log("BandwidthJobStatus[0].Status", BandwidthJobStatus)
                var Status = BandwidthJobStatus[0].Status;
                if (Status === "Pending") {
                    jobCollection.findAndModify({ JobID: JobID }, [], { $set: { "Status": "Failed", "EndTime": new Date , BandwidthChangeStatus: "Pending"} }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, BandwidthChangeStatus: 1 } }, function (err, result) {
                        if (err)
                            callback(err, null);
                        else
                            callback(null, result.value.BandwidthChangeStatus)
                    });
                }else if (Status === "Completed") {
                    jobCollection.findAndModify({ JobID: JobID }, [], { $set: { "Status": "Completed", "EndTime": new Date , BandwidthChangeStatus: "Success" } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, BandwidthChangeStatus: 1 } }, function (err, result) {
                        if (err)
                            callback(err, null);
                        else
                            callback(null, result.value.BandwidthChangeStatus)
                    });
                }
                else {
                    jobCollection.findAndModify({ JobID: JobID }, [], { $set: { "Status": "Failed", "EndTime": new Date , BandwidthChangeStatus: "Sent"} }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, BandwidthChangeStatus: 1 } }, function (err, result) {
                        if (err)
                            callback(err, null);
                        else
                            callback(null, result.value.BandwidthChangeStatus)
                    });
                }
            }
        });
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



/**
* @description -  For the Webservice - EditBandwidthDetails, UPDATE Bandwidth details IN MONGODB
* @params bandwidthData, callback
* @return callback function
*/

function editBandwidthDetails(bandwidthData, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            let configCollection = db.delta_Config;
            let jobsCollection = db.delta_Jobs;
            let hyperSproutCollection = db.delta_Hypersprouts;
            let meterCollection = db.delta_Meters;
            editDetailsFromMongoDB(configCollection, jobsCollection, hyperSproutCollection, meterCollection, bandwidthData, callback);

        }
    });
}


/**
* @description -  For the Webservice - EditbandwidthData
* @params configCollection, jobsCollection,, bandwidthData, callback
* @return callback function
*/

function editDetailsFromMongoDB(configCollection, jobsCollection, hyperSproutCollection, meterCollection, bandwidthData, callback) {
    try {
        let errorFinal = [];
        var dID = bandwidthData.deviceId;
        var CName;
        let whereCondition;
        let collectionName;
        let condition;
        if (bandwidthData.DeviceType == "Meter") {
            CName = configCollection;
            whereCondition = { "SerialNumber": bandwidthData.serialNumber }
            collectionName = meterCollection;
            condition = { MeterSerialNumber: bandwidthData.serialNumber }

        } else if (bandwidthData.DeviceType == "HyperHub") {
            CName = configCollection
            whereCondition = { "SerialNumber": bandwidthData.serialNumber }
            collectionName = hyperSproutCollection;
            condition = { HypersproutSerialNumber: bandwidthData.serialNumber, "IsHyperHub": true }

        }
        else {
            CName = configCollection
            whereCondition = { "SerialNumber": bandwidthData.serialNumber }
            collectionName = hyperSproutCollection;
            condition = { HypersproutSerialNumber: bandwidthData.serialNumber, "IsHyperHub": false }

        }
        collectionName.find(condition).toArray(function (err, bandwidthJobID) {
            if (err)
                callback(err, null);
            else {
                if (bandwidthJobID.length>0 && bandwidthJobID[0].BandwidthEditJobID && (bandwidthData.BandwidthFlag == "Y")) {
                    whereCondition.JobID = bandwidthJobID[0].BandwidthEditJobID;
                    jobsCollection.find(whereCondition).toArray(function (err, bandwidthStatus) {
                        if (err)
                            callback(err, null);
                        else if (bandwidthStatus.length > 0) {
                            if (bandwidthStatus[0].BandwidthChangeStatus === "Success") {
                                updateBandwidth(bandwidthData, CName, "Y", errorFinal, callback);
                            }else if (bandwidthStatus[0].BandwidthChangeStatus === "Pending") {
                                errorFinal.push("Unable to update " + bandwidthData.DeviceType + " bandwidth due to no response from device")
                                updateBandwidth(bandwidthData, CName, "N", errorFinal, callback);
                            }
                            else if (bandwidthStatus[0].BandwidthChangeStatus === "Sent") {
                                errorFinal.push("Unable to update " + bandwidthData.DeviceType + " bandwidth due to failure response from device")
                                updateBandwidth(bandwidthData, CName, "N", errorFinal, callback);
                            } else if (!bandwidthStatus[0].BandwidthChangeStatus) {
                                errorFinal.push("Unable to update " + bandwidthData.DeviceType + " bandwidth due to no response from device end or Device not connected!")
                                updateBandwidth(bandwidthData, CName, "N", errorFinal, callback);
                            }
                            else {
                                updateBandwidth(bandwidthData, CName, "N", errorFinal, callback);
                            }
                        } else {
                            updateBandwidth(bandwidthData, CName, "N", errorFinal, callback);

                        }
                    });
                } else {
                    updateBandwidth(bandwidthData, CName, "N", errorFinal, callback);
                }

            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};





module.exports = {
    editBandwidthChangeDetails: editBandwidthChangeDetails

}/**
* @description - update Bandwidth
* @params bandwidthData, collectionName, bandwidthChangeStatus, errorFinal, callback
* @return callback function
*/

function updateBandwidth(bandwidthData, collectionName, bandwidthChangeStatus, errorFinal, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                updateBandwidthDetailsMongoDB(bandwidthData, collectionName, bandwidthChangeStatus, errorFinal, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};




/**
* @description - update Bandwidth Details MongoDB
* @params bandwidthData, collectionName, bandwidthChangeStatus, callback
* @return callback function
*/

function updateBandwidthDetailsMongoDB(bandwidthData, collectionName, bandwidthChangeStatus, errorFinal, callback) {
    try {
        let whereCondition;
        let whereCondition1;
        let updateWhereCondition;
        let dSN = bandwidthData.serialNumber;
        let dID = bandwidthData.deviceId;
        if (bandwidthData.DeviceType == "Meter") {
            whereCondition = { "DeviceType": "meter", MeterID: dID, MeterSerialNumber: { $regex: new RegExp("^" + dSN + "$", "i") }, "Bandwidth": bandwidthData.Status, "DownloadBandwidth": bandwidthData.DownloadBandwidth, "UploadBandwidth": bandwidthData.UploadBandwidth }
            whereCondition1 = { "DeviceType": "meter", "MeterID": dID },
                updateWhereCondition = {
                    $set: {
                        MeterID: dID, "MeterSerialNumber": dSN, config_UpdateTime : bandwidthData.config_time,
                        "Bandwidth_Details": { "Bandwidth": bandwidthData.Status, "DownloadBandwidth": bandwidthData.DownloadBandwidth, "UploadBandwidth": bandwidthData.UploadBandwidth }
                    }
                }
        } else if (bandwidthData.DeviceType == "HyperHub") {
            whereCondition = { "DeviceType": "hh", HypersproutID: dID, HypersproutSerialNumber: { $regex: new RegExp("^" + dSN + "$", "i") }, IsHyperHub: true, "Bandwidth": bandwidthData.Status, "DownloadBandwidth": bandwidthData.DownloadBandwidth, "UploadBandwidth": bandwidthData.UploadBandwidth }
            whereCondition1 = { "DeviceType": "hh", "HypersproutID": dID }
            updateWhereCondition = {
                $set: {
                    HypersproutID: dID, "DeviceType": "hh", "HypersproutSerialNumber": dSN,config_UpdateTime : bandwidthData.config_time,
                    "Bandwidth_Details": { "Bandwidth": bandwidthData.Status, "DownloadBandwidth": bandwidthData.DownloadBandwidth, "UploadBandwidth": bandwidthData.UploadBandwidth }
                }
            }
        } else {
            whereCondition = { "DeviceType": "hs", HypersproutID: dID, HypersproutSerialNumber: { $regex: new RegExp("^" + dSN + "$", "i") }, IsHyperHub: false, "Bandwidth": bandwidthData.Status, "DownloadBandwidth": bandwidthData.DownloadBandwidth, "UploadBandwidth": bandwidthData.UploadBandwidth }
            whereCondition1 = { "DeviceType": "hs", HypersproutID: dID },
                updateWhereCondition = {
                    $set: {
                        HypersproutID: dID, "DeviceType": "hs", "HypersproutSerialNumber": dSN,config_UpdateTime : bandwidthData.config_time,
                        "Bandwidth_Details": { "Bandwidth": bandwidthData.Status, "DownloadBandwidth": bandwidthData.DownloadBandwidth, "UploadBandwidth": bandwidthData.UploadBandwidth }
                    }
                }

        }
        collectionName.find(whereCondition).toArray(function (err, notUpdatedDLDetails) {
            if (err) {
                callback(err, null);
            } else if (notUpdatedDLDetails.length > 0) {
                callback(bandwidthData.DeviceType + " Details not updated", null);
            } else {
                collectionName.find(whereCondition1).toArray(function (err, Details) {
                    if (err)
                        callback(err, null);
                    else if (Details.length === 0)
                        callback("No such " + bandwidthData.DeviceType + " available", null);

                    else {
                        if(bandwidthChangeStatus == "Y" && bandwidthData.BandwidthFlag == "Y"){
                            collectionName.update(whereCondition1, updateWhereCondition, function (err, updateDetails) {
                                if (err)
                                    insertError.putErrorDetails(err, callback);
                                else {
                                    if (updateDetails !== null) {
                                        callback(null, "Bandwidth Details Successfully Updated!", errorFinal);
                                    }
                                }
                            });
                        }else if(bandwidthData.BandwidthFlag == "N"){
                            collectionName.update(whereCondition1, updateWhereCondition, function (err, updateDetails) {
                                if (err)
                                    insertError.putErrorDetails(err, callback);
                                else {
                                    if (updateDetails !== null) {
                                        callback(null, "Bandwidth Details Successfully Updated!", errorFinal);
                                    }
                                }
                            });
                        }else{
                            callback(null, "Failure: Bandwidth could not be updated!", errorFinal);
                    }
                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - get Device HS Details
* @param hyperSproutCollection
* @param CollectionName
* @param bandwidthData
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDeviceHSDetails(hyperSproutCollection, CollectionName, bandwidthData, callback) {
    try {
        findCondition(bandwidthData.DeviceType, bandwidthData.deviceId, function (err, condition) {
            if (!err) {
                collectionStatus(CollectionName, condition, bandwidthData, function (err, result) {
                    if (err) {
                        callback(err, null)
                    } else {
                        let whereCondition;
                        if (bandwidthData.DeviceType == "Meter") {
                            whereCondition = { "HypersproutID": result[0].HypersproutID, Status: "Registered" }
                            findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else if (res.length > 0) {
                                    if (res[0].Status === "NotRegistered") {
                                        callback(bandwidthData.DeviceType + " Not Registered", null);
                                    } else {
                                        HSDetails(res, result, bandwidthData.DeviceType, function (err, response) {
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
                        else {
                            whereCondition = { 'HypersproutID': result[0].HypersproutID }
                            findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else if (res.length > 0) {
                                    if (res[0].Status === "NotRegistered") {
                                        callback(bandwidthData.DeviceType + " Not Registered", null);
                                    } else {
                                        HSDetails(res, result, bandwidthData.DeviceType, function (err, response) {
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
* @description - edit  Bandwidth Reponse
* @params deltalinkID, status, attribute callback
* @return callback function
*/

function editBandwidthReponse(Id, status, attribute, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            findCollectionByAttribute(db, attribute, function (err, collection) {
                if (!err) {
                    editBandwidthReponseFromMongoDB(collection, db.delta_Jobs, Id, status, attribute, callback);
                } else {
                    callback("inavlid condition !!", null)
                }
            })
        }
    });
}


/**
* @description - For the Webservice - findCollection, SELECT Collection Name on the basis of Device Type
* @param db database parameter
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function findCollectionByAttribute(db, Device, callback) {
    try {
        var collectionName;
        if (Device == "METER_BANDWIDTH") {
           collectionName = db.delta_Meters
        } else if (Device == "HS_BANDWIDTH" || Device == "HH_BANDWIDTH") {
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
* @description - edit Deltalink Bandwidth Reponse From MongoDB
* @params deltalinkCollection, jobsCollection, deltalinkID, status, attribute, callback
* @return callback function
*/

function editBandwidthReponseFromMongoDB(Collection, jobsCollection, Id, status, attribute, callback) {
    let condition;
    Id = parseInt(Id)
    if (attribute == "METER_BANDWIDTH") {
        condition = { MeterID: Id }
    } else if (attribute == "HH_BANDWIDTH") {
        condition = { HypersproutID: Id, IsHyperHub: true }
    } else {
        condition = { HypersproutID: Id, IsHyperHub: false }
    }
    Collection.find(condition, { BandwidthEditJobID: 1 }).toArray(function (err, bandwidthEditJobID) {
        if (err)
            callback(err, null);
        else {
            if(bandwidthEditJobID.length>0){
            var JobID = bandwidthEditJobID[0].BandwidthEditJobID;
            if (status === 1) {
                jobsCollection.update({ JobID: JobID }, { $set: { "Status": "Completed", "EndTime": new Date(), "BandwidthChangeStatus": "Success" } }, function (err, updateBandwidthJob) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, updateBandwidthJob);
                });

            } else {
                if (status === 2) {
                    Message = "Invalid Lengh(Length!=8 OR the parameters) !!";
                } else if (status === 3) {
                    Message = "Invalid Characters Received !!";
                } else {
                    Message = "Parameters Not in Range !!";
                }

                jobsCollection.update({ JobID: JobID }, { $set: { "Status": "Failed", "EndTime": new Date() } }, function (err, updateBandwidthJob) {
                    if (err)
                        callback(err, null);
                    else
                        callback(updateBandwidthJob, null);
                });

            }}else{
                callback("Device Details not available in the system!", null) 
            }
        }
    })
}


module.exports = {
    editBandwidthChangeDetails: editBandwidthChangeDetails,
    editBandwidthDetails: editBandwidthDetails,
    editBandwidthReponse: editBandwidthReponse

}





