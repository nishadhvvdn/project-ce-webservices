//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var insertError = require('./insertErrorLogsToDB.js');
var async = require('async');
var transformerDeregisterReq = require('../data/transformerDeregister.js');
var sendToIot = require('./sendToiot');
var dbCmd = require('../data/dbCommandsRegistration.js');
var nextID = require('../config/Helpers/getSequenceNextID')
var fs = require('fs');
var validation = './config/Validation.json';
validation = fs.readFileSync(validation, 'utf-8');
var objValidation = JSON.parse(validation);
var _ = require('lodash');
const flatten = require('lodash.flatten')
var IOTConnectionString = process.env.CONNECTION_STRING;
var res = IOTConnectionString.split(";");
var hostnameSplit = res[0].split("=");
var Hostname = hostnameSplit[1];
const paginatedResults = require('../config/Helpers/Pagination');
var dao = require('../dao/MongoDAO.js');
let duplicateItems = require('../config/Helpers/duplicateEntry.js')



/* *************** DB Commands SECTION 1 - EXPOSED METHODS ************************ */
/**
* @description - CREATE new HyperHub Entry in MONGODB,DataSCAPE WebService - NewHyperHubEntry
* @param insertNewHyperHubDetails object 
* @param callback - callback function returns success or error response
* @return callback function
*/

function createNewHyperHubEntry(insertNewHyperHubDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            createNewHyperHubEntryFromMongoDB(db.delta_Hypersprouts, insertNewHyperHubDetails, callback);
        }
    });
};

/**
* @description - For the Webservice - EditHyperHubDetails, UPDATE HyperHub details IN MONGODB 
* @param updateHyperHubValues object 
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateHyperHubDetails(updateHyperHubValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            updateHyperHubDetailsFromMongoDB(db.delta_Hypersprouts, updateHyperHubValues, callback);
        }
    });
};

/**
* @description - For the Webservice - DisplayAllHyperHubDetails, SELECT All HyperHub details FROM MONGODB 
* @param HyperHubDetails object 
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectAllHyperHubDetails(HyperHubDetails, data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            let hypersproutCollection = db.delta_Hypersprouts;
            selectAllHyperHubDetailsFromMongoDB(hypersproutCollection, HyperHubDetails, data, callback);
        }
    });
};

/**
* @description -For the Webservice - DeleteHyperHubDetails, DELETE HyperHub details IN MONGODB
* @param deleteHyperHubValues 
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteHyperHubDetails(deleteHyperHubValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            deleteHyperHubDetailsFromMongoDB(db.delta_Hypersprouts, db.delta_Config, deleteHyperHubValues, callback);
        }
    });
};

/**
* @description -For the Webservice - AddingHyperHubToTransformer, Group HyperHub with Transformer IN MONGODB 
* @param addHyperHubToTransformerValues 
* @param callback - callback function returns success or error response
* @return callback function
*/
function addHyperHubToTransformer(addHyperHubToTransformerValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            addHyperHubToTransformerFromMongoDB(db.delta_Hypersprouts, db.delta_Transformer, addHyperHubToTransformerValues, callback);
        }
    });
};

/**
* @description For the Webservice - RemovingHyperHubFromTransformer, Desc - Remove HyperHub from Transformer IN MONGODB 
* @param removeHyperHubFromTransformerValues 
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeHyperHubFromTransformer(removeHyperHubFromTransformerValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            removeHyperHubFromTransformerFromMongoDB(db.delta_Hypersprouts, db.delta_Transformer, db.delta_SchedulerFlags, removeHyperHubFromTransformerValues, callback);
        }
    });
};


/**
* @description - For the Webservice - GetAllHyperHubAttachedToTransformer,  Desc - SELECT All HyperHub details attached to a Transformer FROM MONGODB
* @param TransformerDetails object 
* @param callback - callback function returns success or error response
* @return callback function
*/

function getAllHyperHubAttached(data, callback) {
    try {
        let TID = parseInt(data.TransformerID);
        var collection = "delta_Hypersprouts";
        if (!data.search || data.search == null || data.search == "null") {
            let whereCondition = { "IsHyperHub": true, TransformerID: TID };
            data.search = whereCondition;
            dao.findAllPaginationAndSearch(collection, data, whereCondition, "HyperHub", callback);
        } else {
            let whereCondition = { "IsHyperHub": true, TransformerID: TID, HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } };
            dao.findAllPaginationAndSearch(collection, data, whereCondition, "HyperHub", callback);
        }
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
};

/* *************** DB Commands SECTION 2 - NON-EXPOSED METHODS ********************* */

/**
* @description - For the Webservice - NewHyperHubEntry
* @param collectionName
* @param insertNewHyperHubDetails
* @param callback - callback function returns success or error response
* @return callback function
*/


