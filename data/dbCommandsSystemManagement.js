//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var sendToIOT = require('./sendToiot.js');
var insertError = require('./insertErrorLogsToDB.js');
const paginatedResults = require('../config/Helpers/Pagination')


/* *************** DB Commands (System Management) SECTION 1 - EXPOSED METHODS ************************ */

/* ====================== Start : Added by Dhruv  ========================= */


/**
* @description - SMHyperSprout Web Service
* @params - PartSerialNo, type, callback
* @return callback function
*/

function getSystemHyperSproutDetails(PartSerialNo, type, data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var hypersproutCollection = db.delta_Hypersprouts;
            systemHyperSproutDetails(PartSerialNo, type, hypersproutCollection, data, callback);
        }
    });
};

// function getSystemHyperSproutDetails(PartSerialNo, type, callback) {
//     dbCon.getDb(function (err, db) {
//         if (err) {
//             callback(err, null);
//         } else {
//             var collection = db.delta_Hypersprouts;
//             systemHyperSproutDetails(PartSerialNo, type, collection, callback);
//         }
//     });
// };

/**
* @description - SMMeters Web Service 
* @params - PartSerialNo, callback
* @return callback function
*/
function getSystemMeterDetails(PartSerialNo, data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var meterCollection = db.delta_Meters;
            systemMeterDetails(PartSerialNo, meterCollection, data, callback);
        }
    });
};
// function getSystemMeterDetails(PartSerialNo, callback) {
//     dbCon.getDb(function (err, db) {
//         if (err) {
//             callback(err, null);
//         } else {
//             var collection = db.delta_Meters;
//             systemMeterDetails(PartSerialNo, collection, callback);
//         }
//     });
// };

/**
* @description - default  Web Service
* @params - Country, callback
* @return callback function
*/
function getCountryDefaults(Country, type, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            if (type == 3)
                var collection = db.delta_Timezone;
            else
                var collection = db.delta_Default;
            getDefault(Country, type, collection, callback);
        }
    });
};

/**
* @description - HS Config Details
* @params - deviceId, callback
* @return callback function
*/
function getConfigHSDetails(deviceId, deviceType, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var configCollection = db.delta_Config;
            ConfigHSDetails(deviceId, deviceType, configCollection, callback);
        }
    });
};

/**
* @description - SMNodePing Web Service
* @params - type, serialNumber, callback
* @return callback function
*/
function deviceStatus(type, serialNumber, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            if (type === "HyperSprout") {
                var collection = db.delta_Hypersprouts;
            } else {
                return callback(new Error("Wrong type"), null);
            }
            getDeviceID(collection, type, serialNumber, function (err, result) {
                if (err) {
                    return callback(err, null);
                } else {
                    sendToIOT.checkDeviceConnectionState(result, function (err, response) {
                        if (err) {
                            return callback(new Error(err), null);
                        } else if (response === "No DeviceID Found") {
                            return callback(new Error("No DeviceID Found"), null);
                        } else {
                            return callback(null, response);
                        }
                    });
                }
            });
        }
    });
};

/**
* @description - Listing the list of Devices on the basis of DailySelfReadTime
* @params - callback
* @return callback function
*/
function networkStatisticsHS(callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var hyperSproutCollection = db.delta_Hypersprouts;
            var meterCollection = db.delta_Meters;
            var schedulerLogsCollection = db.delta_SchedulerLogs;
            nwStatisticsHS(hyperSproutCollection, meterCollection, schedulerLogsCollection, callback);
        }
    });
}

/* =========================== End : Added by Dhruv  ========================= */


/* ********** DB Commands (System Management) SECTION 2 - NON-EXPOSED METHODS************************ */

/* ======================= Start : Added by Dhruv  ======================= */
/**
* @description - system HyperSprout Details
* @params - PartSerialNo, type, collectionName, callback
* @return callback function
*/


