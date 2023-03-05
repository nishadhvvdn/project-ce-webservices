var binaryconvertor = require('../data/sToBParser.js');
var sToIOT = require('../data/sendToiot.js');
var hypersproutWifiEditReqParser = require('../data/parser.js');
var dbCmd = require('./dbCommandsRegistration.js');

/**
* @description - hyper sprout Wifi Edit Request
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid,
    meterid, DeviceID, AccessPointPassword, HypersproutSerialNumber, deviceType, callback
* @return callback function
*/

function hypersproutWifiEditReq(Action, Attribute, rev, messageid, countrycode, regioncode, cellid,
    meterid, DeviceID, AccessPointPassword, HypersproutSerialNumber, deviceType, callback) {
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
            "AccessPointPassword": AccessPointPassword,
            "Purpose": "HSWifiEdit"
        }

        hypersproutWifiEditReqParser.hexaCreation(data, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        dbCmd.HSWifiPassJobInsert(cellid, HypersproutSerialNumber, deviceType, function (err, WifiPassJobID) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                return callback(null, WifiPassJobID);
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
    hypersproutWifiEditReq: hypersproutWifiEditReq
}