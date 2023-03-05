
//REQUIRED PACKAGES AND FILES.
const dbCon = require('./dbConnection.js');
const sendToIOT = require('./sendToiot.js');
const insertError = require('./insertErrorLogsToDB.js');
const parser = require('../data/parser.js');
const shortid = require('shortid');
const paginatedResults = require('../config/Helpers/Pagination')
const async = require('async');
let fs = require('fs');
let validation = './config/Validation.json';
validation = fs.readFileSync(validation, 'utf-8');
let objValidation = JSON.parse(validation);
var nextID = require('../config/Helpers/getSequenceNextID')
var dao = require('../dao/MongoDAO.js');
var dbCmd = require('./dbCommandsRegistration.js');
let duplicateItems = require('../config/Helpers/duplicateEntry.js')






/**
* @description - check Dupliacte parameter values
* @params  arrays having duplicate values
* @params  parameter name i.e Serial number, Mac ID etc 
* @return callback function
*/

function toCheckDuplicate(array, param, callback) {
    var valueArray = array.map(function (item) { return item.toLowerCase(); });
    var isDuplicate = valueArray.some(function (item, idx) {
        return valueArray.indexOf(item) != idx
    });
    if (isDuplicate) {
        callback("duplicate " + param, null)
    } else {
        callback(null, true)
    }
}


/**
* @description - DataSCAPE WebService - NewDeltalinkEntry,    Desc - CREATE new Deltalink Entry in MONGODB
* @params NewDeltalinkEntryDetails, callback
* @return callback function
*/

function createNewDeltalinkEntry(newDeltalinkEntryDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            createNewDeltalinkEntryFromMongoDB(db.delta_DeltaLink, db.delta_Jobs, db.delta_Meters, newDeltalinkEntryDetails, callback);
    });
}


/**
* @description -parameter validations,  Query from mongoDB , create a job and save the data into MongoDB collection.
* @param  deltalinkCollection,
* @param jobsCollection
* @param  newDeltalinkEntryDetails contains Type, DeltalinkSerialNumber, DeltalinkVersion, DeltalinkWiFiMacID, Bandwidth
* @param  callback - callback function returns success or error response
* @return callback function
*/