function systemHyperSproutDetails(PartSerialNo, type, hypersproutCollection, data, callback) {
    try {
        let whereCondition;
        let regex;
        let regex1;

        // Filter and search
        if (((data.search.searchByHypersproutSerialNumberOrName || data.search.searchByHypersproutID || data.search.search1) && (data.filter === "NotRegistered"))) {
            if (PartSerialNo === "All") {
                if (type === "HyperSprout") {
                    regex = { IsHyperHub: false };
                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { "Hypersprout_DeviceDetails.HypersproutMake": {} }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], IsHyperHub: false
                        }
                    } else if (data.search.search1) {

                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.search1, "i") } }, { HypersproutID: parseInt(data.search.search1) }] },
                                { Status: "NotRegistered" }
                            ], IsHyperHub: false
                        }

                    } else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], IsHyperHub: false
                        }
                    }


                }
                else {
                    regex = { IsHyperHub: true };
                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { "HypersproutName": {} }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], IsHyperHub: true
                        }
                    } else if (data.search.search1) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.search1, "i") } }, { HypersproutID: parseInt(data.search.search1) }] },
                                { Status: "NotRegistered" }
                            ], IsHyperHub: true
                        }
                    }
                    else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], IsHyperHub: true
                        }
                    }

                }

            } else {
                if (type === "HyperSprout") {
                    regex1 = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false };

                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { "Hypersprout_DeviceDetails.HypersproutMake": {} }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false
                        }
                    } else if (data.search.search1) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.search1, "i") } }, { HypersproutID: parseInt(data.search.search1) }] },
                                { Status: "NotRegistered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false
                        }
                    } else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false
                        }
                    }

                }
                else {
                    regex1 = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true };
                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { "HypersproutName": {} }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true
                        }
                    } else if (data.search.search1) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.search1, "i") } }, { HypersproutID: parseInt(data.search.search1) }] },
                                { Status: "NotRegistered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true
                        }
                    } else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "NotRegistered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true
                        }
                    }

                }
            }
            paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, type, function (err, hypersproutDetails) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, hypersproutDetails)
                }
            })
        } else if ((data.filter === "NotRegistered")) {
            // Filter as NotRegistered HH/HS
            if (PartSerialNo === "All") {
                if (type === "HyperSprout") {
                    regex = { IsHyperHub: false };
                    whereCondition = { Status: "NotRegistered", IsHyperHub: false }
                }
                else {
                    regex = { IsHyperHub: true };
                    whereCondition = { Status: "NotRegistered", IsHyperHub: true }
                }

            } else {
                if (type === "HyperSprout") {
                    regex1 = { Status: "NotRegistered", HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false };
                    whereCondition = regex1;
                }
                else {
                    regex1 = { Status: "NotRegistered", HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true };
                    whereCondition = regex1;

                }
            }
            paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, type, function (err, hypersproutDetails) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, hypersproutDetails)
                }
            })
        } else if ((data.search.searchByHypersproutSerialNumberOrName || data.search.searchByHypersproutID || data.search.search1)) {
            //   Registered HH/HS and search 
            if (PartSerialNo === "All") {
                if (type === "HyperSprout") {
                    regex = { IsHyperHub: false };
                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { "Hypersprout_DeviceDetails.HypersproutMake": {} }, { "HypersproutID": parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "Registered" }
                            ], IsHyperHub: false
                        }
                    } else if (data.search.search1) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.search1, "i") } }, { "HypersproutID": parseInt(data.search.search1) }] },
                                { Status: "Registered" }
                            ], IsHyperHub: false
                        }
                    }
                    else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "HypersproutID": parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "Registered" }
                            ], IsHyperHub: false
                        }
                    }
                }
                else {
                    regex = { IsHyperHub: true };
                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { "HypersproutName": {} }, { "HypersproutID": parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "Registered" }
                            ], IsHyperHub: true
                        }
                    } else if (data.search.search1) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.search1, "i") } }, { "HypersproutID": parseInt(data.search.search1) }] },
                                { Status: "Registered" }
                            ], IsHyperHub: true
                        }
                    } else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "HypersproutID": parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "Registered" }
                            ], IsHyperHub: true
                        }
                    }
                }
            } else {
                if (type === "HyperSprout") {
                    regex1 = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false };
                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { HypersproutName: {} }, { HypersproutID: data.search.searchByHypersproutID }] },
                                { Status: "Registered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false
                        }
                    } else if (data.search.search1) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.search1, "i") } }, { HypersproutID: parseInt(data.search.search1) }] },
                                { Status: "Registered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false
                        }
                    } else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "Registered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false
                        }
                    }

                }
                else {
                    regex1 = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true };
                    if (data.search.searchByHypersproutID) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: {} }, { "HypersproutName": {} }, { HypersproutID: data.search.searchByHypersproutID }] },
                                { Status: "Registered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true
                        }
                    } else if (data.search.search1) {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.search1, "i") } }, { HypersproutID: parseIn(data.search.search1) }] },
                                { Status: "Registered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true
                        }
                    }
                    else {
                        whereCondition = {
                            $and: [
                                { $or: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { "HypersproutName": { $regex: new RegExp(data.search.searchByHypersproutSerialNumberOrName, "i") } }, { HypersproutID: parseInt(data.search.searchByHypersproutID) }] },
                                { Status: "Registered" }
                            ], HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true
                        }
                    }
                }
            }
            paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, type, function (err, hypersproutDetails) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, hypersproutDetails)
                }
            })
        } else {
            if (PartSerialNo === "All") {
                if (type === "HyperSprout") {
                    regex = { IsHyperHub: false };
                    whereCondition = { Status: "Registered", IsHyperHub: false }
                }
                else {
                    regex = { IsHyperHub: true };
                    whereCondition = { Status: "Registered", IsHyperHub: true }
                }

            } else {
                if (type === "HyperSprout") {
                    regex1 = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false };
                    whereCondition = { Status: "Registered", HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false }

                }
                else {
                    regex1 = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true };
                    whereCondition = { Status: "Registered", HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true }

                }
            }
            paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, type, function (err, hypersproutDetails) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, hypersproutDetails)
                }
            })
        }

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


