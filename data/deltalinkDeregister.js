var sToIOT = require('../data/sendToiot.js');
var parser = require('../data/parser.js');
var dbCmd = require('./dbCommandsRegistration.js');
var dbCon = require('./dbConnection.js');
var async = require('async');
/**
* @description - deltalink Deregister
* @params - Action, Attribute, rev, messageId, countryCode, regionCode, cellId, deviceID, NoOfDeltalinks, deltalinkID, callback
* @return callback function
*/
function deltlinkDeregister(Action, Attribute, rev, messageId, countryCode, regionCode, cellId, deviceID, NoOfDeltalinks, deltalinkID,sendMacs, callback) {
    var data = {
        "action": Action,
        "attribute": Attribute,
        "rev": rev,
        "messageid": messageId,
        "countrycode": countryCode,
        "regioncode": regionCode,
        "cellid": cellId,
        "meterid": sendMacs,
        "deviceID": deviceID,
        "NoOfDeltalinks": NoOfDeltalinks,
        "Purpose": "DeltalinkDeregister"
    }
    parser.hexaCreation(data, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            dbCmd.deltalinkDeregisterInsert(result, deltalinkID, deviceID, function (err, meterUngroupJob) {
                if (err) {
                    return callback(err, null);
                } else {
                    sToIOT.sendToIOT(result, deviceID, function (err, out) {
                        if (err) {
                            return callback(err.name, null);
                        } else {
                            return callback(null, out);
                        }
                    });
                }
            });
        }
    });
}


module.exports = {
    deltlinkDeregister: deltlinkDeregister

}