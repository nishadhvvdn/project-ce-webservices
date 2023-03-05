var sToIOT = require('../data/sendToiot.js');
var parser = require('../data/parser.js');
var dbCmd = require('../data/dbCommands.js');
var dbCon = require('../data/dbConnection.js');
var async = require('async');

/**
* @description - error Reg
* @params - data, callback
* @return callback function
*/

function errorReg(data, callback) {
    try {
        parser.hexaCreation(data, function (err, result) {
            if (err) {
                return callback(err, null);
            } else {
                var input = {
                    "result": result,
                    "deviceID": data.deviceID
                }
                sendAndSaveMessage(input, function (err, response) {
                    if (err) {
                        callback(err, null);
                    } else if ((data.parameter === "AlreadyRegistered") && (data.action === "COLLECTOR_REGISTERATION")) {
                        dbCon.getDb(function (err, db) {
                            if (err)
                                return callback(null, response);
                            else {
                                var jobsCollection = db.delta_Jobs;
                                var statusField = ["Pending", "Running"]
                                jobsCollection.updateMany({
                                    Status: { $in: statusField }, CreatedDateTimestamp:
                                        { $lt: new Date(new Date().getTime() - 1000 * 60 * 60) }
                                },
                                    { $set: { Status: "Failed", "EndTime": new Date() } }, function (err, jobsToFail) {
                                        if (err) callback(err, null);
                                        jobsCollection.find({
                                            DeviceID: data.deviceID, Status: "Pending", JobName: "Registration Job", $or: [{ JobType: "Meter UnGroup" },
                                            { JobType: "Transformer UnGroup" }, { JobType: "MacID Registraion" }, { JobType: "MacID DeRegistraion" }]
                                        }, { PacketSent: 1, DeviceID: 1, _id: 0 }).toArray(function (err, jobsToResend) {
                                            if ((err === null) && (jobsToResend.length > 0)) {
                                                async.each(jobsToResend,
                                                    function (job, callbackEach) {
                                                        sToIOT.sendToIOT(job.PacketSent, data.deviceID, function (err, reSentData) {
                                                            callbackEach(null, response);
                                                        });
                                                    },
                                                    function (err) {
                                                        callback(null, response);
                                                    });
                                            } else {
                                                callback(null, response);
                                            }
                                        });
                                    });
                            }
    
                        });
                    } else
                        callback(null, response);
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - send And Save Message
* @params - input, callback
* @return callback function
*/
function sendAndSaveMessage(input, callback) {
    sToIOT.sendToIOT(input.result, input.deviceID, function (err, out) {
        if (err) {
            return callback(err, null);
        } else {
            dbCmd.saveParsedData(input.result, input.deviceID, function (err, res) {
                if (err) {
                    return callback(err, null);
                } else {
                    return callback(null, res);
                }
            });
        }
    });
}

module.exports = {
    errorReg: errorReg
}