// function systemHyperSproutDetails(PartSerialNo, type, collectionName, callback) {
//     try {
//         var regex;
//         if (PartSerialNo === "All") {
//             if (type === "HyperSprout")
//                 regex = { IsHyperHub: false };
//             else
//                 regex = { IsHyperHub: true };
//             collectionName.find(regex, { Hypersprout_Communications: 0 }).toArray(function (err, docs) {
//                 if (err) {
//                     callback(err, null);
//                 } else if (docs.length === 0) {
//                     callback(new Error("No " + type + " in the system"), null)
//                 } else {
//                     callback(null, docs);
//                 }
//             });
//         } else {
//             if (type === "HyperSprout")
//                 regex = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: false };
//             else
//                 regex = { HypersproutSerialNumber: new RegExp(PartSerialNo), IsHyperHub: true };
//             collectionName.find(regex, { HypersproutID: 1, HypersproutSerialNumber: 1, Status: 1, Hypersprout_Communications: 1, Hypersprout_DeviceDetails: 1, Hypersprout_FirmwareDetails: 1, device_lock: 1, _id: 0 }).toArray(function (err, docs) {
//                 if (err) {
//                     callback(err, null);
//                 } else if (docs.length === 0) {
//                     callback(new Error("No " + type + " in the system"), null)
//                 } else {
//                     callback(null, docs);
//                 }
//             });
//         }
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)

//     }
// };

/**
* @description - system Meter Details
* @params - PartSerialNo, collectionName, callback
* @return callback function
*/

