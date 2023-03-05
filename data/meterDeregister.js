var sToIOT = require('../data/sendToiot.js');
var meterDeregisterParser = require('../data/parser.js');
var dbCmd = require('./dbCommandsRegistration.js');
var dbCon = require('./dbConnection.js');
var async = require('async');
/**
* @description - meter Deregister
* @params - Action, Attribute, rev, messageId, countryCode, regionCode, cellId, deviceID, noOfMeters, meterId, callback
* @return callback function
*/
function meterDeregister(Action, Attribute, rev, messageId, countryCode, regionCode, cellId, deviceID, noOfMeters, meterId,sendMacs, callback) {
    try {
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
            "noOfMeters": noOfMeters,
            "Purpose": "MeterDeregister"
        }
        meterDeregisterParser.hexaCreation(data, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                dbCmd.meterDeregisterInsert(result, meterId, deviceID, function (err, meterUngroupJob) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                return callback(null, out);
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

// function getMeterGroupingDetails(meterIDs, callback) {
//     dbCon.getDb(function (err, db) {
//         if (err) {
//             return callback(err, null);
//         } else {
//             var metersCollection = db.delta_Meters;
//             var hypersproutsCollection = db.delta_Hypersprouts;
//             var meterGrouping = [];
//             async.each(meterIDs,
//                 function (meterID, callbackEach) {
//                     meterGroupingID(meterID, metersCollection, hypersproutsCollection, function (err, groupedCellID) {
//                         if (err) {
//                             callbackEach(err, null);
//                         } else {
//                             // for (var i in meterGrouping) {
//                             //     if (meterGrouping[i].cellID === groupedCellID) {
//                             //         meterGrouping[i].meterid.push(meterID);
//                             //         flag = false;
//                             //         callbackEach(null, meterGrouping);
//                             //     }
//                             // }
//                             var index = -1;
//                             index = data.findIndex(function (meterGrouping, i) {
//                                 if (meterGrouping.cellID === groupedCellID)
//                                     return i;
//                             });
//                             meterGrouping.findIndex()
//                             if (index === -1) {
//                                 var output = {
//                                     cellID = groupedCellID,
//                                     meterid =[meterID]
//                                 }
//                                 meterGrouping.push(output);
//                                 callbackEach(null, meterGrouping);
//                             } else {
//                                 meterGrouping[index].meterid.push(meterID);
//                                 callbackEach(null, meterGrouping);
//                             }
//                             // communicationStatisticsResponse.push(result);
//                         }
//                     });
//                 },
//                 function (err) {
//                     if (err)
//                         callback(err, null);
//                     else
//                         callback(null, meterGrouping);
//                 });
//         }
//     });
// }

// function meterGroupingID(meterID, metersCollection, hypersproutsCollection, callback) {
//     metersCollection.find({ MeterID: meterID }, { HypersproutID: 1 }).toArray(function (err, metDet) {
//         if (err)
//             callback(err, null)
//         else if (metDet.length === 0)
//             callback(null, 0);
//         else {
//             // hypersproutsCollection.find({ HypersproutID: metDet[0].HypersproutID }).toArray(function (err, hsDet) {
//             //     if (err)
//             //         callback(err, null)
//             //     else if (hsDet.length === 0)
//             //         callback(null, 0, 0);
//             //     else
//             callback(null, metDet[0].HypersproutID)
//             // });
//         }
//     })
// }

module.exports = {
    meterDeregister: meterDeregister
    // getMeterGroupingDetails: getMeterGroupingDetails
}