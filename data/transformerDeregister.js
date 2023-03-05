var binaryconvertor = require('../data/sToBParser.js');
var sToIOT = require('../data/sendToiot.js');
var transformerDeregisterReqParser = require('../data/parser.js');
var dbCmd = require('./dbCommandsRegistration.js');

/**
* @description - transformer Deregister Request, cellid is the transformerID
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, HypersproutSerialNumber, callback
* @return callback function
*/

function transformerDeregisterReq(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, HypersproutSerialNumber, callback) {
 try{
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
        "Purpose": "HSDeregister"
    }

    transformerDeregisterReqParser.hexaCreation(data, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                if (err) {
                    return callback(err, null);
                } else {
                    if (Attribute == "HYPERHUB_DELETE") {
                        dbCmd.hyperhubDeregisterInsert(cellid, HypersproutSerialNumber, result, function (err, transformerUngroupJobID) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                return callback(null, "Hypersprout Ungrouped Successfully");
                            }
                        });
                    } else {
                        dbCmd.transformerDeregisterInsert(cellid, HypersproutSerialNumber, result, function (err, transformerUngroupJobID) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                return callback(null, "Hypersprout Ungrouped Successfully");
                            }
                        });
                    }
                }
            });
        }
    });
} catch (e) {
    callback("Something went wrong : " + e.name + " " + e.message, null)

}
}
module.exports = {
    transformerDeregisterReq: transformerDeregisterReq
}