var async = require('async');
var dbCon = require('./dbConnection.js');
const paginatedResults = require('../config/Helpers/Pagination')

/**
* @description - get Device Error Report
* @param startDate
* @param endDate
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDeviceErrorReport(startDate, endDate, data, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                getAlarmDataFromDB(startDate, endDate, data, function (err, erordata) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, erordata);
                    }

                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

};


// function getDeviceErrorReport(startDate, endDate,data, callback) {
//     try {
//         dbCon.getDb(function (err, db) {
//             if (err) {
//                 callback(err, null);
//             } else {
//                 var alarmEventcollection = db.delta_AlarmsAndEvents;
//                 var hypersproutsCircuit = db.delta_Hypersprouts;
//                 var collectionCircuitID = db.delta_Transformer;
//                 getAlarmDataFromDB(startDate, endDate, alarmEventcollection, function (err, erordata) {
//                     if (err) {
//                         callback(err);
//                     } else {
//                         getCircuitId(erordata, hypersproutsCircuit, collectionCircuitID, function (err, errCircuitDetails) {
//                             if (err) {
//                                 callback(err);
//                             } else {
//                                 callback(null, errCircuitDetails);
//                             }
//                         });
//                     }

//                 });
//             }
//         });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }

// };

/**
* @description - get Alarm Data From DB
* @param startDate
* @param endDate
* @param alarmEventcollection
* @param callback - callback function returns success or error response
* @return callback function
*/

