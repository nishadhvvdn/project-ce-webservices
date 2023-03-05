var binaryconvertor = require('../data/sToBParser.js');
var sToIOT = require('../data/sendToiot.js');
var onDemandParser = require('../data/parser.js');
var dbCmd = require('./dbCommandsOnDemand.js');

/**
* @description - onDemDisConn
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, STATUS_CODE, password, DeviceID, callback
* @return callback function
*/

function onDemDisConn(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, STATUS_CODE, password, DeviceID, callback) {
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
            "STATUS_CODE": STATUS_CODE,
            "password": password,
            "deviceID": DeviceID,
            "Purpose": "OnDemandConnDisconn"
        }
    console.log(data)
        onDemandParser.hexaCreation(data, function (err, result) {
            if (err)
                callback(err, null);
            else {
                sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                    if (err)
                        return callback(err, null);
                    else {
                        dbCmd.OnDemandSystemEventInsert(rev, cellid, meterid, messageid, Action, Attribute, result, function (err, onDemandRawData) {
                            if (err)
                                return callback(err, null);
                            else
                                return callback(null, onDemandRawData);
                        });
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }

}

module.exports = {
    onDemDisConn: onDemDisConn
}