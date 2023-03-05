//REQUIRED PACKAGES AND FILES.
var async = require('async');
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var generator = require('generate-password');
var email = require('./sendEmail');
var moment = require('moment');
var unique = require('array-unique');
var sToIOT = require('./sendToiot.js');
var objdaoimpl = require('./mysqldaoimpl.js');
var objLatestTransactionModel = require('./latesttransactionmodel.js');
var validator = require('validator');
var insertError = require('./insertErrorLogsToDB.js');
var bcrypt = require('bcrypt');
var parser = require('../data/parser.js');
var dao = require('../dao/MongoDAO.js');
const paginatedResults = require('../config/Helpers/Pagination');
const { and } = require('node-bitarray');


moment().format();

/* *************** DB Commands SECTION 2 - EXPOSED METHODS ************************ */

/**
* @description - get user information
*
* @param userID  - username entered by user
* @param password  - password entered by user 
* @param callback  - returns success or error response
*
* @return callback function.
*/

function getUserDetails(userID, password, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            findOneFromMongoDB(db.delta_User, db.delta_SecurityGroups, db.delta_PasswordSettings, db.delta_SystemSettings, userID, password, callback);
    });
};

/**
* @description - assign endpoint parameters to MongoDB , for web service HSMGrpMgmtAssignGrpMembershipAssignEndpoint
* @param collectionName  - name of mongoDB collection
* @param assignEndPointParams  - endpoints param object 
* @param callback  - returns success or error response
* @return callback function.
*/
function assignEndPointParamsToMongodb(collectionName, assignEndPointParams, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else { // if its app id else configid.both will not come at same time .
            var colletionValue = db.db.collection(collectionName);
            var key = assignEndPointParams.values.SerialNumber;
            if (assignEndPointParams.values.ConfigID === undefined)
                // ---------------------appid exists.--------------------------
                //understanding - serialnumber will be unique.
                updateFieldsIntoMongoDbForAppId(colletionValue, key, assignEndPointParams, callback);
            else
                //------------------------configid exists----------------------
                updateFieldsIntoMongoDbForConfigId(colletionValue, key, assignEndPointParams, callback);
        }
    });
};

/**
* @description - Find data from config group table and app group ,for the Webservice - HSMGrpmgmt
* @param type  - Device type
* @param callbackEnd  - callback called after success or failure of async waterfall execution of functions, 
* @return callback function.
*/
function findFromMongoDB_HSM(type, data, callbackEnd) {
    try {
        let appCount = [];
        getDataFromDELTA_AppGroups_WithPagination(type, data, function (err, ApplicationIDs) {
            if (err) {
                callbackEnd && callbackEnd(err, null);
            }
            else {
                dbCon.getDb(function (err, db) {
                    if (err)
                        callbackEnd && callbackEnd(err, null);
                    else {
                        var collection;
                        if (type === "HyperSprout")
                            collection = db.delta_Hypersprouts;
                        else
                            collection = db.delta_Meters;
                        async.each(ApplicationIDs.results,
                            function (ApplicationID, callbackEach) {
                                collection.find({ AppIDs: ApplicationID.GroupID }).toArray(function (err, docs) {
                                    if (err)
                                        callbackEach(err, null);
                                    else {
                                        ApplicationID.Members = docs.length > 0 ? docs.length : 0;
                                        ApplicationID.AppID = ApplicationID.GroupID;
                                        appCount.push(ApplicationID);
                                        ApplicationIDs.results = appCount;
                                        callbackEach(null, ApplicationIDs);
                                    }
                                });
                            },
                            function (err) {
                                if (err)
                                    callbackEnd && callbackEnd(err, null);
                                else
                                    callbackEnd && callbackEnd(null, ApplicationIDs);
                            });
                    };
                });
            }
        });
        // async.waterfall(
        //     [
        //         async.apply(getDataFromDELTA_ConfigGroups_HSM, type),
        //         getDataFromDELTA_AppGroups_HS,
        //         getHSConfigMemberCount,
        //         getHSApplicationMemberCount
        //         //  getDataFromDELTA_ConfigGroups_HS,
        //         // getDataFromDELTA_AppGroups_HS,
        //     ],
        //     function (err, dataFromConfigGrps, dataFromAppGrps, configCount, appCount) {
        //         if (err)
        //             callbackEnd && callbackEnd(err, null, null, null, null);
        //         else
        //             callbackEnd && callbackEnd(null, dataFromConfigGrps, dataFromAppGrps, configCount, appCount);
        //     });
    } catch (e) {
        callbackEnd("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - SELECT TAG Discrepancies details FROM MONGODB , For the Webservice - HSMTagDiscrepancies
* @param startTime  - start time
* @param endTime  - end time
* @param callback - callback function returns success or error response
* @return callback function.
*/

function selectTagDiscrepanciesHSM(startTime, endTime, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            selectTagDiscrepanciesFromMongoDB(db.delta_TagDiscripancies, "HyperSprout", startTime, endTime, callback);
    });
};

/**
* @description - SELECT TAG Discrepancies details FROM MONGODB , For the Webservice - MMTagDiscrepancies
* @param startTime  - start time
* @param endTime  - end time
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectTagDiscrepanciesMM(startTime, endTime, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            selectTagDiscrepanciesFromMongoDB(db.delta_TagDiscripancies, "Meter", startTime, endTime, callback);
    });
};

/**
* @description - Select Job Status details from MONGODB , For the Webservice - JobsList 
* @param type - Job type
* @param startTime  - start time
* @param endTime  - end time
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectJobs(type, startTime, endTime, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            selectJobStatus(db.delta_Jobs, type, startTime, endTime, callback);
    });
};

/**
* @description - Select Security Codes details from MONGODB , For the Webservice - HSMSecurityCodeMgmt
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectSecurityCodesHSM(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            selectSecurityCodesHSMFromMongoDB(db.delta_DeviceClass, callback);
    });
};

/**
* @description - SELECT Security Codes details FROM MONGODB , For the Webservice - MMSecurityCodeMgmt 
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectSecurityCodeMM(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            selectSecurityCodeMMFromMongoDB(db.delta_DeviceClass, callback);
    });
};

/**
* @description - UPDATE Encryption Codes for Hypersprout Device Class details IN MONGODB, For the Webservice - HSMSecuritySave
* @param updateHSMSecuritySaveValues  - Device security code object
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateSecuritySaveHSM(updateHSMSecuritySaveValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            updateSecuritySaveHSMFromMongoDB(db.delta_DeviceClass, updateHSMSecuritySaveValues, callback);
    });
};

/**
* @description -  UPDATE Encryption Codes for Meter Device Class details IN MONGODB,For the Webservice - MMSecuritySave
* @param updateMMSecuritySaveValues-  Device security code object
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateSecuritySaveMM(updateMMSecuritySaveValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            updateSecuritySaveMMFromMongoDB(db.delta_DeviceClass, updateMMSecuritySaveValues, callback);
    });
};

/**
* @description -  UPDATE Device Security Codes for Hypersprout Device Class details IN MONGODB, For the Webservice - HSMSecurityAssignDeviceSecCodeSave
* @param updateHSMAssignDeviceSecCodeValues-Device security code object
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateAssignDeviceSecurityCodeHSM(updateHSMAssignDeviceSecCodeValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            updateAssignDeviceSecurityCodeHSMFromMongoDB(db.delta_DeviceClass, updateHSMAssignDeviceSecCodeValues, callback);
    });
};

/**
* @description -  UPDATE Device Security Codes for Meter Device Class details IN MONGODB,For the Webservice - MMSecurityAssignDeviceSecCodeSave
* @param updateMMAssignDeviceSecCodeValues - Device security code object
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateAssignDeviceSecurityCodeMM(updateMMAssignDeviceSecCodeValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            updateAssignDeviceSecurityCodeMMFromMongoDB(db.delta_DeviceClass, updateMMAssignDeviceSecCodeValues, callback);
    });
};

/**
* @description -  create new Device group in system
* @param groupName - group name , 
* @param Description - group description
* @param type - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function createNewHSMAppGroup(groupName, Description, type, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var collectionName = db.delta_AppGroups;
                collectionName.find({ GroupName: { $regex: groupName, $options: 'i' }, Type: type }).toArray(function (err, result) {
                    if (err)
                        callback(err, null);
                    else if (result.length != 0) {
                        var error = {};
                        error.message = "Group name already exists";
                        callback(error, null);
                    } else {
                        collectionName.find().sort({ "GroupID": -1 }).limit(1).next(function (err, record) {
                            if (err)
                                callback(err, null);
                            else {
                                var count;
                                if (!record)
                                    count = 0;
                                else
                                    count = record.GroupID;
                                var doc = {
                                    "GroupID": ++count,
                                    "GroupName": groupName,
                                    "Description": Description,
                                    "Type": type,
                                    "CreatedDate": new Date()
                                };
                                collectionName.insertOne(doc, function (err) {
                                    if (err)
                                        callback(err, null);
                                    else
                                        callback(null, "Inserted into App Group");
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description -  get Hypersprout management group config info by config ID
* @param callback - callback function returns success or error response
* @return callback function
*/
function hSMConfigEdit(ConfigID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            findAllDoc(db.delta_ConfigGroups, ConfigID, callback);
    });
};

/**
* @description -  update configuration values in MongoDB
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateConfigDataValues(updatevalues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection1 = db.delta_ConfigGroups;
            var collection2 = db.delta_ConfigPrograms;
            updateFieldValues(collection1, collection2, updatevalues, callback);
        }
    });
};

//HSMGrpMgmtAssigngrpMembershipAssignEndpoint Web Service

/**
* @description -  Assign Hypersprouts to group
* @param listHS  - Hypersprout List to be grouped
* @param Action  - Add / Remove Hypersprout
* @param type - Device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function assignHyperSproutGroups(GroupName, listHS, Action, type, callback) {
    try {
        var serialNumbers = [];
        for (var key in listHS) {
            listHS[key] = (listHS[key]);
            serialNumbers.push(listHS[key]);
        }
        getHSAppIDFromDELTA_AppGroupsByCondition(GroupName, serialNumbers, Action, type, function (err, result, serialNumbersNotUpdated) {
            if (err)
                callback(err, null, serialNumbersNotUpdated);
            else
                callback(null, result, serialNumbersNotUpdated);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  Assign meter to groups, for MMGrpMgmtAssigngrpMembershipAssignEndpoint Web Service
* @param listMeters  - List of Meters to be grouped 
* @param Action  - Add / Remove Meter
* @param type - Device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function assignMetersGroups(GroupName, listMeters, Action, type, callback) {
    try {
        var serialNumbers = [];
        for (var key in listMeters) {
            listMeters[key] = (listMeters[key]);
            serialNumbers.push(listMeters[key]);
        }
        getHSAppIDFromDELTA_AppGroupsByCondition(GroupName, serialNumbers, Action, type, function (err, result, serialNumbersNotUpdated) {
            if (err)
                callback(err, null, serialNumbersNotUpdated);
            else
                callback(null, result, serialNumbersNotUpdated);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  Find Hypersprout by serial No
* @param SERIAL_NO - Serial No
* @param callback -  returns success or error response
* @return callback function
*/
function findSerialNumber(SERIAL_NO, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_Hypersprouts;
            collectionName.find({ SerialNumber: SERIAL_NO }).toArray(function (err, result) {
                if (err)
                    return callback(err, null);
                else {
                    if (result.length > 0)
                        return callback(null, result);
                    else
                        return callback(new Error("Serial Number Not Found"), null);
                }
            });
        }
    });
}

