var binaryconvertor = require('../data/sToBParser.js');
var sToIOT = require('../data/sendToiot.js');
var meterWifiEditReqParser = require('../data/parser.js');
var dbCmd = require('./dbCommandsRegistration.js');
/**
* @description - meter Wifi Edit Request
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID,MeterWiFiAccessPointPassword,MeterSerialNumber, callback
* @return callback function
*/
function meterWifiEditReq(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, MeterWiFiAccessPointPassword, MeterSerialNumber, callback) {
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
            "MeterWiFiAccessPointPassword": MeterWiFiAccessPointPassword,
            "Purpose": "MeterWifiEdit"
        }

        meterWifiEditReqParser.hexaCreation(data, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        dbCmd.MeterWifiPassJobInsert(meterid, MeterSerialNumber, function (err, WifiPassJobID) {
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
    meterWifiEditReq: meterWifiEditReq
}