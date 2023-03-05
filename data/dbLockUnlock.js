var binaryconvertor = require('./sToBParser.js');
var sToIOT = require('./sendToiot.js');
var onLockUnlockParser = require('./parser.js');
var dbCmd = require('./dbCommandsOnDemand.js');
var dbCon = require('./dbConnection.js');

/**
* @description - Firmware upload event
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename,MeterList,NoOfMeters,serialNumber, callback
* @return callback function
*/
function onLockUnlock(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, serialNumber, JobID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                countrycode = (countrycode == null || countrycode == "null" || countrycode == undefined || countrycode == "") ? 0 : countrycode;
                regioncode = (regioncode == null || regioncode == "null" || regioncode == undefined || regioncode == "") ? 0 : regioncode;
                rev = (rev == null || rev == "null" || rev == undefined || rev == "") ? 0 : rev;
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
                    "Purpose": "LockUnlock"
                }
                onLockUnlockParser.hexaCreation(data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                            if (err) {
                                return callback(err.name, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(rev, cellid, meterid, messageid, Action, Attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getLockCurrentStatus(jobsCollection, messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 6000);

                                    }
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

/**
* @description - get Meter Current Status
* @param jobsCollection
* @param meterID
* @param messageid
* @param jobID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getLockCurrentStatus(jobsCollection, messageid, jobID, callback) {
    try {
        jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Completed", "EndTime": new Date } }, function (err, insertResponse) {
            jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "Status": "Completed", "EndTime": new Date } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, LockStatus: 1 } }, function (err, result) {
                if (err)
                    callback(err, null);
                else
                    callback(null, result.value.LockStatus)
            });
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

module.exports = {
    onLockUnlock: onLockUnlock,
    getLockCurrentStatus : getLockCurrentStatus
}