/**
* @description -  update EditTime in ConfigGroups collection and update Tagdiscrepancy collection
* @param updateValues  - Values object
* @param data  - config Data
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateEditTimeAndTagDescrepancy(updateValues, data, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection1 = db.delta_ConfigGroups;
            var collection2;
            if (updateValues.Type === "HyperSprout")
                collection2 = db.delta_Hypersprouts;
            else if (updateValues.Type === "Meter")
                collection2 = db.delta_Meters;
            else
                callback(new Error("Wrong Type"), null);

            var collection3 = db.delta_TagDiscripancies;
            var collection4 = db.delta_ConfigPrograms;
            var out = {
                "ConfigProgramName": updateValues.ConfigProgramName,
                "nModified": data.result.nModified,
                "Type": updateValues.Type,
                "ConfigID": updateValues.ConfigID,
                "collection1": collection1,
                "collection2": collection2,
                "collection3": collection3,
                "collection4": collection4
            };
            async.waterfall(
                [
                    async.apply(updateEditTime, out),
                    modifyTagDescrepancies,
                ],
                function (err, output) {
                    if (err)
                        callback(err, null);
                    else
                        //hold things here and do manipulations.
                        callback(null, output);
                });
        }
    });
};

/**
* @description -  Delete Hypersprout group
* @param groupID  - group ID
* @param Type  - operation type (Application group | config group)
* @param deviceType - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteHSConfiggroup(groupID, Type, deviceType, callback) {
    try {
        async.waterfall(
            [
                async.apply(getMembersID, groupID, Type, deviceType),
                removeGroups,
            ],
            function (err, output) {
                if (err)
                    callback(err, null);
                else
                    //hold things here and do manipulations.
                    callback(null, output);
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description - Download configuration group for HyperSprout
* @param configName  - config name
* @param callbackEnd - callback function returns success or error response
* @return callback function
*/
function hsmGroupDownload(configName, callbackEnd) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callbackEnd(err, null);
            else {
                var collectionName = db.delta_ConfigGroups;
                async.waterfall(
                    [
                        async.apply(findDownloadConfigID, collectionName, configName, "HyperSprout"),
                        listDevicesAttached,
                        findHSID
                    ],
                    function (err, result) {
                        if (err)
                            callbackEnd && callbackEnd(err, null);
                        else
                            //hold things here and do manipulations.
                            callbackEnd && callbackEnd(null, result);
                    });
            }
        });
    } catch (e) {
        callbackEnd("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  Download configuration group data for Meter
* @param configName  -  config Name
* @param callbackEnd - callback function returns success or error response
* @return callback function
*/
function mmGroupDownload(configName, callbackEnd) {
    dbCon.getDb(function (err, db) {
        if (err)
            callbackEnd(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            async.waterfall(
                [
                    async.apply(findDownloadConfigID, collectionName, configName, "Meter"),
                    listDevicesAttached,
                    findMeterID
                ],
                function (err, result) {
                    if (err)
                        callbackEnd && callbackEnd(err, null);
                    else
                        //hold things here and do manipulations.
                        callbackEnd && callbackEnd(null, result);
                });
        }
    });
}

//ConfigPrograms Web Service

/**
* @description -  list config program data
* @param type  - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function configPrograms(type, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            getconfigProgramData(db.delta_ConfigPrograms, db.delta_ConfigGroups, type, function (err, membersInfo, configProgramData) {
                if (err)
                    callback(err, null, null);
                else
                    callback(null, membersInfo, configProgramData);
            });
        }
    });
};

/**
* @description -  edit config program by program name
* @param Type  - Device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function configProgramEdit(configProgramName, Type, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_ConfigPrograms;
            getConfigProgramInfo(collection, configProgramName, Type, callback);
        }
    });
};

/**
* @description -  add new config program
* @param configProgramDetails  - program details object
* @param Description  - description
* @param type - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function newConfigProgram(configProgramName, configProgramDetails, Description, type, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_ConfigPrograms;
            if ((type === "HyperSprout") || (type === "Meter"))
                addConfigProgram(collection, configProgramName, configProgramDetails, Description, type, callback);
            else {
                callback(new Error("Wrong Device Type"), null);
            }
        }
    });
};

/**
* @description -  delete config program , for ConfigProgramsDelete Web Service
* @param type  - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteConfigPrograms(configProgramName, type, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_ConfigPrograms;
            var collection1 = db.delta_ConfigGroups;
            removeConfigProgram(collection, collection1, configProgramName, type, callback);
        }
    });
};


/**
* @description -  save new config for hypersprout and meter, for HSMConfNewConfSave & MMConfNewConfSave Web Service
* @param configName  - group config name
* @param DeviceClass  - device class of config group
* @param configProgramName - name of config program
* @param Description - description of config program / config group 
* @param Type - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function newConfGrp(configName, DeviceClass, configProgramName, Description, Type, callback) {
    async.waterfall(
        [
            async.apply(getConfigGroups_Info, configName, DeviceClass, configProgramName, Description, Type),
            insertOneConfigGrp
        ],
        function (err, result) {
            if (err)
                callback(err, null);
            else
                //hold things here and do manipulations.
                callback(null, result);
        });
};

//HSMConf Web Service

/**
* @description -  get configuration details from configGroup and HyperSprout  
* @param callbackEnd - callback function returns success or error response
* @return callback function
*/
function configurationDetailsOfHSM(callbackEnd) {
    async.waterfall(
        [
            getHSDataFromDELTA_ConfigGroupsByCondition,
            getDataFromDELTA_HyperSproutsByCondition,
        ],
        function (err, membersInfo, hyperSproutData) {
            if (err)
                callbackEnd && callbackEnd(err, null, null);
            else
                //hold things here and do manipulations.
                callbackEnd && callbackEnd(null, membersInfo, hyperSproutData);
        });
};

/**
* @description -  get meter configuration 
* @param callbackEnd - callback function returns success or error response
* @return callback function
*/
function configurationDetailsOfMM(callbackEnd) {
    try {
        async.waterfall(
            [
                getMeterDataFromDELTA_ConfigGroupsByCondition,
                getDataFromDELTA_MetersByCondition,
            ],
            function (err, membersInfo, meterData) {
                if (err)
                    callbackEnd && callbackEnd(err, null, null);
                else
                    //hold things here and do manipulations.
                    callbackEnd && callbackEnd(null, membersInfo, meterData);
            });
    } catch (error) {
        callbackEnd(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  update hypersprout groups,for HSMConfImportConfSave Web Service
* @param configName  - config name
* @param listHS  - list of hypersprouts
* @param Action - Add / Remove
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateHyperSproutGroups(configName, listHS, Action, callback) {
    var serialNumbers = [];
    // Removing unwanted characters from listHS.
    for (var key in listHS) {
        if (listHS.hasOwnProperty(key))
            serialNumbers.push(listHS[key]);
    }
    if (Action === 'Add') {
        async.each(serialNumbers,
            function (serialNumber, callbackEach) {
                addHSConfigIDFromDELTA_ConfigGroupsByCondition(configName, serialNumber, Action, function (err, result) {
                    if (err)
                        callbackEach(err, null);
                    else
                        callbackEach(null, result);
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else
                    callback(null, "Successfully Added");
            });
    }
    else if (Action === 'Remove') {
        async.each(serialNumbers,
            function (serialNumber, callbackEach) {
                removeHSConfigIDFromDELTA_ConfigGroupsByCondition(configName, serialNumber, Action, function (err, result) {
                    if (err)
                        callbackEach(err, null);
                    else
                        callbackEach(null, result);
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else
                    callback(null, "Successfully Removed");
            });
    } else
        callback(new Error("Wrong Action to perform"), null)
};


function updateMeterGroupsAction(serialNumbers, configName, Action, callback) {
    if (Action === 'Add') {
        async.each(serialNumbers,
            function (serialNumber, callbackEach) {
                addMMConfigIDFromDELTA_ConfigGroupsByCondition(configName, serialNumber, Action, function (err, result) {
                    if (err)
                        callbackEach(err, null);
                    else
                        callbackEach(null, result);
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else
                    callback(null, "Meter(s) grouped");
            });
    }
    else if (Action === 'Remove') {
        async.each(serialNumbers,
            function (serialNumber, callbackEach) {
                removeMMConfigIDFromDELTA_ConfigGroupsByCondition(configName, serialNumber, Action, function (err, result) {
                    if (err)
                        callbackEach(err, null);
                    else
                        callbackEach(null, result);
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else
                    callback(null, "Meter(s) ungrouped");
            });
    } else
        callback(new Error("Wrong Action to perform"), null)
}



/**
* @description -  updating meter groups, for MMConfImportConfSave Web Service
* @param listMeters  - list of meters
* @param Action -  Add/Remove
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateMeterGroups(configName, listMeters, Action, callback) {
    let serialNumbers = [];
    let serialNumbers1 = [];
    // Removing unwanted characters from listHS.
    for (var key in listMeters) {
        if (listMeters.hasOwnProperty(key))
            serialNumbers1.push(listMeters[key]);
    }
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var meterCollection = db.delta_Meters;
                meterCollection.find({ "MeterSerialNumber": { $in: serialNumbers1 } }).toArray(function (err, result) {
                    if (err)
                        return callback(err, null)
                    else if (result.length == 0)
                        return callback(new Error("Invalid SerialNumber"), null);
                    else {
                        for (var i in result) {
                            serialNumbers.push(result[i].MeterSerialNumber);
                        }
                    }
                    //console.log("serialNumbers ",serialNumbers)
                    updateMeterGroupsAction(serialNumbers, configName, Action, callback)
                })
            }
        })
    } catch (error) {
        return callback(new Error("something went wrong"), null);
    }


    // if (Action === 'Add') {
    //     async.each(serialNumbers,
    //         function (serialNumber, callbackEach) {
    //             addMMConfigIDFromDELTA_ConfigGroupsByCondition(configName, serialNumber, Action, function (err, result) {
    //                 if (err)
    //                     callbackEach(err, null);
    //                 else
    //                     callbackEach(null, result);
    //             });
    //         },
    //         function (err) {
    //             if (err)
    //                 callback(err, null);
    //             else
    //                 callback(null, "Successfully Added");
    //         });
    // }
    // else if (Action === 'Remove') {

    //     async.each(serialNumbers,
    //         function (serialNumber, callbackEach) {
    //             removeMMConfigIDFromDELTA_ConfigGroupsByCondition(configName, serialNumber, Action, function (err, result) {
    //                 if (err)
    //                     callbackEach(err, null);
    //                 else
    //                     callbackEach(null, result);
    //             });
    //         },
    //         function (err) {
    //             if (err)
    //                 callback(err, null);
    //             else
    //                 callback(null, "Successfully Removed");
    //         });
    // } else
    //     callback(new Error("Wrong Action to perform"), null)
};

/**
* @description -  lits of device attached 
* @param doc  - object containg group type or device type 
* @param callback - callback function returns success or error response
* @return callback function
*/
function listDevicesAttached(doc, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                return callback(err, null);
            else {
                var collection;
                var grpID;
                var key;
                if (doc.Type === "HyperSprout") {
                    collection = db.delta_Hypersprouts;
                } else if (doc.Type === "Meter") {
                    collection = db.delta_Meters;
                } else if (doc.Type === "DeltaLink") {
                    collection = db.delta_DeltaLink;
                } else {
                    return callback(new Error("Wrong Device Type"), null);
                }
                if (doc.grpType === "Configuration Group")
                    grpID = doc.ConfigID
                else if (doc.grpType === "Application Group")
                    grpID = doc.GroupID
                else
                    return callback(new Error("Wrong Group Type"), null);
                findDevicesAttachedToGrp(collection, grpID, doc.Type, doc.grpType, function (err, serialNumbers) {
                    if (err)
                        return callback(err, null);
                    else {
                        doc.listSerialNumber = serialNumbers;
                        return callback(null, doc);
                    }
                });
                // } else if (doc.grpType === "Application Group") {
                //     findDevicesAppGrp(collection, doc.GroupID, doc.Type, function (err, result) {
                //         if (err)
                //             return callback(err, null);
                //         else {
                //             if (doc.Type === "HyperSprout") {
                //                 for (key in result) {
                //                     if (result.hasOwnProperty(key))
                //                         serialNumbers.push(result[key].HypersproutSerialNumber);
                //                 }
                //             } else {
                //                 for (key in result) {
                //                     if (result.hasOwnProperty(key))
                //                         serialNumbers.push(result[key].MeterSerialNumber);
                //                 }
                //             }
                //             doc.listSerialNumber = serialNumbers;
                //             return callback(null, doc);
                //         }
                //     });
                // } else
                // return callback(new Error("Wrong Group Type"), null);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  List of download jobs, for ListDownloadJobs Web Service
* @param startTime  - start time 
* @param endTime  - end time
* @param Type - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function listDownloadJobs(startTime, endTime, type, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var jobsCollection = db.delta_Jobs;
            downloadJobs(jobsCollection, startTime, endTime, type, callback);
        }
    });
}

/**
* @description -  Add Hypersprout job , for HSMDownDownloadConfSave Web Service
* @param configName  - name
* @param listSerialNumber  - list of device serial no to be added to job
* @param callbackEnd - callback function returns success or error response
* @return callback function
*/
function initiateHSJobOfDownConf(configName, listSerialNumber, callbackEnd) {
    dbCon.getDb(function (err, db) {
        if (err)
            callbackEnd(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            async.waterfall(
                [
                    async.apply(findDownConfigID, collectionName, configName, listSerialNumber, "HyperSprout"),
                    findHSID
                ],
                function (err, result) {
                    if (err)
                        callbackEnd && callbackEnd(err, null);
                    else
                        //hold things here and do manipulations.
                        callbackEnd && callbackEnd(null, result);
                });
        }
    });
}

/**
* @description -  Add Meter job , for MMDownDownloadConfSave Web Service
* @param configName  - name
* @param listSerialNumber  - list of device serial no to be added to job
* @param callbackEnd - callback function returns success or error response
* @return callback function
*/
function initiateMeterJobOfDownConf(configName, listSerialNumber, callbackEnd) {
    dbCon.getDb(function (err, db) {
        if (err)
            callbackEnd(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            async.waterfall(
                [
                    async.apply(findDownConfigID, collectionName, configName, listSerialNumber, "Meter"),
                    findMeterID
                ],
                function (err, result) {
                    if (err)
                        callbackEnd && callbackEnd(err, null);
                    else
                        callbackEnd && callbackEnd(null, result);
                });
        }
    });
}

/**
* @description -  initiate app group download, for AppGroupDownload Web Service
* @param grpID  - group id
* @param type  - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function initiateAppGrpDownload(grpID, type, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var appGrpCollection = db.delta_AppGroups;
                var configGrpCollection = db.delta_ConfigGroups;
                var deviceCollection
                if (type === "HyperSprout")
                    deviceCollection = db.delta_Hypersprouts;
                else
                    deviceCollection = db.delta_Meters;
                var hsCollection = db.delta_Hypersprouts;
                var tagDiscrepancyCollection = db.delta_TagDiscripancies;
                var doc = {
                    AppGrpCollection: appGrpCollection,
                    ConfigGrpCollection: configGrpCollection,
                    deviceCollection: deviceCollection,
                    Type: type,
                    grpType: "Application Group",
                    GroupID: grpID,
                    HSCollection: hsCollection,
                    TagDiscrepancyCollection: tagDiscrepancyCollection
                }
                var JobIDs = [];
                listDevicesAttached(doc, function (err, response) {
                    async.each(doc.listSerialNumber,
                        function (serialNumber, callbackEach) {
                            async.waterfall(
                                [
                                    async.apply(getConfigGrpInfo, doc, serialNumber),
                                    function (info, callbackEach) {
                                        if (info === "No Tag Discrepancy")
                                            callbackEach(null, "No Tag Discrepancy")
                                        else
                                            initiateAppGrpJob(info, callbackEach)
                                    },
                                    function (input, callbackEach) {
                                        if (input === "No Tag Discrepancy")
                                            callbackEach(null, "No Tag Discrepancy")
                                        else {
                                            JobIDs.push(input.JobID);
                                            callbackEach(null, input);
                                        }
                                    }
                                ],
                                function (err, result) {
                                    callbackEach(err, result);
                                });
                        },
                        function (err, asyncResponse) {
                            if (err)
                                callback(err, null);
                            else if (JobIDs.length > 0) {
                                setTimeout(function () {
                                    changeJobStatus(JobIDs, function (err, success) {
                                        callback(null, success);
                                    });
                                }, 30000);
                            } else
                                callback(null, asyncResponse);
                        });
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  check and update device jobs
* @param cellID  - cell ID
* @param meterID  - Meter ID
* @param messageID - message ID
* @param status - job status
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateDownloadJobs(cellID, meterID, messageID, status, type, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callbackEnd(err, null);
        else {
            var deviceCollection;
            var jobsCollection = db.delta_Jobs;
            var tagDiscrepancyCollection = db.delta_TagDiscripancies;
            if (type === "HS_DOWNLOAD") {
                deviceCollection = db.delta_Hypersprouts;
                deviceCollection.find({ HypersproutID: cellID }).toArray(function (err, deviceDetails) {
                    if (err)
                        callback(err, null);
                    else if (deviceDetails.length === 0)
                        callback(new Error("No such device present"), null);
                    else
                        updateDownConfJobs(jobsCollection, tagDiscrepancyCollection, messageID, deviceDetails[0].HypersproutSerialNumber, status, callback);
                });
            } else {
                deviceCollection = db.delta_Meters;
                deviceCollection.find({ MeterID: meterID }).toArray(function (err, deviceDetails) {
                    if (err)
                        callback(err, null);
                    else if (deviceDetails.length === 0)
                        callback(new Error("No such device present"), null);
                    else
                        updateDownConfJobs(jobsCollection, tagDiscrepancyCollection, messageID, deviceDetails[0].MeterSerialNumber, status, callback);
                });
            }
        }
    });
}

/**
* @description -  UserSettings Web Service
* @param userID  - user Id
* @param callback - callback function returns success or error response
* @return callback function
*/
function getUserSettings(userID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_User;
            getUserDetail(collection, userID, callback);
        }
    });
}

/**
* @description - updating user details, UpdateUserSettings Web Service
* @param userID  - user id
* @param loginId  - login id of user
* @param firstName - First Name of user
* @param lastName - Last Name
* @param emailAddress - email of user
* @param homePage - home page name
* @param timeZone - timeZone object
* @param temprature - temprature unit
* @param password - login password
* @param callback -  returns success or error response
* @return callback function
*/
function updateUserDetails(userID, loginId, firstName, lastName, emailAddress, homePage, timeZone, temprature, password, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var result = validator.isEmail(emailAddress);
            if ((result === false) || (result === "false") || (result === undefined)) {
                callback(new Error("Not a valid Email Address"), null);
            } else {
                var collection = db.delta_User;
                checkOldPassword(collection, loginId, password, function (err, resp) {
                    if (err)
                        callback(err, null);
                    else
                        updateUserFields(collection, userID, loginId, firstName, lastName, emailAddress, homePage, timeZone, temprature, callback);
                });
            }
        }
    });
}

/**
* @description - update login password, Tools -> My Settings -> ChangePassword Web Service
* @param loginId  - login ID 
* @param oldPassword  - old password
* @param newPassword - new password
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateUserPassword(loginId, oldPassword, newPassword, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_User;
            var collection1 = db.delta_PasswordSettings;
            checkPasswordLength(collection1, newPassword, function (err, result) {
                if (err)
                    callback(err, null);
                else {
                    checkOldPassword(collection, loginId, oldPassword, function (err, res) {
                        if (err)
                            callback(err, null);
                        else
                            updatePassword(collection, collection1, loginId, newPassword, callback)
                    })
                }
            });
        }
    });
}

/**
* @description -  List of security group ID's , Administration -> UniqueSecurityID Web Service
* @param callback - callback function returns success or error response
* @return callback function
*/
function listOfSecurityID(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SecurityGroups;
            listSecurityIDs(collection, callback);
        }
    });
}

/**
* @description -  add new security group , Administration -> AddSecurityGroup Web Service
* @param securityID  - security ID
* @param description  - description of security group
* @param functions- Array of objects of different functions having different roles
* @param callback - callback function returns success or error response
* @return callback function
*/
function newSecurityGroup(securityID, description, functions, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SecurityGroups;
            addSecurityGroup(collection, securityID, description, functions, callback);
        }
    });
}

/**
* @description - security Group Details, Administration -> ReturnSecurityGroup Details Web Service 
* @param securityID  - security ID 
* @param callback - callback function returns success or error response
* @return callback function
*/
function securityGroupDetails(securityID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SecurityGroups;
            returnSecurityGroupDetails(collection, securityID, callback);
        }
    });
}

/**
* @description -  All scecurity groups list, Administration -> GetSecurityGroups Web Service
* @param callback - callback function returns success or error response
* @return callback function
*/
function allSecurityGroupDetails(data, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_User;
            getSecurityGroupDetails(collection, data, callback);
        }
    });
}

/**
* @description -  edit security group , Administration -> EditSecurityGroup Web Service
* @param securityID  - security ID
* @param description  - description of security group
* @param functions- Array of objects of different functions having different roles
* @param callback - callback function returns success or error response
* @return callback function
*/
function editSecurityGroup(securityID, description, functions, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SecurityGroups;
            updateSecurityGroupDetails(collection, securityID, description, functions, callback);
        }
    });
}

/**
* @description -  update password settings, Administration -> System Settings -> RestoreDefaultSettings Web Service
* @param settings  - settings object
* @param callback - callback function returns success or error response
* @return callback function
*/
function savePasswordSettings(settings, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_PasswordSettings;
            upgradePasswordSettings(collection, settings, callback);
        }
    });
}

/**
* @description -  restore default password settings,Administration -> RestoreDefaultPasswordSettings Web Service
* @param callback - callback function returns success or error response
* @return callback function
*/
function restoreDefaultPasswordSettings(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_PasswordSettings;
            defaultPasswordSettings(collection, callback);
        }
    });
}

/**
* @description -  get updated password settings, Administration -> UpdatedPasswordSettings Web Service
* @param startTime  - 
* @param endTime  - 
* @param callback - callback function returns success or error response
* @return callback function
*/
function getUpdatedPasswordSettings(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_PasswordSettings;
            updatedPasswordSettings(collection, callback);
        }
    });
}

/**
* @description -  delete security group by security ID ,Administration -> Security -> DeleteSecurityGroup Details Web Service 
* @param securityID  - security ID
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteSecurityGroup(securityID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SecurityGroups;
            var collection1 = db.delta_User;
            removeSecurityGroup(collection, collection1, securityID, callback);
        }
    });
}

/**
* @description -  List of User ID, Administration -> Users -> UniqueUserID Web Service
* @param callback - callback function returns success or error response
* @return callback function
*/
function listOfUserID(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_User;
            listUserIDs(collection, callback);
        }
    });
}

/**
* @description -  Add New User, Administration -> Users -> Add New User Web Service
* @param userID  - userId,
* @param firstName - first name
* @param lastName  - last name
* @param emailAdd - email address
* @param securityGroup - security Group
* @param homePage- home page name
* @param timeZone - timeZone object
* @param accountLocked- account Locked
* @param temprature - temprature unit
* @param mobileNumber - mobile number
* @param callback - callback function returns success or error response
* @return callback function
*/
function addUser(userID, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, mobileNumber, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_User;
            var collection1 = db.delta_PasswordSettings;
            var collection2 = db.delta_SecurityGroups;

            validateSecurityGroup(collection2, securityGroup, function (err) {
                if (err)
                    callback(new Error(err));
                else
                    addNewUser(collection, collection1, userID, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, mobileNumber, callback);
            });
        }
    });
}
/**
 * validate security id
 * @param {*} collectionName 
 * @param {*} securityGroup 
 * @param {*} callback 
 */
function validateSecurityGroup(collectionName, securityGroup, callback) {
    collectionName.find({ 'SecurityID': securityGroup }).toArray(function (err, result) {
        if (err)
            callback(err);
        else {
            if (result.length === 0) {
                callback("Invalid Security Group");
            } else {
                callback(null);
            }
        }
    });
}

/**
* @description -  edit user,Administration -> Users -> Edit New User Web Service
* @param userID  - userId,
* @param loginId - loginId
* @param firstName - first name
* @param lastName  - last name
* @param emailAdd - email address
* @param securityGroup - security Group
* @param homePage- home page name
* @param timeZone - timeZone object
* @param accountLocked- account Locked
* @param temprature - temprature unit
* @param mobileNumber - monile number 
* @param callback - callback function returns success or error response
* @return callback function
*/
function editUser(userID, loginId, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, mobileNumber, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var result = validator.isEmail(emailAdd);
            if ((result === false) || (result === "false") || (result === undefined)) {
                callback("Not a valid Email Address", null);
            } else {
                var collection = db.delta_User;
                var collection2 = db.delta_SecurityGroups;
                validateSecurityGroup(collection2, securityGroup, function (err) {
                    if (err)
                        callback(err);
                    else
                        editUserDetails(collection, userID, loginId, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, mobileNumber, callback);
                });
            }
        }
    });
}

/**
* @description - reset Password ,Administration -> Users ->Reset Password Web Service
* @param userID  -  user ID for which password being generated
* @param callback - callback function returns success or error response
* @return callback function
*/
function resetPassword(userID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_User;
            var collection1 = db.delta_PasswordSettings;
            passwordReset(collection, collection1, userID, callback);
        }
    });
}

/**
* @description -  delete user, Administration -> Users ->Delete User Web Service
* @param userID  - delete user
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteUser(userID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_User;
            userDelete(collection, userID, callback);
        }
    });
}

/**
* @description -  save system settings, Administration -> System Settings -> RestoreDefaultSettings Web Service
* @param settings  -  settings name string
* @param tabVal  - settings value Object
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveSystemSettings(settings, tabVal, status, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SystemSettings;
            if (tabVal === "Communications") {
                if (settings.LineLossFactor == undefined && settings.HyperSproutLoss == undefined && settings.HyperHubLoss) {
                    callback(new Error("Settings couldn't be updated"), null);
                } else {
                    checkMinMaxValForLossFactors(settings.LineLossFactor, settings.HyperSproutLoss, settings.HyperHubLoss, function (err) {
                        if (err) {
                            callback(new Error(err), null);
                        } else {
                            upgradeSystemSettings(collection, settings, tabVal, status, callback);
                        }
                    });
                }
            } else {
                upgradeSystemSettings(collection, settings, tabVal, status, callback);
            }
        }
    });
}

function checkMinMaxValForLossFactors(LineLossFactor, HyperSproutLoss, HyperHubLoss, callback) {

    lineLossMin = 0;
    lineLossMax = 1;
    hsMin = 0.01;
    hsMax = 0.06;

    if (LineLossFactor >= lineLossMin && LineLossFactor <= lineLossMax && HyperSproutLoss >= hsMin && HyperSproutLoss <= hsMax && HyperHubLoss >= hsMin && HyperHubLoss <= hsMax) {
        callback(null, null);
    } else {
        callback("Line Loss Min Max values are 0 and 1 respectively and other factors Min and Max values are 0.01 and  0.06 respectively: settings couldn't be updated", null);
    }

}
/**
* @description - restore default settings, Administration -> System Settings -> RestoreDefaultSettings Web Service
* @param tabVal  - settings value Object 
* @param callback - callback function returns success or error response
* @return callback function
*/
function restoreDefaultSystemSettings(tabVal, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SystemSettings;
            defaultSystemSettings(collection, tabVal, callback);
        }
    });
}

