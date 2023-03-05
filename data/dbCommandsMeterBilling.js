//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var unique = require('array-unique');
var objdaoimpl = require('./mysqldaoimpl.js');
var objLatestTransactionModel = require('./latesttransactionmodel.js');
var insertError = require('./insertErrorLogsToDB.js');
var moment = require('moment');
const paginatedResults = require('../config/Helpers/Pagination')
let schemaValidation = require('../config/Helpers/payloadValidation');
let schema = require('../config/Helpers/meterBillingSchema');


/* *************** DB Commands SECTION 2 - EXPOSED METHODS ************************ */
/**
* @description - For the Webservice - MeterBillingUploadData - Meter Billing Data into MONGODB
* @param fileName
* @param jsonFile
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterBillingInsert(fileName, jsonFile, callback) {
    var MeterBilling = [];
    var emptyCount = 0;
    var error = 0;
    var dateErr = 0;

    for (var i in jsonFile) {
        if ((!jsonFile[i]["Physical mtr no"] || !jsonFile[i]["Unit"] || !jsonFile[i]["Account"]
            || !jsonFile[i]["RC"] || !jsonFile[i]["Meter no"] || !jsonFile[i].Dials || !jsonFile[i].Calcparm || !jsonFile[i].Factor || !jsonFile[i].Route
            || !jsonFile[i]["Old reading"] || !jsonFile[i]["Old date"] || !jsonFile[i].Street || !jsonFile[i]["Street no"] || !jsonFile[i].Initials ||
            !jsonFile[i]["Erf number"] || !jsonFile[i]["Flat reference"] || !jsonFile[i]["Meter location"] || !jsonFile[i].Average)) {
            emptyCount = emptyCount + 1;

        }
        else if (jsonFile[i]["New reading"] || jsonFile[i]["New date"]) {
            //New Reading and New Date field must be blank
            error = error + 1;
        } else {
            var doc = {
                "Unit": jsonFile[i].Unit,
                "Account": jsonFile[i].Account,
                "RC": jsonFile[i].RC,
                "MeterNumber": jsonFile[i]["Meter no"],
                "PhysicalMeterNumber": jsonFile[i]["Physical mtr no"],
                "Dials": jsonFile[i].Dials,
                "Calcparm": jsonFile[i].Calcparm,
                "Factor": jsonFile[i].Factor,
                "Route": jsonFile[i].Route,
                "OldReading": jsonFile[i]["Old reading"],
                "OldDate": jsonFile[i]["Old date"],
                "NewReading": jsonFile[i]["New reading"],
                "NewDate": jsonFile[i]["New date"],
                "Street": jsonFile[i].Street,
                "StreetNumber": jsonFile[i]["Street no"],
                "Name": jsonFile[i].Name,
                "Initials": jsonFile[i].Initials,
                "ErfNumber": jsonFile[i]["Erf number"],
                "FlatReference": jsonFile[i]["Flat reference"],
                "MeterLocation": jsonFile[i]["Meter location"],
                "AverageConsumption": jsonFile[i].Average,
                "ErrorCode": '',
                "Latitude": '',
                "Longitude": '',
                "FileName": fileName
            };
            var dateReg = /^\d{4}[./-]\d{2}[./-]\d{2}$/;
            if (dateReg.test(jsonFile[i]["Old date"]) === true) {
                MeterBilling.push(doc);
            }
            else {
                dateErr = dateErr + 1
            }
        }
    }
   
    // Validation for Empty CSV file or Wrong Physical Meter Number CSV Header
    if (dateErr != 0) {
        return callback('5', null);
    } else if ((MeterBilling.length === 0 && error === 0) || emptyCount != 0) {
        return callback('3', null);
    } else if (error > 0) {
        return callback('2', null);
    }
    //Validation for CSV Header Format
    for (var j in MeterBilling) {
        if ((MeterBilling[j].Unit === undefined) || (MeterBilling[j].Account === undefined) || (MeterBilling[j].RC === undefined) ||
            (MeterBilling[j].MeterNumber === undefined) || (MeterBilling[j].PhysicalMeterNumber === undefined) || (MeterBilling[j].Dials === undefined) ||
            (MeterBilling[j].Calcparm === undefined) || (MeterBilling[j].Factor === undefined) || (MeterBilling[j].Route === undefined) ||
            (MeterBilling[j].OldReading === undefined) || (MeterBilling[j].OldDate === undefined) || (MeterBilling[j].NewReading === undefined) ||
            (MeterBilling[j].NewDate === undefined) || (MeterBilling[j].Street === undefined) || (MeterBilling[j].StreetNumber === undefined) ||
            (MeterBilling[j].Name === undefined) || (MeterBilling[j].Initials === undefined) || (MeterBilling[j].ErfNumber === undefined) ||
            (MeterBilling[j].FlatReference === undefined) || (MeterBilling[j].MeterLocation === undefined) || (MeterBilling[j].AverageConsumption === undefined) || (MeterBilling[j].FileName === undefined)) {
            return callback('4', null);
        }
    }
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            MeterBillingInsertFromMongoDB(db.delta_MeterBilling, MeterBilling, callback);
        }
    });
};

/**
* @description - For the Webservice - MeterBillingUploadDisplay, Meter Billing Details from MONGODB
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterBillingDetails(queryDetails, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                MeterBillingDetailsFromMongoDB(queryDetails, db.delta_MeterBilling, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - Get FileName and TimeStamp Meter Billing Details from mongoDb
* @param startDate
* @param callback - callback function returns success or error response
* @return callback function
*/
function getFileNameandTimeStamp(startDate, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                uniqueNameOfFileandDate(db.delta_MeterBilling, startDate, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - delete meter billing file
* @param fileName
* @param TimeStamp
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteMeterBillingFile(fileName, TimeStamp, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                deleteFileNameFromBilling(db.delta_MeterBilling, fileName, TimeStamp, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - view billing data
* @param fileName
* @param dateTime
* @param callback - callback function returns success or error response
* @return callback function
*/
function getViewBilingData(fileName, dateTime, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                getAllDataFromMongoDB(db.delta_MeterBilling, fileName, dateTime, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/* ********** DB Commands SECTION 2 - NON-EXPOSED METHODS************************ */

/**
* @description - For the Webservice - MeterBillingUploadData
* @param collectionName
* @param MeterBilling
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterBillingInsertFromMongoDB(collectionName, MeterBilling, callback) {
    var loopCount = 0;
    var storeDate = new Date();
    for (var i in MeterBilling) {
        if (MeterBilling.hasOwnProperty(i)) {
            collectionName.update({ "PhysicalMeterNumber": { $eq: MeterBilling[i].PhysicalMeterNumber } }, {
                "$set": {
                    "Unit": MeterBilling[i].Unit,
                    "Account": MeterBilling[i].Account,
                    "RC": MeterBilling[i].RC,
                    "MeterNumber": MeterBilling[i].MeterNumber,
                    "Dials": MeterBilling[i].Dials,
                    "Calcparm": MeterBilling[i].Calcparm,
                    "Factor": MeterBilling[i].Factor,
                    "Route": MeterBilling[i].Route,
                    "OldReading": MeterBilling[i].OldReading,
                    "OldDate": MeterBilling[i].OldDate,
                    "NewReading": MeterBilling[i].NewReading,
                    "NewDate": MeterBilling[i].NewDate,
                    "Street": MeterBilling[i].Street,
                    "StreetNumber": MeterBilling[i].StreetNumber,
                    "Name": MeterBilling[i].Name,
                    "Initials": MeterBilling[i].Initials,
                    "ErfNumber": MeterBilling[i].ErfNumber,
                    "FlatReference": MeterBilling[i].FlatReference,
                    "MeterLocation": MeterBilling[i].MeterLocation,
                    "AverageConsumption": MeterBilling[i].AverageConsumption,
                    "ErrorCode": '',
                    "Latitude": '',
                    "Longitude": '',
                    "FileName": MeterBilling[i].FileName,
                    "StoredTime": storeDate
                }
            }, { upsert: true }, function (err, result) {
                loopCount++;
                if (err) {
                    insertError.putErrorDetails(err, callback);
                } else {
                    if (loopCount >= (MeterBilling.length)) {
                        collectionName.find({ "StoredTime": storeDate }, { "PhysicalMeterNumber": 1, "_id": 0 }).toArray(function (err, meterBillingUploadFetched) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                var billingMeterID = [];
                                if (meterBillingUploadFetched.length > 0) {
                                    for (var j in meterBillingUploadFetched) {
                                        if (meterBillingUploadFetched.hasOwnProperty(j))
                                            billingMeterID.push(meterBillingUploadFetched[j].PhysicalMeterNumber);
                                    }
                                    // Getting details from MYSQL - DataMart
                                    objdaoimpl.synctable("latesttransactions", objLatestTransactionModel.objLatestTrans, objLatestTransactionModel.objTableProps,
                                        function (err, isTruncated) {
                                            objdaoimpl.findAll("latesttransactions", objLatestTransactionModel.objLatestTrans, objLatestTransactionModel.objTableProps,
                                                ['MeterID', 'MeterLatitude', 'MeterLongitude', 'Meter_ActiveReceivedCumulativeRate_Total', 'Meter_ReadTimestamp'],
                                                { 'MeterID': { $in: billingMeterID } }, function (err, objData) {
                                                    if (err) {
                                                        return callback(err, null);
                                                    } else if (objData.length === 0) {
                                                        callback(null, 4)
                                                    }
                                                    else {
                                                        var meterBillingUploadLoop = 0;
                                                        for (var i = 0; i < objData.length; i++) {

                                                            var MeterNumber = objData[i].MeterID;
                                                            collectionName.update({ "PhysicalMeterNumber": MeterNumber, "StoredTime": storeDate },
                                                                {
                                                                    $set: {
                                                                        "NewDate": objData[i].Meter_ReadTimestamp,
                                                                        "NewReading": objData[i].Meter_ActiveReceivedCumulativeRate_Total,
                                                                        "Latitude": objData[i].MeterLatitude,
                                                                        "Longitude": objData[i].MeterLongitude
                                                                    }
                                                                }, function (err, meterBillingUploadTransactionUpdated) {
                                                                    meterBillingUploadLoop++;
                                                                    if (err) {
                                                                        insertError.putErrorDetails(err, callback);
                                                                    } else {
                                                                        if (meterBillingUploadLoop >= objData.length) {
                                                                            callback(null, 2);
                                                                        }
                                                                    }
                                                                });
                                                        }
                                                    }
                                                });
                                        });
                                }
                            }
                        });
                    }
                }
            });
        }
    }
};

/**
* @description - For the Webservice - MeterBillingUploadDisplay
* @param collectionName
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterBillingDetailsFromMongoDB(queryDetails, collectionName, callback) {
    try {
        collectionName.find({}, { "StoredTime": 1 }).sort({ "StoredTime": -1 }).limit(1).toArray(function (err, latestDate) {
            if (err) {
                callback(err, null);
            } else if (latestDate.length === 0) {
                callback(null, "No Data Found");
            } else {
                let whereCondition = { "StoredTime": latestDate[0].StoredTime }
                paginatedResults.paginatedResults(collectionName, whereCondition, queryDetails, "MeterBillingReport", function (err, meterBillingDetails) {
                    if (err) {
                        callback(err, null)
                    } else {
                        callback(null, meterBillingDetails)
                    }
                })
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
// function MeterBillingDetailsFromMongoDB(collectionName, callback) {
//     try {
//         collectionName.find({}, { "StoredTime": 1 }).sort({ "StoredTime": -1 }).limit(1).toArray(function (err, latestDate) {
//             if (err) {
//                 callback(err, null);
//             } else if (latestDate.length === 0) {
//                 callback(null, "No Data Found");
//             } else {
//                 collectionName.find({ "StoredTime": latestDate[0].StoredTime }).toArray(function (err, meterBillingDetails) {
//                     if (err) {
//                         callback(err);
//                     } else if (meterBillingDetails === 0) {
//                         callback(null, "No Data Found");
//                     } else {
//                         callback(null, meterBillingDetails);
//                     }
//                 });
//             }
//         });
//     } catch (error) {
//         callback(`Something went wrong : ${error.name} ${error.message}`, null);
//     }
// };


/**
* @description - For Geting unique name Dbcommands for the WebService
* @param collectionMeterBilling
* @param startDate
* @param callback - callback function returns success or error response
* @return callback function
*/
function uniqueNameOfFileandDate(collectionMeterBilling, startDate, callback) {
    try {
        var startTime = new Date(startDate);
        collectionMeterBilling.find({ "StoredTime": { '$gte': new Date(startTime.toISOString()) } }, { "FileName": 1, "StoredTime": 1 }).toArray(function (err, listOfFileName) {
            if (err) {
                callback(err);
            } else {
                var distNameTime = [];
                collectionMeterBilling.distinct("StoredTime", function (err, distTime) {
                    if (err) {
                        callback(err);
                    } else {
                        for (var i = 0; i < distTime.length; i++) {
                            var count = 0;
                            for (var j = 0; j < listOfFileName.length; j++) {
                                if ((new Date(distTime[i]) - new Date(listOfFileName[j].StoredTime)) === 0) {
                                    count++;
                                    if (count === 1) {
                                        distNameTime.push({ FileName: listOfFileName[j].FileName, StoredTime: listOfFileName[j].StoredTime })
                                    }
                                }
                            }
                        }
                        callback(null, distNameTime);
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  delete File Name From Billing
* @param collectionMeterBilling
* @param fileName
* @param TimeStamp
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteFileNameFromBilling(collectionMeterBilling, fileName, TimeStamp, callback) {
    try {
        collectionMeterBilling.remove({ "FileName": fileName, "StoredTime": new Date(TimeStamp) }, function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, "Record Deleted");
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - get All Data From MongoDB
* @param collectionMeterBilling
* @param fileName
* @param dateTime
* @param callback - callback function returns success or error response
* @return callback function
*/
function getAllDataFromMongoDB(collectionMeterBilling, fileName, dateTime, callback) {
    try {
        collectionMeterBilling.find({ "FileName": fileName, "StoredTime": new Date(dateTime) }).toArray(function (err, result) {
            if (err) {
                callback(err);
            } else if (result.length === 0) {
                callback(null, "Data Not Found");
            } else {
                callback(null, result);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    MeterBillingInsert: MeterBillingInsert,
    MeterBillingDetails: MeterBillingDetails,
    getFileNameandTimeStamp: getFileNameandTimeStamp,
    deleteMeterBillingFile: deleteMeterBillingFile,
    getViewBilingData: getViewBilingData
};