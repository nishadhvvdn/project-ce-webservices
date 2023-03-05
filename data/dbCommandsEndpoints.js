//REQUIRED PACKAGES AND FILES.
var async = require('async');
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var generator = require('generate-password');
var unique = require('array-unique');
var objdaoimpl = require('./mysqldaoimpl.js');
var objLatestTransactionModel = require('./latesttransactionmodel.js');
var validator = require('validator');
var insertError = require('./insertErrorLogsToDB.js');
var parser = require('../data/parser.js');
var sToIOT = require('./sendToiot.js');
var dbCmd = require('../data/dbCommandsTransactionScheduler.js');
var fs = require('fs');
var validation = './config/Validation.json';
validation = fs.readFileSync(validation, 'utf-8');
var objValidation = JSON.parse(validation);
var nextID = require('../config/Helpers/getSequenceNextID')
const paginatedResults = require('../config/Helpers/Pagination')
let duplicateItems = require('../config/Helpers/duplicateEntry.js')



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
* @description - Get all Endpoint Entries in MONGODB ,WebService - DisplayAllEndpointDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectAllEndpointDetails(data, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            }
            else {
                var endpointCollection = db.delta_Endpoint;
                getAllEndpointEntryFromMongoDB(endpointCollection, data, callback);
            }

        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - CREATE new Endpoint Entry in MONGODB ,WebService - NewEndpointEntry
