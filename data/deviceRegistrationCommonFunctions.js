var sToIOT = require('../data/sendToiot.js');
var parser = require('../data/parser.js');
var dbCmd = require('../data/dbCommandsTransactionScheduler.js');
var dbCon = require('../data/dbConnection.js');

/**
* @description - device Registration
* @params - data, callback
* @return callback function
*/

function deviceRegistration(data, callback) {
    try {
        var input = {
            "deviceID": data.deviceID,
            "rev": data.rev,
            "cellid": data.cellid,
            "meterid": data.meterid,
            "messageid": data.messageid,
            "Action": data.action,
            "Attribute": data.attribute,
            "JobID": data.JobID
        }
        parser.hexaCreation(data, function (err, msg) {
            if (err) {
                callback(err, null);
            } else {
                input.result = msg;
                sendAndSaveMessage(input, function (err, response) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, response);
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - send And SaveMessage to IOT
* @params - input, callback
* @return callback function
*/

function sendAndSaveMessage(input, callback) {
    try {
        sToIOT.sendToIOT(input.result, input.deviceID, function (err, output) {
            if (err) {
                return callback(err, null);
            } else {
                if (output) {
                    dbCmd.systemEvents(input.rev, input.cellid, input.meterid, input.messageid, input.Action, input.Attribute, input.result, function (err, res) {
                        if (err) {
                            return callback(err, null);
                        } else if ((input.Attribute === "HS_CONFIGURATION") || (input.Attribute === "METER_CONFIGURATION")) {
                            dbCon.getDb(function (err, db) {
                                if (err)
                                    return callback(null, res);
                                else {
                                    var jobsCollection = db.delta_Jobs;
                                    jobsCollection.update({ JobID: input.JobID }, { $set: { Status: "Completed", EndTime: new Date() } }, function (err, result) {
                                        return callback(null, res);
                                    });
                                }
                            });
                        }
                        else
                            return callback(null, res);
                    });
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
module.exports = {
    deviceRegistration: deviceRegistration
}