var binaryconvertor = require('../data/sToBParser.js');
var sToIOT = require('../data/sendToiot.js');
var parser = require('../data/parser.js');
var dbCmd = require('./dbCommandsDeltalink.js');
/**
* @description - Deltalink bandwidth  Request
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, deltalinkid,  DeviceID,DeltalinkBandwidth,DeltalinkSerialNumber, callback
* @return callback function
*/

function deltalinkBandwidthEditReq(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, deltalinkID, DeviceID, deltalinkBandwidth, deltalinkDownloadBandwidth, deltalinkUploadBandwidth, deltalinkSerialNumber, callback) {
    try {
        var data = {
            "action": Action,
            "attribute": Attribute,
            "rev": rev,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": cellid,
            "meterid": deltalinkID,
            "deviceID": DeviceID,
            "DeltalinkBandwdith": deltalinkBandwidth,
            "DeltalinkDownloadBandwidth":deltalinkDownloadBandwidth, 
            "DeltalinkUploadBandwidth":deltalinkUploadBandwidth, 
            "Purpose": "DeltalinkBandwidthEdit"
        }
        parser.hexaCreation(data, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        dbCmd.DeltalinkBandwidthJobInsert(deltalinkID, deltalinkSerialNumber, function (err, BandwidthJobID) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                return callback(null, BandwidthJobID);
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
module.exports = {
    deltalinkBandwidthEditReq: deltalinkBandwidthEditReq
}