function systemMeterDetails(PartSerialNo, meterCollection, data, callback) {
    try {
        let whereCondition;

        if (data.isRegistered) {
            //Device Management Case
            if ((data.search.searchByMeterSerialNumberOrName || data.search.searchByMeterID || data.search.search1) && data.filter) {
                if (data.search.searchByMeterSerialNumberOrName) {
                    if (PartSerialNo === "All") {
                        whereCondition = { "Status": "NotRegistered", $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }] };
                    } else {
                        whereCondition = { "Status": "NotRegistered", $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }] }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                } else if (data.search.searchByMeterID) {
                    if (PartSerialNo === "All") {
                        whereCondition = { "Status": "NotRegistered", "MeterID": parseInt(data.search.searchByMeterID) };
                    } else {
                        whereCondition = { "Status": "NotRegistered", $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { "MeterID": parseInt(data.search.searchByMeterID) }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails)
                        }
                    })
                } else {
                    //search by ALL
                    if (PartSerialNo === "All") {
                        whereCondition = { "Status": "NotRegistered", $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "MeterID": parseInt(data.search.search1) }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.search1, "i") } }] };
                    } else {
                        whereCondition = { "Status": "NotRegistered", $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "MeterID": parseInt(data.search.search1) }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.search1, "i") } }] }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
            } else if (data.filter) {
                if (PartSerialNo === "All") {
                    let whereCondition = { "Status": "NotRegistered" }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                } else {
                    let whereCondition = { "Status": "NotRegistered", MeterSerialNumber: new RegExp(PartSerialNo) }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
            } else {
                if (data.search.searchByMeterSerialNumberOrName) {
                    if (PartSerialNo === "All") {
                        whereCondition = { "Status": "Registered", $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }] };
                    } else {
                        whereCondition = { "Status": "Registered", $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.searchByMeterSerialNumberOrName, "i") } }] }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
                else if (data.search.searchByMeterID) {
                    if (PartSerialNo === "All") {
                        whereCondition = { "Status": "Registered", "MeterID": parseInt(data.search.searchByMeterID) };
                    } else {
                        whereCondition = { "Status": "Registered", $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { "MeterID": parseInt(data.search.searchByMeterID) }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails)
                        }
                    })
                } else if (data.search.search1) {
                    //search by ALL
                    if (PartSerialNo === "All") {
                        whereCondition = { "Status": "Registered", $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "MeterID": parseInt(data.search.search1) }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.search1, "i") } }] };
                    } else {
                        whereCondition = { "Status": "Registered", $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "MeterID": parseInt(data.search.search1) }, { "Meters_DeviceDetails.MeterMake": { $regex: new RegExp(data.search.search1, "i") } }] }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
                else {
                    if (PartSerialNo === "All") {
                        let whereCondition = { "Status": "Registered" }
                        paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                callback(null, SMMetersDetails);
                            }
                        })
                    } else {
                        let whereCondition = { "Status": "Registered", MeterSerialNumber: new RegExp(PartSerialNo) }
                        paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                callback(null, SMMetersDetails);
                            }
                        })
                    }

                }
            }
        } else if (data.isGrouping) {
            //Grouping
            //grouped Meter
            if (data.groupedMeter && data.TID) {
                if (data.search.searchByMeterSerialNumber) {
                    if (PartSerialNo === "All") {
                        whereCondition = { "TransformerID": parseInt(data.TID), MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumber, "i") } };
                    } else {
                        whereCondition = { "TransformerID": parseInt(data.TID), $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumber, "i") } }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
                else if (data.search.searchByMeterConsumerNumber) {
                    if (PartSerialNo === "All") {
                        whereCondition = { "TransformerID": parseInt(data.TID), "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.searchByMeterConsumerNumber, "i") } };
                    } else {
                        whereCondition = { "TransformerID": parseInt(data.TID), $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.searchByMeterConsumerNumber, "i") } }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails)
                        }
                    })
                } else if (data.search.search1) {
                    //search by ALL
                    if (PartSerialNo === "All") {
                        whereCondition = { "TransformerID": parseInt(data.TID), $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.search1, "i") } }] };
                    } else {
                        whereCondition = { "TransformerID": parseInt(data.TID), $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.search1, "i") } }] }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
                else {
                    if (PartSerialNo === "All") {
                        let whereCondition = { "TransformerID": parseInt(data.TID) }
                        paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                callback(null, SMMetersDetails);
                            }
                        })
                    } else {
                        let whereCondition = { "TransformerID": parseInt(data.TID), MeterSerialNumber: new RegExp(PartSerialNo) }
                        paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                callback(null, SMMetersDetails);
                            }
                        })
                    }

                }

            } else {
                //meter not grouped                
                if (data.search.searchByMeterSerialNumber) {
                    if (PartSerialNo === "All") {
                        whereCondition = { $or: [{ "TransformerID": null }, { "TransformerID": "null" }], MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumber, "i") } };
                    } else {
                        whereCondition = { $or: [{ "TransformerID": null }, { "TransformerID": "null" }], $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumber, "i") } }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
                else if (data.search.searchByMeterConsumerNumber) {
                    if (PartSerialNo === "All") {
                        whereCondition = { $or: [{ "TransformerID": null }, { "TransformerID": "null" }], "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.searchByMeterConsumerNumber, "i") } };
                    } else {
                        whereCondition = { $or: [{ "TransformerID": null }, { "TransformerID": "null" }], $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.searchByMeterConsumerNumber, "i") } }] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails)
                        }
                    })
                } else if (data.search.search1) {
                    //search by ALL
                    if (PartSerialNo === "All") {
                        whereCondition = {$and:[{ $or: [{ "TransformerID": null }, { "TransformerID": "null" }]}, {$or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.search1, "i") } }]}] };
                    } else {
                        whereCondition = {$and:[{ $or: [{ "TransformerID": null }, { "TransformerID": "null" }]}, {$and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.search1, "i") } }] }]}] }
                    }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }
                else {
                    if (PartSerialNo === "All") {
                        let whereCondition = { $or: [{ "TransformerID": null }, { "TransformerID": "null" }] }
                        paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                callback(null, SMMetersDetails);
                            }
                        })
                    } else {
                        let whereCondition = { $or: [{ "TransformerID": null }, { "TransformerID": "null" }], MeterSerialNumber: new RegExp(PartSerialNo) }
                        paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                callback(null, SMMetersDetails);
                            }
                        })
                    }

                }
            }

        } else {
            //Add Devices Case
            if (data.search.searchByMeterSerialNumber) {
                if (PartSerialNo === "All") {
                    whereCondition = { MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumber, "i") } };
                } else {
                    whereCondition = { $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { MeterSerialNumber: { $regex: new RegExp(data.search.searchByMeterSerialNumber, "i") } }] }
                }
                paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, SMMetersDetails);
                    }
                })
            }
            else if (data.search.searchByMeterConsumerNumber) {
                if (PartSerialNo === "All") {
                    whereCondition = { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.searchByMeterConsumerNumber, "i") } };
                } else {
                    whereCondition = { $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.searchByMeterConsumerNumber, "i") } }] }
                }
                paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, SMMetersDetails)
                    }
                })
            } else if (data.search.search1) {
                //search by ALL (on the basis of meter serial number or meter consumer number)
                if (PartSerialNo === "All") {
                    whereCondition = { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.search1, "i") } }] };
                } else {
                    whereCondition = { $and: [{ MeterSerialNumber: new RegExp(PartSerialNo) }, { $or: [{ MeterSerialNumber: { $regex: new RegExp(data.search.search1, "i") } }, { "Meters_Billing.MeterConsumerNumber": { $regex: new RegExp(data.search.search1, "i") } }] }] }
                }
                paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, SMMetersDetails)
                    }
                })
            }
            else {
                if (PartSerialNo === "All") {
                    let whereCondition = {}
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                } else {
                    let whereCondition = { MeterSerialNumber: new RegExp(PartSerialNo) }
                    paginatedResults.paginatedResults(meterCollection, whereCondition, data, "SMMeters", function (err, SMMetersDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, SMMetersDetails);
                        }
                    })
                }

            }
        }


    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