function getAlarmDataFromDB(startDate, endDate, data, callback) {
    try {
        var startDate = startDate.replace("T", " ");
        var endDate = endDate.replace("T", " ");
        var startDate = startDate.replace("Z", "");
        var endDate = endDate.replace("Z", "");
        let TableName = "alarmseventstransformer";
        let ColumnName = "HypersproutID,ReadTimestamp,UnderVoltage,`OverLoadLine2(MD Alarm)`, OverFrequency,OilLevelSensorFailure,TamperBox,HighOilTemperature,BatteryFailure,PrimaryPowerUp,`Non-TechnicalLoss`, MeterDisconnected,`3G/4G/LTECommunicationLoss`,Communicationattemptsexceeded,UnderFrequency,`OverLoadLine1(MD Alarm)`,`OverLoadLine3(MD Alarm)`,PTOpen,  TamperLid,LowOilLevel,LowBatteryVoltage,BatteryRemoved,PrimaryPowerDown,MeterConnected,`Wi-FiCommunicationLoss`, UnAuthenticatedConnectionRequest";
        let Count = "1";
        let WhereCondition = "(ReadTimestamp >=" + " '" + startDate + "' " + "AND ReadTimestamp <= " + "'" + endDate + "' " + ") AND UnderVoltage = 1 OR `OverLoadLine2(MD Alarm)` = 1 OR OverFrequency = 1 OR OilLevelSensorFailure = 1 OR TamperBox = 1 OR HighOilTemperature = 1 OR BatteryFailure = 1 OR PrimaryPowerUp = 1 OR `Non-TechnicalLoss` = 1 OR MeterDisconnected = 1 OR `3G/4G/LTECommunicationLoss` = 1 OR Communicationattemptsexceeded = 1 OR UnderFrequency = 1 OR `OverLoadLine1(MD Alarm)` = 1 OR `OverLoadLine3(MD Alarm)` = 1 OR PTOpen = 1 OR TamperLid = 1 OR LowOilLevel = 1 OR LowBatteryVoltage = 1 OR BatteryRemoved = 1 OR PrimaryPowerDown = 1 OR MeterConnected = 1 OR `Wi-FiCommunicationLoss`  = 1 OR UnAuthenticatedConnectionRequest =1";
        let CountWhereCondition = "(ReadTimestamp >=" + " '" + startDate + "' " + "AND ReadTimestamp <= " + "'" + endDate + "' " + ") AND UnderVoltage = 1 OR `OverLoadLine2(MD Alarm)` = 1 OR OverFrequency = 1 OR OilLevelSensorFailure = 1 OR TamperBox = 1 OR HighOilTemperature = 1 OR BatteryFailure = 1 OR PrimaryPowerUp = 1 OR `Non-TechnicalLoss` = 1 OR MeterDisconnected = 1 OR `3G/4G/LTECommunicationLoss` = 1 OR Communicationattemptsexceeded = 1 OR UnderFrequency = 1 OR `OverLoadLine1(MD Alarm)` = 1 OR `OverLoadLine3(MD Alarm)` = 1 OR PTOpen = 1 OR TamperLid = 1 OR LowOilLevel = 1 OR LowBatteryVoltage = 1 OR BatteryRemoved = 1 OR PrimaryPowerDown = 1 OR MeterConnected = 1 OR `Wi-FiCommunicationLoss`  = 1 OR UnAuthenticatedConnectionRequest =1";
        paginatedResults.paginatedResultsMySQLSortBY(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, data, "DeviceErrorReport", "ReadTimestamp DESC", function (err, Details) {
            if (err) {
                callback(err, null)
            } else {
                let result = Details.results;
                var errorData = [];
                let alarmError = [];
                for (var i = 0; i < result.length; i++) {
                    for (var key in result[i]) {
                        if ((key !== 'HypersproutID') && (key !== "ReadTimestamp") && (result[i][key] === 1)) {
                            alarmError.push(key)
                        }
                    }
                    if (alarmError.length > 0) {
                        const unique = [...new Set(alarmError)]
                        errorData.push({ HypersproutSerialNumber: result[i].HypersproutID, error: unique, ReadTimestamp: result[i].ReadTimestamp });
                    }

                }
                delete Details.results;
                Details.results = errorData;
                callback(null, Details);
            }
        })



    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};



// function getAlarmDataFromDB(startDate, endDate, alarmEventcollection, callback) {
//     try {
//         alarmEventcollection.find({ "DBTimestamp": { '$gte': new Date(startDate), '$lte': new Date(endDate) } }).sort({"DBTimestamp":-1}).limit(1000).toArray(function (err, result) {
//             if (err) {
//                 callback(err);
//             } else if (result.length === 0) {
//                 callback(new Error("No Data Found"), null);
//             } else {
//                 var errorData = [];
//                 for (var i = 0; i < result.length; i++) {
//                     for (var key in result[i].result.Transformer) {
//                         if ((key !== 'Phase') && (key !== "NoOfMeter") && (key !== 'StatusTransformer') && (key !== 'ReadTimestamp') && (result[i].result.Transformer[key] === 1)) {
//                             errorData.push({ celID: result[i].result.CellID, error: key, ReadTimestamp: result[i].result.Transformer.ReadTimestamp });
//                         }
//                     }
//                 }
//                 callback(null, errorData);
//             }
//         });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };





/**
* @description - get Circuit ID
* @param errCircuitDetail array
* @param hypersproutsCircuits collection name
* @param collectionCircuit collection name
* @param callback - callback function returns success or error response
* @return callback function
*/
function getCircuitId(errCircuitDetail, hypersproutsCircuits, collectionCircuit, callback) {
    try {
        var grpDetails = [];
        async.each(errCircuitDetail,
            function (errCircuitDet, callback) {
                hypersproutsCircuits.find({ "HypersproutID": errCircuitDet.celID }, { "HypersproutSerialNumber": 1, "TransformerID": 1 }).toArray(function (err, result) {
                    if (err) {
                        callback(err);
                    } else if (result.length === 0) {
                        callback();
                    } else {
                        collectionCircuit.find({ "TransformerID": result[0].TransformerID }, { "CircuitID": 1, "TransformerSerialNumber": 1 }).toArray(function (err, doc) {
                            if (err) {
                                callback(err);
                            } else {
                                var errDetail = {
                                    "cellID": errCircuitDet.celID,
                                    "error": errCircuitDet.error,
                                    "ReadTimestamp": errCircuitDet.ReadTimestamp,
                                    "HypeSrpoutID": errCircuitDet.celID,
                                    "HypersproutSerialNumber": result[0].HypersproutSerialNumber,
                                    "CircuitID": doc[0].CircuitID,
                                    "TransformerSerialNumber": doc[0].TransformerSerialNumber
                                };
                                grpDetails.push(errDetail);
                                callback(null, grpDetails);
                            }
                        });

                    }
                });
            }, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    if (grpDetails.length > 0) {
                        callback(null, grpDetails);
                    } else {
                        callback(new Error("No Data Found"), null);
                    }
                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};





module.exports = {
    getDeviceErrorReport: getDeviceErrorReport,
};