function createNewDeltalinkEntryFromMongoDB(deltalinkCollection, jobsCollection, metersCollection, insertNewDeltalinkEntry, callback) {
    try {
        let dID = [];
        let dupDID = [];
        let dupDIDFinal = [];
        let emptyCount = 0;
        let regex = /^0+$/;
        let resultErrors = [];
        let type = insertNewDeltalinkEntry.Type;
        let serialNumberInLowerCase = insertNewDeltalinkEntry.DeltalinkSerialNumber.map(function (e) { return new RegExp("^" + e + "$", "i"); });
        getdupDeltalinkMACID(deltalinkCollection, function (err, dupMACID) {
            if (err) {
                callback(err, null, null);
            } else {
                let condition = { DeltalinkSerialNumber: { "$in": serialNumberInLowerCase } };
                deltalinkCollection.find(condition).toArray(function (err, dupSerialNumber) {
                    if (err)
                        callback(err, null, null);
                    else {
                        if (dupSerialNumber.length > 0) {
                            for (var i in dupSerialNumber) {
                                if (dupSerialNumber.hasOwnProperty(i)) {
                                    dupDID.push(dupSerialNumber[i].DeltalinkSerialNumber.toLowerCase());
                                    dupDIDFinal.push("DeltalinkSerialNumber: " + dupSerialNumber[i].DeltalinkSerialNumber + " - " + " Duplicate Deltalink!");
                                    resultErrors.push({ SerialNumber: dupSerialNumber[i].DeltalinkSerialNumber, Status: "Fail", Comment: "DeltalinkSerialNumber: " + dupSerialNumber[i].DeltalinkSerialNumber + " - " + " Duplicate Deltalink!" });
                                }
                            }
                        }
                        for (var j in insertNewDeltalinkEntry.DeltalinkSerialNumber) {
                            if (dupDID.indexOf(insertNewDeltalinkEntry.DeltalinkSerialNumber[j].toLowerCase()) === -1) {
                                insertNewDeltalinkEntry.Bandwidth[j] = (insertNewDeltalinkEntry.Bandwidth[j] == "null" || insertNewDeltalinkEntry.Bandwidth[j] == "" || insertNewDeltalinkEntry.Bandwidth[j] == " " || insertNewDeltalinkEntry.Bandwidth[j] == null || insertNewDeltalinkEntry.Bandwidth[j] == "undefined" || insertNewDeltalinkEntry.Bandwidth[j] == undefined || regex.test(insertNewDeltalinkEntry.Bandwidth[j]) == true || insertNewDeltalinkEntry.Bandwidth[j] == "true" || insertNewDeltalinkEntry.Bandwidth[j] == "false") ? 0 : parseInt(insertNewDeltalinkEntry.Bandwidth[j]);
                                insertNewDeltalinkEntry.DeltalinkVersion[j] = (insertNewDeltalinkEntry.DeltalinkVersion[j] == "null" || insertNewDeltalinkEntry.DeltalinkVersion[j] == "" || insertNewDeltalinkEntry.DeltalinkVersion[j] == " " || insertNewDeltalinkEntry.DeltalinkVersion[j] == null || insertNewDeltalinkEntry.DeltalinkVersion[j] == "undefined" || insertNewDeltalinkEntry.DeltalinkVersion[j] == undefined || insertNewDeltalinkEntry.DeltalinkVersion[j] == "true" || insertNewDeltalinkEntry.DeltalinkVersion[j] == "false") ? "null" : insertNewDeltalinkEntry.DeltalinkVersion[j];
                                if (insertNewDeltalinkEntry.Bandwidth[j] == 0) {
                                    insertNewDeltalinkEntry.DownloadBandwidth[j] = 1;
                                    insertNewDeltalinkEntry.UploadBandwidth[j] = 1;
                                }
                                // Checking for null rows in CSV upload file
                                if (dupMACID.includes(insertNewDeltalinkEntry.DeltalinkWiFiMacID[j].toLowerCase())) {
                                    emptyCount = emptyCount + 1;
                                    dupDIDFinal.push(insertNewDeltalinkEntry.DeltalinkWiFiMacID[j] + " Mac ID already in use!!");
                                    resultErrors.push({ SerialNumber: insertNewDeltalinkEntry.DeltalinkSerialNumber[j], Status: "Fail", Comment: insertNewDeltalinkEntry.DeltalinkWiFiMacID[j] + " Mac ID already in use!!" });
                                } else if ((insertNewDeltalinkEntry.DeltalinkVersion[j]) > 256) {
                                    emptyCount = emptyCount + 1;
                                    dupDIDFinal.push(insertNewDeltalinkEntry.DeltalinkVersion[j] + " Deltalink Version should be less than or equal to  255.255 !!");
                                    resultErrors.push({ SerialNumber: insertNewDeltalinkEntry.DeltalinkSerialNumber[j], Status: "Fail", Comment: insertNewDeltalinkEntry.DeltalinkVersion[j] + " Deltalink Version should be less than or equal to  255.255 !!" });

                                } else if ((insertNewDeltalinkEntry.DeltalinkVersion[j]) > 255 && (insertNewDeltalinkEntry.DeltalinkVersion[j]) > 255.255) {
                                    emptyCount = emptyCount + 1;
                                    dupDIDFinal.push(insertNewDeltalinkEntry.DeltalinkVersion[j] + " Deltalink Version should be less than or equal to  255.255 !!");
                                    resultErrors.push({ SerialNumber: insertNewDeltalinkEntry.DeltalinkSerialNumber[j], Status: "Fail", Comment: insertNewDeltalinkEntry.DeltalinkVersion[j] + " Deltalink Version should be less than or equal to  255.255 !!" });

                                } else {
                                    /* 
                                    Multiple If-Else statements to Validate Data and
                                    return a customised message on validation failure
                                    */

                                    delete insertNewDeltalinkEntry.Type;
                                    var doc = {};
                                    for (var key in insertNewDeltalinkEntry) {
                                        if (checkMandatoryValidation(key, insertNewDeltalinkEntry[key][j])) {
                                            if (checkMinimumLengthValidation(key, insertNewDeltalinkEntry[key][j]) &&
                                                checkMaximumLengthValidation(key, insertNewDeltalinkEntry[key][j])) {
                                                if (checkTypeValidation(key, insertNewDeltalinkEntry[key][j])) {
                                                    if (checkPatternValidation(key, insertNewDeltalinkEntry[key][j])) {
                                                        if (checkValueMatches(key, insertNewDeltalinkEntry[key][j])) {
                                                            if (checkMaxValueValidation(key, insertNewDeltalinkEntry[key][j], j, insertNewDeltalinkEntry)) {
                                                                if (checkMinValueValidation(key, insertNewDeltalinkEntry[key][j], j, insertNewDeltalinkEntry)) {
                                                                    doc[key] = insertNewDeltalinkEntry[key][j];
                                                                } else {
                                                                    dupDIDFinal.push(insertNewDeltalinkEntry[key][j] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!");
                                                                    resultErrors.push({ SerialNumber: insertNewDeltalinkEntry['DeltalinkSerialNumber'][j], Status: "Fail", Comment: insertNewDeltalinkEntry[key][j] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!" });
                                                                }
                                                            } else {
                                                                dupDIDFinal.push(insertNewDeltalinkEntry[key][j] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!");
                                                                resultErrors.push({ SerialNumber: insertNewDeltalinkEntry['DeltalinkSerialNumber'][j], Status: "Fail", Comment: insertNewDeltalinkEntry[key][j] + " - " + key + " Incorrect Value !!" });
                                                            }
                                                        } else {
                                                            dupDIDFinal.push(insertNewDeltalinkEntry[key][j] + " - " + key + " Incorrect Value !!");
                                                            resultErrors.push({ SerialNumber: insertNewDeltalinkEntry['DeltalinkSerialNumber'][j], Status: "Fail", Comment: insertNewDeltalinkEntry[key][j] + " - " + key + " Incorrect Value !!" });
                                                        }
                                                    } else {
                                                        dupDIDFinal.push(insertNewDeltalinkEntry[key][j] + " - " + key + " pattern doesn't Matches!!");
                                                        resultErrors.push({ SerialNumber: insertNewDeltalinkEntry['DeltalinkSerialNumber'][j], Status: "Fail", Comment: insertNewDeltalinkEntry[key][j] + " - " + key + " pattern doesn't Matches!!" });
                                                    }
                                                } else {
                                                    dupDIDFinal.push(insertNewDeltalinkEntry[key][j] + " - " + key + " Type is Wrong!!");
                                                    resultErrors.push({ SerialNumber: insertNewDeltalinkEntry['DeltalinkSerialNumber'][j], Status: "Fail", Comment: insertNewDeltalinkEntry[key][j] + " - " + key + " Type is Wrong!!" });
                                                }
                                            } else {
                                                dupDIDFinal.push(insertNewDeltalinkEntry[key][j] + " - " + key + " length is Wrong!!");
                                                resultErrors.push({ SerialNumber: insertNewDeltalinkEntry['DeltalinkSerialNumber'][j], Status: "Fail", Comment: insertNewDeltalinkEntry[key][j] + " - " + key + " length is Wrong!!" });
                                            }
                                        } else {
                                            dupDIDFinal.push(insertNewDeltalinkEntry[key][j] + " - " + key + " Field is Required!!");
                                            resultErrors.push({ SerialNumber: insertNewDeltalinkEntry['DeltalinkSerialNumber'][j], Status: "Fail", Comment: insertNewDeltalinkEntry[key][j] + " - " + key + " Field is Required!!" });
                                        }
                                    }
                                    if (Object.keys(insertNewDeltalinkEntry).length === Object.keys(doc).length) {
                                        dID.push(doc);
                                    }
                                }

                            }
                        }
                        //Case I: All Duplicate/Incorrect Entries
                        if (dID.length === 0) {
                            if (type == "Add") {
                                callback(null, "Failed to Add: Duplicate/Incorrect Deltalink Details!", dupDIDFinal, resultErrors);
                            } else
                                callback(null, "Failed to Upload: Duplicate/Incorrect file!", dupDIDFinal, resultErrors);
                        } else {
                            dbCon.getDb(function (err, db) {
                                if (err)
                                    callback(err, null, null);
                                else {
                                    var collectionName = db.delta_DeltaLink;
                                    //Case II : With New Entries
                                    if (dID.length > 0) {
                                        insertDeltalink(dID, dupDID, collectionName, jobsCollection, dupDIDFinal, resultErrors, metersCollection, callback);
                                    }
                                }
                            });
                        }
                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description -function to fetch Duplicate Mac Id from the MongoDB Collection.
* @param  collectionName,
* @param  callback - callback function returns success or error response
* @return callback function
*/

function getdupDeltalinkMACID(collectionName, callback) {
    try {
        var dupMACID = [];
        collectionName.find({}).toArray(function (err, DeltalinkDetails) {
            if (err) {
                callback(err, null, null);
            }
            else {
                if (DeltalinkDetails.length > 0) {
                    for (var i in DeltalinkDetails) {
                        if (DeltalinkDetails.hasOwnProperty(i)) {
                            if (DeltalinkDetails[i].DeltaLinks_Communications.MAC_ID_WiFi) {
                                dupMACID.push((DeltalinkDetails[i].DeltaLinks_Communications.MAC_ID_WiFi).toLowerCase())
                            }
                        }
                    }
                }
                callback(null, dupMACID)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/**
* @description -find the query result on the basis of condtion and Device Type
* @param collectionName
* @param condition 
* @param DeviceType - (Meter/Hyperhub/Hypersprout/Deltalink)
* @param callback - callback function returns success or error response
* @return callback function
*/

function findCursor(collectionName, condition, DeviceType, callback) {
    collectionName.find(condition).toArray(function (err, res) {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            callback(null, res)
        } else {
            callback(null, DeviceType + " not available");
        }

    });
}

/**
* @description - check Mandatory Validation
* @params key, value
* @return boolean
*/

function checkMandatoryValidation(key, value) {
    if (objValidation[key].Required && (value.length > 0 || isNaN(value) === false)) {
        return true;
    } else if (objValidation[key].Required && (value.length === 0 || isNaN(value) === true)) {
        return false;
    } else {
        return true;
    }
}



/**
* @description - check Min Length Validation
* @params key, value
* @return boolean
*/

function checkMinimumLengthValidation(key, value) {
    if (objValidation[key].MinLength && value.toString().length < objValidation[key].MinLength) {
        return false;
    } else {
        return true;
    }
}


/**
* @description - check Maximum Length Validation
* @params key, value
* @return boolean
*/

function checkMaximumLengthValidation(key, value) {
    if (objValidation[key].MaxLength && value.toString().length > objValidation[key].MaxLength) {
        return false
    } else {
        return true;
    }
}


/**
* @description - check Type Validation
* @params key, value
* @return boolean
*/
function checkTypeValidation(key, value) {
    if (objValidation[key].Type === "none") {
        return true;
    } else if (typeof value === objValidation[key].Type) {
        return true;
    } else {
        return false;
    }
}


/**
* @description - check Pattern Validation
* @params key, value
* @return boolean
*/
function checkPatternValidation(key, value) {
    if (!objValidation[key].Pattern) {
        return true;
    } else if (objValidation[key].Pattern && new RegExp(objValidation[key].Pattern).test(value)) {
        return true;
    } else {
        return false;
    }
}



/**
* @description - check Value Matches
* @params key, value
* @return boolean
*/

function checkValueMatches(key, value) {
    if (objValidation[key].Values.length == 0) {
        return true;
    } else if (objValidation[key].Values.indexOf(value) > -1) {
        return true;
    } else {
        return false;
    }
}


/**
* @description - check Max Value Validation
* @params key, value, index, data
* @return boolean
*/

function checkMaxValueValidation(key, value, index, data) {
    if (!objValidation[key].MaxValue) {
        return true;
    } else if (parseInt(value) > parseInt(data[objValidation[key].MaxValue][index])) {
        return false;
    } else {
        return true;
    }
}



/**
* @description - check min value validation
* @params key, value, index, data
* @return boolean
*/

function checkMinValueValidation(key, value, index, data) {
    if (!objValidation[key].MinValue) {
        return true;
    } else if (parseInt(value) < parseInt(data[objValidation[key].MinValue][index])) {
        return false;
    } else {
        return true;
    }
}

/**
* @description - check max value validation
* @params key, value, data
* @return boolean
*/

function checkMaxValueValidationEdit(key, value, data) {
    if (!objValidation[key].MaxValue) {
        return true;
    } else if (parseInt(value) > parseInt(data[objValidation[key].MaxValue])) {
        return false;
    } else {
        return true;
    }

}

/**
* @description - check min value validation
* @params key, value,  data
* @return boolean
*/

function checkMinValueValidationEdit(key, value, data) {
    if (!objValidation[key].MinValue) {
        return true;
    } else if (parseInt(value) < parseInt(data[objValidation[key].MinValue])) {
        return false;
    } else {
        return true;
    }
}



/**
* @description - insert Deltalink
* @params dID, dupDID, collectionName, jobsCollection, dupDIDFinal, callback 
* @return callback function
*/

function insertDeltalink(dID, dupDID, collectionName, jobsCollection, dupDIDFinal, resultErrors, metersCollection, callback) {
    try {
        let JobToInsert = [];
        let docsToInsert;
        if (dID.length > 500) {
            callback("Total number of records should not be more than 500", null);
        } else {
            const uniqueMeterID = [];
            async.each(dID,
                function (DID, callbackEach) {
                    let MID;
                    let jobDoc = {
                        "JobID": shortid.generate(),
                        "DeviceID": "NA",
                        "SerialNumber": DID.DeltalinkSerialNumber,
                        "DeviceType": "DeltaLink",
                        "JobName": "Registration Job",
                        "JobType": "Deltalink Registration",
                        "Status": "Pending",
                        "Group": "NA",
                        "CreatedDateTimestamp": new Date()
                    }
                    //Group Meter 
                    metersCollection.find({ "MeterSerialNumber": { $regex: new RegExp("^" + DID.GroupMeterSerialNo + "$", "i") } }).toArray(function (err, meterDetails) {
                        if (err)
                            callback(err, null);
                        else {

                            if (meterDetails.length > 0) {
                                MID = meterDetails[0].MeterID;
                                if (!uniqueMeterID.includes(meterDetails[0].MeterID))
                                    uniqueMeterID.push(meterDetails[0].MeterID);
                            }
                            else {
                                MID = null;
                            }
                        }
                        JobToInsert.push(jobDoc);
                        var id = "item_id";
                        nextID.getValueForNextSequenceItem(id, "DeltaLink", function (err, nextId) {
                            docsToInsert = {
                                "DeltalinkID": nextId,
                                "DeltalinkSerialNumber": DID.DeltalinkSerialNumber,
                                "ConfigID": 2,
                                "AppIDs": [],
                                "ConfigStatus": 'M',
                                "MeterID": MID,
                                "Status": 'NotRegistered',
                                "ConnDisconnStatus": 'Connected',
                                "Bandwidth": DID.Bandwidth,
                                "DownloadBandwidth": DID.DownloadBandwidth,
                                "UploadBandwidth": DID.UploadBandwidth,
                                "device_lock": 0,
                                "IsMaster": 'null',
                                "CreatedOn": new Date(), "RegistrationJobID": jobDoc.JobID,
                                "DeltaLinks_Communications": {
                                    "MAC_ID_WiFi": DID.DeltalinkWiFiMacID.toLowerCase()
                                },
                                "DeltaLinks_DeviceDetails": {
                                    "DeltalinkVersion": DID.DeltalinkVersion
                                }

                            }

                            collectionName.insertOne(docsToInsert, function (err, result) {
                                if (err) {
                                    insertError.putErrorDetails(err, callbackEach);
                                    callbackEach(err)
                                }
                                else {
                                    if (MID == null && DID.DeltalinkSerialNumber != "" && DID.DeltalinkSerialNumber){
                                        if(DID.GroupMeterSerialNo){
                                            resultErrors.push({ SerialNumber: DID.DeltalinkSerialNumber, Status: 'Pass', Comment: "Deltalink Details Successfully Added But Deltalink Not Grouped Due To Meter not registered or Invalid Meter SerialNumber"});

                                        }else{
                                            resultErrors.push({ SerialNumber: DID.DeltalinkSerialNumber, Status: 'Pass', Comment: "Deltalink Details Successfully Added"});

                                        }
                                    }
                                    else
                                        resultErrors.push({ SerialNumber: DID.DeltalinkSerialNumber, Status: "Pass", Comment: "Deltalink Details Successfully Added!" });
                                    //Continue the loop
                                    callbackEach()
                                }
                            });
                        });
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {

                        async.each(uniqueMeterID,
                            function (meterID, callbackcideach) {
                                collectionName.find({ MeterID: meterID }).count(function (err, NoOfDeltalinkAllocated) {
                                    metersCollection.update({ "MeterID": meterID }, { $set: { NoOfDeltalinkAllocated: NoOfDeltalinkAllocated } });
                                    callbackcideach();
                                });
                            });

                        jobsCollection.insertMany(JobToInsert, function (err, success) {
                            if (err)
                                callback(err, null, null);
                            else {
                                callback(null, "Deltalink Details Successfully Added!", dupDIDFinal, resultErrors);
                            }
                        });
                    }
                });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description -  For the Webservice - EditDeltalinkDetails, UPDATE Deltalink details IN MONGODB
* @params updateDeltalinkValues, callback
* @return callback function
*/

function editDeltalinkDetails(updateDeltalinkValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            editDeltalinkDetailsFromMongoDB(db.delta_DeltaLink, updateDeltalinkValues, callback);
    });
}



/**
* @description -  For the Webservice - EditDeltalinkDetails
* @params collectionName, updateDeltalinkValues, callback
* @return callback function
*/

function editDeltalinkDetailsFromMongoDB(collectionName, updateDeltalinkValues, callback) {
    try {
        var dID = updateDeltalinkValues.DeltalinkID;
        let errorFinal = [];
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_DeltaLink;
                if (updateDeltalinkValues.DeltalinkBandwidthFlag === "Y") {
                    collectionName.find({ DeltalinkID: dID, /*BandwidthChangeStatus: "Success"*/ }, { _id: 0, DeltalinkID: 1, BandwidthChangeStatus: 1 }).toArray(function (err, bandwidthStatus) {
                        if (err)
                            callback(err, null);
                        else if (bandwidthStatus.length > 0) {
                            if (bandwidthStatus[0].BandwidthChangeStatus === "Success") {
                                updateDeltalink(updateDeltalinkValues, CName, "Y", errorFinal, callback);
                            }
                            else if (bandwidthStatus[0].BandwidthChangeStatus === "Sent") {
                                errorFinal.push("Unable to update Deltalink bandwidth due to no response from device!")
                                updateDeltalink(updateDeltalinkValues, CName, "N", errorFinal, callback);
                            } else if (!bandwidthStatus[0].BandwidthChangeStatus) {
                                errorFinal.push("Unable to update Deltalink bandwidth due to no response from device end or Device not connected!")
                                updateDeltalink(updateDeltalinkValues, CName, "N", errorFinal, callback);
                            }
                            else {
                                callback(null, bandwidthStatus[0].BandwidthChangeStatus);
                            }
                        } else {
                            errorFinal.push("Unable to update Deltalink bandwidth due to no response from device end or Device not connected!")
                            updateDeltalink(updateDeltalinkValues, CName, "N", errorFinal, callback);

                        }
                    });
                } else
                    updateDeltalink(updateDeltalinkValues, CName, "Y", errorFinal, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description - update Deltalink
* @params updateDeltalinkValues, collectionName, callback
* @return callback function
*/

function updateDeltalink(updateDeltalinkValues, collectionName, bandwidthChangeStatus, errorFinal, callback) {
    try {
        var dSN = updateDeltalinkValues.DeltalinkSerialNumber;
        var dID = updateDeltalinkValues.DeltalinkID;
        var dupDID = [];
        var dupDSN = [];
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_DeltaLink;
                var meterCollection = db.delta_Meters;
                var HsCollection = db.delta_Hypersprouts;
                var jobCollection = db.delta_Jobs;
                collectionName.find({ DeltalinkID: dID }).toArray(function (err, details) {
                    if (err)
                        callback(err, null);
                    else if (details.length > 0) {
                        collectionName.find({ DeltalinkSerialNumber: { $regex: new RegExp("^" + dSN + "$", "i") } }).toArray(function (err, dupDeltalinkSerialNum) {
                            if (err)
                                callback(err, null);
                            else {
                                if (dupDeltalinkSerialNum.length > 0) {
                                    for (var i in dupDeltalinkSerialNum) {
                                        if (dupDeltalinkSerialNum.hasOwnProperty(i)) {
                                            dupDID.push(dupDeltalinkSerialNum[i].DeltalinkID);
                                            dupDSN.push(dupDeltalinkSerialNum[i].DeltalinkSerialNumber);
                                        }
                                    }
                                    if (dupDID[0] === dID) {
                                        //Case I : DeltalinkSerialNumber not changed for Update
                                        updateDeltalinkDetailsMongoDB(updateDeltalinkValues, CName, meterCollection, HsCollection, jobCollection, bandwidthChangeStatus, errorFinal, callback);
                                    } else {
                                        // Case II: Duplicate DeltalinkSerialNumber or DeltalinkSerialNumber already present in system
                                        callback("Duplicate Deltalink Serial Number!", null);
                                    }
                                } else {
                                    if (dupDeltalinkSerialNum.length === 0) {
                                        // Case III : When DeltalinkSerialNumber is not duplicate
                                        updateDeltalinkDetailsMongoDB(updateDeltalinkValues, CName, meterCollection, HsCollection, jobCollection, bandwidthChangeStatus, errorFinal, callback);
                                    }
                                }
                            }
                        });
                    } else {
                        callback("invalid DeltalinkID!!", null)
                    }
                })
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};




/**
* @description - update Deltalink Details MongoDB
* @params updateDeltalinkValues, collectionName, callback
* @return callback function
*/

function updateDeltalinkDetailsMongoDB(updateDeltalinkValues, collectionName, meterCollection, HsCollection, jobsCollection, bandwidthChangeStatus, errorFinal, callback) {
    try {
        collectionName.find({ DeltalinkID: updateDeltalinkValues.DeltalinkID, "DeltalinkSerialNumber": { $regex: new RegExp("^" + updateDeltalinkValues.DeltalinkSerialNumber + "$", "i") }, "DeltaLinks_Communications.MAC_ID_WiFi": { $regex: new RegExp("^" + updateDeltalinkValues.DeltalinkWiFiMacID + "$", "i") }, "DeltaLinks_DeviceDetails.DeltalinkVersion": updateDeltalinkValues.DeltalinkVersion, "Bandwidth": updateDeltalinkValues.Bandwidth, "DownloadBandwidth": updateDeltalinkValues.DownloadBandwidth, "UploadBandwidth": updateDeltalinkValues.UploadBandwidth }).toArray(function (err, notUpdatedDLDetails) {
            if (err) {
                callback(err, null);
            } else if (notUpdatedDLDetails.length > 0) {
                callback("Deltalink Details not updated", null);
            } else {
                collectionName.find({ DeltalinkID: updateDeltalinkValues.DeltalinkID }).toArray(function (err, DLDetails) {
                    if (err)
                        callback(err, null);
                    else if (DLDetails.length === 0)
                        callback("No such Deltalink available", null);
                    else if (updateDeltalinkValues.DeltalinkVersion > 255.255) {
                        return callback(updateDeltalinkValues.DeltalinkVersion + " Deltalink Version should be less than or equal to  255.255 !!", null);

                    } else if (updateDeltalinkValues.DeltalinkVersion > 255 && updateDeltalinkValues.DeltalinkVersion > 255.255) {
                        return callback(updateDeltalinkValues.DeltalinkVersion + " Deltalink Version should be less than or equal to  255.255 !!", null);

                    }
                    else {
                        for (var key in updateDeltalinkValues) {
                            if (checkMandatoryValidation(key, updateDeltalinkValues[key])) {
                                if (checkMinimumLengthValidation(key, updateDeltalinkValues[key]) &&
                                    checkMaximumLengthValidation(key, updateDeltalinkValues[key])) {
                                    if (checkTypeValidation(key, updateDeltalinkValues[key])) {
                                        if (checkPatternValidation(key, updateDeltalinkValues[key])) {
                                            if (checkValueMatches(key, updateDeltalinkValues[key])) {
                                                if (checkMaxValueValidationEdit(key, updateDeltalinkValues[key], updateDeltalinkValues)) {
                                                    if (checkMinValueValidationEdit(key, updateDeltalinkValues[key], updateDeltalinkValues)) {
                                                        if(duplicateItems.toCheckMulticastMACAddress(updateDeltalinkValues.DeltalinkWiFiMacID.toLowerCase()) == 1){
                                                            return callback(`${updateDeltalinkValues.DeltalinkWiFiMacID} multicast Wifi Mac ID not allowed!!`, null);
                                                        }else{

                                                        }
                                                    } else {
                                                        return callback(key + " is Minimum than " + objValidation[key].MinValue + "Value !!", null)
                                                    }
                                                } else {
                                                    return callback(key + " is Maximum than " + objValidation[key].MaxValue + "Value !!", null)
                                                }
                                            } else {
                                                return callback(key + " Incorrect Value !!", null)

                                            }
                                        } else {
                                            return callback(key + " pattern doesn't Matches!!", null)
                                        }
                                    } else {
                                        return callback(key + " Type is Wrong!!", null)
                                    }
                                } else {
                                    return callback(key + " length is Wrong!!", null)
                                }
                            } else {
                                return callback(key + " Field is Required!!", null)
                            }
                        }
                        if (updateDeltalinkValues.Bandwidth == 0) {
                            updateDeltalinkValues.DownloadBandwidth = 1;
                            updateDeltalinkValues.UploadBandwidth = 1;
                        }
                        if (DLDetails[0].DeltaLinks_Communications.MAC_ID_WiFi.toLowerCase() !== updateDeltalinkValues.DeltalinkWiFiMacID.toLowerCase()) {
                            collectionName.find({ "DeltaLinks_Communications.MAC_ID_WiFi": { $regex: new RegExp("^" + updateDeltalinkValues.DeltalinkWiFiMacID + "$", "i") } }).toArray(function (err, macIDs) {
                                if (err)
                                    callback(err, null);
                                else if (macIDs.length > 0)
                                    callback("MAC ID already in use !!", null);
                                else {
                                    var regMac = /^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/;
                                    if (regMac.test(updateDeltalinkValues.DeltalinkWiFiMacID)) {
                                        var newMacIDs = [];
                                        var oldMac = DLDetails[0].DeltaLinks_Communications.MAC_ID_WiFi;
                                        newMacIDs.push(oldMac);
                                        var MacAdd = [];
                                        newMacIDs.push(updateDeltalinkValues.DeltalinkWiFiMacID);
                                        MacAdd[updateDeltalinkValues.DeltalinkWiFiMacID.toLowerCase()] = 'deltalink';
                                        if (bandwidthChangeStatus == "Y") {
                                            updateDetails = { "DeltalinkID": updateDeltalinkValues.DeltalinkID, "DeltalinkSerialNumber": updateDeltalinkValues.DeltalinkSerialNumber, "DeltaLinks_Communications.MAC_ID_WiFi": (updateDeltalinkValues.DeltalinkWiFiMacID).toLowerCase(), "DeltaLinks_DeviceDetails.DeltalinkVersion": updateDeltalinkValues.DeltalinkVersion, "Bandwidth": updateDeltalinkValues.Bandwidth, "DownloadBandwidth": updateDeltalinkValues.DownloadBandwidth, "UploadBandwidth": updateDeltalinkValues.UploadBandwidth };
                                        } else {
                                            updateDetails = { "DeltalinkID": updateDeltalinkValues.DeltalinkID, "DeltalinkSerialNumber": updateDeltalinkValues.DeltalinkSerialNumber, "DeltaLinks_Communications.MAC_ID_WiFi": (updateDeltalinkValues.DeltalinkWiFiMacID).toLowerCase(), "DeltaLinks_DeviceDetails.DeltalinkVersion": updateDeltalinkValues.DeltalinkVersion };
                                        }
                                        collectionName.update({ DeltalinkID: updateDeltalinkValues.DeltalinkID }, { $set: updateDetails }, function (err, updateDeltalink) {
                                            if (err)
                                                insertError.putErrorDetails(err, callback);
                                            else {


                                                meterCollection.find({ MeterID: DLDetails[0].MeterID }).toArray(function (err, MDetails) {
                                                    if (err)
                                                        callback(err, null);
                                                    else {
                                                        if (MDetails.length > 0) {
                                                            HsCollection.find({ Status: "Registered", TransformerID: MDetails[0].TransformerID }).toArray(function (err, HSDetails) {
                                                                if (err)
                                                                    callback(err, null);
                                                                else {
                                                                    if (HSDetails.length > 0) {
                                                                        HSDetail = HSDetails[0];
                                                                        var msgID, JobType;
                                                                        var jobdoc = [];
                                                                        if ((HSDetail.MessageID == 255) || (HSDetail.MessageID == null) || (HSDetail.MessageID == undefined))
                                                                            msgID = 0;
                                                                        else
                                                                            msgID = ++HSDetail.MessageID;
                                                                        JobType = "Mac Acl DL Update";

                                                                        jobdoc.push({
                                                                            "JobID": shortid.generate(),
                                                                            "DeviceID": HSDetail.DeviceID,
                                                                            "SerialNumber": HSDetail.HypersproutSerialNumber,
                                                                            "DeviceType": "DeltaLink",
                                                                            "JobName": "Mac Updation Job",
                                                                            "JobType": JobType,
                                                                            "Status": "Pending",
                                                                            "Group": "NA",
                                                                            "MessageID": msgID,
                                                                            "CreatedDateTimestamp": new Date(),
                                                                            "MacID": newMacIDs[1]
                                                                        });
                                                                        dbCmd.sendMacIDs(HsCollection, newMacIDs, msgID, HSDetail, JobType, function (err, resp) {
                                                                            for (var key in jobdoc) {
                                                                                jobdoc[key].PacketSent = resp;
                                                                            }
                                                                            jobsCollection.insertOne(jobdoc, function (err, resp) {
                                                                                if (updateDeltalink !== null) {
                                                                                    callback(null, "Deltalink Details Successfully Updated!", errorFinal);
                                                                                }
                                                                            });

                                                                        });
                                                                    } else {
                                                                        return callback(null, "Hypersprout not available!");
                                                                    }
                                                                }

                                                            });
                                                        } else {
                                                            callback(null, "Deltalink Details Successfully Updated!", errorFinal)
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        callback("Wrong Mac ID", null);
                                    }
                                }
                            });
                        } else {
                            if (bandwidthChangeStatus == "Y") {
                                collectionName.update({ DeltalinkID: updateDeltalinkValues.DeltalinkID }, { $set: { "DeltalinkID": updateDeltalinkValues.DeltalinkID, "DeltalinkSerialNumber": updateDeltalinkValues.DeltalinkSerialNumber, "DeltaLinks_Communications.MAC_ID_WiFi": updateDeltalinkValues.DeltalinkWiFiMacID.toLowerCase(), "DeltaLinks_DeviceDetails.DeltalinkVersion": updateDeltalinkValues.DeltalinkVersion, "Bandwidth": updateDeltalinkValues.Bandwidth, "DownloadBandwidth": updateDeltalinkValues.DownloadBandwidth, "UploadBandwidth": updateDeltalinkValues.UploadBandwidth } }, function (err, updateDeltalink) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else {
                                        if (updateDeltalink !== null) {
                                            callback(null, "Deltalink Details Successfully Updated!", errorFinal);
                                        }
                                    }
                                });
                            } else {
                                collectionName.update({ DeltalinkID: updateDeltalinkValues.DeltalinkID }, { $set: { "DeltalinkID": updateDeltalinkValues.DeltalinkID, "DeltalinkSerialNumber": updateDeltalinkValues.DeltalinkSerialNumber, "DeltaLinks_Communications.MAC_ID_WiFi": (updateDeltalinkValues.DeltalinkWiFiMacID).toLowerCase(), "DeltaLinks_DeviceDetails.DeltalinkVersion": updateDeltalinkValues.DeltalinkVersion } }, function (err, updateDeltalink) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else {
                                        if (updateDeltalink !== null) {
                                            callback(null, "Deltalink Details Successfully Updated!", errorFinal);
                                        }
                                    }
                                });
                            }

                        }

                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};



/**
* @description -  edit Deltalink Bandwidth Details
* @params DeltalinkID, callback
* @return callback function
*/

function editDeltalinkBandwidthDetails(DeltalinkID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            editDeltalinkBandwidthDetailsFromMongoDB(db.delta_DeltaLink, db.delta_Meters, db.delta_Hypersprouts, db.delta_SchedulerFlags, DeltalinkID, callback);
    });
};

/**
* @description - edit Deltalink Bandwidth Details From MongoDB
* @params collectionName, collectionName1, collectionName2, DeltalinkID, callback
* @return callback function
*/

function editDeltalinkBandwidthDetailsFromMongoDB(deltalinkCollection, meterCollection, hyperSproutCollection, schedulerFlagCollection, DeltalinkID, callback) {
    try {
        deltalinkCollection.find({ "DeltalinkID": DeltalinkID, "Status": "Registered" }).toArray(function (err, deltalinkDetails) {
            if (err)
                callback(err, null);
            else {
                if (deltalinkDetails.length > 0) {
                    if (deltalinkDetails[0].MeterID) {
                        var meterID = deltalinkDetails[0].MeterID;
                        meterCollection.find({ "MeterID": meterID, "Status": "Registered" }).toArray(function (err, meterKwHdetails) {
                            if (err)
                                callback(err, null);
                            else {
                                if (meterKwHdetails.length !== 0) {
                                    if (meterKwHdetails[0].HypersproutID != null || meterKwHdetails[0].HypersproutID != "null") {
                                        hyperSproutCollection.find({ "HypersproutID": meterKwHdetails[0].HypersproutID, "Status": "Registered" }, { "DeviceID": 1, "_id": 0 }).toArray(function (err, deviceIDdetails) {
                                            if (err)
                                                callback(err, null);
                                            else {
                                                if (deviceIDdetails.length !== 0) {
                                                    if (deviceIDdetails[0].DeviceID) {
                                                        deltalinkDetails.push(deviceIDdetails[0].DeviceID)
                                                        deltalinkDetails.push(meterKwHdetails[0].HypersproutID);
                                                        var DeviceID = deltalinkDetails[1];
                                                        schedulerFlagCollection.find({ "DeviceID": DeviceID }, { "MessageID": 1, "Flag": 1, "_id": 0 }).toArray(function (err, messageIDdetails) {
                                                            if (err)
                                                                callback(err, null);
                                                            else {
                                                                if (messageIDdetails.length > 0 && (messageIDdetails[0].MessageID && (messageIDdetails[0].Flag != null || messageIDdetails[0].Flag != undefined))) {
                                                                    var Flag = [];
                                                                    Flag.push(messageIDdetails[0].Flag);
                                                                    deltalinkDetails.push(messageIDdetails[0].MessageID);
                                                                    deltalinkDetails.push(messageIDdetails[0].Flag);
                                                                    callback(null, deltalinkDetails);

                                                                } else {
                                                                    callback("Scheduler Flag not available", null)
                                                                }
                                                            }
                                                        })
                                                    } else {
                                                        callback("Device not found! ", null)
                                                    }

                                                } else {
                                                    callback("Hypersprout not available", null)
                                                }
                                            }
                                        })
                                    } else {
                                        callback("Meter not grouped to send request to HS")
                                    }
                                } else {
                                    callback("Meter not available", null)

                                }
                            }
                        })
                    } else {
                        callback("DeltaLink not grouped to the Meter", null)
                    }

                } else {
                    callback("DeltaLink not available", null);
                }
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - For the Webservice - EditDeltalinkDetails,Job creation for Bandwidth change req in Deltalink Edit 
* @params deltalinkID, deltalinkSerialNumber, callback
* @return callback function
*/

function DeltalinkBandwidthJobInsert(deltalinkID, deltalinkSerialNumber, callback) {
    try {
        var jobInsert = {
            "JobID": shortid.generate(),
            "DeviceID": deltalinkID,
            "SerialNumber": deltalinkSerialNumber,
            "DeviceType": "DeltaLink",
            "JobName": "Bandwidth Limitations",
            "JobType": "Deltalink BandwidthChangeJobs",
            "Status": "Pending",
            "Group": "None",
            "CreatedDateTimestamp": new Date(),
            "BandwidthChangeStatus": "Sent"

        };
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                DeltalinkBandwidthJobInsertFromMongoDB(db.delta_Jobs, db.delta_DeltaLink, deltalinkID, jobInsert, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - For the Webservice - EditDeltalinkDetails 
* @params jobCollection, deltalinkCollection, DeltalinkID, jobToInsert, callback 
* @return callback function
*/

function DeltalinkBandwidthJobInsertFromMongoDB(jobCollection, deltalinkCollection, DeltalinkID, jobToInsert, callback) {
    try {
        var JobID = [];
        jobCollection.insertOne(jobToInsert, function (err, jobsInserted) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                deltalinkCollection.update({ "DeltalinkID": DeltalinkID }, { "$set": { "BandwidthEditJobID": jobToInsert.JobID, "BandwidthChangeStatus": "Sent" } }, function (err, jobDetailsUpdateDeltalinks) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        JobID = jobToInsert.JobID;
                        callback(null, JobID);
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description - For the Webservice - EditDeltalinkDetails
* @params DeltalinkID, JobID, callback  
* @return callback function
*/

function DetalinkBandwidthRequestDelayed(DeltalinkID, JobID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            DetalinkBandwidthRequestDelayedMongoDB(db.delta_Jobs, DeltalinkID, JobID, callback);
    });
};


/**
* @description -Deltalink Bandwidth Request Delayed MongoDB
* @params jobCollection, DeltalinkID, JobID, callback
* @return callback function
*/
function DetalinkBandwidthRequestDelayedMongoDB(jobCollection, DeltalinkID, JobID, callback) {
    try {
        jobCollection.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, deltalinkBandwidthJobStatus) {
            if (err)
                callback(err, null);
            else {
                var Status = deltalinkBandwidthJobStatus[0].Status;
                if (Status === "Pending") {
                    jobCollection.update({ "JobID": JobID }, { "$set": { "Status": "Failed", "EndTime": new Date() } }, function (err, delayStatusUpdate) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else
                            callback(null, "Deltalink Bandwidth Delayed in Response Successfully handled!");
                    });
                }
                else
                    callback(null, "Deltalink Bandwidth Delayed Successfully Completed!");
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};



/**
* @description - edit Deltalink Bandwidth Reponse
* @params deltalinkID, status, attribute callback
* @return callback function
*/

function editDeltalinkBandwidthReponse(deltalinkID, status, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            editDeltalinkBandwidthReponseFromMongoDB(db.delta_DeltaLink, db.delta_Jobs, deltalinkID, status, callback);
    });
}


/**
* @description - edit Deltalink Bandwidth Reponse From MongoDB
* @params deltalinkCollection, jobsCollection, deltalinkID, status, attribute, callback
* @return callback function
*/

function editDeltalinkBandwidthReponseFromMongoDB(deltalinkCollection, jobsCollection, deltalinkID, status, callback) {
    var Message;
    deltalinkID = parseInt(deltalinkID)
    deltalinkCollection.find({ DeltalinkID: deltalinkID }, { BandwidthEditJobID: 1 }).toArray(function (err, bandwidthDeltalinkEditJobID) {
        if (err)
            callback(err, null);
        else {
            var JobID = bandwidthDeltalinkEditJobID[0].BandwidthEditJobID;
            if (status === 1) {
                deltalinkCollection.update({ DeltalinkID: deltalinkID }, { $set: { "BandwidthChangeStatus": "Success" } }, function (err, updateDeltalinkBandwidth) {
                    if (err)
                        callback(err, null);
                    else {
                        jobsCollection.update({ JobID: JobID }, { $set: { "Status": "Completed", "EndTime": new Date(), "BandwidthChangeStatus": "Success" } }, function (err, updateDeltalinkBandwidthJob) {
                            if (err)
                                callback(err, null);
                            else
                                callback(null, updateDeltalinkBandwidthJob);
                        });
                    }
                });
            } else {
                if (status === 2) {
                    Message = "Invalid Lengh(Length!=8 OR the parameters) !!";
                } else if (status === 3) {
                    Message = "Invalid Characters Received !!";
                } else {
                    Message = "Parameters Not in Range !!";
                }
                deltalinkCollection.update({ DeltalinkID: deltalinkID }, { $set: { "BandwidthChangeStatus": "Failed:" + Message } }, function (err, updateDeltalinkBandwidth) {
                    if (err)
                        callback(err, null);
                    else {
                        jobsCollection.update({ JobID: JobID }, { $set: { "Status": "Failed", "EndTime": new Date() } }, function (err, updateDeltalinkBandwidthJob) {
                            if (err)
                                callback(err, null);
                            else
                                callback(updateDeltalinkBandwidthJob, null);
                        });
                    }
                });
            }
        }
    });
}


/**
* @description - For the Webservice - getAllDeltalinkDetails, SELECT AllDeltalinkDetails lists details FROM MONGODB 
* @param deltainkDetails object 
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectAllDeltalinkDetails(deltainkDetails, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                if (!deltainkDetails.search || deltainkDetails.search == null || deltainkDetails.search == "null") {
                    let deltalinkCollection = db.delta_DeltaLink;
                    if (deltainkDetails.deviceStatus == "registered") {
                        let whereCondition = { "Status": "Registered", "IsMaster": true }
                        paginatedResults.paginatedResults(deltalinkCollection, whereCondition, deltainkDetails, "Deltalink", function (err, List) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, List)
                            }
                        })
                    } else if (deltainkDetails.deviceStatus == "notRegistered") {
                        let whereCondition = { Status: "NotRegistered", $or: [{ IsMaster: true }, { IsMaster: "null" }, { IsMaster: null }] }
                        paginatedResults.paginatedResults(deltalinkCollection, whereCondition, deltainkDetails, "Deltalink", function (err, List) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, List)
                            }
                        })
                    } else if (deltainkDetails.deviceStatus == "all") {
                        let whereCondition
                        if (deltainkDetails.meterID) {
                            if (isNormalInteger(deltainkDetails.meterID)) {
                                whereCondition = { "MeterID": parseInt(deltainkDetails.meterID) }
                            } else {
                                if (deltainkDetails.meterID == "null" || deltainkDetails.meterID == 'null') {
                                    whereCondition = { $or: [{ "MeterID": "null" }, { "MeterID": null }] }

                                } else {
                                    whereCondition = { "MeterID": deltainkDetails.meterID }

                                }
                            }
                        } else {
                            whereCondition = {}
                        }
                        paginatedResults.paginatedResults(deltalinkCollection, whereCondition, deltainkDetails, "Deltalink", function (err, List) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, List)
                            }
                        })
                    } else {
                        callback("invalid deviceStatus !!", null)
                    }
                } else {
                    let deltalinkCollection = db.delta_DeltaLink;
                    let query;
                    query = { DeltalinkSerialNumber: { $regex: new RegExp(deltainkDetails.search, "i") } };
                    if (deltainkDetails.deviceStatus == "registered") {
                        let whereCondition = { $and: [{ "Status": "Registered", "IsMaster": true }, query] }
                        paginatedResults.paginatedResults(deltalinkCollection, whereCondition, deltainkDetails, "Deltalink", function (err, List) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, List)
                            }
                        })
                    } else if (deltainkDetails.deviceStatus == "notRegistered") {
                        query = { DeltalinkSerialNumber: { $regex: new RegExp(deltainkDetails.search, "i") } };
                        let whereCondition = { $and: [{ "Status": "NotRegistered", $or: [{ "IsMaster": true }, { "IsMaster": "null" }, { "IsMaster": null }] }, query] }
                        paginatedResults.paginatedResults(deltalinkCollection, whereCondition, deltainkDetails, "Deltalink", function (err, List) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, List)
                            }
                        })
                    } else if (deltainkDetails.deviceStatus == "all") {
                        let whereCondition
                        query = { DeltalinkSerialNumber: { $regex: new RegExp(deltainkDetails.search, "i") } };

                        if (deltainkDetails.meterID) {
                            if (isNormalInteger(deltainkDetails.meterID)) {
                                whereCondition = { $and: [{ "MeterID": parseInt(deltainkDetails.meterID) }, query] }
                            } else {
                                if (deltainkDetails.meterID == "null" || deltainkDetails.meterID == 'null') {
                                    whereCondition = { $and: [{ $or: [{ "MeterID": "null" }, { "MeterID": null }] }, query] }

                                } else {
                                    whereCondition = { $and: [{ "MeterID": deltainkDetails.meterID }, query] }
                                }
                            }
                        } else {
                            whereCondition = query
                        }
                        paginatedResults.paginatedResults(deltalinkCollection, whereCondition, deltainkDetails, "Deltalink", function (err, List) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, List)
                            }
                        })
                    } else {
                        callback("invalid deviceStatus !!", null)
                    }
                }

            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}

/**
* @description -For the Webservice - deltalinkDetails, DELETE Deltalink details IN MONGODB
* @param deltalinkDetails 
* @param callback - callback function returns success or error response
* @return callback function
*/

function deleteDeltalinkDetails(deltalinkDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            deleteDeltalinkDetailsFromMongoDB(db.delta_DeltaLink, deltalinkDetails, callback);
        }
    });
}


/**
* @description -For the Webservice - deleteDeltalinkDetailsFromMongoDB, DELETE Deltalink details IN MONGODB
* @param deltalinkDetails 
* @param callback - callback function returns success or error response
* @return callback function
*/

function deleteDeltalinkDetailsFromMongoDB(collectionName, deltalinkDetails, callback) {
    try {
        let deltalinkIDtoDelete = [];
        let errorFinal = [];
        let groupedDL = [];
        // map() return a new array of Deltalink having only integer values and  integerValue function return an Integer values
        let deltalinkID = (deltalinkDetails.DeltalinkID).map(integerValue);
        collectionName.find({ DeltalinkID: { $in: deltalinkID } }).toArray(function (err, deltalinktoDelete) {
            if (err)
                callback(err, null);
            else {
                if (deltalinktoDelete.length > 0) {
                    for (var i in deltalinktoDelete) {
                        if (deltalinktoDelete.hasOwnProperty(i)) {
                            if (deltalinktoDelete[i].MeterID == null || deltalinktoDelete[i].MeterID == "null") {
                                deltalinkIDtoDelete.push(deltalinktoDelete[i].DeltalinkID);
                            } else {
                                groupedDL.push(deltalinktoDelete[i].DeltalinkID)
                            }

                        }
                    }
                    collectionName.deleteMany({ DeltalinkID: { $in: deltalinkIDtoDelete } }, function (err, deltalinkDeleted) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else if (deltalinkIDtoDelete.length === deltalinkID.length)
                            callback(null, "Deltalink Deleted Successfully!", errorFinal);
                        else {
                            for (var i in deltalinkID) {
                                if (!deltalinkIDtoDelete.includes(deltalinkID[i]) && (!groupedDL.includes(deltalinkID[i]))) {
                                    errorFinal.push("invalid DeltalinkID: " + deltalinkID[i])
                                }
                            }
                            callback(null, "Deltalink deleted successfully!, if not deleted, please try to ungroup them before deleting", errorFinal);
                        }
                    });

                } else {
                    callback("invalid DeltalinkID(s)", null)
                }

            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

}

// function return an Integer values

function integerValue(x) {
    return parseInt(x);
}


/**
* @description -  create new Device group in system
* @param groupName - group name , 
* @param description - group description
* @param type - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function createNewDLMAppGroup(groupName, description, type, callback) {
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
                                "Description": description,
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
};



/**
* @description - Find data from  app group ,for the Webservice - DLMGrpmgmt
* @param type  - Device type
* @param callbackEnd  - callback called after success or failure of async waterfall execution of functions, 
* @return callback function.
*/
function findFromMongoDB_DLM(type, queryParams, callbackEnd) {
    async.waterfall(
        [
            async.apply(getDataFromDELTA_AppGroups_DL, type, queryParams),
            getDLApplicationMemberCount

        ],
        function (err, dataFromAppGrps, appCount) {
            if (err)
                callbackEnd && callbackEnd(err, null, null, null, null);
            else
                callbackEnd && callbackEnd(null, dataFromAppGrps, appCount);
        });
};

/**
* @description -  App group collection data
* @param configGrpsData  - config group data object
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDataFromDELTA_AppGroups_DL(type, queryParams, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var collectionName = db.delta_AppGroups;
            findCollectionDataFromMongoDB_DL(collectionName, type, queryParams, function (err, appConfigData) {
                if (err)
                    callback(err, null, null);
                else
                    callback(null, appConfigData);
            });
        }
    });
};



/**
* @description -  Find All Collection Data by Type From MongoDB
* @param collectionName  - Name of mongoDB collection
* @param type  - device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function findCollectionDataFromMongoDB_DL(collectionName, type, queryParams, callback) {
    paginatedResults.paginatedResults(collectionName, { Type: type }, queryParams, "AppGroup", function (err, docs) {
        if (err)
            return callback(err, null);
        else {
            docs.type = type;
            docs.queryParams = queryParams;
            callback(null, docs);

        }
    })
};


/**
* @description -  get app member count
* @param appConfigData  - app config data object
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDLApplicationMemberCount(appConfigData, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            var ApplicationIDs = [];
            var collection2;
            var collection1 = db.delta_AppGroups;
            if (appConfigData.type === "HyperSprout")
                collection2 = db.delta_Hypersprouts;
            else if (appConfigData.type === "Meter")
                collection2 = db.delta_Meters;
            else
                collection2 = db.delta_DeltaLink;
            collection1.find({ Type: appConfigData.type }, { GroupID: 1, _id: 0 }).toArray(function (err, docs) {
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
                        else {
                            appCount.sort((a, b) => (a.AppID > b.AppID) ? 1 : ((b.AppID > a.AppID) ? -1 : 0));
                            appCount = paginate(appCount, appConfigData.queryParams.page, appConfigData.queryParams.limit);
                            delete appConfigData.type;
                            delete appConfigData.queryParams;
                            callback(null, appConfigData, appCount);
                        }

                    });
            });
        };
    });
}

// function to return list on the basis of page number and page limit
function paginate(array, page, limit) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page - 1) * limit, page * limit);
}


/**
* @description -  Assign deltalink to groups, for DLMGrpMgmtAssigngrpMembershipAssignEndpoint Web Service
* @param listDelalinks  - List of Deltalink Seria Numbers to be grouped 
* @param Action  - Add / Remove Deltalink
* @param type - Device type
* @param callback - callback function returns success or error response
* @return callback function
*/
function assignDeltalinksGroups(GroupName, listDelalinks, Action, type, callback) {
    var serialNumbers = listDelalinks;
    getDLAppIDFromDELTA_AppGroupsByCondition(GroupName, serialNumbers, Action, type, function (err, result, serialNumbersNotUpdated) {
        if (err)
            callback(err, null, serialNumbersNotUpdated);
        else
            callback(null, result, serialNumbersNotUpdated);
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
function getDLAppIDFromDELTA_AppGroupsByCondition(GroupName, serialNumbers, Action, type, callback) {
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
                    collection2 = db.delta_DeltaLink;
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
                                            if (serialNumbersWhichDoNotHaveAppID[count].AppIDs.length < 8) {
                                                serialNumbersToAssignAppID.push(serialNumbersWhichDoNotHaveAppID[count].DeltalinkSerialNumber);
                                            } else {
                                                serialNumbersNotToProcess.push(serialNumbersWhichDoNotHaveAppID[count].DeltalinkSerialNumber);
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
                                            return callback('No Serial Number found to ADD', null, serialNumbersNotToProcess);
                                        }
                                    } else {
                                        return callback('No Serial Number found to ADD', null, serialNumbersWhichHaveAppID);
                                    }
                                    break;
                                case "Remove":
                                    if (serialNumbersWhichHaveAppID.length === 0) {
                                        return callback('No Serial Number found to remove', null, serialNumbersWhichDoNotHaveAppID);
                                    } else {
                                        var serialNumbersToRemoveAppID = [];
                                        for (var key in serialNumbersWhichHaveAppID) {
                                            if (serialNumbersWhichHaveAppID.hasOwnProperty(key))
                                                serialNumbersToRemoveAppID.push(serialNumbersWhichHaveAppID[key].DeltalinkSerialNumber);
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
                                    return callback('Invalid Action', null, null);
                            }
                        }
                    });

                }
            });
        }
    });
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
    collectionName.find({ GroupName: AppName, Type: Type }).toArray(function (err, docs) {
        if (err)
            callback(err, null);
        else {
            if (docs[0] !== undefined)
                return callback(null, docs[0].GroupID);
            else
                return callback('Invalid Group Name', null);
        }
    });
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
    if (type === "DeltaLink") {
        collectionName.find({ DeltalinkSerialNumber: { $in: serialNumbers } }).toArray(function (err, dataFromMatchingSrNumbers) {
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
        return callback("Wrong Type", null, null);
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
    collectionname.updateMany({ DeltalinkSerialNumber: { $in: serialNumber } }, { $push: { AppIDs: docs } }, function (err, result) {
        if (err)
            return callback(err, null);
        else
            return callback(null, result);
    });

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
    if (type == "DeltaLink") {
        collectionname.updateMany({ DeltalinkSerialNumber: { $in: serialNumber } }, { $pull: { AppIDs: docs } }, function (err, result) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else
                return callback(null, result);
        });
    } else {
        return callback("Wrong Type", null);
    }
};

/* @description - Select Job Status details from MONGODB , For the Webservice - JobsList 
* @param  data - type - DeviceType
* @param data -startTime  - start time
* @param data- endTime  - end time
* @param data - page - page Number
* @param data - limit - Page Limit
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectJobs(data, filter, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            selectJobFromMongoDB(db.delta_Jobs, data, filter, callback);
    });
};



/**
* @description - jobs list , For the Webservice - JobsList 
* @param  data - type - DeviceType
* @param data -startTime  - start time
* @param data- endTime  - end time
* @param data - page - page Number
* @param data - limit - Page Limit
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectJobFromMongoDB(jobsCollection, data, filter, callback) {
    let filterArray = filter.split(',')
    let whereCondition;
    let deviceMessage;
    async.each(filterArray, function (Filter, callbackEach) {
        if (Filter == 'none') {
            callbackEach()
        } else {
            callbackEach("error", null)
        }
    }, function (err, result) {
        if (!err) {
            if (data.deviceType === "All")
                whereCondition = { "CreatedDateTimestamp": { $gte: new Date(data.startTime), $lte: new Date(data.endTime) } };
            else
                whereCondition = { DeviceType: data.deviceType, "CreatedDateTimestamp": { $gte: new Date(data.startTime), $lte: new Date(data.endTime) } }
            switch (data.deviceType) {
                case "DeltaLink": deviceMessage = "Deltalink Job Status";
                    break;
                case "HyperSprout": deviceMessage = "HyperSprout Job Status";
                    break;
                case "Meter": deviceMessage = "Meter Job Status";
                    break;
                default: deviceMessage = "Device Job Status";
            }
            paginatedResults.paginatedResults(jobsCollection, whereCondition, data, deviceMessage, function (err, List) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, List)
                }
            })
        }
        else {
            let StatusJobs = [];
            if (filterArray.indexOf("Running Jobs") !== -1 && filterArray.indexOf("Historical Job") !== -1) {
                StatusJobs.push("Pending")
                StatusJobs.push("Completed")
                StatusJobs.push("Successful")
                StatusJobs.push("Failed")
            }
            else if (filterArray.indexOf("Running Jobs") !== -1) {
                StatusJobs.push("Pending")
            } else if (filterArray.indexOf("Historical Job") !== -1) {
                StatusJobs.push("Completed")
                StatusJobs.push("Successful")
                StatusJobs.push("Failed")

            }
            if (data.deviceType === "All")
                whereCondition = { $or: [{ JobName: { $in: filterArray } }, { "Status": { $in: StatusJobs } }], "CreatedDateTimestamp": { $gte: new Date(data.startTime), $lte: new Date(data.endTime) } };
            else {
                whereCondition = { DeviceType: data.deviceType, $or: [{ JobName: { $in: filterArray } }, { "Status": { $in: StatusJobs } }], "CreatedDateTimestamp": { $gte: new Date(data.startTime), $lte: new Date(data.endTime) } }
            }
            switch (data.deviceType) {
                case "DeltaLink": deviceMessage = "Deltalink Job Status";
                    break;
                case "HyperSprout": deviceMessage = "HyperSprout Job Status";
                    break;
                case "Meter": deviceMessage = "Meter Job Status";
                    break;
                default: deviceMessage = "Device Job Status";
            }
            paginatedResults.paginatedResults(jobsCollection, whereCondition, data, deviceMessage, function (err, List) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, List)
                }
            })
        }

    })
};


function selectExportAllDeltalinkDetails(data, callback) {
    try {
        var collection;
        let transformerCollection;
        if (data.DeviceType == "DeltaLink") {
            collection = "delta_DeltaLink";
        } else if (data.DeviceType == "Meter") {
            collection = "delta_Meters";
        } else if (data.DeviceType == "HyperSprout" || data.DeviceType == "Transformer") {
            collection = "delta_Hypersprouts";
            transformerCollection = "delta_Transformer";
        } else {
            collection = "delta_Hypersprouts";
        }
        if (data.JobType == "Meter" || data.JobType == "HyperHub" || data.JobType == "HyperSprout" || data.JobType == "DeltaLink") {
            collection = "delta_Jobs";
            dao.findAllByCondition({ DeviceType: data.JobType }, collection, function (err, JobStatusDetails) {
                if (err)
                    callback(err, null);
                else {
                    if (JobStatusDetails.length !== 0) {
                        return callback(null, JobStatusDetails);

                    } else {
                        return callback('Job Status Details not available in the System', null);

                    }
                }
            })
        } else if (data.JobType == "All") {
            collection = "delta_Jobs";
            dao.findAll(collection, callback);
        }
        else if (data.DeviceType == "HyperSprout" || data.DeviceType == "Transformer") {
            dao.findAllByCondition({ IsHyperHub: false }, collection, function (err, hypersproutDetails) {
                if (err)
                    callback(err, null);
                else {
                    if (hypersproutDetails.length !== 0) {
                        var tfmrIds = [];
                        for (var i in hypersproutDetails) {
                            if (hypersproutDetails.hasOwnProperty(i))
                                tfmrIds.push(hypersproutDetails[i].TransformerID);
                        }
                        dao.findAllByCondition({ TransformerID: { $in: tfmrIds } }, transformerCollection, function (err, dataFromMatchingTfmrIds) {
                            if (err)
                                return callback(err, null, null);
                            else {
                                let data = { hypersproutDetails, dataFromMatchingTfmrIds }
                                return callback(null, data);

                            }
                        });
                    } else
                        return callback('Transformer Details not available in the System', null);
                }
            });
        } else if (data.DeviceType == "HyperHub") {
            dao.findAllByCondition({ IsHyperHub: true }, collection, function (err, hypersproutDetails) {
                if (err)
                    callback(err, null);
                else {
                    if (hypersproutDetails.length !== 0) {
                        return callback(null, hypersproutDetails);

                    } else {
                        return callback('HyperHub Details not available in the System', null);

                    }
                }
            })
        } else {
            dao.findAll(collection, callback);
        }

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

module.exports = {
    toCheckDuplicate: toCheckDuplicate,
    createNewDeltalinkEntry: createNewDeltalinkEntry,
    editDeltalinkDetails: editDeltalinkDetails,
    editDeltalinkBandwidthDetails: editDeltalinkBandwidthDetails,
    DeltalinkBandwidthJobInsert: DeltalinkBandwidthJobInsert,
    DetalinkBandwidthRequestDelayed: DetalinkBandwidthRequestDelayed,
    editDeltalinkBandwidthReponse: editDeltalinkBandwidthReponse,
    selectAllDeltalinkDetails: selectAllDeltalinkDetails,
    deleteDeltalinkDetails: deleteDeltalinkDetails,
    createNewDLMAppGroup: createNewDLMAppGroup,
    findFromMongoDB_DLM: findFromMongoDB_DLM,
    assignDeltalinksGroups: assignDeltalinksGroups,
    selectJobs: selectJobs,
    selectExportAllDeltalinkDetails: selectExportAllDeltalinkDetails

}