// function systemMeterDetails(PartSerialNo, collectionName, callback) {
//     try {
//         if (PartSerialNo === "All") {
//             collectionName.find({}).toArray(function (err, docs) {
//                 if (err) {
//                     callback(err, null);
//                 } else {
//                     callback(null, docs);
//                 }
//             });
//         } else {
//             var regex = { MeterSerialNumber: new RegExp(PartSerialNo) };
//             collectionName.find(regex, { MeterID: 1, MeterSerialNumber: 1, Status: 1, Meters_Communications: 1, Meters_DeviceDetails: 1, Meters_FirmwareDetails: 1, device_lock: 1, _id: 0 }).toArray(function (err, docs) {
//                 if (err) {
//                     callback(err, null);
//                 } else {
//                     if (docs.length === 0) {
//                         callback(new Error("No Meter in the system"), null)
//                     } else {
//                         callback(null, docs);
//                     }
//                 }
//             });
//         }
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)

//     }
// };

/**
* @description - get Device ID
* @params - collection, type, serialNumber, callback
* @return callback function
*/

function getDeviceID(collection, type, serialNumber, callback) {
    collection.find({ HypersproutSerialNumber: serialNumber, Status: "Registered" }, { DeviceID: 1, _id: 0 }).toArray(function (err, result) {
        if (err) {
            return callback(err, null);
        } else if (result.length === 0) {
            return callback(new Error("Device not Registered"), null);
        } else if (result[0].DeviceID) {
            return callback(null, result[0].DeviceID)
        }
        else {
            return callback(new Error("Device ID not found"), null)
        }
    });
}
/**
* @description - Hyper Sprout network statistics
* @params - hyperSproutCollection, meterCollection, schedulerLogsCollection, callback
* @return callback function
*/

