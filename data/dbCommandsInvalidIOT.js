//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var parser = require('../data/parser.js');
var sToIOT = require('./sendToiot.js');

/* *************** DB Commands (System Management) SECTION 1 - EXPOSED METHODS ************************ */

/**
* @description - Listing the list of Devices on the basis of DailySelfReadTime
* @param packetData
* @param callback - callback function returns success or error response
* @return callback function
*/
function intimateWrongPacket(packetData, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var hyperSproutCollection = db.delta_Hypersprouts;
            intimateForWrongPacket(hyperSproutCollection, packetData, callback);
        }
    });
}




/* ********** DB Commands (System Management) SECTION 2 - NON-EXPOSED METHODS************************ */

/**
* @description - intimate for wrong packet
* @param hyperSproutCollection
* @param packetData
* @param callback - callback function returns success or error response
* @return callback function
*/
function intimateForWrongPacket(hyperSproutCollection, packetData, callback) {
    hyperSproutCollection.find({ HypersproutID: packetData.cellid }).toArray(function (err, HSDetails) {
        if (err) {
            callback(err, null);
        } else if ((HSDetails.length === 0) || (HSDetails[0].DeviceID === null) || (HSDetails[0].DeviceID === undefined)) {
            callback(new Error("DeviceID not available in the system"), null);
        } else {
            parser.hexaCreation(packetData, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    sToIOT.sendToIOT(result, HSDetails[0].DeviceID, function (err, output) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, output);
                        }
                    });
                }
            });
        }
    });
};

/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {

    intimateWrongPacket: intimateWrongPacket
   
};