/**
* @description - update system settings, Administration -> System Settings -> UpdatedSystemSettings Web Service
* @param callback - callback function returns success or error response
* @return callback function
*/
function getUpdatedSystemSettings(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_SystemSettings;
            var settings = ["Communications", "Control", "DataProcessing", "Firmware", "Miscellaneous", "Registration", "Reporting"];
            updatedSystemSettings(collection, settings, callback);
        }
    });
}

/**
* @description -  save Parsed (Raw ) data
* @param result  - raw data
* @param deviceID  - device Id
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveParsedData(result, deviceID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_RawData;
            addParsedData(collection, result, deviceID, function (err, result) {
                if (err)
                    callback(err, null);
                else
                    callback(null, result);
            })
        }
    });
}
/* ********** DB Commands SECTION 2 - NON-EXPOSED METHODS************************ */

/**
* @description -  App group collection data
* @param configGrpsData  - config group data object
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDataFromDELTA_AppGroups_HS(configGrpsData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var collectionName = db.delta_AppGroups;
                findCollectionDataFromMongoDB_HS(collectionName, configGrpsData.type, function (err, appConfigData) {
                    if (err)
                        callback(err, null, null);
                    else
                        callback(null, configGrpsData, appConfigData);
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

function getDataFromDELTA_AppGroups_WithPagination(type, data, callback) {
    try {
        let collection = "delta_AppGroups";
        let whereCondition = { Type: type };
        data.search = whereCondition;
        dao.findAllPaginationAndSearch(collection, data, whereCondition, type + " Firmware", callback);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

function getSecurityGroupFromDELTA_WithPagination(data, callback) {
    try {
        let collection = "delta_SecurityGroups";
        let whereCondition = {};
        dao.findAllPaginationAndSearch(collection, data, whereCondition, "Security Group", callback);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null);
    }
};

/**
* @description -  get hypersprout record from config group
* @param type  - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDataFromDELTA_ConfigGroups_HSM(type, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var collectionName = db.delta_ConfigGroups;
                findCollectionDataFromMongoDB_HS(collectionName, type, function (err, configGrpsData) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, configGrpsData);
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  no of configuration of config groups
* @param configGrpsData  - config group data object
* @param appConfigData  - config data object
* @param callback - callback function returns success or error response
* @return callback function
*/
function getHSConfigMemberCount(configGrpsData, appConfigData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var ConfigIDs = [];
                var collection2;
                var collection1 = db.delta_ConfigGroups;
                if (configGrpsData.type === "HyperSprout")
                    collection2 = db.delta_Hypersprouts;
                else
                    collection2 = db.delta_Meters;
                collection1.find({ Type: configGrpsData.type }, { ConfigID: 1, _id: 0 }).toArray(function (err, docs) {
                    var configCount = [];
                    for (var count in docs) {
                        if (docs.hasOwnProperty(count))
                            ConfigIDs.push(docs[count].ConfigID);
                    }
                    async.each(ConfigIDs,
                        function (ID, callbackEach) {
                            var M = 0;
                            collection2.find({ ConfigID: ID }).toArray(function (err, deviceData) {
                                if (err)
                                    callback(err, null, null);
                                else {
                                    for (var count in deviceData) {
                                        if (deviceData[count].ConfigStatus === "M") {
                                            M++;
                                        }
                                    }
                                    var membersOfConfigID = {
                                        configID: ID,
                                        Members: M
                                    };
                                    configCount.push(membersOfConfigID);
                                    callbackEach(null, configCount);
                                }
                            });
                        },
                        function (err) {
                            if (err)
                                callback(err);
                            else
                                callback(null, configGrpsData, appConfigData, configCount);
                        });
                });
            };
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  get app member count
* @param configGrpsData  - config group data object
* @param appConfigData  - app config data object
* @param configCount - array of no of configuration related to config groups
* @param callback - callback function returns success or error response
* @return callback function
*/
function getHSApplicationMemberCount(configGrpsData, appConfigData, configCount, callback) {
    try {

        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var ApplicationIDs = [];
                var collection2;
                var collection1 = db.delta_AppGroups;
                if (configGrpsData.type === "HyperSprout")
                    collection2 = db.delta_Hypersprouts;
                else
                    collection2 = db.delta_Meters;
                collection1.find({ Type: configGrpsData.type }, { GroupID: 1, _id: 0 }).toArray(function (err, docs) {
                    var appCount = [];
                    for (var count in docs) {
                        if (docs.hasOwnProperty(count))
                            ApplicationIDs.push(docs[count].GroupID);
                    }
                    async.each(ApplicationIDs,
                        function (ID, callbackEach) {
                            collection2.find({ AppIDs: ID }).toArray(function (err, docs) {
                                if (err)
                                    callback(err, null, null);
                                else {
                                    var membersOfAppID = {
                                        AppID: ID,
                                        Members: docs.length
                                    };
                                    appCount.push(membersOfAppID);
                                    callbackEach(null, appCount);
                                }
                            });
                        },
                        function (err) {
                            if (err)
                                callback(err);
                            else
                                callback(null, configGrpsData, appConfigData, configCount, appCount);
                        });
                });
            };
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  Find All Collection Data by Type From MongoDB
* @param collectionName  - Name of mongoDB collection
* @param type  - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findCollectionDataFromMongoDB_HS(collectionName, type, callback) {
    try {
        collectionName.find({ Type: type }).toArray(function (err, docs) {
            if (err)
                callback(err, null);
            else
                docs.type = type;
            callback(null, docs);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  
* @param startTime  - 
* @param endTime  - 
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateFieldsIntoMongoDbForAppId(collectionName, key, updateValues, callbackEnd) {
    async.waterfall(
        [
            async.apply(findDataForKey, collectionName, key, updateValues),
            updateWithAppId,
        ],
        function (err, data) {
            if (err)
                callbackEnd && callbackEnd(err, null);
            else
                callbackEnd && callbackEnd(null, data);
        });
};

/**
* @description -  update Fields Into MongoDb For ConfigId
* @params colletionValue, key, updateValues, callbackEnd
* @return callback function
*/
function updateFieldsIntoMongoDbForConfigId(colletionValue, key, updateValues, callbackEnd) {
    async.waterfall(
        [
            async.apply(findDataForKey, colletionValue, key, updateValues),
            updateWithConfigId,
        ],
        function (err, data) {
            if (err)
                callbackEnd && callbackEnd(err, null);
            else
                callbackEnd && callbackEnd(null, data);
        });
};

/**
* @description -  take all the appID from docs, append the new one into it, update the document in mongodb
* @params docs, updateValues, collectionName, callback
*/
function updateWithConfigId(docs, updateValues, collectionName, callback) {
    var key = docs[0].SerialNumber;
    var previousConfigId = docs[0].ConfigID;
    if (updateValues.operationType === 'add') {
        if (previousConfigId !== 'unknown') {
            // we can pass message like already added to this group.
            return callback(null, 'ConfigID exists');
        }
    } else if (updateValues.operationType === 'remove') {
        updateValues.values.ConfigID = 'unknown';
    }
    updateFieldsIntoMongoDb(collectionName, key, updateValues.values, callback);
};

/**
* @description -  take all the appID from docs, append the new one into it, update the document in mongodb.
* @param docs  - document info which need to be updated
* @param updateValues - object of values to be updated
* @param collectionName  - Name of mongo collection
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateWithAppId(docs, updateValues, collectionName, callback) {
    var key = docs[0].SerialNumber;
    var previousAppIds = docs[0].AppIDs;
    if (updateValues.operationType === 'add') {
        if (previousAppIds.indexOf(updateValues.values.AppIDs) >= 0) {
            // we can pass message like already added to this group.
            return callback(null, 'AppId already exists');
        }
        updateValues.values.AppIDs = previousAppIds + ', ' + updateValues.values.AppIDs;
    } else if (updateValues.operationType === 'remove') {
        //what if it will be more then one time macth
        if (previousAppIds.indexOf(updateValues.values.AppIDs) >= 0) {
            // we can pass message like already added to this group.
            updateValues.values.AppIDs = previousAppIds.replace(updateValues.values.AppIDs, '');
        } else {
            return callback(null, 'AppId does not exists');
        }
    } else {
        // what needs to be done when its replace call.

    }
    updateFieldsIntoMongoDb(collectionName, key, updateValues.values, callback);
};

/**
* @description -  update mongo db collection
* @param collectionName  - Name of collection
* @param key  - key
* @param updateValues- values to be updated
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateFieldsIntoMongoDb(collectionName, key, updateValues, callback) {
    collectionName.update({ SerialNumber: key }, { $set: updateValues }, callback);
};

/**
* @description -  find in mongo db collection
* @param collectionName  - Name of collection
* @param key  - key
* @param updateValues- values to be updated
* @param callback - callback function returns success or error response
* @return callback function
*/

function findDataForKey(collectionName, key, updateValues, callback) {
    collectionName.find({ SerialNumber: key }).toArray(function (err, docs) {
        if (err)
            callback(err, null, null, null);
        else
            callback(null, docs, updateValues, collectionName);
    });
};

function getDataFromDELTA_ConfigGroups(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            findCollectionDataFromMongoDB(collectionName, function (err, configGrpsData) {
                if (err)
                    callback(err, null);
                else
                    callback(null, configGrpsData);
            });
        }
    });
};

/**
* @description -  Find All Collection Data From MongoDB
* @param collectionName  - Mongo DB collection
* @param callback - callback function returns success or error response
* @return callback function
*/
function findCollectionDataFromMongoDB(collectionName, callback) {
    collectionName.find({ Type: "HyperSprout" }).toArray(function (err, docs) {
        if (err)
            callback(err, null);
        else
            callback(null, docs);
    });
};

function findCollectionDataFromMongoDB_Search(collectionName, callback) {
    collectionName.find().toArray(function (err, docs) {
        if (err)
            callback(err, null);
        else
            callback(null, docs);
    });
};

/**
* @description -  Fine one user from mongo DB
* @param login  - user collection name
* @param securityGroups  - security group collection name
* @param passwordSett - password settings collection name
* @param systemSettingsCollection - system settings collection name
* @param userID - user id
* @param password -  password
* @param callback - callback function returns success or error response
* @return callback function
*/
function findOneFromMongoDB(login, securityGroups, passwordSett, systemSettingsCollection, userID, password, callback) {
    login.findOne({ UserID: userID }, function (err, result) {
        if (err)
            return callback(err, null, null, null)
        else if (result == null)
            return callback(new Error("Wrong Username/Password"), null, null, null);
        else {
            var attemptsToLogin = (result.AttemptsToLogin == 0) ? 1 : result.AttemptsToLogin;
            comparePassword(password, result.Password, function (err, isPasswordMatch) {
                if (err)
                    return callback(err, null, null, null);
                else if (!isPasswordMatch) {
                    passwordSett.find({
                        'Type.Status': "Updated", $or: [{ 'Type.Settings.EnablePasswordPolicy': true },
                        { 'Type.Settings.EnablePasswordPolicy': "true" }]
                    }).toArray(function (err, out) {
                        if (err)
                            return callback(err, null, null, null);
                        else if (out.length > 0) {
                            if (attemptsToLogin >= out[0].Type.Settings.MaximumLogonFailuresbeforeLockout) {
                                var lockoutPeriod = out[0].Type.Settings.LockoutDuration;
                                login.update({ UserID: userID }, { $set: { AccountLocked: true, AccountLockedTimestamp: new Date() } },
                                    function (err, upd) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            return callback(new Error("Account Locked. Try Again after " + lockoutPeriod + " minutes"),
                                                null, null, null);
                                        }
                                    });
                            } else {
                                attemptsToLogin += 1;
                                login.update({ UserID: userID }, { $set: { AttemptsToLogin: attemptsToLogin } }, function (err, upd) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else {
                                        return callback(new Error("Wrong Username/Password"), null, null, null);
                                    }
                                });
                            }
                        } else {
                            return callback(new Error("Wrong Username/Password"), null, null, null);
                        }
                    });
                } else {
                    if ((result.AccountLocked === "true") || (result.AccountLocked === true)) {
                        var accountLockedTime, loginAttempts, currentTime, accountLockTime, timeDifference, timeDuration;
                        passwordSett.find({ 'Type.Status': "Updated", $or: [{ 'Type.Settings.EnablePasswordPolicy': true }, { 'Type.Settings.EnablePasswordPolicy': "true" }] }).toArray(function (err, out) {
                            if (err)
                                return callback(err, null, null, null);
                            else if (out.length > 0) {
                                accountLockedTime = out[0].Type.Settings.LockoutDuration;
                                loginAttempts = out[0].Type.Settings.MaximumLogonFailuresbeforeLockout;
                                if (loginAttempts <= attemptsToLogin) {
                                    accountLockTime = moment(result.AccountLockedTimestamp);
                                    currentTime = moment(new Date());
                                    //timeDuration = accountLockedTime * 24 * 60 * 60 * 1000;
                                    timeDuration = accountLockedTime * 60 * 1000;
                                    timeDifference = currentTime.diff(accountLockTime);
                                    if (timeDifference >= timeDuration) {
                                        login.findAndModify({ UserID: userID }, [], { $set: { AccountLocked: false, AttemptsToLogin: 0 } }, { remove: false, new: true, upsert: false, fields: { Password: 0, OldPasswords: 0, PasswordAssignedTimestamp: 0, AccountLockedTimestamp: 0 } }, function (err, resp) {
                                            if (err)
                                                return callback(err, null, null, null);
                                            else {
                                                securityGroups.find({ SecurityID: resp.value.SecurityGroup }).toArray(function (err, res) {
                                                    if (err)
                                                        return callback(err, null, null, null);
                                                    else if (res.length === 0) {
                                                        return callback(new Error("Security Group Not available, can't login"), null, null, null)
                                                    } else {
                                                        systemSettingsCollection.find({ Settings: { $in: ["Communications", "Miscellaneous", "Reporting"] }, "Type.Status": "Updated" }).toArray(function (err, sysSettings) {
                                                            if (err)
                                                                return callback(err, null, null, null);
                                                            else
                                                                return callback(null, resp.value, res[0], sysSettings);
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        return callback(new Error("Account is Locked. Can't Login"), null, null, null);
                                    }
                                } else {
                                    return callback(new Error("Account is Locked. Can't Login"), null, null, null);
                                }
                            } else {
                                return callback(new Error("Account is Locked. Can't Login"), null, null, null);
                            }
                        });
                    } else {
                        var passwordAge, passwordDuration, passwordChangeTime, timeDifferences, currentDateTime;
                        passwordSett.find({ 'Type.Status': "Updated", $or: [{ 'Type.Settings.EnablePasswordPolicy': true }, { 'Type.Settings.EnablePasswordPolicy': "true" }] }).toArray(function (err, out) {
                            if (err)
                                return callback(err, null, null);
                            else if (out.length > 0) {
                                currentDateTime = moment(new Date());
                                passwordAge = out[0].Type.Settings.MaximumPasswordAge;
                                passwordDuration = passwordAge * 24 * 60 * 60 * 1000;
                                passwordChangeTime = moment(result.PasswordAssignedTimestamp);
                                timeDifferences = currentDateTime.diff(passwordChangeTime);
                                if (timeDifferences >= passwordDuration) {
                                    var error = new Error("Change Password");
                                    error.status = 101;
                                    return callback(error, result.LoginID, null, null);
                                } else {
                                    loginFindAndModify(login, securityGroups, systemSettingsCollection, userID, function (err, userDet, securityGrpDet, sysSettings) {
                                        if (err)
                                            return callback(err, null, null, null);
                                        else {
                                            return callback(null, userDet, securityGrpDet, sysSettings);
                                        }
                                    });
                                }
                            } else {
                                loginFindAndModify(login, securityGroups, systemSettingsCollection, userID, function (err, userDet, securityGrpDet, sysSettings) {
                                    if (err)
                                        return callback(err, null, null, null);
                                    else {
                                        return callback(null, userDet, securityGrpDet, sysSettings);
                                    }
                                });
                            }
                        });
                    }
                }
            })
        }
    });
};

/**
* @description -  find and update user details
* @param loginCollection  - user collection name
* @param securitGroupCollection  - security group collection name
* @param systemSettingsCollection  - system settings collection name
* @param userID  - user id 
* @param callback - callback function returns success or error response
* @return callback function
*/
function loginFindAndModify(loginCollection, securitGroupCollection, systemSettingsCollection, userID, callback) {
    loginCollection.findAndModify({ UserID: userID }, [], { $set: { AttemptsToLogin: 0 } }, { remove: false, new: true, upsert: false, fields: { Password: 0, OldPasswords: 0, PasswordAssignedTimestamp: 0, AccountLockedTimestamp: 0 } }, function (err, response) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else {
            securitGroupCollection.find({ SecurityID: response.value.SecurityGroup }).toArray(function (err, res) {
                if (err)
                    return callback(err, null, null);
                else if (res.length === 0)
                    return callback(new Error("Security Group Not available, can't login").null, null)
                else
                    systemSettingsCollection.find({ Settings: { $in: ["Communications", "Miscellaneous", "Reporting"] }, "Type.Status": "Updated" }).toArray(function (err, sysSettings) {
                        if (err)
                            return callback(err, null, null, null);
                        else
                            return callback(null, response.value, res[0], sysSettings);
                    });
            });
        }
    });
}

/**
* @description -  get tag Discrepancies, For the Webservice - HSMTagDiscrepancies
* @param collectionName  - name of mongo collection
* @param type  - device type
* @param startTime - start time
* @param endTime - end time
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectTagDiscrepanciesFromMongoDB(collectionName, type, startTime, endTime, callback) {
    var regex = { TagDiscrepanciesDevice: type, $and: [{ FirstFoundTime: { $gte: new Date(startTime) } }, { FirstFoundTime: { $lte: new Date(endTime) } }] }
    collectionName.find(regex).sort({ FirstFoundTime: -1 }).toArray(function (err, tagDiscrepancies) {
        if (err)
            return callback(err, null);
        else if (tagDiscrepancies.length === 0)
            return callback(new Error(type + " Tag Dicrepancies not available in the System"), null);
        else
            return callback(null, tagDiscrepancies);
    });
};

/**
* @description - jobs list , For the Webservice - JobsList 
* @param type - device type
* @param startTime  - start time
* @param endTime  - end time
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectJobStatus(jobsCollection, type, startTime, endTime, callback) {
    var regex;
    if (type === "All")
        regex = { "CreatedDateTimestamp": { $gte: new Date(startTime), $lte: new Date(endTime) } };
    else
        regex = { DeviceType: type, "CreatedDateTimestamp": { $gte: new Date(startTime), $lte: new Date(endTime) } }
    jobsCollection.find(regex).sort({ CreatedDateTimestamp: -1 }).toArray(function (err, networkJobStatusSM) {
        if (err)
            callback(err, null);
        else if (networkJobStatusSM.length === 0)
            callback(new Error("Job Status not available in the System"), null);
        else
            callback(null, networkJobStatusSM);
    });
};

// 

/**
* @description -  get security codes,For the Webservice - HSMSecurityCodeMgmt
* @param collectionName  - collection Name
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectSecurityCodesHSMFromMongoDB(collectionName, callback) {
    collectionName.find({ DeviceClassType: "HyperSprout" }, { DeviceClassID: 1, ClassName: 1, Primary: 1, Secondary: 1, Tertiary: 1, Quarternary: 1, EncryptionType1: 1, EncryptionKeyID1: 1, EncryptionKey1: 1, EncryptionType2: 1, EncryptionKeyID2: 1, EncryptionKey2: 1, EncryptionType3: 1, EncryptionKeyID3: 1, EncryptionKey3: 1 }).toArray(function (err, securityCodes) {
        if (err)
            callback(err, null);
        else if (securityCodes.length === 0)
            callback(new Error("Security Codes not available in the System"), null);
        else
            callback(null, securityCodes);
    });
};

/**
* @description - select security code for Meter, For the Webservice - MMSecurityCodeMgmt
* @param collectionName  - mongoDB collection Name
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectSecurityCodeMMFromMongoDB(collectionName, callback) {
    collectionName.find({ DeviceClassType: "Meter" }, { DeviceClassID: 1, ClassName: 1, Primary: 1, Secondary: 1, Tertiary: 1, Quarternary: 1, EncryptionType1: 1, EncryptionKeyID1: 1, EncryptionKey1: 1, EncryptionType2: 1, EncryptionKeyID2: 1, EncryptionKey2: 1, EncryptionType3: 1, EncryptionKeyID3: 1, EncryptionKey3: 1 }).toArray(function (err, securityCodesMM) {
        if (err)
            callback(err, null);
        else if (securityCodesMM.length === 0)
            callback(new Error("Security Codes not available in the System"), null);
        else
            callback(null, securityCodesMM);
    });
};

/**
* @description -  save hypersprout security , For the Webservice - HSMSecuritySave
* @param updateHSMSecuritySaveValues  -  values object
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateSecuritySaveHSMFromMongoDB(collectionName, updateHSMSecuritySaveValues, callback) {
    collectionName.update({ DeviceClassID: updateHSMSecuritySaveValues.DeviceClassID }, { $set: updateHSMSecuritySaveValues }, function (err, securitySaveHSM) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (securitySaveHSM != null)
            callback(null, securitySaveHSM);
        else
            callback(new Error("Device Encryption Codes not available in the System"), null);
    });
};

/**
* @description -  save hypersprout security , For the Webservice - MMSecuritySave
* @param updateMMSecuritySaveValues  -  values object
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateSecuritySaveMMFromMongoDB(collectionName, updateMMSecuritySaveValues, callback) {
    collectionName.update({ DeviceClassID: updateMMSecuritySaveValues.DeviceClassID }, { $set: updateMMSecuritySaveValues }, function (err, securitySaveMM) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (securitySaveMM != null)
            callback(null, securitySaveMM);
        else
            callback(new Error("Device Encryption Codes not available in the System"), null);
    });
};

/**
* @description -  For the Webservice - HSMSecurityAssignDeviceSecCodeSave
* @param collectionName 
* @param updateHSMAssignDeviceSecCodeValues 
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateAssignDeviceSecurityCodeHSMFromMongoDB(collectionName, updateHSMAssignDeviceSecCodeValues, callback) {
    collectionName.update({ DeviceClassID: updateHSMAssignDeviceSecCodeValues.DeviceClassID }, { $set: updateHSMAssignDeviceSecCodeValues }, function (err, assignDeviceSecCodeHSM) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (assignDeviceSecCodeHSM == null)
            callback(new Error("Device Security Codes not available in the System"), null);
        else
            callback(null, assignDeviceSecCodeHSM);
    });
};


/**
* @description -  For the Webservice - MMSecurityAssignDeviceSecCodeSave
* @param collectionName 
* @param updateMMAssignDeviceSecCodeValues - values to be updated
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateAssignDeviceSecurityCodeMMFromMongoDB(collectionName, updateMMAssignDeviceSecCodeValues, callback) {
    collectionName.update({ DeviceClassID: updateMMAssignDeviceSecCodeValues.DeviceClassID }, { $set: updateMMAssignDeviceSecCodeValues }, function (err, assignDeviceSecCodeMM) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (assignDeviceSecCodeMM == null)
            callback(new Error("Device Security Codes not available in the System"), null);
        else
            callback(null, assignDeviceSecCodeMM);
    });
};

/**
* @description -  find all documents
* @param CollectionName
* @param ConfigID 
* @param callback - callback function returns success or error response
* @return callback function
*/
function findAllDoc(CollectionName, ConfigID, callback) {
    CollectionName.find({ ConfigID: ConfigID }).toArray(function (err, docs) {
        if (err)
            return callback(err, null);
        else if (docs.length === 0)
            return callback(new Error("Configuration ID Not Found"), null);
        else
            return callback(null, docs);
    });
}

/**
* @description - update values in mongoDB 
* @param collection1
* @param collection2
* @param updateValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateFieldValues(collection1, collection2, updateValues, callback) {
    collection1.find({ ConfigID: updateValues.ConfigID, Type: updateValues.Type, ConfigProgramName: updateValues.ConfigProgramName }).toArray(function (err, resp) {
        if (err)
            return callback(err, null);
        else if (resp.length > 0)
            return callback(new Error("Configuration Group Already attached to the Config Program"), null);
        else {
            collection2.find({ Name: updateValues.ConfigProgramName, Type: updateValues.Type }).toArray(function (err, result) {
                if (err)
                    return callback(err, null);
                else if (result.length === 0)
                    return callback(new Error("No Config Program with this name available"), null);
                else {
                    var configGroups_Info = result[0].ConfigGroups_Info;
                    collection1.update({ ConfigID: updateValues.ConfigID, Type: updateValues.Type }, { $set: { ConfigProgramName: updateValues.ConfigProgramName, ConfigGroups_Info: configGroups_Info } }, function (err, res) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else if (res.result.nModified === 0)
                            return callback(new Error("Configuration Group couldn't be updated"), null);
                        else
                            return callback(null, res);
                    });
                }
            });
        }
    });
}

/**
* @description - get user detail  
* @param collectionName
* @param userID 
* @param callback - callback function returns success or error response
* @return callback function
*/
function getUserDetail(collectionName, userID, callback) {
    collectionName.find({ UserID: userID }, { UserID: 1, FirstName: 1, LastName: 1, HomePage: 1, TimeZone: 1, EmailAddress: 1, SecurityGroup: 1, Temprature: 1, AccountLocked: 1, _id: 0 }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else if (result.length === 0)
            callback(new Error("UserID not found"), null);
        else
            callback(null, result);
    });
}

/**
* @description -  check password length
* @param collectionName
* @param password
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkPasswordLength(collectionName, password, callback) {
    collectionName.find({ 'Type.Status': "Updated", $or: [{ 'Type.Settings.EnablePasswordPolicy': true }, { 'Type.Settings.EnablePasswordPolicy': "true" }] }, { 'Type.Settings.MinimumPasswordLength': 1, _id: 0 }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else {
            if (result.length === 0) {
                if (password.length >= 6)
                    callback(null, "Okay");
                else
                    callback(new Error("Password doesn't meet minimum length requirement"), null);
            } else {
                var len = result[0].Type.Settings.MinimumPasswordLength;
                if (password.length >= len)
                    callback(null, "Okay");
                else
                    callback(new Error("Password doesn't meet minimum length requirement"), null);
            }
        }
    });
}

/**
* @description -  check old password
* @param collectionName
* @param loginId 
* @param password
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkOldPassword(collectionName, loginId, password, callback) {
    collectionName.find({ LoginID: loginId }).toArray(function (err, res) {
        if (err)
            callback(err, null);
        else if (res.length === 0)
            callback(new Error("User not available in the system"), null);
        else {
            comparePassword(password, res[0].Password, function (err, isPasswordMatch) {
                if (err)
                    callback(err, null);
                else if (!isPasswordMatch)
                    callback(new Error("Password entered is wrong"), null);
                else
                    callback(null, res);
            });
        }
    });
}

/**
* @description -  update user fields
* @param - collection, userID, loginId, firstName, lastName, emailAdd, homePage, timeZone, temprature, callback
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateUserFields(collection, userID, loginId, firstName, lastName, emailAdd, homePage, timeZone, temprature, callback) {
    collection.find({ LoginID: loginId }).toArray(function (err, res) {
        if (err)
            callback(err, null)
        else if (res.length === 0)
            callback(new Error("User not available in the System"), null);
        else {
            if (userID !== res[0].UserID) {
                //UserID is also being Changed, so checking availability of its first
                collection.find({ UserID: { $ne: userID } }).toArray(function (err, response) {
                    if (err)
                        callback(err, null);
                    else if (response.length > 0)
                        callback(new Error("UserID entered is not Unique"), null);
                    else {
                        collection.find({ $and: [{ EmailAddress: emailAdd }, { UserID: { $ne: userID } }] }).toArray(function (err, result) {
                            if (err)
                                callback(err, null);
                            else if (result.length > 0)
                                callback(new Error("Email ID already attached to other UserID"), null);
                            else {
                                collection.update({ LoginID: loginId }, { $set: { UserID: userID, FirstName: firstName, LastName: lastName, HomePage: homePage, TimeZone: timeZone, EmailAddress: emailAdd, Temprature: temprature } }, function (err, resp) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else
                                        callback(null, "User Details updated");
                                });
                            }
                        });
                    }
                });
            } else {
                collection.find({ $and: [{ EmailAddress: emailAdd }, { UserID: { $ne: userID } }] }).toArray(function (err, response) {
                    if (err)
                        callback(err, null);
                    else if (response.length > 0)
                        callback(new Error("Email ID already attached to other UserID"), null);
                    else {
                        collection.update({ LoginID: loginId }, { $set: { FirstName: firstName, LastName: lastName, HomePage: homePage, TimeZone: timeZone, EmailAddress: emailAdd, Temprature: temprature } }, function (err, result) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else
                                callback(null, "User Details updated");
                        });
                    }
                });
            }
        }
    });
}

/**
* @description - update password  
* @param userCollection
* @param passwordSettingsCollection
* @param loginId
* @param newPassword
* @param callback - callback function returns success or error response
* @return callback function
*/
function updatePassword(userCollection, passwordSettingsCollection, loginId, newPassword, callback) {
    passwordSettingsCollection.find({ 'Type.Status': "Updated" }).toArray(function (err, res) {
        if (err)
            callback(err, null);
        else if (res.length === 0)
            callback(new Error("No Password Settings in DB"), null);
        else {
            var passwordsToStore;
            var storedPasswords = [];
            if ((res[0].Type.Settings.EnablePasswordPolicy === true) || (res[0].Type.Settings.EnablePasswordPolicy === "true"))
                passwordsToStore = res[0].Type.Settings.NumberofPasswordstoStore;
            else
                passwordsToStore = 0;
            userCollection.find({ LoginID: loginId }).toArray(function (err, response) {
                if (err)
                    callback(err, null);
                else if (response.length === 0)
                    callback(new Error("User not Found"), null);
                else {
                    storedPasswords = response[0].OldPasswords;
                    async.waterfall([
                        function (callback) {
                            async.each(storedPasswords,
                                function (storedPassword, callback) {
                                    comparePassword(newPassword, storedPassword, function (err, isPasswordMatch) {
                                        if (err)
                                            return callback(err, null);
                                        else if (isPasswordMatch)
                                            return callback(new Error("Password matches old Password(s)"), null);
                                        else
                                            return callback(null, "Success");
                                    });
                                },
                                function (err) {
                                    if (err)
                                        callback(err, null);
                                    else
                                        callback(null, "Success");
                                });
                        },
                        function (input, callback) {
                            cryptPassword(newPassword, function (err, hashPassword) {
                                if (err)
                                    callback(err, null);
                                else {
                                    if (passwordsToStore === 0)
                                        storedPasswords = [];
                                    else if (passwordsToStore <= storedPasswords.length) {
                                        while (storedPasswords.length >= passwordsToStore) {
                                            storedPasswords.shift();
                                        }
                                        storedPasswords.push(hashPassword);
                                    } else
                                        storedPasswords.push(hashPassword);
                                    userCollection.update({ LoginID: loginId }, { $set: { Password: hashPassword, OldPasswords: storedPasswords, PasswordAssignedTimestamp: new Date() } }, function (err, resp) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else if (resp.result.nModified === 0)
                                            callback(new Error("Password couldn't be updated"), null);
                                        else
                                            return callback(null, "Password updated");
                                    });
                                }
                            });
                        }
                    ], function (error, success) {
                        if (error)
                            callback(error, null);
                        else
                            callback(null, success);
                    });
                }
            });
        }
    });
}

/**
* @description -  list of security ID's
* @param collectionName 
* @param callback - callback function returns success or error response
* @return callback function
*/
function listSecurityIDs(collectionName, callback) {
    collectionName.distinct('SecurityID', function (err, result) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else {
            if (result.length === 0)
                callback(new Error("Security ID not available"), null);
            else
                callback(null, result);
        }
    });
}

/**
* @description -  add security group
* @param securityID - security ID
* @param collection - collection name
* @param description - description
* @param functions - security attributes object
* @param callback - callback function returns success or error response
* @return callback function
*/
function addSecurityGroup(collection, securityID, description, functions, callback) {
    collection.find({ SecurityID: securityID }).toArray(function (err, res) {
        if (err)
            callback(err, null);
        else {
            if (res.length > 0)
                callback(new Error("Security ID not Unique"), null);
            else {
                collection.insert({ SecurityID: securityID, Description: description, Functions: functions }, function (err, result) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (result.result.nModified === 0)
                        callback(new Error("Couldn't add Security Group"), null);
                    else
                        callback(null, "Security Group Added into the System");
                });
            }
        }
    });
}

/**
* @description -  security group details by security ID
* @param collection
* @param callback - callback function returns success or error response
* @return callback function
*/
function returnSecurityGroupDetails(collection, securityID, callback) {
    collection.find({ SecurityID: securityID }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else {
            if (result.length === 0)
                callback("Security Group not available", null);
            else
                callback(null, result);
        }
    });
}

/**
* @description - get all security group details
* @param collection
* @param collection1
* @param callback - callback function returns success or error response
* @return callback function
*/
function getSecurityGroupDetails(collection, data, callback) {
    getSecurityGroupFromDELTA_WithPagination(data, function (err, SecurityGroups) {
        if (err)
            callback(err, null, null);
        else {
            if (SecurityGroups.length === 0) {
                callback(new Error("No Security Groups in System"), null, null);
            } else {
                let securityIDs = [];
                let grpDetails = [];
                // Removing unwanted characters from listHS.
                for (var key in SecurityGroups.results) {
                    if (SecurityGroups.results.hasOwnProperty(key))
                        securityIDs.push(SecurityGroups.results[key].SecurityID);
                }
                async.each(securityIDs,
                    function (securityID, callback) {
                        collection.count({ SecurityGroup: securityID }, function (err, count) {
                            if (err)
                                callback(err, null, null);
                            else {
                                var group = {
                                    "SecurityID": securityID,
                                    "Count": count
                                };
                                grpDetails.push(group);
                                callback(null, SecurityGroups, grpDetails);
                            }
                        });
                    },
                    function (err) {
                        if (err)
                            callback(err, null, null);
                        else
                            callback(null, SecurityGroups, grpDetails);
                    });
            }
        }
    });
}

/**
* @description - update security group details 
* @param collection
* @param securityID
* @param description
* @param functions
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateSecurityGroupDetails(collection, securityID, description, functions, callback) {
    if (securityID === "Administrator")
        callback(new Error("Can't Edit Administrator Security Group"), null);
    else {
        collection.update({ SecurityID: securityID }, { $set: { Description: description, Functions: functions } }, function (err, result) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                if (result.result.nModified === 0)
                    callback(new Error("Invalid SecurityID OR No updated values in the payload"), null);
                else
                    callback(null, "Security Group Details Updated");
            }
        });
    }
}

/**
* @description -  remove security group by securityID
* @param collection
* @param collection1
* @param securityID
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeSecurityGroup(collection, collection1, securityID, callback) {
    if (securityID === "Administrator") {
        callback(new Error("Can't delete Administrator Security Group"), null);
    } else {
        collection1.find({ SecurityGroup: securityID }).toArray(function (err, res) {
            if (err)
                callback(err, null)
            else if (res.length > 0)
                callback(new Error("Users attached to the Security Group, Can't Delete"), null);
            else {
                collection.remove({ SecurityID: securityID }, function (err, result) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        if (result.result.n === 0)
                            callback(new Error("Security Group not available"), null);
                        else
                            callback(null, "Security Group Deleted");
                    }
                });
            }
        });
    }
}

/**
* @description - upgrade password settings 
* @param collectionName 
* @param settings -  object of settings
* @param callback - callback function returns success or error response
* @return callback function
*/
function upgradePasswordSettings(collectionName, settings, callback) {
    collectionName.update({ 'Type.Status': "Updated" }, { $set: { 'Type.Settings': settings } }, function (err, result) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else {
            if (result.result.nModified === 0)
                callback(new Error("Password Settings couldn't be updated"), null);
            else
                callback(null, "Password Settings Updated");
        }
    });
}

