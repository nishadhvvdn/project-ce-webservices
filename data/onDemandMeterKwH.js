var binaryconvertor = require('../data/sToBParser.js');
var sToIOT = require('../data/sendToiot.js');
var onDemandKwHParser = require('../data/parser.js');
var dbCmd = require('./dbCommandsOnDemand.js');
/**
* @description - on Demand KwH
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, callback
* @return callback function
*/
function onDemandKwH(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, callback) {
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
            "Purpose": "OnDemandMeterKwH"
        }
        
        onDemandKwHParser.hexaCreation(data, function (err, result) {
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
                                return callback(null, onDemandRawData);
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
module.exports = {
    onDemandKwH: onDemandKwH
}