function createNewHyperHubEntryFromMongoDB(collectionName, insertNewHyperHubDetails, callback) {
    try {
        var HHID = [];
        var dupID = [];
        var dupHHID = [];
        var dupHHIDFinal = [];
        var emptyCount = 0;
        let dupMACID = [];
        let resultErrors = [];
        let type;

        for (var i in insertNewHyperHubDetails.HubSerialNumber) {
            dupID[i] = insertNewHyperHubDetails.HubSerialNumber[i];
        }
        collectionName.find({}).toArray(function (err, dupHubID) {
            if (err) {
                callback(err, null, null);
            }
            else {
                if (dupHubID.length > 0) {
                    for (var i in dupHubID) {
                        if (dupHubID.hasOwnProperty(i)) {
                            dupMACID.push(dupHubID[i].Hypersprout_Communications.MAC_ID_GPRS.toLowerCase())
                            dupMACID.push(dupHubID[i].Hypersprout_Communications.MAC_ID_WiFi.toLowerCase())
                        }
                    }
                }
            }
            var regex = dupID.map(function (e) { return new RegExp("^" + e + "$", "i"); });
            collectionName.find({ HypersproutSerialNumber: { "$in": regex } }, { "HypersproutSerialNumber": 1, "Hypersprout_Communications.MAC_ID_GPRS": 1, "Hypersprout_Communications.MAC_ID_WiFi": 1, "_id": 0 }).toArray(function (err, dupHubID) {
                if (err) {
                    callback(err, null, null);
                }
                else {
                    if (dupHubID.length > 0) {
                        for (var i in dupHubID) {
                            if (dupHubID.hasOwnProperty(i)) {
                                dupHHID.push(dupHubID[i].HypersproutSerialNumber.toLowerCase());
                            }
                            dupHHIDFinal.push(dupHubID[i].HypersproutSerialNumber + " - " + "Duplicate HyperHub!");
                            resultErrors.push({ SerialNumber: dupHubID[i].HypersproutSerialNumber, Status: "Fail", Comment: dupHubID[i].HypersproutSerialNumber + " - " + "Duplicate HyperHub!" });
                        }
                    }
                    type = insertNewHyperHubDetails.Type;
                    delete insertNewHyperHubDetails.Type;
                    for (var j in insertNewHyperHubDetails.HubSerialNumber) {
                        if (dupHHID.indexOf(insertNewHyperHubDetails.HubSerialNumber[j].toLowerCase()) === -1) {

                            if (!insertNewHyperHubDetails.HubSerialNumber[j]) {
                                emptyCount = emptyCount + 1;
                                dupHHIDFinal.push("HyperHub Serial Number is Null/Empty !!");
                                resultErrors.push({ SerialNumber: "NULL", Status: "Fail", Comment: "HyperHub Serial Number is Null/Empty !!" });

                            } else if (dupMACID.includes(insertNewHyperHubDetails.GprsMacID[j].toLowerCase())) {
                                emptyCount = emptyCount + 1;
                                dupHHIDFinal.push(insertNewHyperHubDetails.GprsMacID[j] + " Mac ID already in use!!");
                                resultErrors.push({ SerialNumber: insertNewHyperHubDetails.HubSerialNumber[j], Status: "Fail", Comment: insertNewHyperHubDetails.GprsMacID[j] + " Mac ID already in use!!" });
                            } else if (dupMACID.includes(insertNewHyperHubDetails.WifiMacID[j].toLowerCase())) {
                                emptyCount = emptyCount + 1;
                                dupHHIDFinal.push(insertNewHyperHubDetails.WifiMacID[j] + " Mac ID already in use!!");
                                resultErrors.push({ SerialNumber: insertNewHyperHubDetails.HubSerialNumber[j], Status: "Fail", Comment: insertNewHyperHubDetails.WifiMacID[j] + " Mac ID already in use!!" });
                            } else if (insertNewHyperHubDetails.HardwareVersion[j] > 255 && insertNewHyperHubDetails.HardwareVersion[j] > "255.255") {
                                emptyCount = emptyCount + 1;
                                dupHHIDFinal.push(insertNewHyperHubDetails.HardwareVersion[j] + " - " + "Hyperhub  Hardware Version should be less than or equal to  255.255 !!");
                                resultErrors.push({ SerialNumber: insertNewHyperHubDetails.HardwareVersion[j], Status: 'Fail', Comment: `${insertNewHyperHubDetails.HardwareVersion[j]} Hyperhub Version should be less than or equal to  255.255 !!` });
                            } else {

                                /* 
                                Multiple If-Else statements to Validate Data and
                                return a customised message on validation failure
                                */
                                var doc = {};
                                for (var key in insertNewHyperHubDetails) {
                                    if (checkMandatoryValidation(key, insertNewHyperHubDetails[key][j])) {
                                        if (checkMinimumLengthValidation(key, insertNewHyperHubDetails[key][j]) &&
                                            checkMaximumLengthValidation(key, insertNewHyperHubDetails[key][j])) {
                                            if (checkTypeValidation(key, insertNewHyperHubDetails[key][j])) {
                                                if (checkPatternValidation(key, insertNewHyperHubDetails[key][j])) {
                                                    doc[key] = insertNewHyperHubDetails[key][j];
                                                } else {
                                                    dupHHIDFinal.push(insertNewHyperHubDetails[key][j] + " - " + key + " pattern doesn't Matches!!");
                                                    resultErrors.push({ SerialNumber: insertNewHyperHubDetails['HubSerialNumber'][j], Status: 'Fail', Comment: insertNewHyperHubDetails[key][j] + " - " + key + " pattern doesn't Matches!!" });
                                                }
                                            } else {
                                                dupHHIDFinal.push(insertNewHyperHubDetails[key][j] + " - " + key + " Type is Wrong!!");
                                                resultErrors.push({ SerialNumber: insertNewHyperHubDetails['HubSerialNumber'][j], Status: 'Fail', Comment: insertNewHyperHubDetails[key][j] + " - " + key + " Type is Wrong!!" });
                                            }
                                        } else {
                                            dupHHIDFinal.push(insertNewHyperHubDetails[key][j] + " - " + key + " length is Wrong!!");
                                            resultErrors.push({ SerialNumber: insertNewHyperHubDetails['HubSerialNumber'][j], Status: 'Fail', Comment: insertNewHyperHubDetails[key][j] + " - " + key + " length is Wrong!!" });
                                        }
                                    } else {
                                        dupHHIDFinal.push(insertNewHyperHubDetails[key][j] + " - " + key + " Field is Required!!");
                                        resultErrors.push({ SerialNumber: insertNewHyperHubDetails['HubSerialNumber'][j], Status: 'Fail', Comment: insertNewHyperHubDetails[key][j] + " - " + key + " Field is Required!!" });
                                    }
                                }
                                if (Object.keys(insertNewHyperHubDetails).length === Object.keys(doc).length) {
                                    HHID.push(doc);

                                }
                            }
                        }
                    }
                    dbCon.getDb(function (err, db) {
                        if (err) {
                            callback(err, null, null);
                        } else {
                            var CName = db.delta_Hypersprouts;
                            var CName1 = db.delta_Transformer;
                            var ConfigCollection = db.delta_Config;
                            //Case I : With New Entries
                            if (HHID.length > 0) {
                                // insertHyperHub(HHID, dupHHID, CName, CName1, ConfigCollection, dupHHIDFinal, resultErrors, callback);

                                //check if hypersprout is registered, if not register hypersprout on IOT
                                checkIfDeviceRegistered(HHID, dupHHIDFinal, function (dupHHIDFinal, arrToInsert) {
                                    // 1) Insert command for all new details with no duplicates

                                    if (arrToInsert.length > 0) {
                                        insertHyperHub(arrToInsert, dupHHID, CName, CName1, ConfigCollection, dupHHIDFinal, resultErrors, callback);
                                    }
                                    else {
                                        callback(null, "unable to register on IOT", dupHHIDFinal, resultErrors)
                                    }
                                });

                            }
                            //Case II : All Duplicate Entries
                            else {
                                if (type === "Add") {
                                    callback(null, "Failed to Add: Duplicate/Incorrect HyperHub Details!", dupHHIDFinal, resultErrors);
                                } else {
                                    callback(null, "Failed to Upload: Duplicate/Incorrect file!", dupHHIDFinal, resultErrors);
                                }
                            }
                        }
                    });
                }
            })
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description - For the Webservice - NewHyperHubEntry
* @param HHID
* @param dupHHID
* @param collectionName
* @param dupHHIDFinal
* @param callback - callback function returns success or error response
* @return callback function
*/




//Function to convert array into chunk given by size
function chunk(array, size) {
    const chunked_arr = [];
    let copied = [...array]; // ES6 destructuring
    const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
    for (let i = 0; i < numOfChild; i++) {
        chunked_arr.push(copied.splice(0, size));
    }
    return chunked_arr;
}

function insertHyperHub(HHID, dupHHID, collectionName, collectionName1, ConfigCollection, dupHHIDFinal, resultErrors, callback) {
    try {
        let doc;
        var ConfigToInsert = [];
        const uniqueTransformerID = [];
        if (HHID.length > 500) {
            callback("Total number of records should not be more than 500", null);
        } else {
            async.each(HHID,
                function (key, callbackEach) {
                    let TID;
                    let id = "item_id";
                    //Convert latitude and longitude to float
                    key.Latitude = parseFloat(key.Latitude);
                    key.Longitude = parseFloat(key.Longitude);
                    collectionName1.find({ "TransformerSerialNumber": { $regex: new RegExp("^" + key.GroupTransformerSerialNo + "$", "i") } }).toArray(function (err, transformerDetails) {
                        if (err)
                            callback(err, null);
                        else {

                            if (transformerDetails.length > 0) {
                                TID = transformerDetails[0].TransformerID;
                                if (!uniqueTransformerID.includes(transformerDetails[0].TransformerID))
                                    uniqueTransformerID.push(transformerDetails[0].TransformerID);
                            }
                            else {
                                TID = null;
                            }
                        }
                        nextID.getValueForNextSequenceItem(id, "HyperHub", function (err, nextId) {
                            key.Country = "INDIA";
                            var configdoc = CreateConfigHH(key, nextId);
                            var SakDeviceID = "HH-"+key.HubSerialNumber;
                            sendToIot.checkDeviceConnectionSAS(SakDeviceID, function (err, status) {
                                if (err) {
                                    callbackEach(err)
                                } else {
                                    var Sak = status;
                                    configdoc.Cloud_Connectivity_Settings.SAK = Sak;

                                    ConfigToInsert.push(configdoc);
                                    doc = {
                                        "HypersproutID": nextId,
                                        "HypersproutSerialNumber": key.HubSerialNumber,
                                        "IsHyperHub": true,
                                        "ConfigID": 1,
                                        "AppIDs": [],
                                        "ConfigStatus": 'M',
                                        "Status": 'NotRegistered',
                                        "ConnDisconnStatus": 'Connected',
                                        "TransformerID": TID,
                                        "CreatedOn": new Date(),
                                        "device_lock": 0,
                                        "HypersproutName": key.HubName,
                                        "HardwareVersion": key.HardwareVersion,
                                        "Hypersprout_Communications": {
                                            "MAC_ID_GPRS": key.GprsMacID,
                                            "MAC_ID_WiFi": key.WifiMacID,
                                            "IP_address_WiFi": key.WifiIPAddress,
                                            "AccessPointPassword": key.WifiAccessPointPassword,
                                            "Latitude": key.Latitude,
                                            "Longitude": key.Longitude,
                                            "SimCardNumber": key.SimCardNumber
                                        },
                                        "Hypersprout_DeviceDetails": {
                                            "CT_Ratio": "null",
                                            "PT_Ratio": "null",
                                            "RatedVoltage": "null",
                                            "Phase": "null",
                                            "Frequency": "null",
                                            "Accuracy": "null",
                                            "HSDemandResetDate": "null",
                                            "HSCompliantToStandards": "null",
                                            "MaxDemandWindow": "null",
                                            "MaxDemandSlidingWindowInterval": "null",
                                            "SensorDetails": "null",
                                            "HypersproutVersion": "null",
                                            "HypersproutMake": "null"

                                        }
                                    }
                                    collectionName.insert(doc, function (err, result) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callbackEach);
                                            callbackEach(err)
                                        }
                                        else {
                                            if (TID == null && key.GroupTransformerSerialNo != "" && key.GroupTransformerSerialNo)
                                                resultErrors.push({ SerialNumber: key.HubSerialNumber, Status: 'Pass', Comment: "HyperHub Details Successfully Added But HyperHub Not Grouped Due To Transformer not registered or Invalid Transformer SerialNumber: " + key.GroupTransformerSerialNo });
                                            else
                                                resultErrors.push({ SerialNumber: key.HubSerialNumber, Status: 'Pass', Comment: "HyperHub Details Successfully Added!" });
                                            callbackEach();
                                        }

                                    });
                                }
                            });
                        });
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        async.each(uniqueTransformerID,
                            function (transformerID, callbackcideach) {
                                collectionName.find({ TransformerID: transformerID, IsHyperHub: true }).count(function (err, noOfHyperHubAllocated) {
                                    collectionName1.update({ "TransformerID": transformerID }, { $set: { NoOfHyperHubAllocated: noOfHyperHubAllocated } });
                                    callbackcideach();
                                });
                            }),
                            // results is now an array of the response bodies               
                            //callback(null, "HyperHub Details Successfully Added!", dupHHIDFinal, resultErrors);
                            ConfigCollection.insertMany(ConfigToInsert, function (err, success) {
                                if (err)
                                    callback(err, null, null);
                                else {
                                    callback(null, "HyperHub Details Successfully Added!", dupHHIDFinal, resultErrors);
                                }
                            });
                    }
                })
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}


/**
* @description - check if hypersprout registered on IOT hub. Also check if hypersprout and transformer serial number is same
* @params HHID errorFinal
* @return errorFinal arrToInsert
*/
function CreateConfigHH(key, nextId) {
    if (key.Country == "INDIA") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11axg",
                "chan_bw": "20MHz", "channel": 6, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11axa",
                "chan_bw": "20MHz", "channel": 36, "txpower": 17, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11axa",
                "chan_bw": "20MHz", "channel": 149, "txpower": 17, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else if (key.Country == "CANADA") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 1, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 36, "txpower": 23, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 149, "txpower": 30, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else if (key.Country == "SINGAPORE") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 1, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 36, "txpower": 17, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 149, "txpower": 30, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else if (key.Country == "MEXICO") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 1, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 36, "txpower": 17, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 149, "txpower": 30, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else if (key.Country == "RUSSIA") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 1, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 36, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 149, "txpower": 30, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else if (key.Country == "UZBEKISTAN") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 1, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 36, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else if (key.Country == "SOUTH AFRICA") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 1, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 36, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 100, "txpower": 30, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else if (key.Country == "PHILIPPINES") {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 1, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 36, "txpower": 17, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11a",
                "chan_bw": 1, "channel": 100, "txpower": 30, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    } else {
        var RadioConfig = {
            "two_four": {
                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": "11axg",
                "chan_bw": 20, "channel": 6, "txpower": 20, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_low": {
                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": "11axa",
                "chan_bw": 20, "channel": 36, "txpower": 17, "stream_selection": "4x4", "guard_interval": "800ns"
            },
            "five_high": {
                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": "11axa",
                "chan_bw": 20, "channel": 149, "txpower": 17, "stream_selection": "4x4", "guard_interval": "800ns"
            }
        }
    }

    var configdoc = {
        "HypersproutID": nextId, "TransformerID": 'null', "HypersproutSerialNumber": key.HubSerialNumber, "DeviceType": "hh",
        "System_Info": {
            "power_src": "", "country": "INDIA", "timezone": "Asia/Kolkata - GMT+5:30", "current_fw": "",
            "eth_mac": "", "cellular_mac": "", "wifi_mac_2": "", "wifi_mac_5": "",
            "backup_fw": "", "cloud_status": "", "eth_ipv4": "", "eth_subnet": "",
            "eth_gw": "", "eth_pridns": "", "eth_secdns": "", "eth_conf_type": true,
            "eth_link_speed": "", "eth_status": "", "cellular_state": "", "cellular_ipv4": "",
            "cellular_gw": "", "cellular_sig_strength": "", "cellular_carrier": "",
            "itm_status": "", "itm_serial_num": key.HubSerialNumber, "itm_model_num": "", "itm_fw_version": "",
            "itm_phase_type": "", "up_time": "",
        },
        "BackHaul": {
            "Cellular": {
                "username": "", "password": "", "sim_pin": "", "network_selection": 0, "carrier": "", "CarrierList": []
            },
            "Ethernet": {
                "mode": 0, "ip": "", "gateway": "", "subnet": "",
                "primary_dns": "", "secondary_dns": ""
            },
            "Advanced": {
                "primary_backhaul": 1, "auto_switchover": 1
            }
        },
        "FrontHaul": {
            "Radio_Configuration": RadioConfig,
            "Mesh_Configuration": {
                "two_four": {
                    "status": 1, "radio_band": "2.4 GHz", "meshID": "", "securityType": "Open",
                    "PSK": "", "enable": 1, "action": 1
                },
                "five_high": {
                    "status": 1, "radio_band": "5 GHz(High)", "meshID": "", "securityType": "Open",
                    "PSK": "", "enable": 1, "action": 1
                }
            },
            "Hotspot_Configuration": {
                "two_four": {
                    "action": 1, "status": 1, "radio_band": "2.4 GHz",
                    "ssid": 'Hyperhub' + key.WifiMacID, "security": "WPA2-PSK", "password": key.WifiMacID,
                    "vap_details": []
                },
                "five": {
                    "action": 1, "status": 1, "radio_band": "5 GHz",
                    "vap_details": []
                }
            },
            "DHCP": {
                "Hotspot": {
                    "Status": 1, "Mode": 1, "StartIpAddr": "192.168.20.100",
                    "EndIpAddr": "192.168.20.200", "Gateway": "192.168.20.1",
                    "Subnet": "255.255.255.0", "PrimaryDNS": "8.8.8.8",
                    "SecondaryDNS": "1.0.0.1"
                },
                "Mesh": {
                    "Status": 1, "Mode": 1, "StartIpAddr": "172.16.100.100",
                    "EndIpAddr": "172.16.100.200", "Gateway": "172.16.100.1",
                    "Subnet": "255.255.255.0", "PrimaryDNS": "8.8.4.4",
                    "SecondaryDNS": "1.0.0.1"
                }
            }
        },
        "Cloud_Connectivity_Settings": {
            "Hostname": Hostname, "SAK": "", "status": "Open"
        },
        "Alarm": {
            "OverVoltage": true,
            "UnderVoltage": true,
            "OverLoadLine1_MD_Alarm": true,
            "OverLoadLine2_MD_Alarm": true,
            "OverLoadLine3_MD_Alarm": true,
            "OverFrequency": true,
            "UnderFrequency": true,
            "PowerFailure": true,
            "CTOpen": true,
            "PTOpen": true,
            "OilLevelSensorFailure": true,
            "TamperLid": true,
            "TamperBox": true,
            "LowOilLevel": true,
            "HighOilTemperature": true,
            "LowBatteryVoltage": true,
            "BatteryFailure": true,
            "BatteryRemoved": true,
            "PrimaryPowerUp": true,
            "PrimaryPowerDown": true,
            "NonTechnicalLoss": true,
            "MeterConnected": true,
            "MeterDisconnected": true,
            "WiFiCommunicationLoss": true,
            "LTECommunicationLoss_3G_4G": true,
            "Communicationattemptsexceeded": true,
            "UnAuthenticatedConnectionRequest": true
        },
        "System_Settings": {
            "Status": 1, "sysname": "HYPERHUB", "country": "INDIA", "timezone": "Asia/Kolkata - GMT+5:30", "bandwidth": 33
        },
        "Bandwidth_Details": {
            "Bandwidth": 0, "DownloadBandwidth": 1, "UploadBandwidth": 1
        },
        "config_UpdateTime": parseInt(Date.now() / 1000)

    }
    return configdoc;

}
function checkIfDeviceRegistered(HHID, errorFinal, callback) {
    try {
        var arrToInsert = [];
        let devicesArray = [];
        let digit = getDigit(HHID.length);
        var count = HHID.length;
        var limit = 100;
        var pageNocount = Math.ceil(count / limit);
        var pageNo;
        var startInd;
        let devicesToRegister;
        let bulkInsertArr1;
        loopcount = 0;
        for (var i in HHID) {
            if (HHID.hasOwnProperty(i))
                var deviceID = 'HH-' + HHID[i].HubSerialNumber;
            var device = {
                deviceId: deviceID
            };
            devicesArray.push(device)
        }
        for (pageNo = 0; pageNo < pageNocount; pageNo++) {
            startInd = (pageNo) * limit;
            endInd = (startInd + limit);
            if (digit >= 3) {
                devicesToRegister = devicesArray.slice(startInd, endInd);
                bulkInsertArr1 = HHID.slice(startInd, endInd);
            }
            else {
                devicesToRegister = devicesArray;
                bulkInsertArr1 = HHID
            }
            let bulkInsertArr = bulkInsertArr1;
            sendToIot.registerBulkDeviceOnIot(devicesToRegister, function (err, data) {
                if (!err) {
                    arrToInsert.push(bulkInsertArr)
                    loopcount++;
                }
                else if (err.name && err.name == "ArgumentError") {
                    arrToInsert.push(bulkInsertArr)
                    loopcount++;
                } else if (err.name && err.name != "ArgumentError" || err.name == "Error") {
                    errorFinal.push('Hypersprout unable to register on IOT due to ' + err.name);
                    loopcount++;

                } else {
                    errorFinal.push('Hypersprout unable to register on IOT due to ' + err);
                    loopcount++;
                }
                if (loopcount == pageNocount) {
                    arrToInsert = flatten(arrToInsert)
                    arrToInsert = uniqueArray(arrToInsert)
                    return callback(errorFinal, arrToInsert);
                }
            });

        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}


function getDigit(number) {
    return number.toString().length;
}

/**
* @description - For the Webservice - EditHyperHubDetails
* @param collectionName
* @param updateHyperHubValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateHyperHubDetailsFromMongoDB(collectionName, updateHyperHubValues, callback) {
    try {
        var HubSerNum = updateHyperHubValues.HubSerialNumber;
        var HHID = updateHyperHubValues.HyperHubID;
        var dupHHID = [];
        var dupHHIDNum = [];

        collectionName.find({ "HypersproutSerialNumber": { $regex: new RegExp("^" + HubSerNum + "$", "i") } }).toArray(function (err, dupHubSerialNumber) {
            if (err) {
                callback(err, null);
            } else {
                if (dupHubSerialNumber.length > 0) {
                    //When serial number is not changed
                    for (var i in dupHubSerialNumber) {
                        if (dupHubSerialNumber.hasOwnProperty(i)) {
                            dupHHID.push(dupHubSerialNumber[i].HypersproutID);
                            dupHHIDNum.push(dupHubSerialNumber[i].HypersproutSerialNumber);
                        }
                    }
                    dbCon.getDb(function (err, db) {
                        if (err) {
                            callback(err, null, null);
                        } else {
                            var CName = db.delta_Hypersprouts;
                            if (dupHHID[0] === HHID) {
                                //Case I : Hub Serial Number not changed for Update
                                updateHyperHub(updateHyperHubValues, CName, callback);
                            } else {
                                // Case II: Duplicate HHID or HHID already present in system
                                callback("Duplicate HyperHub Serial Number!", null);
                            }
                        }
                    });
                } else {
                    dbCon.getDb(function (err, db) {
                        if (err) {
                            callback(err, null, null);
                        } else {
                            // Case III : When Hub Serial Number is not duplicate
                            if (dupHubSerialNumber.length === 0) {
                                //When serial number is changed
                                //fetch old serial number 
                                collectionName.findOne({ "HypersproutID": HHID }, { "HypersproutSerialNumber": 1, "Status": 1 }, function (err, hyperhubDetails) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (hyperhubDetails != null) {
                                            //only edit serial number if device is not registered
                                            if (hyperhubDetails.Status == 'Registered') {
                                                callback("Serial number can not be updated as Hyperhub is already registered", null);
                                            } else {
                                                var hhToDelete = "HH-" + hyperhubDetails.HypersproutSerialNumber;
                                                //Delete old deviceId on iot hub
                                                sendToIot.deleteDeviceOnIot(hhToDelete, function (err, data) {
                                                    if (err) {
                                                        if (err.name == 'DeviceNotFoundError') {
                                                            var CName = db.delta_Hypersprouts;
                                                            //register on iot hub with new serial number
                                                            registerAndUpdateHyperhub(updateHyperHubValues, CName, function (err, data) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    callback(null, data);
                                                                }
                                                            });
                                                        } else {
                                                            callback("Error Occured while updating hyperhub on IOT Hub " + err.name, null)
                                                        }
                                                    } else {
                                                        var CName = db.delta_Hypersprouts;
                                                        //register on iot hub with new serial number
                                                        registerAndUpdateHyperhub(updateHyperHubValues, CName, function (err, data) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                callback(null, data);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            callback('Invalid HypersproutID', null);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
/**
* @description - For the Webservice - register and update hyperhub
* @param updateHyperHubValues
*/
function registerAndUpdateHyperhub(updateHyperHubValues, CName, callback) {
    try {
        var hhToUpdate = "HH-" + updateHyperHubValues.HubSerialNumber;
        var device = {
            deviceId: hhToUpdate
        };
        sendToIot.registerDeviceOnIot(device, function (err, data) {
            if (err) {
                callback("Error Occured while updating hyperhub on IOT hub " + err.name, null)
            } else {
                updateHyperHub(updateHyperHubValues, CName, function (err, data) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, data);
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

}
/**
* @description - For the Webservice - update hyperhub
* @param collectionName
* @param updateHyperHubValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateHyperHub(updateHyperHubValues, collectionName, callback) {
    try {
        let doc;
        collectionName.find({ HypersproutID: updateHyperHubValues.HyperHubID }).toArray(function (err, HHDetails) {
            if (err)
                callback(err, null);
            else if (HHDetails.length === 0)
                callback("No such HyperHub available", null);
            else {
                let MacID = [];
                let dupMACID = [];
                MacID.push(updateHyperHubValues.GprsMacID)
                MacID.push(updateHyperHubValues.WifiMacID)
                collectionName.find({ '$and': [{ 'HypersproutID': { '$ne': updateHyperHubValues.HyperHubID } }, { '$or': [{ "Hypersprout_Communications.MAC_ID_GPRS": { $in: MacID } }, { "Hypersprout_Communications.MAC_ID_WiFi": { $in: MacID } }] }] }).toArray(function (err, dubMacId) {
                    if (err) {
                        callback(err, null);
                    }
                    else if (dubMacId.length > 0) {
                        for (var i in dubMacId) {
                            if (dubMacId.hasOwnProperty(i)) {
                                dupMACID.push(dubMacId[i].Hypersprout_Communications.MAC_ID_GPRS.toLowerCase())
                                dupMACID.push(dubMacId[i].Hypersprout_Communications.MAC_ID_WiFi.toLowerCase())
                            }
                        }
                        if (dupMACID.includes(updateHyperHubValues.GprsMacID.toLowerCase())) {
                            callback("GPRS Mac ID already in use!!", null);

                        } else if (dupMACID.includes(updateHyperHubValues.WifiMacID.toLowerCase())) {
                            callback("Wifi Mac ID already in use!!", null);
                        }
                    }
                    else {
                        for (var key in updateHyperHubValues) {
                            if (checkMandatoryValidation(key, updateHyperHubValues[key])) {
                                if (checkMinimumLengthValidation(key, updateHyperHubValues[key]) &&
                                    checkMaximumLengthValidation(key, updateHyperHubValues[key])) {
                                    if (checkTypeValidation(key, updateHyperHubValues[key])) {
                                        if (checkPatternValidation(key, updateHyperHubValues[key])) {
                                            if (checkValueMatches(key, updateHyperHubValues[key])) {
                                                if (checkMaxValueValidationEdit(key, updateHyperHubValues[key], updateHyperHubValues)) {
                                                    if (checkMinValueValidationEdit(key, updateHyperHubValues[key], updateHyperHubValues)) {
                                                        if (updateHyperHubValues.HardwareVersion > 255 && updateHyperHubValues.HardwareVersion > "255.255") {
                                                            return callback("HyperHub Version should be less than or equal to 255.255 !!", null);
                                                        } if(duplicateItems.toCheckMulticastMACAddress(updateHyperHubValues.GprsMacID.toLowerCase()) == 1){
                                                            return callback(`${updateHyperHubValues.GprsMacID} multicast Gprs Mac ID not allowed!!`, null);
                                                        } if(duplicateItems.toCheckMulticastMACAddress(updateHyperHubValues.WifiMacID.toLowerCase()) == 1){
                                                            return callback(`${updateHyperHubValues.WifiMacID} multicast Wifi Mac ID not allowed!!`, null);
                                                        }
                                                        else {
                                                            doc = {
                                                                "HypersproutSerialNumber": updateHyperHubValues.HubSerialNumber,
                                                                "HypersproutName": updateHyperHubValues.HubName,
                                                                "HardwareVersion": updateHyperHubValues.HardwareVersion,
                                                                "Hypersprout_Communications.MAC_ID_GPRS": updateHyperHubValues.GprsMacID,
                                                                "Hypersprout_Communications.Latitude": updateHyperHubValues.Latitude,
                                                                "Hypersprout_Communications.Longitude": updateHyperHubValues.Longitude,
                                                                "Hypersprout_Communications.MAC_ID_WiFi": updateHyperHubValues.WifiMacID,
                                                                "Hypersprout_Communications.IP_address_WiFi": updateHyperHubValues.WifiIPAddress,
                                                                "Hypersprout_Communications.AccessPointPassword": updateHyperHubValues.WifiAccessPointPassword,
                                                                "Hypersprout_Communications.SimCardNumber": updateHyperHubValues.SimCardNumber
                                                            }
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
                        if (!(_.isEmpty(doc))) {
                            collectionName.update({ "HypersproutID": updateHyperHubValues.HyperHubID },
                                {
                                    $set: doc
                                }, function (err, updateHyperHub) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (updateHyperHub !== null) {
                                            callback(null, "HyperHub Details Successfully Updated!");
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
};

/**
* @description - For the Webservice - DisplayAllHyperHubDetails
* @param collectionName
* @param HyperHubDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function selectAllHyperHubDetailsFromMongoDB(hypersproutCollection, HyperHubDetails, data, callback) {
    try {
        let Type = HyperHubDetails.Type;
        if (!data.search || data.search == null || data.search == undefined) {
            if (Type === "All") {
                let query = { "IsHyperHub": true };
                let whereCondition = query;
                paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "HyperHub", function (err, AllHyperHubDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, AllHyperHubDetails)
                    }
                })
            } else {
                let whereCondition = { "IsHyperHub": true, "$or": [{ TransformerID: { $exists: false } }, { TransformerID: null }, { TransformerID: "null" }] };
                paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "HyperHub", function (err, AllHyperHubDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, AllHyperHubDetails)
                    }
                })
            }
        } else {
            if (Type === "All") {
                let query = { "IsHyperHub": true };
                let whereCondition = { $and: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } }, query] }
                paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "HyperHub", function (err, AllHyperHubDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, AllHyperHubDetails)
                    }
                })
            } else {
                let query = { "IsHyperHub": true, "$or": [{ TransformerID: { $exists: false } }, { TransformerID: null }, { TransformerID: "null" }] }
                let whereCondition = { $and: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } }, query] }
                paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "HyperHub", function (err, AllHyperHubDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, AllHyperHubDetails)
                    }
                })
            }
        }

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

// function selectAllHyperHubDetailsFromMongoDB(collectionName, HyperHubDetails, callback) {
//     try {
//         var Type = HyperHubDetails.Type;
//         if (Type === "All") {
//             collectionName.find({ "IsHyperHub": true }).toArray(function (err, AllHyperHubDetails) {
//                 if (err) {
//                     callback(err, null);
//                 } else {
//                     if (AllHyperHubDetails !== null) {
//                         callback(null, AllHyperHubDetails);
//                     } else {
//                         callback(null, "HyperHub Details not available in the System");
//                     }
//                 }
//             });
//         } else {
//             collectionName.find({ "IsHyperHub": true, "$or": [{ TransformerID: { $exists: false } }, { TransformerID: "null" }] }).toArray(function (err, UnassignedHyperHubDetails) {
//                 if (err) {
//                     callback(err, null);
//                 } else {
//                     if (UnassignedHyperHubDetails !== null) {
//                         callback(null, UnassignedHyperHubDetails);
//                     } else {
//                         callback(null, "HyperHub Details not available in the System");
//                     }
//                 }
//             });
//         }
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };


/**
* @description - // For the Webservice - DeleteHyperHubDetails
* @param collectionName
* @param deleteHyperHubValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteHyperHubDetailsFromMongoDB(collectionName, ConfigCollection, deleteHyperHubValues, callback) {
    try {
        // map() return a new array of Deltalink having only integer values and  integerValue function return an Integer values
        let HHID = (deleteHyperHubValues.HyperHubID).map(integerValue);
        var HIDtoDelete = [];
        var groupedHID = [];
        var HHSerialNo = [];
        let errorFinal = [];
        collectionName.find({ HypersproutID: { $in: HHID }, IsHyperHub: true }, { _id: 0, HypersproutID: 1, TransformerID: 1, HypersproutSerialNumber: 1 }).toArray(function (err, hyperHubToDelete) {
            if (err)
                callback(err, null);
            else {
                if (hyperHubToDelete.length !== 0) {
                    for (var i in hyperHubToDelete) {
                        if ((hyperHubToDelete[i].TransformerID === "null") || ((hyperHubToDelete[i].TransformerID === null))) {
                            HIDtoDelete.push(hyperHubToDelete[i].HypersproutID);
                            let SN = "HH-" + hyperHubToDelete[i].HypersproutSerialNumber;
                            HHSerialNo.push(SN);
                        } else {
                            groupedHID.push(hyperHubToDelete[i].HypersproutID);
                        }
                    }
                    //Group the array in slots of 15
                    // Object.defineProperty(Array.prototype,'chunk', {value: function(n) {
                    //     return Array.from(Array(Math.ceil(this.length/n)), (_,i)=>this.slice(i*n,i*n+n));
                    // }});
                    // HHSerialNo = HHSerialNo.chunk(10);
                    // HIDtoDelete = HIDtoDelete.chunk(10);

                    // CEG20-855 : Split in group of 10 devices(To avoid ArgumentError)


                    // var msg = "Hyperhub details successfully deleted! If not deleted, please try to ungroup before deleting";
                    if (groupedHID.length === HHID.length)
                        msg = "Please Un-Group Hyperhub from Transformer before Delete!";
                    if ((HIDtoDelete.length !== 0) && (HIDtoDelete.length === HHID.length) && HHSerialNo.length == HHID.length) {
                        msg = "Hyperhub Details Successfully Deleted!";
                    } else {
                        for (let i in deleteHyperHubValues.HyperHubID) {
                            if (!(HIDtoDelete.includes(deleteHyperHubValues.HyperHubID[i])) && !(groupedHID.includes(deleteHyperHubValues.HyperHubID[i]))) {
                                errorFinal.push("Invalid HyperHub : " + deleteHyperHubValues.HyperHubID[i]);
                            }
                            msg = "Hyperhub details successfully deleted! If not deleted, please try to ungroup before deleting";
                        }
                    }

                    HHSerialNo = chunk(HHSerialNo, 10);
                    HIDtoDelete = chunk(HIDtoDelete, 10);
                    //delete from IOT
                    if (HHSerialNo.length !== 0) {
                        async.eachOfLimit(HHSerialNo, 1, function (HHSerialNo, index, loopCallback) {
                            sendToIot.deleteDeviceOnIot(HHSerialNo, function (err, data) {
                                if (err) {
                                    if (err.name == 'DeviceNotFoundError') {
                                        collectionName.deleteMany({ HypersproutID: { $in: HIDtoDelete[index] } }, function (err, hyperHubDelete) {
                                            if (err) {
                                                insertError.putErrorDetails(err, callback);
                                                loopCallback(err);
                                            } else {
                                                ConfigCollection.deleteMany({ HypersproutID: { $in: HIDtoDelete[index] } }, function (err, hyperHubDelete) {
                                                    if (err) {
                                                        insertError.putErrorDetails(err, callback);
                                                        loopCallback(err);
                                                    } else {
                                                        loopCallback();
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        loopCallback("Error occured while deleting Devices from IOT hub");
                                    }
                                } else {
                                    collectionName.deleteMany({ HypersproutID: { $in: HIDtoDelete[index] } }, function (err, hyperHubDelete) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                            loopCallback(err);
                                        } else {
                                            ConfigCollection.deleteMany({ HypersproutID: { $in: HIDtoDelete[index] } }, function (err, hyperHubDelete) {
                                                if (err) {
                                                    insertError.putErrorDetails(err, callback);
                                                    loopCallback(err);
                                                } else {
                                                    loopCallback();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }, function (err) {
                            //console.log('==> I am at the end of loop ==>', err, msg);
                            if (err != null)
                                callback(err, null);
                            else
                                callback(null, msg, errorFinal);
                        });
                    } else {
                        callback(null, msg, errorFinal);
                    }
                } else {
                    callback("Invalid HyperHubID !!", null);
                }
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

};

// function return an Integer values

function integerValue(x) {
    return parseInt(x);
}

/**
* @description - For the Webservice - AddingHyperHubToTransformer
* @param collectionName
* @param collectionName1
* @param addHyperHubToTransformerValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function addHyperHubToTransformerFromMongoDB(collectionName, collectionName1, addHyperHubToTransformerValues, callback) {
    try {
        var HHID = [];
        var TID = parseInt(addHyperHubToTransformerValues.TransformerID);
        var HHIDCount = 0;
        let HId = []
        for (var i in addHyperHubToTransformerValues.HyperHubID) {
            if (addHyperHubToTransformerValues.HyperHubID.hasOwnProperty(i)) {
                HHID.push(addHyperHubToTransformerValues.HyperHubID[i]);
                HHIDCount = HHIDCount + 1;
            }
        }
        HHID = (HHID).map(integerValue);
        HHIDCount = HHID.length;
        if (HHID.length !== 0) {
            hyperhubValidation(collectionName, { "HypersproutID": { $in: HHID }, IsHyperHub: true }, function (err, hyperhubDet) {
                if (hyperhubDet.length > 0) {
                    if (HHID.length == hyperhubDet.length) {
                        dbCmd.toCheckIfNotGrouped(hyperhubDet, "HyperHub", function (err, alreadygroupedHyperhub) {
                            if (err) {
                                callback(err, null)
                            } else {
                                collectionName.updateMany({ "HypersproutID": { $in: HHID } }, { $set: { "TransformerID": TID } }, function (err, hyperHubToTransformer) {
                                    if (err) {
                                        insertError.putErrorDetails(err, callback);
                                    } else {
                                        if (hyperHubToTransformer.length !== 0) {
                                            collectionName1.find({ "TransformerID": TID }, { "NoOfHyperHubAllocated": 1, "_id": 0 }).toArray(function (err, NoOfHyperHubAllocatedCount) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    var HyperHubAllocatedToUpdate = 0;
                                                    if (NoOfHyperHubAllocatedCount !== null) {
                                                        for (var i in NoOfHyperHubAllocatedCount) {
                                                            if (NoOfHyperHubAllocatedCount.hasOwnProperty(i))
                                                                HyperHubAllocatedToUpdate = NoOfHyperHubAllocatedCount[i].NoOfHyperHubAllocated;
                                                        }
                                                        HyperHubAllocatedToUpdate = HyperHubAllocatedToUpdate + HHIDCount;
                                                        collectionName1.update({ "TransformerID": TID }, { $set: { NoOfHyperHubAllocated: HyperHubAllocatedToUpdate } }, function (err, HyperHubGrouped) {
                                                            if (err) {
                                                                insertError.putErrorDetails(err, callback);
                                                            } else {
                                                                callback(null, "HyperHub Successfully Grouped with Transformer!");
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        })
                    } else {
                        return callback("Invalid HyperHub ID(s)!!", null)
                    }
                } else {
                    callback("HyperHub not available !!", null)
                }
            })

        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};



//hyperhub validation
function hyperhubValidation(hypersproutCollection, where, callback) {
    try {
        hypersproutCollection.find(where).toArray(function (err, hypersproutDet) {
            if (err)
                callback(err, null);
            else {
                callback(null, hypersproutDet)
            }
        })

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description - For the Webservice - RemovingHyperHubFromTransformer
* @param collectionName
* @param collectionName1
* @param schedulerFlagsCollection
* @param removeHyperHubFromTransformerValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeHyperHubFromTransformerFromMongoDB(collectionName, collectionName1, schedulerFlagsCollection, removeHyperHubFromTransformerValues, callback) {
    try {
        var HHID = [];
        var TID = removeHyperHubFromTransformerValues.TransformerID;
        var HHIDCount = 0;
        for (var i in removeHyperHubFromTransformerValues.HyperHubID) {
            if (removeHyperHubFromTransformerValues.HyperHubID.hasOwnProperty(i)) {
                HHID.push(removeHyperHubFromTransformerValues.HyperHubID[i]);
                HHIDCount = HHIDCount + 1;
            }
        }

        dbCmd.transformerValidation(collectionName1, { "TransformerID": TID }, function (err, transformerDet) {
            if (err)
                callback(err, null);
            else {
                if (transformerDet.length > 0) {
                    hyperhubValidation(collectionName, { "HypersproutID": { $in: HHID }, "IsHyperHub": true }, function (err, hypersproutDet) {
                        if (err)
                            callback(err, null);
                        else {
                            if (hypersproutDet.length > 0) {
                                if (hypersproutDet.length == HHID.length) {
                                    HHIDCount = HHID.length;
                                    dbCmd.toCheckIfTransformerGroupedToHH(hypersproutDet, TID, "HyperHub", function (err, result) {
                                        if (err) {
                                            callback(err, null)
                                        } else {
                                            collectionName.updateMany({ "HypersproutID": { $in: HHID } }, { $set: { "TransformerID": 'null' } }, function (err, hyperHubFromTransformer) {
                                                if (err) {
                                                    insertError.putErrorDetails(err, callback);
                                                } else {
                                                    if (hyperHubFromTransformer.length !== 0) {
                                                        collectionName1.find({ "TransformerID": TID }, { "NoOfHyperHubAllocated": 1, "_id": 0 }).toArray(function (err, NoOfHyperHubAllocatedCount) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                var HyperHubDeAllocatedToUpdate = 0;
                                                                if (NoOfHyperHubAllocatedCount !== null) {
                                                                    for (var i in NoOfHyperHubAllocatedCount) {
                                                                        if (NoOfHyperHubAllocatedCount.hasOwnProperty(i))
                                                                            HyperHubDeAllocatedToUpdate = NoOfHyperHubAllocatedCount[i].NoOfHyperHubAllocated;
                                                                    }
                                                                    HyperHubDeAllocatedToUpdate = HyperHubDeAllocatedToUpdate - HHIDCount;
                                                                    collectionName1.update({ "TransformerID": TID }, { $set: { NoOfHyperHubAllocated: HyperHubDeAllocatedToUpdate } }, function (err, hyperHubUnGrouped) {
                                                                        if (err) {
                                                                            insertError.putErrorDetails(err, callback);
                                                                        } else {
                                                                            async.each(HHID,
                                                                                function (hhid, callbackEach) {
                                                                                    collectionName.find({ "HypersproutID": hhid, Status: "Registered" }).toArray(function (err, hhDetails) {
                                                                                        if (err)
                                                                                            callbackEach(err, null);
                                                                                        else if (hhDetails.length > 0)
                                                                                            sendHHDeRegRequests(schedulerFlagsCollection, hhDetails, callback);
                                                                                        else
                                                                                            callbackEach(null, "HyperHub Successfully Ungrouped from Transformer!");
                                                                                    })
                                                                                }, function (err) {
                                                                                    if (err) {
                                                                                        callback(err, null);
                                                                                    } else {
                                                                                        callback(null, "HyperHub Successfully Ungrouped from Transformer!");
                                                                                    }
                                                                                });
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    })

                                } else {
                                    callback("Either Hyperhub is not grouped or grouped to any other transformer", null);

                                }
                            } else {
                                callback("Hyperhub not available!!", null);
                            }
                        }

                    });

                } else {
                    callback("Transformer not avialable", null)
                }
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

};

/**
* @description - send Hardware Registeration request
* @param schedulerFlagsCollection
* @param hhDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function sendHHDeRegRequests(schedulerFlagsCollection, hhDetails, callback) {
    try {
        var Action = "COLLECTOR_DEREGISTER";
        var Attribute = "HYPERHUB_DELETE";
        var rev = 0;
        var meterID = 0;
        var cellid = hhDetails[0].HypersproutID;
        var HypersproutSerialNumber = hhDetails[0].HypersproutSerialNumber;
        hhDetails[0].Hypersprout_DeviceDetails.CountryCode = (hhDetails[0].Hypersprout_DeviceDetails.CountryCode == null || hhDetails[0].Hypersprout_DeviceDetails.CountryCode == "null" || hhDetails[0].Hypersprout_DeviceDetails.CountryCode == undefined || hhDetails[0].Hypersprout_DeviceDetails.CountryCode == "") ? 0 : hhDetails[0].Hypersprout_DeviceDetails.CountryCode;
        hhDetails[0].Hypersprout_DeviceDetails.RegionCode = (hhDetails[0].Hypersprout_DeviceDetails.RegionCode == "null" || hhDetails[0].Hypersprout_DeviceDetails.RegionCode == null || hhDetails[0].Hypersprout_DeviceDetails.RegionCode == undefined || hhDetails[0].Hypersprout_DeviceDetails.RegionCode == "") ? 0 : hhDetails[0].Hypersprout_DeviceDetails.RegionCode;
        var countryCode = hhDetails[0].Hypersprout_DeviceDetails.CountryCode;
        var regionCode = hhDetails[0].Hypersprout_DeviceDetails.RegionCode;
        var DeviceID = hhDetails[0].DeviceID;
        if (DeviceID) {
            schedulerFlagsCollection.find({ DeviceID: DeviceID }).toArray(function (err, deviceMsgID) {
                var messageID = deviceMsgID[0].MessageID;
                if ((messageID === 255) || (messageID === null) || (messageID === undefined)) {
                    messageID = 0;
                } else {
                    messageID++;
                }
                transformerDeregisterReq.transformerDeregisterReq(Action, Attribute, rev, messageID, countryCode, regionCode, cellid, meterID, DeviceID, HypersproutSerialNumber, callback);
            });
        } else {
            return callback("HyperHub Successfully Ungrouped from Transformer!", null);
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

//Function to convert array into chunk given by size
function chunk(array, size) {
    const chunked_arr = [];
    let copied = [...array]; // ES6 destructuring
    const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
    for (let i = 0; i < numOfChild; i++) {
        chunked_arr.push(copied.splice(0, size));
    }
    return chunked_arr;
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
* @params key, value, index, data
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

// function  to find uniqueArray of objects
uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))


/* *************** DB Commands SECTION 3 - MODULE EXPORTS *************************** */

module.exports = {
    createNewHyperHubEntry: createNewHyperHubEntry,
    updateHyperHubDetails: updateHyperHubDetails,
    selectAllHyperHubDetails: selectAllHyperHubDetails,
    deleteHyperHubDetails: deleteHyperHubDetails,
    addHyperHubToTransformer: addHyperHubToTransformer,
    getAllHyperHubAttached: getAllHyperHubAttached,
    removeHyperHubFromTransformer: removeHyperHubFromTransformer,
    hyperhubValidation: hyperhubValidation,
    uniqueArray: uniqueArray
};

/* ====================== End : Added by F H Khan  ========================= */