* @param insertNewEndpointDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function createNewEndpointEntry(insertNewEndpointDetails, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                createNewEndpointEntryFromMongoDB(db.delta_Endpoint, db.delta_Transformer, db.delta_Hypersprouts, db.delta_Jobs, insertNewEndpointDetails, db.delta_Circuit, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - WebService - EditEndpointDetails, Edit Endpoint Entry in MONGODB
* @param updateEndpointValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateEndpointDetails(updateEndpointValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                editEndpointDetails(db.delta_Endpoint, db.delta_Transformer, db.delta_Hypersprouts, db.delta_Jobs, updateEndpointValues, db.delta_Circuit, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

// function return an Integer values

function integerValue(x) {
    return parseInt(x);
}


/**
* @description - WebService - DeleteEndpointDetails,Delete Endpoint Entry in MONGODB
* @param EndpointIDs
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteEndpoints(EndpointIDs, callback) {
    try {
        // map() return a new array of Deltalink having only integer values and  integerValue function return an Integer values
        let endpoints = (EndpointIDs).map(integerValue);
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                deleteMultipleEndpoints(db.delta_Transformer, db.delta_Hypersprouts, db.delta_Jobs, db.delta_Endpoint, endpoints, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - WebService - EndpointResponse, Response from Devices for the Endpoints Registration 
* @param cellID
* @param messageID
* @param status
* @param jobType
* @param callback - callback function returns success or error response
* @return callback function
*/

function endpointRegistrationJobsResponse(cellID, messageID, status, jobType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                updateEndpointRegistraionJobs(db.delta_Hypersprouts, db.delta_Endpoint, db.delta_Jobs, cellID, messageID, status, jobType, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - get All Endpoint Entry From MongoDB
* @param endpointCollection
* @param callback - callback function returns success or error response
* @return callback function
*/
function getAllEndpointEntryFromMongoDB(endpointCollection, data, callback) {
    try {
        if (!data.search || data.search === undefined || data.search === null) {
            let whereCondition = {};
            paginatedResults.paginatedResults(endpointCollection, whereCondition, data, "Endpoint", function (err, allEndPointDetails) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, allEndPointDetails)
                }
            })
        }
        else {
            let whereCondition = { Owner: { $regex: new RegExp(data.search, "i") } };
            paginatedResults.paginatedResults(endpointCollection, whereCondition, data, "Endpoint", function (err, allEndPointDetails) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, allEndPointDetails);
                }
            })

        }

    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
// function getAllEndpointEntryFromMongoDB(endpointCollection, callback) {
//    try {
//        endpointCollection.find().toArray(function (err, endpointDetails) {
//            if (err)
//                callback(err, null);
//            else if (endpointDetails.length === 0)
//                callback(new Error("No Endpoints found in system!"), null);
//            else
//                callback(null, endpointDetails);
//        });
//    } catch (error) {
//         callback(`Something went wrong : ${error.name} ${error.message}`, null);
//    }
// }



function insertEndpoint(EID, dupEID, endpointCollection, transformerCollection, hypersproutCollection, jobsCollection, CircuitID, Type, dupEIDFinal, resultErrors, callback) {
    try {
        var newMacIDs = [];
        if (EID.length > 500) {
            callback("Total number of records should not be more than 500", null);
        } else {
            var MacAdd = [];
            async.each(EID,
                function (eid, callbackEach) {
                    newMacIDs.push(eid.MacID.toLowerCase());
                    var id = "item_id";
                    nextID.getValueForNextSequenceItem(id, "Endpoint", function (err, nextId) {
                        let doc = {
                            "EndpointID": nextId,
                            "MacID": eid.MacID.toLowerCase(),
                            "Owner": eid.Owner,
                            "Description": eid.Description,
                            "CircuitID": CircuitID,
                            "DeviceType": eid.DeviceType,
                            "Status": "NotRegistered"
                        }
                        if (eid.DeviceType == 'Roaming Devices')
                            MacAdd["0_"+eid.MacID.toLowerCase()] = eid.Owner;
                        else
                            MacAdd["1_"+eid.MacID.toLowerCase()] = "meshcard";
                        endpointCollection.insert(doc, function (err, result) {
                            if (err) {
                                insertError.putErrorDetails(err, callbackEach);
                                callbackEach(err)
                            }
                            else {
                                resultErrors.push({ SerialNumber: eid.MacID, Status: 'Pass', Comment: "Endpoint Details Successfully Added!" });
                                callbackEach();
                            }

                        });
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        //   callback(null, "Endpoint Details Successfully Added!");
                        if (newMacIDs.length > 0) {
                            //MacAdd[eid.MacID.toLowerCase()] = eid.Owner
                            sendNewMacIDs(transformerCollection, hypersproutCollection, jobsCollection, newMacIDs, MacAdd, CircuitID, "Register", function (err, response) {
                                return callback(err, response, dupEIDFinal, resultErrors);
                            });
                        } else if (Type === "Add") {
                            return callback(null, "Failed to Add: Duplicate/Incorrect file! !!", dupEIDFinal, resultErrors);
                        } else if (Type === "Upload") {
                            return callback(null, "Failed to Upload: Duplicate/Incorrect file!!", dupEIDFinal, resultErrors);
                        } else {
                            return callback(new Error("Invalid Request, Please try again after some time!"), null, null);
                        }
                    }
                });
        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}









/**
* @description - create New Endpoint Entry From MongoDB, For the Webservice - NewEndpointEntry
* @param endpointCollection
* @param transformerCollection
* @param hypersproutCollection
* @param jobsCollection
* @param insertNewEndpointDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function createNewEndpointEntryFromMongoDB(endpointCollection, transformerCollection, hypersproutCollection, jobsCollection, insertNewEndpointDetails, circuitCollection, callback) {
    try {
        var MID = [];
        var dupEID = [];
        var dupEIDFinal = [];
        var emptyCount = 0;
        var CircuitID = insertNewEndpointDetails.CircuitID;
        var Type = insertNewEndpointDetails.Type;
        var resultErrors = [];
        var dupID = [];
        let macReg = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
        circuitCollection.find({ CircuitID: insertNewEndpointDetails.CircuitID }).toArray(function (err, CircuitDetails) {
            if (err)
                callback(err, null, null)
            else if (CircuitDetails.length == 0)
                callback('Invalid circuitID', null, null)
            else {
                for (i in insertNewEndpointDetails.MacID) {
                    if (!macReg.test(insertNewEndpointDetails.MacID[i])) {
                        //invalid pattern mac id
                    } else {
                        dupID.push(insertNewEndpointDetails.MacID[i])
                    }
                }
                var regex = dupID.map(function (e) { return new RegExp("^" + e + "$", "i"); });
                endpointCollection.find({ CircuitID: insertNewEndpointDetails.CircuitID, MacID: { "$in": regex } }, { "MacID": 1, "_id": 0 }).toArray(function (err, dupMacID) {
                    if (err)
                        callback(err, null, null);
                    else {
                        if (dupMacID.length > 0) {
                            for (var i in dupMacID) {
                                if (dupMacID.hasOwnProperty(i)) {
                                    dupEID.push(dupMacID[i].MacID.toLowerCase());
                                    dupEIDFinal.push(dupMacID[i].MacID + " - " + " Duplicate Mac ID!");
                                    resultErrors.push({ SerialNumber: dupMacID[i].MacID, Status: 'Fail', Comment: dupMacID[i].MacID + " - " + " Duplicate Mac ID!" });
                                }
                            }
                        }

                        for (var j in insertNewEndpointDetails.MacID) {
                            if (dupEID.indexOf(insertNewEndpointDetails.MacID[j].toLowerCase()) === -1) {
                                if ((insertNewEndpointDetails.MacID[j] === "") || (insertNewEndpointDetails.MacID[j] === null) ||
                                    (insertNewEndpointDetails.MacID[j] === '') || (insertNewEndpointDetails.MacID[j] === undefined)) {
                                    emptyCount = emptyCount + 1;
                                    dupEIDFinal.push(j + " - " + "MAC ID is Null/Empty !!");
                                    resultErrors.push({ SerialNumber: "NULL", Status: 'Fail', Comment: j + " - " + "MAC ID is Null/Empty !!" });
                                }
                                else {
                                    var doc = {};
                                    delete insertNewEndpointDetails.Type
                                    delete insertNewEndpointDetails.CircuitID
                                    for (var key in insertNewEndpointDetails) {
                                        if ((key == "Type") || key == "CircuitID") {
                                            delete key;
                                            continue;
                                        }
                                        if (checkMandatoryValidation(key, insertNewEndpointDetails[key][j])) {
                                            if (checkMinimumLengthValidation(key, insertNewEndpointDetails[key][j]) &&
                                                checkMaximumLengthValidation(key, insertNewEndpointDetails[key][j])) {
                                                if (checkTypeValidation(key, insertNewEndpointDetails[key][j])) {
                                                    if (checkPatternValidation(key, insertNewEndpointDetails[key][j])) {
                                                        doc[key] = insertNewEndpointDetails[key][j];
                                                    } else {
                                                        dupEIDFinal.push(insertNewEndpointDetails[key][j] + " - " + key + " pattern doesn't Matches!!");
                                                        resultErrors.push({ SerialNumber: insertNewEndpointDetails['MacID'][j], Status: 'Fail', Comment: insertNewEndpointDetails[key][j] + " - " + key + " pattern doesn't Matches!!" });
                                                    }
                                                } else {
                                                    dupEIDFinal.push(insertNewEndpointDetails[key][j] + " - " + key + " Type is Wrong!!");
                                                    resultErrors.push({ SerialNumber: insertNewEndpointDetails['MacID'][j], Status: 'Fail', Comment: insertNewEndpointDetails[key][j] + " - " + key + " Type is Wrong!!" });
                                                }
                                            } else {
                                                dupEIDFinal.push(insertNewEndpointDetails[key][j] + " - " + key + " length is Wrong!!");
                                                resultErrors.push({ SerialNumber: insertNewEndpointDetails['MacID'][j], Status: 'Fail', Comment: insertNewEndpointDetails[key][j] + " - " + key + " length is Wrong!!" });
                                            }
                                        } else {
                                            dupEIDFinal.push(insertNewEndpointDetails[key][j] + " - " + key + " Field is Required!!");
                                            resultErrors.push({ SerialNumber: insertNewEndpointDetails['MacID'][j], Status: 'Fail', Comment: insertNewEndpointDetails[key][j] + " - " + key + " Field is Required!!" });
                                        }
                                    }
                                    if (Object.keys(insertNewEndpointDetails).length === Object.keys(doc).length) {
                                        MID.push(doc);
                                    }
                                }
                            }
                        }
                        if (MID.length === 0) {
                            if (Type === "Add") {
                                callback(null, "Failed to Add: Duplicate/Incorrect  Details!", dupEIDFinal, resultErrors);
                            } else
                                callback(null, "Failed to Upload: Duplicate/Incorrect file!", dupEIDFinal, resultErrors);
                        } else {
                            if (MID.length > 0) {
                                insertEndpoint(MID, dupEID, endpointCollection, transformerCollection, hypersproutCollection, jobsCollection, CircuitID, Type, dupEIDFinal, resultErrors, callback);
                            }

                        }

                    }

                });
            }
        })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - send new mac ids
* @param transformerCollection
* @param hypersproutCollection
* @param jobsCollection
* @param newMacIDs
* @param circuitID
* @param operation
* @param callback - callback function returns success or error response
* @return callback function
*/
function sendNewMacIDs(transformerCollection, hypersproutCollection, jobsCollection, newMacIDs, MacAdd, circuitID, operation, callback) {
    try {
        transformerCollection.find({ CircuitID: circuitID }, { TransformerID: 1, _id: 0 }).toArray(function (err, transformerDetails) {
            if (err)
                callback(err, null);
            else if (transformerDetails.length === 0)
                callback(null, "MacID added but DTC not grouped with any Transformer!");
            else {
                async.each(transformerDetails,
                    function (transformerDetail, callback) {
                        if (transformerDetail.TransformerID) {
                            hypersproutCollection.find({ Status: "Registered", TransformerID: transformerDetail.TransformerID }).toArray(function (err, HSDetails) {
                                if (err)
                                    callback(err, null);
                                else {
                                    if (HSDetails.length > 0) {
                                        async.each(HSDetails,
                                            function (HSDetail, callback) {
                                                var msgID, JobType;
                                                var jobdoc = [];
                                                if ((HSDetail.MessageID == 255) || (HSDetail.MessageID == null) || (HSDetail.MessageID == undefined))
                                                    msgID = 0;
                                                else
                                                    msgID = ++HSDetail.MessageID;
                                                if (operation === "Register")
                                                    JobType = "MacID Registraion";
                                                else if (operation === "Update")
                                                    JobType = "MacID Update";
                                                else
                                                    JobType = "MacID DeRegistraion";
                                                if (JobType == "MacID Update") {
                                                    jobdoc.push({
                                                        "JobID": shortid.generate(),
                                                        "DeviceID": HSDetail.DeviceID,
                                                        "SerialNumber": HSDetail.HypersproutSerialNumber,
                                                        "DeviceType": "Circuit",
                                                        "JobName": "Mac Updation Job",
                                                        "JobType": JobType,
                                                        "Status": "Pending",
                                                        "Group": "NA",
                                                        "MessageID": msgID,
                                                        "CreatedDateTimestamp": new Date(),
                                                        "MacID": newMacIDs[1]
                                                    });
                                                } else {
                                                    for (var key in newMacIDs) {
                                                        jobdoc.push({
                                                            "JobID": shortid.generate(),
                                                            "DeviceID": HSDetail.DeviceID,
                                                            "SerialNumber": HSDetail.HypersproutSerialNumber,
                                                            "DeviceType": "Circuit",
                                                            "JobName": "Registration Job",
                                                            "JobType": JobType,
                                                            "Status": "Pending",
                                                            "Group": "NA",
                                                            "MessageID": msgID,
                                                            "CreatedDateTimestamp": new Date(),
                                                            "MacID": newMacIDs[key]
                                                        });
                                                    }
                                                }
                                                sendMacIDs(hypersproutCollection, newMacIDs, MacAdd, msgID, HSDetail, JobType, function (err, resp) {
                                                    for (var key in jobdoc) {
                                                        jobdoc[key].PacketSent = resp;
                                                    }
                                                    jobsCollection.insertMany(jobdoc, callback);

                                                });
                                            }, function (err) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    // callback(null, "Endpoint Details Successfully Added!");
                                                }
                                            });
                                        callback(null, "Endpoint Details Successfully Added!")
                                    } else {
                                        return callback(null, "Hypersprout not available!");
                                    }
                                }
                            });
                        } else {
                            callback(null, "Transformer ID not found!");
                        }
                    }, function (err) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, "Endpoint Details Successfully Added!");
                        }
                    });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - send MAC ids
* @param hypersproutCollection
* @param macids
* @param messageid
* @param HSDetail
* @param JobType
* @param callback - callback function returns success or error response
* @return callback function
*/
function sendMacIDs(hypersproutCollection, macid, MacAdd, messageid, HSDetail, JobType, callback) {
    try {
        var macids = JSON.parse(JSON.stringify(macid));
        var SendMac = [];
        if(JobType === "MacID Registraion" || JobType == "MacID Update"){
        for (var key in MacAdd) {
            oldkey = key;
            var keyArr = key.split('_');
            keyArr[1] = keyArr[1].replace(/:/g, "");
            var NewKey =keyArr[0]+"_" +keyArr[1];
            SendMac[NewKey] = MacAdd[oldkey];
        }
    }
        //If protocolversion countrycode regioncode is undefined in a hypersprout add default value
        var protocolversion = HSDetail.ProtocolVersion ? HSDetail.ProtocolVersion : 0;
        var countrycode = HSDetail.Hypersprout_DeviceDetails.CountryCode ? HSDetail.Hypersprout_DeviceDetails.CountryCode : 0;
        var regioncode = HSDetail.Hypersprout_DeviceDetails.RegionCode ? HSDetail.Hypersprout_DeviceDetails.RegionCode : 0;
        var data = {
            "rev": protocolversion,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": HSDetail.HypersproutID,
            "meterid": 0,
            "attribute": "ALL_DEVICE",
            "Purpose": "SendMACIDs",
            "Length": macid.length,
            "MacIDDetails": SendMac
        };
        if (JobType === "MacID Registraion")
            data.action = "ENDPOINT_REGISTERATION";
        else if (JobType == "MacID Update") {
            data.update = macid[0].replace(/:/g, "");
            data.Length = Object.keys(SendMac).length;
            data.action = "ENDPOINT_UPDATE";
        } else {
            data.action = "ENDPOINT_DEREGISTERATION";
            SendMac = [];
            // for (var i = 0; i < MacAdd.length; i++) {
                //console.log(typeof MacAdd[i]);
                //console.log(MacAdd[i])
                var x = MacAdd;
                // var keyArr = new Array();
                 var keyArr1 = x.split('_');
                SendMac.push(keyArr1[0]+"_"+(keyArr1[1].replace(/:/g, "")));
                data.MacIDDetails = SendMac;
           // }
        }
        parser.hexaCreation(data, function (err, response) {
            if (err)
                callback(err, null);
            else {
                sToIOT.sendToIOT(response, HSDetail.DeviceID, function (err, resp) {
                    if (err) {
                        callback(err.name, null)
                    } else {
                        hypersproutCollection.update({ HypersproutSerialNumber: HSDetail.HypersproutSerialNumber }, { $set: { MessageID: messageid } }, function (err, _hsSuccess) {
                            if (err) {
                                callback(err, null);
                            } else {
                                dbCmd.systemEvents(data.rev, data.cellid, data.meterid, data.messageid, data.Action, data.Attribute, response, function (err, _successEve) {
                                    callback(err, response);
                                });
                            }
                        });
                    }

                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - For the Webservice - EditEndpointDetails
* @param endpointCollection
* @param transformerCollection
* @param hypersproutCollection
* @param jobsCollection
* @param updateEndpointValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function editEndpointDetails(endpointCollection, transformerCollection, hypersproutCollection, jobsCollection, updateEndpointValues, circuitCollection, callback) {
    try {
        var newMacIDs = [];
        updateEndpointValues.MacID = updateEndpointValues.MacID.toLowerCase();
        for (var key in updateEndpointValues) {
            if (checkMandatoryValidation(key, updateEndpointValues[key])) {
                if (checkMinimumLengthValidation(key, updateEndpointValues[key]) &&
                    checkMaximumLengthValidation(key, updateEndpointValues[key])) {
                    if (checkTypeValidation(key, updateEndpointValues[key])) {
                        if (checkPatternValidation(key, updateEndpointValues[key])) {
                            if(duplicateItems.toCheckMulticastMACAddress(updateEndpointValues.MacID.toLowerCase()) == 1){
                                return callback(new Error(`${updateEndpointValues.MacID} multicast Mac ID not allowed!!`), null);
                            }else{

                            }
                        } else {
                            return callback(new Error(key + " pattern doesn't Matches!!"), null)
                        }
                    } else {
                        return callback(new Error(key + " Type is Wrong!!"), null)
                    }
                } else {
                    return callback(new Error(key + " length is Wrong!!"), null)
                }
            } else {
                return callback(new Error(key + " Field is Required!!"), null)

            }
        }
        circuitCollection.find({ CircuitID: updateEndpointValues.CircuitID }).toArray(function (err, CircuitDetails) {
            if (err)
                callback(err, null)
            else if (CircuitDetails.length == 0)
                callback('Invalid CircuitID', callback)
            else {
                endpointCollection.find({ EndpointID: updateEndpointValues.EndpointID }).toArray(function (err, EPDetails) {
                    if (err)
                        callback(err, null);
                    else if (EPDetails.length === 0)
                        callback(new Error("No such Endpoint available"), null);
                    else {
                        updateEndpointValues.MacID = updateEndpointValues.MacID.toLowerCase();
                        if (EPDetails[0].MacID.toLowerCase() !== updateEndpointValues.MacID) {
                            endpointCollection.find({ CircuitID: updateEndpointValues.CircuitID, MacID: { $regex: new RegExp("^" + updateEndpointValues.MacID + "$", "i") } }).toArray(function (err, macIDs) {
                                if (err)
                                    callback(err, null);
                                else if (macIDs.length > 0)
                                    callback(new Error("MAC ID already in use !!"), null);
                                else {
                                    var regMac = /^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/;
                                    if (regMac.test(updateEndpointValues.MacID)) {
                                        var oldMac = EPDetails[0].MacID;
                                        newMacIDs.push(oldMac);
                                        epUpdate(transformerCollection, hypersproutCollection, jobsCollection, endpointCollection, EPDetails, newMacIDs, updateEndpointValues, callback);
                                    } else {
                                        callback(new Error("Wrong MAC ID"), null);
                                    }
                                }
                            });
                        } else {
                            var oldMac = EPDetails[0].MacID;
                            newMacIDs.push(oldMac);
                            epUpdate(transformerCollection, hypersproutCollection, jobsCollection, endpointCollection, EPDetails, newMacIDs, updateEndpointValues, callback);
                        }
                    }
                });
            }
        })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }

};
/**
* @description - End Point update 
* @param transformerCollection
* @param hypersproutCollection
* @param jobsCollection
* @param endpointCollection
* @param EPDetails
* @param newMacIDs
* @param updateEndpointValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function epUpdate(transformerCollection, hypersproutCollection, jobsCollection, endpointCollection, EPDetails, newMacIDs, updateEndpointValues, callback) {

    try {
        endpointCollection.update({ EndpointID: updateEndpointValues.EndpointID }, { $set: { MacID: updateEndpointValues.MacID, Owner: updateEndpointValues.Owner, Description: updateEndpointValues.Description, CircuitID: updateEndpointValues.CircuitID } }, function (err, updateresult) {
            if (err)
                callback(err, null);
            else if ((EPDetails[0].MacID.toLowerCase() !== updateEndpointValues.MacID) || (EPDetails[0].CircuitID.toLowerCase() !== updateEndpointValues.CircuitID.toLowerCase()) || (EPDetails[0].Owner !== updateEndpointValues.Owner)) {
                var MacAdd = [];
                newMacIDs.push(updateEndpointValues.MacID);
                if (EPDetails[0].DeviceType == 'Roaming Devices')
                    MacAdd["0_" + updateEndpointValues.MacID.toLowerCase()] = updateEndpointValues.Owner;
                else
                    MacAdd["1_" + updateEndpointValues.MacID.toLowerCase()] = "meshcard";
                sendNewMacIDs(transformerCollection, hypersproutCollection, jobsCollection, newMacIDs, MacAdd, updateEndpointValues.CircuitID, "Update", function (err, response) {
                    return callback(null, "Endpoint Details Successfully Updated!");
                });
            } else
                return callback(null, "Endpoint Details Successfully Updated!");
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }

}
/**
* @description - delete multiple end points ,  For the Webservice - DeleteEndpointDetails
* @param transformerCollection
* @param hypersproutCollection
* @param jobsCollection
* @param endpointCollection
* @param endpoints
* @param callback - callback function returns success or error response
* @return callback function
*/
function deleteMultipleEndpoints(transformerCollection, hypersproutCollection, jobsCollection, endpointCollection, endpoints, callback) {
    try {
        var macIDs = [];
        var flag = false;
        var output = {
            hypersproutCollection: hypersproutCollection,
            jobsCollection: jobsCollection,
            transformerCollection: transformerCollection,
            EndpointID: [],
            MACIDs: {
                MacID: [],
                CircuitID: ""
            }
        }
        endpointCollection.find({ EndpointID: { $in: endpoints } }).toArray(function (err, IDDetails) {
            if (err)
                callback(err, null);
            else if (IDDetails.length === 0)
                callback("Invalid EndpointID(s)", null);
            else {
                async.waterfall(
                    [
                        function (callbacksEach) {
                            async.each(endpoints,
                                function (endpoint, callbackEach) {
                                    endpointCollection.find({ EndpointID: endpoint }).toArray(function (err, MacIDDetails) {
                                        if (err)
                                            callbackEach(err, null);
                                        else if (MacIDDetails.length === 0)
                                            callbackEach(null, "No MacIDs to Delete");
                                        else {
                                            if (MacIDDetails[0].Status === "NotRegistered") {
                                                jobsCollection.update({ Status: "Pending", JobName: "Registration Job", JobType: "MacID Registraion", MacID: MacIDDetails[0].MacID }, { $set: { Status: "Failed", EndTime: new Date() } });
                                            }
                                            for (var key in macIDs) {
                                                if (macIDs[key].CircuitID === MacIDDetails[0].CircuitID) {
                                                    macIDs[key]["MacID"].push(MacIDDetails[0].MacID);
                                                    flag = true;
                                                }
                                            }
                                            if (!flag) {
                                                var details = {
                                                    "MacID": [MacIDDetails[0].MacID],
                                                    "CircuitID": MacIDDetails[0].CircuitID,
                                                    "DeviceType":MacIDDetails[0].DeviceType
                                                }
                                                macIDs.push(details);
                                            }
                                            output.MACIDs = macIDs;
                                            output.EndpointID.push(endpoint);
                                            callbackEach(null, "Processed");
                                        }
                                    });
                                },
                                function (err) {
                                    if (err) {
                                        callbacksEach(err, null);
                                    } else {
                                        callbacksEach(null, output);
                                    }
                                });
                        },
                        function (MacIDDetails, callback) {
                            async.each(MacIDDetails.MACIDs,
                                function (MacIDDetail, callbackEach) {
                                    if (MacIDDetail.DeviceType == 'Roaming Devices')
                                        var AddMac = "0_" + MacIDDetail.MacID;
                                    else
                                        var AddMac = "1_" + MacIDDetail.MacID;
                                    sendNewMacIDs(MacIDDetails.transformerCollection, MacIDDetails.hypersproutCollection, MacIDDetails.jobsCollection, MacIDDetail.MacID, AddMac, MacIDDetail.CircuitID, "Deregister", callbackEach);
                                },
                                function (err) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, MacIDDetails);
                                    }
                                });
                        },
                        function (MacIDDetails, callback) {
                            endpointCollection.remove({ EndpointID: { $in: MacIDDetails.EndpointID } }, function (err, response) {
                                if (err)
                                    callback(err, null);
                                else
                                    callback(null, "Endpoint Deleted Successfully!");
                            });
                        }
                    ],
                    function (err, result) {
                        callback(err, result);
                    });
            }
        });


    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - update Endpoint Registration of Jobs
* @param hypersproutCollection
* @param endpointCollection
* @param jobsCollection
* @param cellID
* @param messageID
* @param status
* @param jobType
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateEndpointRegistraionJobs(hypersproutCollection, endpointCollection, jobsCollection, cellID, messageID, status, jobType, callback) {
    try {
        hypersproutCollection.find({ HypersproutID: cellID }).toArray(function (err, HSDetails) {
            if (err)
                callback(err, null);
            else {
                if (HSDetails.length) {
                    var epStatus;
                    if (status === "Completed")
                        epStatus = "Registered";
                    else
                        epStatus = "NotRegistered";
                    jobsCollection.update({ SerialNumber: HSDetails[0].HypersproutSerialNumber, MessageID: messageID, JobName: "Registration Job", JobType: jobType }, { $set: { Status: status, EndTime: new Date() } }, { multi: true }, function (err, success) {
                        if (err)
                            callback(err, null);
                        else {
                            jobsCollection.find({ SerialNumber: HSDetails[0].HypersproutSerialNumber, MessageID: messageID, JobName: "Registration Job", JobType: jobType }, { MacID: 1, _id: 0 }).toArray(function (err, macIDs) {
                                if (err)
                                    callback(err, null);
                                else {
                                    async.each(macIDs,
                                        function (macID, callbackEach) {
                                            endpointCollection.update({ MacID: macID.MacID }, { $set: { Status: epStatus } }, callbackEach);
                                        },
                                        function (err) {
                                            if (err)
                                                callback(err, null);
                                            else
                                                callback(null, "Success");
                                        });
                                }
                            });
                        }
                    });
                } else {
                    callback('Hypersprout data not found', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}


/**
* @description - get CircuitID and CircuitNumber from MONGODB 
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectAllCircuitIDs(callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                collectionDetails(db.delta_Circuit, {}, { "_id": 0, "CircuitID": 1, "CircuitNumber": 1 }, "CircuitId", function (err, details) {
                    if (err) {
                        callback(err, null)
                    } else {
                        callback(null, details)
                    }
                })

            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

}


/**
* @description - For the Webservice - collectionStatus, SELECT All Device  details which is registered FROM MONGODB after query
* @param CollectionName MongodbCollection 
* @param condition condition used for mongodb query
* @param projection field which required from the query 
* @param message message to show 
* @param callback - callback function returns success or error response
* @return callback function
*/
function collectionDetails(collectionName, condition, projection, message, callback) {
    try {
        collectionName.find(condition).project(projection).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length > 0) {
                    callback(null, result);
                } else {
                    callback(message + " not available in the system", null);
                }
            }
        });
    } catch (e) {

        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}
module.exports = {
    selectAllEndpointDetails: selectAllEndpointDetails,
    createNewEndpointEntry: createNewEndpointEntry,
    updateEndpointDetails: updateEndpointDetails,
    deleteEndpoints: deleteEndpoints,
    endpointRegistrationJobsResponse: endpointRegistrationJobsResponse,
    selectAllCircuitIDs:selectAllCircuitIDs
};
/* ====================== End : Added by Dhruv Daga  ========================= */