function nwStatisticsHS(hyperSproutCollection, meterCollection, schedulerLogsCollection, callback) {
    hyperSproutCollection.find().toArray(function (err, HSDetails) {
        if (err) {
            callback(err, null);
        } else if (HSDetails.length === 0) {
            callback(new Error("No HyperSprouts in the System"), null);
        } else {
            var nwStatisticsHSReport = [];
            nwStatistics(meterCollection, schedulerLogsCollection, HSDetails, nwStatisticsHSReport, callback);
        }
    });
};
/**
* @description - network statistics
* @params - meterCollection, schedulerLogsCollection, HSDetails, nwStatisticsHSReport, callback
* @return callback function
*/
function nwStatistics(meterCollection, schedulerLogsCollection, HSDetails, nwStatisticsHSReport, callback) {
    nwstats(HSDetails[0], meterCollection, schedulerLogsCollection, function (err, result) {
        if (err) {
            return callback(err, null);
        } else {
            if (result != null) {
                nwStatisticsHSReport.push(result);
            }
            HSDetails.shift();
            if (HSDetails.length === 0) {
                return callback(null, nwStatisticsHSReport);
            } else {
                nwStatistics(meterCollection, schedulerLogsCollection, HSDetails, nwStatisticsHSReport, callback);
            }
        }
    });
}
/**
* @description - network status
* @params - HSDetails, meterCollection, schedulerLogsCollection, callback
* @return callback function
*/
function nwstats(HSDetails, meterCollection, schedulerLogsCollection, callback) {
    var output = {};
    meterCollection.count({ TransformerID: HSDetails.HypersproutID }, function (err, metersCount) {
        if (err) {
            return callback(err, null);
        } else {
            var deviceID;
            var dataTransmissionExpectedDaily = 4 * 60 * 24;
            schedulerLogsCollection.count({ CellID: HSDetails.HypersproutID }, { $and: [{ TimeStampResponse: { $gte: new Date(new Date().getTime() - 1) } }, { TimeStampResponse: { $lte: new Date() } }] }, function (err, daysCount) {
                if (err) {
                    return callback(err, null);
                } else {
                    schedulerLogsCollection.find({ CellID: HSDetails.HypersproutID }).sort({ TimeStampResponse: -1 }).limit(1).toArray(function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else if (result.length > 0) {
                            var DataSize = 381
                            var connectedMeterCount = result[0].NoOfMeters;
                            if (connectedMeterCount > 0) {
                                DataSize = 381 + (432 * connectedMeterCount);
                            }
                            var OneDayAvgThroughput = DataSize / (dataTransmissionExpectedDaily / daysCount);
                            if (HSDetails.Status === "NotRegistered") {
                                output = {
                                    "HypersproutID": HSDetails.HypersproutID,
                                    "SerialNumber": HSDetails.HypersproutSerialNumber,
                                    "InstallationTime": "NotRegistered",
                                    "Name": HSDetails.Hypersprout_DeviceDetails.HypersproutMake,
                                    "NoOfMetersConnected": metersCount,
                                    "Load": "0 %",
                                    "Status": "NotRegistered"
                                }
                                return callback(null, output);
                            } else {
                                deviceID = HSDetails.DeviceID;
                                sendToIOT.checkDeviceConnectionState(deviceID, function (err, deviceState) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        output = {
                                            "HypersproutID": HSDetails.HypersproutID,
                                            "SerialNumber": HSDetails.HypersproutSerialNumber,
                                            "InstallationTime": HSDetails.RegisteredTime,
                                            "Name": HSDetails.Hypersprout_DeviceDetails.HypersproutMake,
                                            "NoOfMetersConnected": metersCount,
                                            "Load": OneDayAvgThroughput,
                                            "Status": deviceState
                                        }
                                        return callback(null, output);
                                    }
                                });
                            }
                        } else {
                            if (HSDetails.Status === "NotRegistered") {
                                output = {
                                    "HypersproutID": HSDetails.HypersproutID,
                                    "SerialNumber": HSDetails.HypersproutSerialNumber,
                                    "InstallationTime": "NotRegistered",
                                    "Name": HSDetails.Hypersprout_DeviceDetails.HypersproutMake,
                                    "NoOfMetersConnected": metersCount,
                                    "Load": "0 %",
                                    "Status": "NotRegistered"
                                }
                                return callback(null, output);
                            } else {
                                deviceID = HSDetails.DeviceID;
                                sendToIOT.checkDeviceConnectionState(deviceID, function (err, deviceState) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        output = {
                                            "HypersproutID": HSDetails.HypersproutID,
                                            "SerialNumber": HSDetails.HypersproutSerialNumber,
                                            "InstallationTime": HSDetails.RegisteredTime,
                                            "Name": HSDetails.Hypersprout_DeviceDetails.HypersproutMake,
                                            "NoOfMetersConnected": metersCount,
                                            "Load": "0 %",
                                            "Status": deviceState
                                        }
                                        return callback(null, output);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}
/**
* @description - system Meter Details
* @params - PartSerialNo, collectionName, callback
* @return callback function
*/

function getDefault(Country, type, collectionName, callback) {
    if (type == 1) {
        var regex = { "Country": Country };
        collectionName.find(regex).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                if (docs.length === 0) {
                    callback(new Error("No Config in the system"), null)
                } else {
                    callback(null, docs);
                }
            }
        });
    } else if (type == 2) {
        collectionName.find({}, { Country: 1, _id: 0 }).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                if (docs.length === 0) {
                    callback(new Error("No Config in the system"), null)
                } else {
                    var Country = [];
                    docs.forEach(function (a) {
                        Country.push(a.Country);
                    });
                    callback(null, Country);
                }
            }
        });
    } else {
        collectionName.find({}, { Timezone: 1, _id: 0 }).toArray(function (err, docs) {
            if (err) {
                callback(err, null);
            } else {
                if (docs.length === 0) {
                    callback(new Error("No Timezone in the system"), null)
                } else {
                    callback(null, docs);
                }
            }
        });
    }
};
/**
* @description - Hs Config Details
* @params - deviceId, configCollection, callback
* @return callback function
*/

function ConfigHSDetails(deviceId, deviceType, configCollection, callback) {
    if (deviceType == 'meter') {
        var regex = { MeterID: deviceId };
    } else {
        var regex = { HypersproutID: deviceId };
    }
    configCollection.find(regex, {}).toArray(function (err, docs) {
        if (err) {
            callback(err, null);
        } else {
            if (docs.length === 0) {
                callback(new Error("No Config in the system"), null)
            } else {
                if (deviceType == 'hs' || deviceType == 'hh') {
                    if (docs[0].Cloud_Connectivity_Settings.SAK == '') {
                        if (deviceType == 'hs')
                            var DeviceID = "HS-" + docs[0].HypersproutSerialNumber;
                        else
                            var DeviceID = "HH-" + docs[0].HypersproutSerialNumber;
                        sendToIOT.checkDeviceConnectionSAS(DeviceID, function (err, status) {
                            if (err) {
                                
                                insertError.putErrorDetails(err, callback);
                            } else {
                                regex = { HypersproutID: deviceId };
                                configCollection.updateOne(regex, { $set: { "Cloud_Connectivity_Settings.SAK": status } }, function (err, res) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else {
                                        docs[0].Cloud_Connectivity_Settings.SAK = status;
                                        callback(null, docs);
                                    }

                                });
                            }
                        });
                    } else {
                        callback(null, docs);
                    }
                } else {
                    callback(null, docs);
                }

            }
        }
    });
};

/* ========================= End : Added by Dhruv  ========================== */


/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by Dhruv  ============== */
    //System Management -> Device Management -> HyperSprouts Web Service
    getSystemHyperSproutDetails: getSystemHyperSproutDetails,
    //System Management -> Device Management -> Meters Web Service
    getSystemMeterDetails: getSystemMeterDetails,
    //Network Statistics Web Service
    networkStatisticsHS: networkStatisticsHS,
    //Node Ping Web Service
    deviceStatus: deviceStatus,
    //Hs Config Details
    getConfigHSDetails: getConfigHSDetails,
    getCountryDefaults: getCountryDefaults
    /* ================ End : Added by Dhruv  =================== */
};