/**
* @description - default password settings 
* @param collectionName
* @param callback - callback function returns success or error response
* @return callback function
*/
function defaultPasswordSettings(collectionName, callback) {
    collectionName.find({ "Type.Status": "Default" }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else {
            if (result.length === 0)
                callback(new Error("Default Settings not available in System"), null);
            else {
                //convert string to object
                var resultObject = JSON.parse(JSON.stringify(result));

                var passwordSettings = {};
                passwordSettings.MaximumPasswordAge = resultObject[0].Type.Settings.MaximumPasswordAge;
                if (passwordSettings.MaximumPasswordAge < 10 || passwordSettings.MaximumPasswordAge > 999) {

                    passwordSettings.MaximumPasswordAge = 999;
                }
                passwordSettings.NumberofPasswordstoStore = resultObject[0].Type.Settings.NumberofPasswordstoStore
                passwordSettings.MaximumLogonFailuresbeforeLockout = resultObject[0].Type.Settings.MaximumLogonFailuresbeforeLockout
                passwordSettings.LockoutDuration = resultObject[0].Type.Settings.LockoutDuration
                passwordSettings.MinimumPasswordLength = resultObject[0].Type.Settings.MinimumPasswordLength
                passwordSettings.EnablePasswordPolicy = resultObject[0].Type.Settings.EnablePasswordPolicy
                collectionName.update({ 'Type.Status': "Updated" }, { $set: { 'Type.Settings': passwordSettings } }, function (err, result) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        if (result.result.nModified === 0)
                            console.log("Password Settings couldn't be updated")
                        else
                            console.log("Password Settings Updated")
                    }
                });
                callback(null, result);
            }
        }
    });
}

/**
* @description - update password settings 
* @param collectionName
* @param callback - callback function returns success or error response
* @return callback function
*/
function updatedPasswordSettings(collectionName, callback) {
    collectionName.find({ "Type.Status": "Updated" }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else {
            if (result.length === 0)
                callback(new Error("Updated Settings not available in System"), null);
            else
                callback(null, result);
        }
    });
}

/**
* @description -  list of user ids
* @param collectionName
* @param callback - callback function returns success or error response
* @return callback function
*/
function listUserIDs(collectionName, callback) {
    collectionName.distinct('UserID', { UserType: { $ne: "Consumer" } }, function (err, result) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else {
            if (result.length === 0)
                callback(new Error("UserID not available"), null);
            else
                callback(null, result);
        }
    });
}

