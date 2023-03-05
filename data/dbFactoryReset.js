var dbCon = require('./dbConnection.js');
var sToIOT = require('./sendToiot.js');
var ResetParser = require('./parser.js');
var dbCmd = require('./dbCommandsOnDemand.js');

/**
* @description - Firmware upload event for factory reset
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename,MeterList,NoOfMeters,serialNumber, callback
* @return callback function
*/
function onFactoryReset(Action, Attribute, Purpose, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, serialNumber,JobID,factoryResetType,DeviceType, callback) {
    try {
        var data = {
            "action": Action,
            "attribute": Attribute,
            "rev": rev,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": cellid,
            "meterid": meterid,
            "deviceID": DeviceID,
            "Purpose": Purpose
        }
        ResetParser.hexaCreation(data, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        dbCmd.OnDemandSystemEventInsert(rev, cellid, meterid, messageid, Action, Attribute, result, function (err, onDemandRawData) {
                            if (err) {
                                return callback(err, null);
                            } else {                         
                                setTimeout(function () {
                                    getResetCurrentStatus(factoryResetType,DeviceType,JobID, function (err, result) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, result);
                                        }
                                    });
                                }, 3000);
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - get Job Current Status
* @param factoryResetType
* @param jobID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getResetCurrentStatus(factoryResetType, DeviceType, jobID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                jobsCollection = db.delta_Jobs;
                let configCollection = db.delta_Config;
                let deltalinkCollection = db.delta_DeltaLink;
                let condition;
                let setCondition;
                jobsCollection.find({ JobID: jobID }).toArray(function (err, jobDetails) {
                    if (jobDetails[0].Status == "Success") {
                        jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "ResetStatus": `${factoryResetType} factory reset for ${DeviceType} initiated` } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, Status: 1 } }, function (err, result) {
                            if (err)
                                callback(err, null);
                            else {
                                if (DeviceType == 'HyperSprout') {
                                    CollectionName = configCollection;
                                    condition = { "HypersproutSerialNumber": jobDetails[0].SerialNumber, "DeviceType": "hs" }
                                    setCondition = { "Bandwidth_Details.Bandwidth": 0, "Bandwidth_Details.DownloadBandwidth": 1, "Bandwidth_Details.UploadBandwidth": 1 }
                                } else if (DeviceType == 'HyperHub') {
                                    CollectionName = configCollection;
                                    condition = { "HypersproutSerialNumber": jobDetails[0].SerialNumber, "DeviceType": "hh" }
                                    setCondition = { "Bandwidth_Details.Bandwidth": 0, "Bandwidth_Details.DownloadBandwidth": 1, "Bandwidth_Details.UploadBandwidth": 1 }

                                } else if (DeviceType == 'Meter') {
                                    CollectionName = configCollection;
                                    condition = { "MeterSerialNumber": jobDetails[0].SerialNumber, "DeviceType": "meter" }
                                    setCondition = { "Bandwidth_Details.Bandwidth": 0, "Bandwidth_Details.DownloadBandwidth": 1, "Bandwidth_Details.UploadBandwidth": 1 }
                                } else {
                                    CollectionName = deltalinkCollection;
                                    condition = { "DeltalinkSerialNumber": jobDetails[0].SerialNumber }
                                    setCondition = { "Bandwidth": 0, "DownloadBandwidth": 1, "UploadBandwidth": 1 }
                                }
                                updateData(CollectionName, condition, setCondition, function (err, res) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        callback(null, result.value.Status)

                                    }
                                })

                            }
                        });

                    } else {
                        jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "ResetStatus": `${factoryResetType} factory reset for ${DeviceType} initiated` } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, Status: 1 } }, function (err, result) {
                            if (err)
                                callback(err, null);
                            else
                                callback(null, result.value.Status)
                        });
                    }

                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}





/**
* @description - For the Webservice - collectionStatus, update  details which is registered FROM MONGODB after query
* @param CollectionName MongodbCollection 
* @param condition condition used for mongodb query
* @param setCondition set condition to update the data
* @param callback - callback function returns success or error response
* @return callback function
*/
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
module.exports = {
    onFactoryReset: onFactoryReset,
    getResetCurrentStatus : getResetCurrentStatus
}