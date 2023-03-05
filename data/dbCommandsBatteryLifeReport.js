var async = require('async');
var dbCon = require('./dbConnection.js');
var fs = require('fs');

const paginatedResults = require('../config/Helpers/Pagination')

/**
* @description - get Battery Life Report
* @param callback - callback function returns success or error response
* @return callback function
*/



function getBatterLifeReport(queryParam, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                let TableName = "managerialdata";
                let ColumnName = "distinct md.HypersproutSerialNumber,tt.StatusTransformer,tt.CellID,tt.BatteryVoltage,tt.DBTimestamp";
                let JoinTableName = "transformertransactions";
                let JoinColumnName = "tt.StatusTransformer,tt.CellID,tt.BatteryVoltage,max(tt.DBTimestamp)DBTimestamp";
                let joinType = "INNER join"
                let WhereCondition = `tt.StatusTransformer = 'Connected' group by tt.CellID)tt ON md.TransformerID = tt.CellID`;
                let Count = "distinct tt.CellID";
                let JoinCountColumnName = "tt.StatusTransformer,tt.CellID,tt.BatteryVoltage,max(tt.DBTimestamp)DBTimestamp";
                let CountWhereCondition = `tt.StatusTransformer = 'Connected' group by tt.CellID)tt
                ON md.TransformerID = tt.CellID`;
                let variable1 = "md";
                let variable2 = "tt";
                paginatedResults.paginatedResultsMySQLJoin(TableName, ColumnName, JoinColumnName, joinType, variable1, variable2, JoinTableName, JoinCountColumnName, Count, WhereCondition, CountWhereCondition, queryParam, "BatteryLifeReport", function (err, Details) {
                    if (err) {
                        callback(err, null)
                    } else {
                        var BackupTime;
                        var minsOnBattery;
                        var batteryDetails = JSON.parse(fs.readFileSync('./config/BatteryLifeDetail.json', 'utf8'));
                        var variableLoad = (batteryDetails.Wifi_Active_Percentage / 100 * 510 + batteryDetails.LTE_active_percentage / 100 * (6600 * 0.15 / 60 + 700)).toFixed(1);
                        var totalLoad = (variableLoad * 3.3).toFixed(1);
                        let rows = Details.results;
                        var transactionData = [];
                        for (var c in rows) {
                            if (rows.hasOwnProperty(c)) {
                                var energycapacityforanhour = (batteryDetails.Current_capacity * (rows[c].BatteryVoltage - 5.4)).toFixed(1);
                                if (rows[c].BatteryVoltage <= 5.4) {
                                    BackupTime = 0;
                                    minsOnBattery = batteryDetails.MaxMinsOnBattery;
                                } else {
                                    BackupTime = (energycapacityforanhour / totalLoad * 60).toFixed(1);
                                    minsOnBattery = batteryDetails.MaxMinsOnBattery - BackupTime;
                                }
                                transactionData.push({
                                    "BatteryVoltage": rows[c].BatteryVoltage,
                                    "DBTimestamp": rows[c].DBTimestamp,
                                    "CellID": rows[c].CellID,
                                    "HypersproutID": rows[c].CellID,
                                    "HypersproutSerialNumber": rows[c].HypersproutSerialNumber,
                                    "BackupTime": BackupTime,
                                    "energycapacityforanhour": energycapacityforanhour,
                                    "variableLoad": variableLoad,
                                    "totalLoad": totalLoad,
                                    "minsOnBattery": minsOnBattery
                                });

                            }
                        }

                        delete Details.results;
                        Details.results = transactionData
                        callback(null, Details);
                    }
                })
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};


// function getBatterLifeReport(queryParam, callback) {
//     try {
//         dbCon.getDb(function (err, db) {
//             if (err) {
//                 callback(err, null);
//             } else {
//                 var collectionHyperSprout = db.delta_Hypersprouts;
//                 var collectionTransaction = db.delta_Transaction_Data;
//                 findHyperSproutSerialNumber(collectionHyperSprout, collectionTransaction, function (err, batteryresult) {
//                     if (err) {
//                         callback(err);
//                     } else {
//                         callback(null, batteryresult);
//                     }
//                 });
//             }
//         });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };
/**
* @description- find HyperSprout Serial Number
* @params collectionHyperSprout 
* @params collectionTransaction
* @param callback - callback function returns success or error response
* @return callback function
*/
function findHyperSproutSerialNumber(collectionHyperSprout, collectionTransaction, callback) {
    try {
        collectionHyperSprout.find({ "Status": 'Registered' }, { "HypersproutSerialNumber": 1, "HypersproutID": 1 }).toArray(function (err, result) {
            if (err) {
                callback(err);
            } else if (result.length === 0) {
                callback(null, 'Data Not Found');
            } else {
                getTransactionDataStatus(collectionTransaction, result, callback);
            }

        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description - get Transaction Data Status
* @param collectionTransaction
* @param serialNumbers
* @param callback - callback function returns success or error response
* @return callback function
*/

function getTransactionDataStatus(collectionTransaction, serialNumbers, callback) {
    try {
        var transactionData = [];
        var totalData = {};
        async.each(serialNumbers,
            function (hyperID, callback) {
                collectionTransaction.find({ "result.CellID": hyperID.HypersproutID, "result.Transformer.StatusTransformer": "Connected" }, { "result.Transformer.BatteryVoltage": 1, "result.CellID": 1, "DBTimestamp": 1 }).sort({ "_id": -1 }).limit(1).toArray(function (err, TransData) {
                    if (err) {
                        callback(err);
                    } else if (TransData.length === 0) {
                        callback(null, 'No Data Found');
                    } else {
                        var BackupTime;
                        var minsOnBattery;
                        var batteryDetails = JSON.parse(fs.readFileSync('./config/BatteryLifeDetail.json', 'utf8'));
                        var variableLoad = (batteryDetails.Wifi_Active_Percentage / 100 * 510 + batteryDetails.LTE_active_percentage / 100 * (6600 * 0.15 / 60 + 700)).toFixed(1);
                        var totalLoad = (variableLoad * 3.3).toFixed(1);
                        var energycapacityforanhour = (batteryDetails.Current_capacity * (TransData[0].result.Transformer.BatteryVoltage - 5.4)).toFixed(1);
                        if (TransData[0].result.Transformer.BatteryVoltage <= 5.4) {
                            BackupTime = 0;
                            minsOnBattery = batteryDetails.MaxMinsOnBattery;
                        } else {
                            BackupTime = (energycapacityforanhour / totalLoad * 60).toFixed(1);
                            minsOnBattery = batteryDetails.MaxMinsOnBattery - BackupTime;
                        }


                        totalData["BatteryVoltage"] = TransData[0].result.Transformer.BatteryVoltage;
                        totalData["DBTimestamp"] = TransData[0].DBTimestamp;
                        totalData["CellID"] = TransData[0].result.CellID;
                        totalData["HypersproutID"] = hyperID.HypersproutID;
                        totalData["HypersproutSerialNumber"] = hyperID.HypersproutSerialNumber;
                        totalData["BackupTime"] = BackupTime;
                        totalData["energycapacityforanhour"] = energycapacityforanhour;
                        totalData["variableLoad"] = variableLoad;
                        totalData["totalLoad"] = totalLoad;
                        totalData["minsOnBattery"] = minsOnBattery;

                        transactionData.push(totalData);
                        totalData = {};
                        callback(null, transactionData);
                    }
                });
            }, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, transactionData);
                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

};

module.exports = {
    getBatterLifeReport: getBatterLifeReport
};