/**
* @description -  add new user
* @param startTime, collectionName, collection1, userID, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, callback
* @return callback function
*/
function addNewUser(collectionName, collection1, userID, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, mobileNumber, callback) {
    collection1.find({ 'Type.Status': "Updated" }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else {
            if (result.length === 0) {
                callback(new Error("No Password Settings in DB"), null);
            } else {
                var len;
                var passwordsToStore;
                var storedPassword = [];
                if ((result[0].Type.Settings.EnablePasswordPolicy === true) || (result[0].Type.Settings.EnablePasswordPolicy === "true")) {
                    len = result[0].Type.Settings.MinimumPasswordLength;
                    passwordsToStore = result[0].Type.Settings.NumberofPasswordstoStore;
                } else {
                    len = 6;
                    passwordsToStore = 0
                }
                var password = generator.generate({
                    length: len,
                    numbers: true
                });
                cryptPassword(password, function (err, hashPassword) {
                    if (err)
                        callback(err, null);
                    else {
                        var loginID = shortid.generate();
                        if (passwordsToStore > 0)
                            storedPassword.push(hashPassword);
                        var user = {
                            "UserID": userID,
                            "LoginID": loginID,
                            "FirstName": firstName,
                            "LastName": lastName,
                            "EmailAddress": emailAdd,
                            "SecurityGroup": securityGroup,
                            "HomePage": homePage,
                            "TimeZone": timeZone,
                            "Temprature": temprature,
                            "MobileNumber":mobileNumber,
                            "Password": hashPassword,
                            "PasswordAssignedTimestamp": new Date(),
                            "AccountLocked": accountLocked,
                            "AccountLockedTimestamp": new Date(),
                            "AttemptsToLogin": 0,
                            "OldPasswords": storedPassword,
                            "SuperUser": false
                        };

                        collectionName.find({ $or: [{ UserID: userID }, { EmailAddress: emailAdd }] }).toArray(function (err, res) {
                            if (err)
                                callback(err, null);
                            else {
                                if (res.length > 0) {
                                    callback(new Error("User ID/Email Already Exist"), null);
                                }
                                else {
                                    collectionName.insertOne(user, function (err, resp) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            var to_email = emailAdd;
                                            var email_subject = "Delta Account Details";
                                            var email_content = "Username: " + userID + "\nPassword: " + password;
                                            email.sendNewUserPassword(to_email, email_subject, email_content, "NewUser", function (err, successful) {
                                                if (err)
                                                    return callback(err, null);
                                                else
                                                    return callback(null, "User added & Login Details emailed");
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    });
}

/**
* @description -  edit user details 
* @param collection, userID, loginId, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, callback
* @return callback function
*/
function editUserDetails(collection, userID, loginId, firstName, lastName, emailAdd, securityGroup, homePage, timeZone, accountLocked, temprature, mobileNumber, callback) {
    collection.find({ LoginID: loginId }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else if (result.length === 0)
            callback("No User with this LoginID available", null);
        else {
            var user = {
                "UserID": userID,
                "FirstName": firstName,
                "LastName": lastName,
                "EmailAddress": emailAdd,
                "SecurityGroup": securityGroup,
                "HomePage": homePage,
                "TimeZone": timeZone,
                "Temprature": temprature,
                "AccountLocked": accountLocked,
                "MobileNumber": mobileNumber,
            }
            
            if( securityGroup === result.SecurityGroup){
                user.permissionChange = false
            }
            else{
                user.permissionChange = true
            }

            if (userID !== result[0].UserID) {
                //UserID is also being Changed, so checking availability of its first
                collection.find({ UserID: userID }).toArray(function (err, response) {
                    if (err)
                        callback(err, null);
                    else if (response.length > 0)
                        callback("UserID entered is not Unique", null);
                    else
                        checkEmailAndUpdateUser(collection, loginId, user, result[0], callback);
                });
            } else
                checkEmailAndUpdateUser(collection, loginId, user, user, callback);
        }
    });
}

/**
* @description -  check email and update user
* @param collection 
* @param loginId
* @param newUserDetails
* @param OldDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkEmailAndUpdateUser(collection, loginId, newUserDetails, OldDetails, callback) {
    collection.find({ $and: [{ EmailAddress: newUserDetails.EmailAddress }, { UserID: { $ne: OldDetails.UserID } }] }).toArray(function (err, res) {
        if (err)
            callback(err, null);
        else if (res.length > 0)
            callback("Email ID already attached to other UserID", null);
        else {
            if (((OldDetails.AccountLocked === true) || (OldDetails.AccountLocked === "true")) && ((newUserDetails.AccountLocked === false) || (newUserDetails.AccountLocked === "false"))) {
                newUserDetails.AttemptsToLogin = 0;
            }
            collection.update({ LoginID: loginId }, { $set: newUserDetails }, function (err, result) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else
                    callback(null, "User Details updated");
            });
        }
    });
}

/**
* @description -  password reset
* @param collection 
* @param collection1
* @param userID
* @param callback - callback function returns success or error response
* @return callback function
*/
function passwordReset(collection, collection1, userID, callback) {
    try {
        collection1.find({ 'Type.Status': "Updated" }).toArray(function (err, result) {
            if (err)
                callback(err, null);
            else {
                if (result.length === 0)
                    callback(new Error("No Password Settings in DB"), null);
                else {
                    var len;
                    var passwordsToStore;
                    var storedPasswords = [];
                    if ((result[0].Type.Settings.EnablePasswordPolicy === true) || (result[0].Type.Settings.EnablePasswordPolicy === "true")) {
                        len = result[0].Type.Settings.MinimumPasswordLength;
                        passwordsToStore = result[0].Type.Settings.NumberofPasswordstoStore;
                    } else {
                        len = 6;
                        passwordsToStore = 0;
                    }
                    var password = generator.generate({
                        length: len,
                        numbers: true,
                        symbols: true
                    });
                    cryptPassword(password, function (err, hashPassword) {
                        if (err)
                            callback(err, null);
                        else {
                            collection.find({ UserID: userID }).toArray(function (err, response) {
                                if (err)
                                    callback(err, null);
                                else if (response.length === 0)
                                    callback(new Error("User not Found"), null);
                                else {
                                    storedPasswords = response[0].OldPasswords;
                                    if (passwordsToStore === 0)
                                        storedPasswords = [];
                                    else if (passwordsToStore <= storedPasswords.length) {
                                        while (storedPasswords.length >= passwordsToStore) {
                                            storedPasswords.shift();
                                        }
                                        storedPasswords.push(hashPassword);
                                    } else
                                        storedPasswords.push(hashPassword);
                                    collection.update({ UserID: userID }, { $set: { Password: hashPassword, OldPasswords: storedPasswords, PasswordAssignedTimestamp: new Date() } }, function (err, res) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else if (res.result.nModified === 0)
                                            callback(new Error("Password could not be resetted"), null);
                                        else {
                                            var to_email = response[0].EmailAddress;
                                            var email_subject = "Delta Account Details";
                                            var email_content = "Username: " + response[0].UserID + "\n" + "Password: " + password;
                                            email.sendNewUserPassword(to_email, email_subject, email_content, "PasswordReset", function (err, successful) {
                                                if ((err !== null) && (err.message !== "Password Reseted, but Email couldn't be sent"))
                                                    callback(err, null);
                                                else
                                                    return callback(null, "Password was Reset & Emailed");
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    } catch (exc) {
        return callback(exc, null);
    }
}

/**
* @description - delete user 
* @param collection
* @param userID
* @param callback - callback function returns success or error response
* @return callback function
*/
function userDelete(collection, userID, callback) {
    collection.find({ UserID: userID }).toArray(function (err, result) {
        if (err) {
            callback(err, null);
        }

        else if (result.length === 0) {
            callback(new Error("User not available"), null);
        }

        else if (result[0].SuperUser === true) {
            callback(new Error("Can't Delete Super User"), null);
        }

        else {
            collection.remove({ UserID: userID }, function (err, res) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (res.result.ok === 0)
                    callback(new Error("User couldn't be Deleted"), null);
                else
                    callback(null, "User Deleted");
            })
        }
    });
}

/**
* @description -  get user details
* @param data - get the pagination and search details
* @param callback - callback function returns success or error response
* @return callback function
*/
function getUsersDetails(data, callback) {
    //filter for locked user


    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            let collectionName = "delta_User"
            var mongoCollection = db[collectionName];

            if (data.filter) {
                if (data.search) {
                    let whereCondition = { UserType: { $ne: "Consumer" }, "AccountLocked": true, UserID: { $regex: new RegExp(data.search, "i") } };
                    paginatedResults.paginatedResults(mongoCollection, whereCondition, data, "User", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                } else {
                    let whereCondition = { $and: [{ UserType: { $ne: "Consumer" } }, { "AccountLocked": true }] };
                    paginatedResults.paginatedResults(mongoCollection, whereCondition, data, "User", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                }
            }
            else {
                if (!data.search || data.search == null || data.search == "null") {
                    let whereCondition = { UserType: { $ne: "Consumer" } };
                    paginatedResults.paginatedResults(mongoCollection, whereCondition, data, "User", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                } else {
                    let whereCondition = { UserType: { $ne: "Consumer" }, UserID: { $regex: new RegExp(data.search, "i") } };
                    paginatedResults.paginatedResults(mongoCollection, whereCondition, data, "User", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                }
            }
        }
    })


    // collectionName.find({ UserType: { $ne: "Consumer" } }, { UserID: 1, LoginID: 1, FirstName: 1, LastName: 1, EmailAddress: 1, SecurityGroup: 1, HomePage: 1, TimeZone: 1, Temprature: 1, AccountLocked: 1, SuperUser: 1, _id: 0 }).toArray(function (err, result) {
    //     if (err)
    //         callback(err, null);
    //     else {
    //         if (result.length === 0)
    //             callback(new Error("No User available"), null);
    //         else
    //             callback(null, result);
    //     }
    // });
}

/**
* @description -  update system settings
* @param collectionName
* @param settings
* @param tabVal
* @param callback - callback function returns success or error response
* @return callback function
*/
function upgradeSystemSettings(collectionName, settings, tabVal, status, callback) {
    collectionName.update({ Settings: tabVal, 'Type.Status': status }, { $set: { 'Type.Values': settings } }, function (err, result) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else {
            callback(null, tabVal + " Settings Updated");
        }
    });
}

/**
* @description -  default system settings
* @param collectionName
* @param tabVal 
* @param callback - callback function returns success or error response
* @return callback function
*/
function defaultSystemSettings(collectionName, tabVal, callback) {
    collectionName.find({ Settings: tabVal, "Type.Status": "Default" }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else {
            if (result.length === 0)
                callback(new Error("Default Settings not available in System"), null);
            else
                callback(null, result);
        }
    });
}

/**
* @description -  update system settings
* @param settings 
* @param callback - callback function returns success or error response
* @return callback function
*/
function updatedSystemSettings(collectionName, settings, callback) {
    collectionName.find({ Settings: { $in: settings }, "Type.Status": "Updated" }).toArray(function (err, result) {
        if (err)
            callback(err, null);
        else {
            if (result.length === 0)
                callback(new Error("Updated Settings not available in System"), null);
            else
                callback(null, result);
        }
    });
}

/**
* @description -  get HSApp ID From AppGroups By Condition
* @param GroupName
* @param serialNumbers 
* @param Action
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function getHSAppIDFromDELTA_AppGroupsByCondition(GroupName, serialNumbers, Action, type, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var collectionName = db.delta_AppGroups;
                findAppID(collectionName, GroupName, type, function (err, docs) {
                    if (err)
                        callback(err, null, null);
                    else {
                        var collection2;
                        if (type === "HyperSprout")
                            collection2 = db.delta_Hypersprouts;
                        else
                            collection2 = db.delta_Meters;
                        findAllMatchingDocuments(collection2, serialNumbers, docs, type, function (err, serialNumbersWhichHaveAppID, serialNumbersWhichDoNotHaveAppID) {
                            if (err)
                                return callback(err, null, null);
                            else {
                                switch (Action) {
                                    case "Add":
                                        if (serialNumbersWhichDoNotHaveAppID.length !== 0) {
                                            var serialNumbersToAssignAppID = [];
                                            var serialNumbersNotToProcess = [];
                                            for (var count in serialNumbersWhichDoNotHaveAppID) {
                                                if (type === "HyperSprout") {
                                                    if (serialNumbersWhichDoNotHaveAppID[count].AppIDs.length < 8) {
                                                        serialNumbersToAssignAppID.push(serialNumbersWhichDoNotHaveAppID[count].HypersproutSerialNumber);
                                                    } else {
                                                        serialNumbersNotToProcess.push(serialNumbersWhichDoNotHaveAppID[count].HypersproutSerialNumber);
                                                    }
                                                } else {
                                                    if (serialNumbersWhichDoNotHaveAppID[count].AppIDs.length < 8) {
                                                        serialNumbersToAssignAppID.push(serialNumbersWhichDoNotHaveAppID[count].MeterSerialNumber);
                                                    } else {
                                                        serialNumbersNotToProcess.push(serialNumbersWhichDoNotHaveAppID[count].MeterSerialNumber);
                                                    }
                                                }
                                            }
                                            serialNumbersNotToProcess = serialNumbersNotToProcess.concat(serialNumbersWhichHaveAppID);
                                            if (serialNumbersToAssignAppID.length !== 0) {
                                                updateAppGroups(collection2, docs, serialNumbersToAssignAppID, type, function (err, result) {
                                                    if (err)
                                                        callback(err, null, null);
                                                    else
                                                        callback(null, result, serialNumbersNotToProcess);
                                                });
                                            } else {
                                                return callback(new Error('Serial Number limit exceeded'), null, serialNumbersNotToProcess);
                                            }
                                        } else {
                                            return callback(new Error('No Serial Number found to ADD'), null, serialNumbersWhichHaveAppID);
                                        }
                                        break;
                                    case "Remove":
                                        if (serialNumbersWhichHaveAppID.length === 0) {
                                            return callback(new Error('No Serial Number found to remove'), null, serialNumbersWhichDoNotHaveAppID);
                                        } else {
                                            var serialNumbersToRemoveAppID = [];
                                            for (var key in serialNumbersWhichHaveAppID) {
                                                if (type === "HyperSprout") {
                                                    if (serialNumbersWhichHaveAppID.hasOwnProperty(key))
                                                        serialNumbersToRemoveAppID.push(serialNumbersWhichHaveAppID[key].HypersproutSerialNumber);
                                                } else {
                                                    if (serialNumbersWhichHaveAppID.hasOwnProperty(key))
                                                        serialNumbersToRemoveAppID.push(serialNumbersWhichHaveAppID[key].MeterSerialNumber);
                                                }
                                            }
                                            removeAppGroups(collection2, docs, serialNumbersToRemoveAppID, type, function (err, result) {
                                                if (err)
                                                    callback(err, null, null);
                                                else
                                                    callback(null, result, serialNumbersWhichDoNotHaveAppID);
                                            });
                                        }
                                        break;
                                    default:
                                        return callback(new Error('Invalid Action'), null, null);
                                }
                            }
                        });

                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  find app by id
* @param collectionName
* @param AppName
* @param Type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findAppID(collectionName, AppName, Type, callback) {
    try {
        collectionName.find({ GroupName: AppName, Type: Type }).toArray(function (err, docs) {
            if (err)
                callback(err, null);
            else {
                if (docs[0] !== undefined)
                    return callback(null, docs[0].GroupID);
                else
                    return callback(new Error('Invalid Group Name'), null);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  find all matching documents
* @param collectionName
* @param serialNumbers
* @param appId
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findAllMatchingDocuments(collectionName, serialNumbers, appId, type, callback) {
    // this method will filter out junk values -
    // available in the text file and the values which contains the app Id already.

    try {
        if (type === "HyperSprout") {
            collectionName.find({ HypersproutSerialNumber: { $in: serialNumbers } }).toArray(function (err, dataFromMatchingSrNumbers) {
                if (err)
                    return callback(err, null, null);
                else {
                    var serialNumbersWhichHaveAppID = [];
                    var serialNumbersWhichDoNotHaveAppID = [];
                    for (var count in dataFromMatchingSrNumbers) {
                        if (dataFromMatchingSrNumbers[count].AppIDs.indexOf(appId) >= 0) {
                            serialNumbersWhichHaveAppID.push(dataFromMatchingSrNumbers[count]);
                        } else {
                            serialNumbersWhichDoNotHaveAppID.push(dataFromMatchingSrNumbers[count]);
                        }
                    }
                    return callback(null, serialNumbersWhichHaveAppID, serialNumbersWhichDoNotHaveAppID);
                }
            });
        } else if (type === "Meter") {
            collectionName.find({ MeterSerialNumber: { $in: serialNumbers } }).toArray(function (err, dataFromMatchingSrNumbers) {
                if (err)
                    return callback(err, null, null);
                else {
                    var serialNumbersWhichHaveAppID = [];
                    var serialNumbersWhichDoNotHaveAppID = [];
                    for (var count in dataFromMatchingSrNumbers) {
                        if (dataFromMatchingSrNumbers[count].AppIDs.indexOf(appId) >= 0) {
                            serialNumbersWhichHaveAppID.push(dataFromMatchingSrNumbers[count]);
                        } else {
                            serialNumbersWhichDoNotHaveAppID.push(dataFromMatchingSrNumbers[count]);
                        }
                    }
                    return callback(null, serialNumbersWhichHaveAppID, serialNumbersWhichDoNotHaveAppID);
                }
            });
        }
        else
            return callback(new Error("Wrong Type"), null, null);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description -  update app groups
* @param collectionname 
* @param docs
* @param serialNumber
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateAppGroups(collectionname, docs, serialNumber, type, callback) {
    try {
        if (type === "HyperSprout") {
            collectionname.updateMany({ HypersproutSerialNumber: { $in: serialNumber } }, { $push: { AppIDs: docs } }, function (err, result) {
                if (err)
                    return callback(err, null);
                else
                    return callback(null, result);
            });
        } else if (type === "Meter") {
            collectionname.updateMany({ MeterSerialNumber: { $in: serialNumber } }, { $push: { AppIDs: docs } }, function (err, result) {
                if (err)
                    return callback(err, null);
                else
                    return callback(null, result);
            });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description -  remove app groups
* @param collectionname 
* @param docs
* @param serialNumber
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeAppGroups(collectionname, docs, serialNumber, type, callback) {
    try {
        if (type === "HyperSprout") {
            collectionname.updateMany({ HypersproutSerialNumber: { $in: serialNumber } }, { $pull: { AppIDs: docs } }, function (err, result) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else
                    return callback(null, result);
            });
        } else if (type === "Meter") {
            collectionname.updateMany({ MeterSerialNumber: { $in: serialNumber } }, { $pull: { AppIDs: docs } }, function (err, result) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else
                    return callback(null, result);
            });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  update EditTime
* @param data
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateEditTime(data, callback) {
    data.collection1.update({ ConfigID: data.ConfigID }, { $set: { "EditTime": new Date() } }, function (err, res) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else
            callback(null, data);
    });
}

/**
* @description -  
* @param startTime  - 
* @param endTime  - 
* @param callback - callback function returns success or error response
* @return callback function
*/
function modifyTagDescrepancies(data, callback) {
    var out = {
        "ConfigProgramName": data.ConfigProgramName,
        "nModified": data.nModified,
        "Type": data.Type,
        "ConfigID": data.ConfigID,
        "collection1": data.collection1,
        "collection2": data.collection2,
        "collection3": data.collection3
    };
    data.collection2.find({ ConfigID: data.ConfigID }).toArray(function (err, results) {
        async.each(results,
            function (result, callbackEach) {
                if (data.Type === "HyperSprout") {
                    out.serialNumber = result.HypersproutSerialNumber;
                    out.configGroups_Info2 = result.Hypersprout_Info;
                } else if (data.Type === "Meter") {
                    out.serialNumber = result.MeterSerialNumber;
                    out.configGroups_Info2 = result.Meters_Info;
                } else {
                    return callbackEach(new Error("Wrong Type"), null);
                }
                out.collection3.update({ SerialNumber: out.serialNumber, IsCorrected: "N" }, { $set: { IsCorrected: "Y", CorrectTime: new Date(), LastFoundTime: new Date() } }, { multi: true }, function (err, output) {
                    if (err)
                        insertError.putErrorDetails(err, callbackEach);
                    else {
                        updateTagDescrepancy(out, function (err, res) {
                            if (err)
                                callbackEach(err, null);
                            else
                                callbackEach(null, res);
                        });
                    }
                });
            },
            function (err) {
                if (err)
                    callback(err, null);
                else
                    callback(null, "Configuration Group updated");
            });
    });
}

/**
* @description -  
* @param startTime  - 
* @param endTime  - 
* @param callback - callback function returns success or error response
* @return callback function
*/
function getMembersID(ID, Type, deviceType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var collectionName;
                if (deviceType === "HyperSprout") {
                    collectionName = db.delta_Hypersprouts;
                } else if (deviceType === "Meter") {
                    collectionName = db.delta_Meters;
                } else if (deviceType === "DeltaLink") {
                    collectionName = db.delta_DeltaLink;
                } else {
                    return callback(new Error("Wrong Type"), null);
                }
                var M = 0;
                var membersOfID;
                findIDAttached(collectionName, ID, Type, function (err, docs) {
                    if (err)
                        return callback(err, null);
                    else {
                        switch (Type) {
                            case 'Configuration Group':
                                // "M" means Member and "N" means Not Member.
                                for (var count in docs) {
                                    if (docs[count].ConfigStatus === "M") {
                                        M++;
                                    }
                                    else {
                                        M = 0;
                                    }
                                }
                                membersOfID = {
                                    "ID": ID,
                                    "Type": Type,
                                    "Members": M
                                };
                                break;
                            case 'Application Group':
                                M = docs.length;
                                membersOfID = {
                                    "ID": ID,
                                    "Type": Type,
                                    "Members": M
                                };
                                break;
                        }
                        callback(null, membersOfID);
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  remove Groups
* @param membersOfID
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeGroups(membersOfID, callback) {
    try {
        if (membersOfID.Members > 0)
            callback(new Error('Devices attached to Group'), null);
        else if (membersOfID.Type === "Application Group") {
            dbCon.getDb(function (err, db) {
                if (err)
                    callback(err, null);
                else {
                    db.delta_AppGroups.remove({ GroupID: membersOfID.ID }, function (err, resp) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else if (resp.result.n > 0)
                            callback(null, "Group Deleted");
                        else
                            callback(new Error('Group not found'), null);
                    });

                }
            });
        } else if (membersOfID.Type === "Configuration Group") {
            dbCon.getDb(function (err, db) {
                if (err)
                    callback(err, null);
                else {
                    db.delta_ConfigGroups.remove({ ConfigID: membersOfID.ID }, function (err, resp) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else if (resp.result.n > 0)
                            callback(null, "Group Deleted");
                        else
                            callback(new Error('Group not found'), null);
                    });
                }
            });
        } else
            callback(new Error("Wrong Group Type"), null);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  find ID Attached
* @param collectionName
* @param ID
* @param Type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findIDAttached(collectionName, ID, Type, callback) {
    try {
        if (Type === "Application Group") {
            var Id = [ID];
            collectionName.find({ AppIDs: Id }).toArray(function (err, docs) {
                if (err)
                    callback(err, null);
                else
                    callback(null, docs);
            });
        } else if (Type === "Configuration Group") {
            collectionName.find({ ConfigID: ID }).toArray(function (err, docs) {
                if (err)
                    callback(err, null);
                else
                    callback(null, docs);
            });
        } else
            return callback(new Error("Wrong Group Type"), null);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  find Download by ConfigID
* @param collectionName 
* @param configName
* @param Type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findDownloadConfigID(collectionName, configName, Type, callback) {
    collectionName.find({ ConfigName: configName, Type: Type }).toArray(function (err, docs) {
        if (err)
            callback(err, null);
        else {
            if (docs.length > 0) {
                var result = {
                    "ConfigID": docs[0].ConfigID,
                    "ConfigName": configName,
                    "ConfigGroups_Info": docs[0].ConfigGroups_Info,
                    "Type": Type,
                    "grpType": "Configuration Group"
                };
                callback(null, result);
            } else
                return callback(new Error('ID Not Found'), null);
        }
    });
};


/**
* @description -  get config program data
* @param collection1 
* @param collection2
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function getconfigProgramData(collection1, collection2, type, callback) {
    collection1.find({ Type: type }, { Name: 1, Description: 1, _id: 0 }).sort({ CreatedDate: -1 }).toArray(function (err, result) {
        if (err)
            callback(err, null, null);
        else {
            if (result.length === 0) {
                callback(new Error("No Config Programs available"), null, null);
            } else {
                var configPrograms = [];
                for (var count in result) {
                    if (result.hasOwnProperty(count))
                        configPrograms.push(result[count].Name);
                }
                var membersInfo = [];
                async.each(configPrograms,
                    function (configProgram, callbackEach) {
                        var M = 0;
                        collection2.count({ ConfigProgramName: configProgram, Type: type }, function (err, res) {
                            if (err)
                                callbackEach(err, null);
                            else
                                M = res;

                            var membersOfConfigProgram = {
                                configProgram: configProgram,
                                Members: M
                            };
                            membersInfo.push(membersOfConfigProgram);
                            callbackEach(null, membersInfo);
                        });
                    },
                    function (err) {
                        if (err)
                            callback(err, null, null);
                        else
                            callback(null, membersInfo, result);
                    });
            }
        }
    });
}

/**
* @description - get config program info 
* @param collection 
* @param configProgramName 
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function getConfigProgramInfo(collection, configProgramName, type, callback) {
    collection.find({ Name: configProgramName, Type: type }, { ConfigGroups_Info: 1, _id: 0 }).toArray(function (err, res) {
        if (err)
            callback(err, null);
        else if (res.length === 0)
            callback(new Error("No such Config Program available"), null);
        else
            callback(null, res);
    });
}

/**
* @description -  add config program
* @param collection
* @param configProgramName
* @param configProgramDetails
* @param Description
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function addConfigProgram(collection, configProgramName, configProgramDetails, Description, type, callback) {
    collection.find({ Name: configProgramName, Type: type }).toArray(function (err, res) {
        if (err)
            callback(err, result);
        else if (res.length > 0)
            callback(new Error("Config Program with this name already available"), null);
        else {
            var doc = {
                "Name": configProgramName,
                "Description": Description,
                "ConfigGroups_Info": configProgramDetails,
                "Type": type,
                "CreatedDate": new Date()
            };
            collection.insertOne(doc, function (err, result) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else
                    callback(null, result);
            });
        }
    });
}

/**
* @description -  remove config program
* @param collection
* @param collection1
* @param configProgramName
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeConfigProgram(collection, collection1, configProgramName, type, callback) {
    collection1.count({ ConfigProgramName: configProgramName, Type: type }, function (err, result) {
        if (err)
            callback(err, null);
        else if (result.length > 0)
            callback(new Error("Config Program is not empty"), null);
        else {
            collection.find({ Name: configProgramName, Type: type }).toArray(function (err, res) {
                if (err)
                    callback(err, null);
                else if (res.length === 0)
                    callback(new Error("Config Program with this name not available"), null);
                else {
                    collection.remove({ Name: configProgramName, Type: type }, function (err, resp) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else if (resp.result.ok === 0)
                            callback(new Error("Config Program Couldn't be deleted"), null)
                        else
                            callback(null, "Config Program Deleted");
                    });
                }
            });
        }
    });
}

/**
* @description -  get config groups info
* @param configName 
* @param DeviceClass
* @param configProgramName
* @param Description
* @param Type
* @param callback - callback function returns success or error response
* @return callback function
*/
function getConfigGroups_Info(configName, DeviceClass, configProgramName, Description, Type, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            return callback(err, null);
        else {
            var collectionName = db.delta_ConfigPrograms;
            findCollectionDataByDeviceClassFromMongoDB(collectionName, configProgramName, Type, function (err, docs) {
                if (err)
                    return callback(err, null);
                else {
                    var ConfigJson = docs[0].ConfigGroups_Info;
                    var res = {
                        "ConfigJson": ConfigJson,
                        "configName": configName,
                        "DeviceClass": DeviceClass,
                        "ConfigProgramName": configProgramName,
                        "Description": Description,
                        "Type": Type
                    };
                    return callback(null, res);
                }
            });
        }
    });
}

/**
* @description -  insert open config group
* @param res 
* @param callback - callback function returns success or error response
* @return callback function
*/
function insertOneConfigGrp(res, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            collectionName.find({ ConfigName: res.configName, Type: res.Type }).toArray(function (err, result) {
                if (err)
                    callback(err, null);
                else if (result.length > 0)
                    callback(new Error("Config Name already present"), null)
                else {
                    // finding the maximum of 'ConfigID' by sorting the collection in descending order
                    // and limiting the result to 1 so that it could get the maximum value.            
                    collectionName.find().sort({ "ConfigID": -1 }).limit(1).next(function (err, item) {
                        if (err)
                            callback(err, null);
                        else {
                            var count;
                            if (!item) {
                                count = 0;
                            } else {
                                count = item.ConfigID;
                            }
                            var doc = {
                                "ConfigID": ++count,
                                "ConfigName": res.configName,
                                "ConfigProgramName": res.ConfigProgramName,
                                "Description": res.Description,
                                "ClassName": res.DeviceClass,
                                "CreatedDate": new Date(),
                                "EditTime": new Date(),
                                "Type": res.Type,
                                "ConfigGroups_Info": res.ConfigJson
                            };
                            collectionName.insertOne(doc, function (err, result) {
                                if (err)
                                    insertError.putErrorDetails(err, callback);
                                else if (result.result.nModified === 0)
                                    callback(new Error("Config Group couldn't be Created"), null);
                                else
                                    callback(null, "Config Group Created");
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
* @description -  find Collection Data By DeviceClass From MongoDB
* @param collectionName
* @param configProgramName
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findCollectionDataByDeviceClassFromMongoDB(collectionName, configProgramName, type, callback) {
    collectionName.find({ Name: configProgramName, Type: type }).toArray(function (err, docs) {
        if (err)
            return callback(err, null);
        else {
            if (docs.length > 0)
                return callback(null, docs);
            else
                callback(new Error("Config Programs Not Present"), null);
        }
    });
};

/**
* @description -  get HSData From ConfigGroups By Condition
* @param callback - callback function returns success or error response
* @return callback function
*/
function getHSDataFromDELTA_ConfigGroupsByCondition(callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            findCollectionDataByTypeFromMongoDB(collectionName, "HyperSprout", function (err, hyperSproutData) {
                if (err)
                    callback(err, null);
                else if (hyperSproutData.length === 0)
                    callback(new Error("No Config Group Available"), null);
                else
                    callback(null, hyperSproutData);
            });
        }
    });
};

/**
* @description -  get Meter Data From ConfigGroups By Condition
* @param callback - callback function returns success or error response
* @return callback function
*/

function getMeterDataFromDELTA_ConfigGroupsByCondition(callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var collectionName = db.delta_ConfigGroups;
                findCollectionDataByTypeFromMongoDB(collectionName, "Meter", function (err, meterData) {
                    if (err)
                        callback(err, null);
                    else if (meterData.length === 0)
                        callback(new Error("No Config Group Available"), null);
                    else
                        callback(null, meterData);
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  add HS Config ID From ConfigGroups By Condition
* @param ConfigName,serialNumber,callback
* @return callback function
*/

function addHSConfigIDFromDELTA_ConfigGroupsByCondition(ConfigName, serialNumber, Action, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            var collection2 = db.delta_Hypersprouts;
            var collection3 = db.delta_TagDiscripancies;
            async.waterfall(
                [
                    async.apply(findConfID, collectionName, ConfigName, "HyperSprout", collection2, collection3, serialNumber, Action),
                    removeTagDescrepancy,
                    updateConfigGroups,
                    updateTagDescrepancy
                ],
                function (err, result) {
                    if (err)
                        return callback(err, null);
                    else
                        return callback(null, result);
                });
            return;
        }
    });
};

/**
* @description -  remove HS Config ID From Config Groups By Condition
* @param ConfigName 
* @param serialNumber
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeHSConfigIDFromDELTA_ConfigGroupsByCondition(ConfigName, serialNumber, Action, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            var collection2 = db.delta_Hypersprouts;
            var collection3 = db.delta_TagDiscripancies;
            async.waterfall(
                [
                    async.apply(findConfID, collectionName, ConfigName, "HyperSprout", collection2, collection3, serialNumber, Action),
                    removeConfigGroups,
                    removeTagDescrepancy
                ],
                function (err, result) {
                    if (err)
                        return callback(err, null);
                    else
                        return callback(null, result);
                });
            return;
        }
    });
};

/**
* @description - add MM Config ID From ConfigGroups By Condition
* @param ConfigName
* @param serialNumber
* @param callback - callback function returns success or error response
* @return callback function
*/
function addMMConfigIDFromDELTA_ConfigGroupsByCondition(ConfigName, serialNumber, Action, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            var collection2 = db.delta_Meters;
            var collection3 = db.delta_TagDiscripancies;
            async.waterfall(
                [
                    async.apply(findConfID, collectionName, ConfigName, "Meter", collection2, collection3, serialNumber, Action),
                    removeTagDescrepancy,
                    updateConfigGroups,
                    updateTagDescrepancy
                ],
                function (err, result) {
                    if (err)
                        return callback(err, null);
                    else {
                        return callback(null, result);
                    }

                });
            return;
        }
    });
};

/**
* @description -  remove MM Config ID From ConfigGroups By Condition
* @param ConfigName 
* @param serialNumber
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeMMConfigIDFromDELTA_ConfigGroupsByCondition(ConfigName, serialNumber, Action, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_ConfigGroups;
            var collection2 = db.delta_Meters;
            var collection3 = db.delta_TagDiscripancies;
            async.waterfall(
                [
                    async.apply(findConfID, collectionName, ConfigName, "Meter", collection2, collection3, serialNumber, Action),
                    removeConfigGroups,
                    removeTagDescrepancy
                ],
                function (err, result) {
                    if (err)
                        return callback(err, null);
                    else
                        return callback(null, result);
                });
            return;
        }
    });
};

/**
* @description -  update Config Groups
* @param res object
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateConfigGroups(res, callback) {
    var configGroups_Info2 = "";
    if (res.Type === "HyperSprout") {
        res.collection2.find({ HypersproutSerialNumber: res.serialNumber }).toArray(function (err, output) {
            if (err)
                return callback(err, null);
            else if (output.length === 0) {
                return callback(new Error('Device not available'), null);
            } else {
                configGroups_Info2 = output[0].Hypersprout_Info;
            }
            if ((configGroups_Info2 === null) || (configGroups_Info2 === undefined) || (output[0].Status === "NotRegistered")) {
                return callback(new Error("Device Not Registered"), null);
            } else {
                res.collection2.update({ HypersproutSerialNumber: res.serialNumber }, { $set: { ConfigID: res.ConfigID, ConfigStatus: "M" } }, function (err, result) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        var out = {
                            "nModified": result.result.nModified,
                            "Type": res.Type,
                            "ConfigID": res.ConfigID,
                            "collection1": res.collectionName,
                            "collection2": res.collection2,
                            "collection3": res.collection3,
                            "serialNumber": res.serialNumber,
                            "configGroups_Info2": configGroups_Info2
                        }
                        return callback(null, out);
                    }
                });
            }
        });
    } else if (res.Type === "Meter") {
        res.collection2.find({ MeterSerialNumber: res.serialNumber }).toArray(function (err, output) {
            if (err)
                return callback(err, null);
            else if (output.length === 0) {
                return callback(new Error('Device not available'), null);
            } else {
                configGroups_Info2 = output[0].Meters_Info;
            }
            if ((configGroups_Info2 === null) || (configGroups_Info2 === undefined) || (output[0].Status === "NotRegistered")) {
                return callback(new Error("Device Not Registered"), null);
            } else {
                res.collection2.update({ MeterSerialNumber: res.serialNumber }, { $set: { ConfigID: res.ConfigID, ConfigStatus: "M" } }, function (err, result) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        var out = {
                            "nModified": result.result.nModified,
                            "Type": res.Type,
                            "ConfigID": res.ConfigID,
                            "collection1": res.collectionName,
                            "collection2": res.collection2,
                            "collection3": res.collection3,
                            "serialNumber": res.serialNumber,
                            "configGroups_Info2": configGroups_Info2
                        }
                        return callback(null, out);
                    }
                });
            }
        });
    } else
        callback(new Error("Wrong Type"), null);
};

/**
* @description - remove Config Groups 
* @param res - response object
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeConfigGroups(res, callback) {

    if (res.Type === "HyperSprout") {
        res.collection2.update({ HypersproutSerialNumber: res.serialNumber, ConfigID: res.ConfigID }, { $set: { ConfigID: res.UnknownGrp, ConfigStatus: "M" } }, function (err, result) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                var out = {
                    "Type": res.Type,
                    "ConfigID": res.ConfigID,
                    "ConfigName": res.ConfigName,
                    "collection1": res.collectionName,
                    "collection2": res.collection2,
                    "collection3": res.collection3,
                    "serialNumber": res.serialNumber
                }
                return callback(null, out);
            }
        });
    } else if (res.Type === "Meter") {
        res.collection2.update({ MeterSerialNumber: res.serialNumber, ConfigID: res.ConfigID }, { $set: { ConfigID: res.UnknownGrp, ConfigStatus: "M" } }, function (err, result) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                var out = {
                    "Type": res.Type,
                    "ConfigID": res.ConfigID,
                    "ConfigName": res.ConfigName,
                    "collection1": res.collectionName,
                    "collection2": res.collection2,
                    "collection3": res.collection3,
                    "serialNumber": res.serialNumber
                }

                return callback(null, out);
            }
        });
    } else
        callback(new Error("Wrong Type"), null);
};

/**
* @description -  update Tag Descrepancy
* @param out - response
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateTagDescrepancy(out, callback) {
    if (out.nModified > 0) {
        out.collection1.find({ ConfigID: out.ConfigID, Type: out.Type }).toArray(function (err, docs) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                var configGroups_Info1 = docs[0].ConfigGroups_Info;
                if (out.Type === "HyperSprout") {
                    out.collection2.find({ HypersproutSerialNumber: out.serialNumber }).toArray(function (err, output) {
                        if (err)
                            return callback(err, null);
                        else if (output.length === 0)
                            return callback(new Error('Invalid Serial numbers'), null);
                        else
                            createTagDiscrepancy(out, configGroups_Info1, callback);

                    });
                } else if (out.Type === "Meter") {
                    out.collection2.find({ MeterSerialNumber: out.serialNumber }).toArray(function (err, output) {
                        if (err)
                            return callback(err, null);
                        else if (output.length === 0)
                            return callback(new Error('Invalid Serial numbers'), null);
                        else
                            createTagDiscrepancy(out, configGroups_Info1, callback);
                    });
                } else
                    callback(new Error("Wrong Type"), null);
            }
        });
    } else
        return callback(null, "No TagDescrepancy as Endpoint already attached to the Group");
}

/**
* @description - create Tag Discrepancy 
* @param out, configGroups_Info1
* @param callback - callback function returns success or error response
* @return callback function
*/
function createTagDiscrepancy(out, configGroups_Info1, callback) {
    var documentsToInsert = [];
    for (var key in out.configGroups_Info2) {
        if (configGroups_Info1[key] !== out.configGroups_Info2[key]) {
            var doc = {
                "TagID": shortid.generate(),
                "SerialNumber": out.serialNumber,
                "TagDiscrepanciesDevice": out.Type,
                "ConfigurationTab": key + ":" + configGroups_Info1[key],
                "DiscrepantTag": key + ":" + out.configGroups_Info2[key],
                "FirstFoundTime": new Date(),
                "IsCorrected": "N"
            };
            documentsToInsert.push(doc);
        }
    }
    if (documentsToInsert.length > 0) {
        out.collection3.insertMany(documentsToInsert, function (err, result) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else
                return callback(null, "Successfully Inserted");
        });
    }
}

/**
* @description - remove Tag Descrepancy
* @param out
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeTagDescrepancy(out, callback) {

    if (out.Type === "HyperSprout") {
        out.collection2.find({ HypersproutSerialNumber: out.serialNumber, ConfigID: out.ConfigID }).toArray(function (err, docs) {
            if (err)
                return callback(err, null);
            else {
                removeConfigurationTagDescrepancy(out, docs.length, callback);
            }
        });
    } else if (out.Type === "Meter") {
        out.collection2.find({ MeterSerialNumber: out.serialNumber, ConfigID: out.ConfigID }).toArray(function (err, docs) {

            if (err)
                return callback(err, null);
            else
                removeConfigurationTagDescrepancy(out, docs.length, callback);
        });
    } else
        callback(new Error("Wrong Type"), null);
}

/**
* @description - remove Configuration Tag Descrepancy
* @param out 
* @param len
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeConfigurationTagDescrepancy(out, len, callback) {

    var res = {
        "ConfigName": out.ConfigName,
        "ConfigID": out.ConfigID,
        "UnknownGrp": out.UnknownGrp,
        "Type": out.Type,
        "collectionName": out.collection1,
        "collection2": out.collection2,
        "collection3": out.collection3,
        "serialNumber": out.serialNumber
    };
    if (len === 0) {
        out.collection3.update({ SerialNumber: out.serialNumber, IsCorrected: "N" }, { $set: { IsCorrected: "Y", CorrectTime: new Date(), LastFoundTime: new Date() } }, { multi: true }, function (err, output) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else
                return callback(null, res);
        });
    } else
        return callback(null, res);
}

/**
* @description -  find group config ID
* @param collectionName, ConfigName, Type, collection2, collection3, serialNumber, callback
* @return callback function
*/
function findConfID(collectionName, ConfigName, Type, collection2, collection3, serialNumber, Action, callback) {
    collectionName.find({ ConfigName: ConfigName, Type: Type }).toArray(function (err, docs) {
        if (err)
            callback(err, null);
        else {
            if (docs.length > 0) {
                collectionName.find({ ConfigName: "Unknown Membership Group", Type: Type }).toArray(function (err, doc) {
                    if (err)
                        return callback(err, null);
                    else {
                        if (doc.length > 0) {
                            var res = {
                                "ConfigName": ConfigName,
                                "ConfigID": docs[0].ConfigID,
                                "UnknownGrp": doc[0].ConfigID,
                                "Type": Type,
                                "collection1": collectionName,
                                "collection2": collection2,
                                "collection3": collection3,
                                "serialNumber": serialNumber
                            };
                            if (Action == "Remove") {
                                collection2.find({ ConfigID: res.ConfigID }).toArray(function (err, doc) {
                                    if (err)
                                        return callback(err, null);
                                    else if (doc.length > 0) {
                                        return callback(null, res);
                                    }
                                    else {
                                        return callback(new Error(Type + "(s) not grouped"), null);
                                    }
                                })
                            } else {
                                return callback(null, res);
                            }

                            //return callback(null, res);
                        } else
                            return callback(new Error("Unknown Membership Group not available in the System"), null);
                    }
                });
            } else
                return callback(new Error("Config Group not avaialable"), null);
        }
    });
};

/**
* @description -  find Collection Data By Type From MongoDB
* @param collectionName 
* @param TypeValue
* @param callback - callback function returns success or error response
* @return callback function
*/
function findCollectionDataByTypeFromMongoDB(collectionName, TypeValue, callback) {
    try {
        collectionName.find({ Type: TypeValue }, { ConfigID: 1, ConfigName: 1, Type: 1, Description: 1, DeviceClassID: 1, ClassName: 1, ConfigProgramName: 1, EditTime: 1, Action: 1, CreatedDate: 1 }).sort({ CreatedDate: -1 }).toArray(function (err, docs) {
            if (err)
                callback(err, null);
            else
                callback(null, docs);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description get Data From HyperSprouts By Condition
* @param hyperSproutData
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDataFromDELTA_HyperSproutsByCondition(hyperSproutData, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var ConfigIDs = [];
            for (var count in hyperSproutData) {
                if (hyperSproutData.hasOwnProperty(count))
                    ConfigIDs.push(hyperSproutData[count].ConfigID);
            }
            var collectionName = db.delta_Hypersprouts;
            var membersInfo = [];
            async.each(ConfigIDs,
                function (ConfigID, callbackEach) {
                    var M = 0;
                    var N = 0;
                    findCollectionDataByConfigIDFromMongoDB(collectionName, ConfigID, function (err, hyperSproutData) {
                        if (err)
                            callback(err, null, null);
                        else {
                            for (var count in hyperSproutData) {
                                if (hyperSproutData[count].ConfigStatus === "M") {
                                    M++;
                                } else {
                                    N++;
                                }
                            }
                            var membersOfConfigID = {
                                configID: ConfigID,
                                Members: M,
                                NonMembers: N
                            };
                            membersInfo.push(membersOfConfigID);
                            callbackEach(null, membersInfo);
                        }
                    });
                },
                function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(null, membersInfo, hyperSproutData);
                });
        }
    });
};

/**
* @description -  get Data From Meters By Condition
* @param meterData
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDataFromDELTA_MetersByCondition(meterData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var ConfigIDs = [];
                for (var count in meterData) {
                    if (meterData.hasOwnProperty(count))
                        ConfigIDs.push(meterData[count].ConfigID);
                }
                var collectionName = db.delta_Meters;
                var membersInfo = [];
                async.each(ConfigIDs,
                    function (ConfigID, callbackEach) {
                        var M = 0;
                        var N = 0;
                        findCollectionDataByConfigIDFromMongoDB(collectionName, ConfigID, function (err, memberData) {
                            if (err)
                                callback(err, null, null);
                            else {
                                // "M" means Member and "N" means Not Member.
                                for (var count in memberData) {
                                    if (memberData[count].ConfigStatus === "M") {
                                        M++;
                                    } else {
                                        N++;
                                    }
                                }
                                var membersOfConfigID = {
                                    configID: ConfigID,
                                    Members: M,
                                    NonMembers: N
                                };
                                membersInfo.push(membersOfConfigID);
                                callbackEach(null, membersInfo);
                            }
                        });
                    },
                    function (err) {
                        if (err)
                            callback(err);
                        else
                            callback(null, membersInfo, meterData);
                    });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  
* @param startTime  - 
* @param endTime  - 
* @param callback - callback function returns success or error response
* @return callback function
*/
function findCollectionDataByConfigIDFromMongoDB(collectionName, ConfigID, callback) {
    try {
        collectionName.find({ ConfigID: ConfigID }).toArray(function (err, docs) {
            if (err)
                callback(err, null);
            else
                callback(null, docs);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  download Jobs
* @param jobsCollection
* @param startTime
* @param endTime
* @param type
* @param callback - callback function returns success or error response
* @return callback function
*/
function downloadJobs(jobsCollection, startTime, endTime, type, callback) {
    var regex;
    if (type === "HyperSprout")
        regex = { DeviceType: type, JobType: "HS Configuration Download", "CreatedDateTimestamp": { $gte: new Date(startTime), $lte: new Date(endTime) } };
    else if (type === "Meter")
        regex = { DeviceType: type, JobType: "Meter Configuration Download", "CreatedDateTimestamp": { $gte: new Date(startTime), $lte: new Date(endTime) } };
    else
        callback(new Error("Wrong Type"), null);
    jobsCollection.find(regex).toArray(function (err, downloadJobs) {
        if (err || !downloadJobs)
            callback(err, null);
        else if (downloadJobs.length === 0)
            callback(new Error("No Download Job curently in the system"), null)
        else
            callback(null, downloadJobs);
    });
}

/**
* @description -  get Config Group Info
* @param inputDetails
* @param serialNumber
* @param callback - callback function returns success or error response
* @return callback function
*/
function getConfigGrpInfo(inputDetails, serialNumber, callback) {
    var regex, regex2;
    if (inputDetails.Type === "HyperSprout")
        regex = { HypersproutSerialNumber: serialNumber }, { ConfigID: 1, ProtocolVersion: 1, HypersproutID: 1, DeviceID: 1, 'Hypersprout_DeviceDetails.CountryCode': 1, 'Hypersprout_DeviceDetails.RegionCode': 1, MessageID: 1, _id: 0 };
    else
        regex = { MeterSerialNumber: serialNumber }, { ConfigID: 1, MeterID: 1, TransormerID: 1, 'Meters_DeviceDetails.CountryCode': 1, 'Meters_DeviceDetails.RegionCode': 1, _id: 0 };
    inputDetails.TagDiscrepancyCollection.find({ SerialNumber: serialNumber, IsCorrected: "N" }).toArray(function (err, tagDiscrepancies) {
        if (err)
            callback(err, null);
        else if (tagDiscrepancies.length === 0)
            callback(null, "No Tag Discrepancy");
        else {
            inputDetails.deviceCollection.find(regex).toArray(function (err, deviceDetails) {
                if (err)
                    callback(err, null);
                else if (deviceDetails.length === 0)
                    callback(new Error("Device Not Attached to any Config Group"), null);
                else
                    inputDetails.ConfigGrpCollection.find({ ConfigID: deviceDetails[0].ConfigID }, { ConfigName: 1, ConfigGroups_Info: 1, _id: 0 }).toArray(function (err, configInfo) {
                        if (err)
                            callback(err, null);
                        else {
                            if (inputDetails.Type === "HyperSprout") {
                                inputDetails.HypersproutID = deviceDetails[0].HypersproutID;
                                inputDetails.CountryCode = deviceDetails[0].Hypersprout_DeviceDetails.CountryCode;
                                inputDetails.RegionCode = deviceDetails[0].Hypersprout_DeviceDetails.RegionCode;
                                inputDetails.DeviceID = deviceDetails[0].DeviceID;
                                inputDetails.ProtocolVersion = deviceDetails[0].ProtocolVersion;
                                inputDetails.MessageID = deviceDetails[0].MessageID;
                            } else {
                                inputDetails.MeterID = deviceDetails[0].MeterID;
                                inputDetails.CountryCode = deviceDetails[0].Meters_DeviceDetails.CountryCode;
                                inputDetails.RegionCode = deviceDetails[0].Meters_DeviceDetails.RegionCode;
                            }
                            inputDetails.ConfigID = deviceDetails[0].ConfigID;
                            inputDetails.ConfigName = configInfo[0].ConfigName;
                            inputDetails.ConfigGroups_Info = configInfo[0].ConfigGroups_Info;
                            inputDetails.serialNumber = serialNumber;
                            if (inputDetails.Type === "Meter") {
                                inputDetails.HSCollection.find({ TransformerID: deviceDetails[0].TransformerID }).toArray(function (err, forMeterDeviceID) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        inputDetails.ProtocolVersion = forMeterDeviceID[0].ProtocolVersion;
                                        inputDetails.DeviceID = forMeterDeviceID[0].DeviceID;
                                        inputDetails.HypersproutID = forMeterDeviceID[0].HypersproutID;
                                        inputDetails.MessageID = forMeterDeviceID[0].MessageID;
                                        callback(null, inputDetails);
                                    }
                                });
                            } else
                                callback(null, inputDetails);
                        }
                    });
            });
        }
    });
}

/**
* @description -  find Download Config ID
* @param collectionName 
* @param configName
* @param listSerialNumber
* @param Type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findDownConfigID(collectionName, configName, listSerialNumber, Type, callback) {
    collectionName.find({ ConfigName: configName, Type: Type }).toArray(function (err, docs) {
        if (err)
            callback(err, null);
        else if (docs.length > 0) {
            var result = {
                "ConfigID": docs[0].ConfigID,
                "ConfigName": configName,
                "listSerialNumber": listSerialNumber,
                "ConfigGroups_Info": docs[0].ConfigGroups_Info,
                "Type": Type
            };
            callback(null, result);
        } else
            return callback(new Error('ID Not Found'), null);
    });
};

/**
* @description -  find hypersprout id
* @param result 
* @param callback - callback function returns success or error response
* @return callback function
*/
function findHSID(result, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var JobIDs = [];
            var serialNumbers = [];
            for (var key in result.listSerialNumber) {
                if (result.listSerialNumber.hasOwnProperty(key))
                    serialNumbers.push(result.listSerialNumber[key]);
            }
            var collection2 = db.delta_Hypersprouts;
            var collection3 = db.delta_TagDiscripancies;
            var schedulerFlagsCollection = db.delta_SchedulerFlags;
            async.each(serialNumbers,
                function (serialNumber, callbackEach) {
                    collection3.find({ SerialNumber: serialNumber, IsCorrected: "N" }).toArray(function (err, isTagDiscrepancy) {
                        if (err)
                            callbackEach(err, null);
                        else if (isTagDiscrepancy.length === 0) {
                            callbackEach(null, "No Tag Discrepancy for " + serialNumber + " Serial Number");
                        } else {
                            collection2.find({ HypersproutSerialNumber: serialNumber, ConfigID: result.ConfigID, ConfigStatus: "M", Status: "Registered" }).toArray(function (err, docs) {
                                if (err)
                                    callbackEach(err, null);
                                else if (docs.length > 0) {
                                    schedulerFlagsCollection.find({ DeviceID: docs[0].DeviceID }).toArray(function (err, msgIDDetails) {
                                        if (err)
                                            callbackEach(err, null);
                                        else {
                                            var msgid = 256;
                                            if (msgIDDetails.length > 0)
                                                msgid = docs[0].MessageID;
                                            var newmsgID = ++msgid;
                                            if (newmsgID > 255)
                                                newmsgID = 0
                                            initiatejob(result.ConfigName, docs[0].HypersproutID, newmsgID, serialNumber, result.Type, "Configuration Job", "HS Configuration Download", function (err, response) {
                                                if (err)
                                                    callbackEach(err, null);
                                                else {
                                                    JobIDs.push(response);
                                                    collection2.update({ HypersproutSerialNumber: serialNumber }, { $set: { /*DownloadJob: response,*/ MessageID: newmsgID } }, function (err, success) {
                                                        var HSDet = {
                                                            "ProtocolVersion": docs[0].ProtocolVersion,
                                                            "MessageID": newmsgID,
                                                            "Hypersprout_DeviceDetails": {
                                                                "CountryCode": docs[0].Hypersprout_DeviceDetails.CountryCode,
                                                                "RegionCode": docs[0].Hypersprout_DeviceDetails.RegionCode,
                                                            },
                                                            "cellid": docs[0].HypersproutID,
                                                            "HypersproutID": docs[0].HypersproutID,
                                                            "DeviceID": docs[0].DeviceID
                                                        }
                                                        sendHSConfigurations(result, docs[0], null, function (err, res) {
                                                            if (err)
                                                                callbackEach(err, null);
                                                            else
                                                                callbackEach(null, res)
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else
                                    return callbackEach(null, "HS not attached to the particular Configuration Group");
                            });
                        }
                    });
                },
                function (err, asyncResponse) {
                    if (err)
                        callback(err, null);
                    else {
                        if (JobIDs.length > 0) {
                            setTimeout(function () {
                                changeJobStatus(JobIDs, function (err, success) {
                                    callback(null, success);
                                });
                            }, 30000);
                        } else
                            callback(null, asyncResponse);
                    }
                });
        }
    });
}

/**
* @description - find Meter ID  
* @param result 
* @param callback - callback function returns success or error response
* @return callback function
*/
function findMeterID(result, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var JobIDs = [];
            var serialNumbers = [];
            for (var key in result.listSerialNumber) {
                if (result.listSerialNumber.hasOwnProperty(key))
                    serialNumbers.push(result.listSerialNumber[key]);
            }
            var collection2 = db.delta_Meters;
            var collection3 = db.delta_TagDiscripancies;
            var collection4 = db.delta_Hypersprouts;
            async.each(serialNumbers,
                function (serialNumber, callbackEach) {
                    collection3.find({ SerialNumber: serialNumber, IsCorrected: "N" }).toArray(function (err, isTagDiscrepancy) {
                        if (err)
                            callbackEach(err, null);
                        else if (isTagDiscrepancy.length === 0)
                            callbackEach(null, "No Tag Discrepancy for " + serialNumber + " Serial Number");
                        else {
                            collection2.find({ MeterSerialNumber: serialNumber, ConfigID: result.ConfigID, ConfigStatus: "M", Status: "Registered" }).toArray(function (err, docs) {
                                if (err)
                                    callbackEach(err, null);
                                else {
                                    if (docs.length > 0) {
                                        collection4.find({ TransformerID: docs[0].TransformerID }).toArray(function (err, HSDetails) {
                                            if (err)
                                                callbackEach(err, null)
                                            else {
                                                var msgid = HSDetails[0].MessageID;
                                                initiatejob(result.ConfigName, docs[0].MeterID, msgid, serialNumber, result.Type, "Configuration Job", "Meter Configuration Download", function (err, response) {
                                                    if (err)
                                                        callbackEach(err, null);
                                                    else {
                                                        JobIDs.push(response);
                                                        //collection2.update({ MeterSerialNumber: serialNumber }, { $set: { DownloadJob: response } }, function (err, success) {
                                                        var newmsgID = ++msgid;
                                                        if (newmsgID > 255)
                                                            newmsgID = 0
                                                        collection4.update({ HypersproutSerialNumber: HSDetails[0].HypersproutSerialNumber }, { $set: { MessageID: newmsgID } }, function (err, success) {
                                                            var HSDet = {
                                                                "ProtocolVersion": HSDetails[0].ProtocolVersion,
                                                                "MessageID": newmsgID,
                                                                "Hypersprout_DeviceDetails": {
                                                                    "CountryCode": HSDetails[0].Hypersprout_DeviceDetails.CountryCode,
                                                                    "RegionCode": HSDetails[0].Hypersprout_DeviceDetails.RegionCode,
                                                                },
                                                                "HypersproutID": HSDetails[0].HypersproutID,
                                                                "DeviceID": HSDetails[0].DeviceID
                                                            }
                                                            sendHSConfigurations(result, HSDet, docs[0], function (err, res) {
                                                                if (err)
                                                                    callbackEach(err, null);
                                                                else
                                                                    callbackEach(null, res);
                                                            });
                                                        });
                                                        //});
                                                    }
                                                });
                                            }
                                        });
                                    } else
                                        return callbackEach(null, "Meter not attached to the particular Configuration Group");
                                }
                            });
                        }
                    });
                },
                function (err, asyncResponse) {
                    if (err)
                        callback(err, null);
                    else {
                        if (JobIDs.length > 0) {
                            setTimeout(function () {
                                changeJobStatus(JobIDs, function (err, success) {
                                    callback(null, success);
                                });
                            }, 30000);
                        } else
                            callback(null, asyncResponse);
                    }
                });
        }
    });
}

/**
* @description -  find Devices Attached To Group
* @param collection, groupID, type, grpType
* @param callback - callback function returns success or error response
* @return callback function
*/
function findDevicesAttachedToGrp(collection, groupID, type, grpType, callback) {
    try {
        var serialNumbers = [];
        var regex;
        if (grpType === "Configuration Group")
            regex = { ConfigID: groupID };
        else
            regex = { AppIDs: { $elemMatch: { $eq: groupID } } };
        if (type === "HyperSprout") {
            collection.find(regex, { HypersproutSerialNumber: 1, _id: 0 }).toArray(function (err, result) {
                if (err)
                    callback(err, null);
                else if (result.length === 0)
                    callback(new Error("No Device attached to this Group"), null);
                else {
                    for (key in result) {
                        if (result.hasOwnProperty(key))
                            serialNumbers.push(result[key].HypersproutSerialNumber);
                    }
                    callback(null, serialNumbers);
                }
            });
        } else if (type === "Meter") {
            collection.find(regex, { MeterSerialNumber: 1, _id: 0 }).toArray(function (err, result) {
                if (err)
                    callback(err, null);
                else if (result.length === 0)
                    callback(new Error("No Device attached to this Group"), null);
                else {
                    for (key in result) {
                        if (result.hasOwnProperty(key))
                            serialNumbers.push(result[key].MeterSerialNumber);
                    }
                    callback(null, serialNumbers);
                }
            });
        } else if (type === "DeltaLink") {
            collection.find(regex, { DeltalinkSerialNumber: 1, _id: 0 }).toArray(function (err, result) {
                if (err)
                    callback(err, null);
                else if (result.length === 0)
                    callback(new Error("No Device attached to this Group"), null);
                else {
                    for (key in result) {
                        if (result.hasOwnProperty(key))
                            serialNumbers.push(result[key].DeltalinkSerialNumber);
                    }
                    callback(null, serialNumbers);
                }
            });
        } else
            callback(new Error("Wrong Type"), null);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - initiate job 
* @param configName, doc, MessageID, serialNumber, type, description, jobType
* @param callback - callback function returns success or error response
* @return callback function
*/
function initiatejob(configName, doc, MessageID, serialNumber, type, description, jobType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var collectionName = db.delta_Jobs;
                var jobdoc = {
                    "JobID": shortid.generate(),
                    "DeviceID": doc,
                    "SerialNumber": serialNumber,
                    "MessageID": MessageID,
                    "DeviceType": type,
                    "JobName": description,
                    "JobType": jobType,
                    "Status": "Pending",
                    "Group": configName,
                    "CreatedDateTimestamp": new Date(),
                };
                collectionName.insertOne(jobdoc, function (err, result) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, jobdoc.JobID);
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description -  send HS Configurations
* @param configGroupDetails
* @param deviceDetails 
* @param meterDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function sendHSConfigurations(configGroupDetails, deviceDetails, meterDetails, callback) {
    try {
        var data;
        deviceDetails.Hypersprout_DeviceDetails.CountryCode = (deviceDetails.Hypersprout_DeviceDetails.CountryCode) ? deviceDetails.Hypersprout_DeviceDetails.CountryCode : 0;
        deviceDetails.Hypersprout_DeviceDetails.RegionCode = (deviceDetails.Hypersprout_DeviceDetails.RegionCode) ? deviceDetails.Hypersprout_DeviceDetails.RegionCode : 0;
        meterDetails.Meters_DeviceDetails.CountryCode = (meterDetails.Meters_DeviceDetails.CountryCode) ? meterDetails.Meters_DeviceDetails.CountryCode : 0;
        meterDetails.Meters_DeviceDetails.RegionCode = (meterDetails.Meters_DeviceDetails.RegionCode) ? meterDetails.Meters_DeviceDetails.RegionCode : 0;
        if (configGroupDetails.Type === "HyperSprout") {
            data = {
                "rev": deviceDetails.ProtocolVersion,
                "messageid": deviceDetails.MessageID,
                "countrycode": deviceDetails.Hypersprout_DeviceDetails.CountryCode,
                "regioncode": deviceDetails.Hypersprout_DeviceDetails.RegionCode,
                "cellid": deviceDetails.HypersproutID,
                "meterid": 0,
                "action": "CONFIGURATION",
                "attribute": "HS_DOWNLOAD",
                "ConfigGroups_Info": configGroupDetails.ConfigGroups_Info,
                "Purpose": "Download"
            }
        } else if (configGroupDetails.Type === "Meter") {
            data = {
                "rev": deviceDetails.ProtocolVersion,
                "messageid": 0,
                "countrycode": meterDetails.Meters_DeviceDetails.CountryCode,
                "regioncode": meterDetails.Meters_DeviceDetails.RegionCode,
                "cellid": deviceDetails.HypersproutID,
                "meterid": meterDetails.MeterID,
                "action": "CONFIGURATION",
                "attribute": "METER_DOWNLOAD",
                "ConfigGroups_Info": configGroupDetails.ConfigGroups_Info,
                "Purpose": "Download"
            }
        }
        parser.hexaCreation(data, function (err, response) {
            if (err)
                callback(err, null);
            else
                sToIOT.sendToIOT(response, deviceDetails.DeviceID, callback);
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -  update Download Config Jobs
* @param jobsCollection
* @param tagDiscrepancyCollection 
* @param messageid
* @param serialNumber
* @param status
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateDownConfJobs(jobsCollection, tagDiscrepancyCollection, messageid, serialNumber, status, callback) {
    jobsCollection.update({ JobName: "Configuration Job", $or: [{ JobType: "HS Configuration Download" }, { JobType: "Meter Configuration Download" }], Status: "Pending", MessageID: messageid }, { $set: { Status: status, EndTime: new Date() } }, function (err, resp) {
        if (err)
            callback(err, null);
        else {
            if (status === "Completed") {
                tagDiscrepancyCollection.update({ SerialNumber: serialNumber, IsCorrected: "N" }, { $set: { IsCorrected: "Y", CorrectTime: new Date(), LastFoundTime: new Date() } }, { multi: true }, function (err, output) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        return callback(null, "Job Updated");
                    }
                });
            } else
                callback(null, "Job Failed")
        }
    });
}
/**
* @description -  initiate AppGroup Job
* @param input
* @param callback - callback function returns success or error response
* @return callback function
*/
function initiateAppGrpJob(input, callback) {
    try {
        var serialNumber;
        var meterDetails = {};
        var jobType;
        input.ProtocolVersion = (input.ProtocolVersion) ? input.ProtocolVersion : 0;
        input.CountryCode = (input.CountryCode) ? input.CountryCode : 0;
        input.RegionCode = (input.RegionCode) ? input.RegionCode : 0;

        var configDetails = {
            Type: input.Type,
            ConfigGroups_Info: input.ConfigGroups_Info
        };
        var deviceDetails = {
            ProtocolVersion: input.ProtocolVersion,
            Hypersprout_DeviceDetails: {
                CountryCode: input.CountryCode,
                RegionCode: input.RegionCode
            },
            HypersproutID: input.HypersproutID,
            DeviceID: input.DeviceID,
            MessageID: input.MessageID
        };
        if (input.Type === "Meter") {
            meterDetails = {
                ProtocolVersion: input.ProtocolVersion,
                Meters_DeviceDetails: {
                    CountryCode: input.CountryCode,
                    RegionCode: input.RegionCode
                },
                MeterID: input.MeterID,
                HypersproutID: input.HypersproutID
            };
            jobType = "Meter Configuration Download";
        } else
            jobType = "HS Configuration Download"
        initiatejob(input.ConfigName, input.DeviceID, input.MessageID, input.serialNumber, input.Type, "Configuration Job", jobType, function (err, jobID) {
            if (err)
                callback(err, null);
            else {
                sendHSConfigurations(configDetails, deviceDetails, meterDetails, function (err, response) {
                    if (err)
                        callback(err, null);
                    else {
                        input.JobID = jobID;
                        callback(null, input);
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description - change Job Status  
* @param JobIDs
* @param callback - callback function returns success or error response
* @return callback function
*/
function changeJobStatus(JobIDs, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                async.each(JobIDs,
                    function (jobID, callback) {
                        jobsCollection.findAndModify({ JobID: jobID, "Status": "Pending" }, [], { $set: { "Status": "Failed", EndTime: new Date() } }, { remove: false, new: true, upsert: false }, function (err, resp) {
                            callback(null, "Jobs Added")
                        });
                    },
                    function (err) {
                        callback(null, "Jobs Added");
                    });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description -  
* @param startTime  - 
* @param endTime  - 
* @param callback - callback function returns success or error response
* @return callback function
*/
function addParsedData(collection, result, deviceID, callback) {
    var parsedDocument = {
        "RawData": result + "|" + deviceID,
        "MessageFrom": "CE",
        "DBTimestamp": new Date()
    }
    collection.insertOne(parsedDocument, function (err, result) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (result.result.nModified === 0)
            callback(new Error("Couldn't add Parsed Data"), null);
        else
            callback(null, "inserted");
    })
}

/**
* @description -  crypt Password
* @param password 
* @param callback - callback function returns success or error response
* @return callback function
*/
function cryptPassword(password, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err)
            return callback(err, null);

        bcrypt.hash(password, salt, function (err, hash) {
            return callback(err, hash);
        });

    });
};

/**
* @description - compare Password 
* @param password
* @param hashPassword
* @param callback - callback function returns success or error response
* @return callback function
*/
function comparePassword(password, hashPassword, callback) {
    bcrypt.compare(password, hashPassword, function (err, isPasswordMatch) {
        if (err)
            return callback(err, null);
        return callback(null, isPasswordMatch);
    });
};

/**
* @description - decrypt encrypted text
*
* @param encryptedString  - encryptedtext
*
* @return callback function.
*/
function decryptPassword(encryptedString, callback) {
    var buff = Buffer.from(encryptedString, 'base64');
    var decryptedString = buff.toString('ascii');
    callback(decryptedString);
};

/**
* @description -  Add New User, Administration -> Users -> Add New User Web Service
* @param message_id  - message_id,
* @param recipient - recevier name
* @param message  - content 
* @param is_read - true / false
* @param date - date
* @param sender- sender
* @param severity - severity 
* @param callback - callback function returns success or error response
* @return callback function
*/
function addMessage(message_id, recipient, message, is_read, date, sender, severity, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_messages;
            var messageDoc = {
                "message_id": message_id,
                "recipient": recipient,
                "message": message,
                "is_read": is_read,
                "date": date,
                "sender": sender,
                "severity": severity
            };
            collectionName.find({ message_id: message_id }).toArray(function (err, res) {
                if (err)
                    callback(err, null);
                else {
                    if (res.length > 0) {
                        console.log("mess",res)
                        callback(new Error("Message Id Already Exist"), null);
                    }
                    else {
                        collectionName.insertOne(messageDoc, function (err, resp) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else {
                                return callback(null, "Message added");
                            }
                        })
                    }
                }
            // addNewUser(collection, , message_id, recipient, message, is_read, date, sender, severity, callback);
           
            // var collection1 = db.delta_PasswordSettings;
            // var collection2 = db.delta_SecurityGroups;

            // validateSecurityGroup(collection2, securityGroup, function (err) {
            //     if (err)
            //         callback(new Error(err));
            //     else
            //         addNewUser(collection, collection1, message_id, recipient, message, is_read, date, sender, severity, callback);
            // // });
            });
        }
    })
}

/**
* @description -  get user details
* @param data - get the pagination and search details
* @param callback - callback function returns success or error response
* @return callback function
*/
function getMessageDetails(data, callback) {
    //filter for locked user

    dbCon.getDb(function (err, db) {
        if (err){ 
            callback(err, null);}
        else {
            let collectionName = "delta_messages" //delta_User
            var mongoCollection = db[collectionName];

            if (data.filter) {
                if (data.search) {
                    let whereCondition = {}
                    paginatedResults.paginatedResults(mongoCollection, whereCondition, data, "Message", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                } else {
                    // let whereCondition = { $and: [{ UserType: { $ne: "Consumer" } }, { "AccountLocked": true }] };
                    let whereCondition = {}
                    paginatedResults.paginatedResults(mongoCollection,whereCondition, data, "Message", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                }
            }
            else {
                if (!data.search || data.search == null || data.search == "null") {
                    // let whereCondition = { UserType: { $ne: "Consumer" } };
                    let whereCondition = {} //var query = db.collection('devices').where("userId", "==", uid);
                    paginatedResults.paginatedResults(mongoCollection, whereCondition, data, "Message", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                } else {
                    // let whereCondition = { UserType: { $ne: "Consumer" }, UserID: { $regex: new RegExp(data.search, "i") } };
                    let whereCondition = {}
                    paginatedResults.paginatedResults(mongoCollection,whereCondition, data, "Message", function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                }
            }
        }
    })
}

/**
* @description -  edit message status
* @param is_read  - true / false,
* @param date - status updated time
* @param messge_id - messgae id
* @param callback - callback function returns success or error response
* @return callback function
*/
function editMessage( is_read, date,message_id, callback) {
    dbCon.getDb(function (err, db) {
        var collection = db.delta_messages;
        if (err)
            callback(err, null);
        else {                
            // editUserDetails(collection, is_read, date, callback);
            collection.find({ message_id: message_id }).toArray(function (err, result) {
                if (err)
                    callback(err, null);
                else if (result.length === 0)
                    callback("No Message with this Message ID available", null);
                else {
                    var messageDoc = {
                        "is_read": is_read,
                        "date": date,
                    }
                    collection.update({ message_id: message_id }, { $set: messageDoc }, function (err, result) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else
                            callback(null, "Message status updated");
                    });
                }
            });
        }
    });
}

/**
* @description -  delete user, Administration -> Users ->Delete User Web Service
* @param message_id  - delete user
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteMessage(message_id, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collection = db.delta_messages;
            // userDelete(collection, message_id, callback);
            collection.find({ message_id: message_id }).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            }
            else if (result.length === 0) {
                callback(new Error("Message not available"), null);
            }
            else {
                collection.remove({ message_id: message_id }, function (err, res) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else if (res.result.ok === 0)
                        callback(new Error("Message couldn't be Deleted"), null);
                    else
                        callback(null, "Message Deleted");
                })
            }
        });
        }
    });
}

function getMessageDetailsById(message_id,  callback) {
    try {
        dbCon.getDb(function (err, db) {
            let collection = db.delta_messages;
            if (err)
                callback(err, null);
            else
                // findOneFromMongoDB(db.delta_messages, message_id, callback);
                collection.find({ message_id: message_id }).toArray(function (err, result) {
                    if (err) {
                        callback(err, null);
                    }
                    else if (result.length === 0) {
                        callback(new Error("Message not available"), null);
                    }
                    else {
                        callback(null, result);
                    }
                });
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

function getMessagesCount( callback){
    dbCon.getDb(async function (err, db) {
        if (err){ 
            callback(err, null);}
        else {
            let collectionName = "delta_messages" //delta_User
            var mongoCollection = db[collectionName];
            const unreadMessages = { is_read: false};
            const dbUnreadMessageCount = await mongoCollection.countDocuments(unreadMessages);
            console.log("dbUnreadMessageCount",dbUnreadMessageCount)
            callback(null, dbUnreadMessageCount);
            }
        })
    }

/* DB Commands SECTION 3 - MODULE EXPORTS*/
module.exports = {
    getSecurityGroupFromDELTA_WithPagination: getSecurityGroupFromDELTA_WithPagination,
    getUserDetails: getUserDetails,
    assignEndPointParamsToMongodb: assignEndPointParamsToMongodb,
    findFromMongoDB_HSM: findFromMongoDB_HSM,
    selectTagDiscrepanciesHSM: selectTagDiscrepanciesHSM,
    selectTagDiscrepanciesMM: selectTagDiscrepanciesMM,
    selectJobs: selectJobs,
    selectSecurityCodesHSM: selectSecurityCodesHSM,
    selectSecurityCodeMM: selectSecurityCodeMM,
    updateSecuritySaveHSM: updateSecuritySaveHSM,
    updateSecuritySaveMM: updateSecuritySaveMM,
    updateAssignDeviceSecurityCodeHSM: updateAssignDeviceSecurityCodeHSM,
    updateAssignDeviceSecurityCodeMM: updateAssignDeviceSecurityCodeMM,
    createNewHSMAppGroup: createNewHSMAppGroup,
    hSMConfigEdit: hSMConfigEdit,
    updateConfigDataValues: updateConfigDataValues,
    listDevicesAttached: listDevicesAttached,
    assignHyperSproutGroups: assignHyperSproutGroups,
    assignMetersGroups: assignMetersGroups,
    findSerialNumber: findSerialNumber,
    updateEditTimeAndTagDescrepancy: updateEditTimeAndTagDescrepancy,
    hsmGroupDownload: hsmGroupDownload,
    mmGroupDownload: mmGroupDownload,
    configPrograms: configPrograms,
    configProgramEdit: configProgramEdit,
    newConfigProgram: newConfigProgram,
    deleteConfigPrograms: deleteConfigPrograms,
    newConfGrp: newConfGrp,
    configurationDetailsOfHSM: configurationDetailsOfHSM,
    configurationDetailsOfMM: configurationDetailsOfMM,
    updateHyperSproutGroups: updateHyperSproutGroups,
    updateMeterGroups: updateMeterGroups,
    listDownloadJobs: listDownloadJobs,
    initiateHSJobOfDownConf: initiateHSJobOfDownConf,
    initiateMeterJobOfDownConf: initiateMeterJobOfDownConf,
    initiateAppGrpDownload: initiateAppGrpDownload,
    updateDownloadJobs: updateDownloadJobs,
    updateUserDetails: updateUserDetails,
    updateUserPassword: updateUserPassword,
    getUserSettings: getUserSettings,
    listOfSecurityID: listOfSecurityID,
    newSecurityGroup: newSecurityGroup,
    securityGroupDetails: securityGroupDetails,
    editSecurityGroup: editSecurityGroup,
    deleteSecurityGroup: deleteSecurityGroup,
    allSecurityGroupDetails: allSecurityGroupDetails,
    savePasswordSettings: savePasswordSettings,
    restoreDefaultPasswordSettings: restoreDefaultPasswordSettings,
    getUpdatedPasswordSettings: getUpdatedPasswordSettings,
    saveSystemSettings: saveSystemSettings,
    restoreDefaultSystemSettings: restoreDefaultSystemSettings,
    getUpdatedSystemSettings: getUpdatedSystemSettings,
    listOfUserID: listOfUserID,
    addUser: addUser,
    getUsersDetails: getUsersDetails,
    editUser: editUser,
    resetPassword: resetPassword,
    deleteUser: deleteUser,
    saveParsedData: saveParsedData,
    deleteHSConfiggroup: deleteHSConfiggroup,
    decryptPassword: decryptPassword,
    addMessage:addMessage,
    getMessageDetails:getMessageDetails,
    editMessage:editMessage,
    deleteMessage:deleteMessage,
    getMessageDetailsById:getMessageDetailsById,
    getMessagesCount:getMessagesCount
};
