//REQUIRED PACKAGES AND FILES.
const dbCon = require('./dbConnection.js');
let fs = require('fs');
let validation = './config/Validation.json';
validation = fs.readFileSync(validation, 'utf-8');
let objValidation = JSON.parse(validation);
var nextID = require('../config/Helpers/getSequenceNextID');
const async = require('async');
const paginatedResults = require('../config/Helpers/Pagination')

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
* @description - create new technical items
* @params  newDeltalinkEntryDetails
* @return callback function
*/

function createNewTechItemEntry(insertNewTechnicalItems, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            let TID = [];
            let errorArr = [];
            let resultErrors = [];
            for (var j in insertNewTechnicalItems.TransformerSerialNo) {
                let objToInsert = {};

                //change string to boolean
                if ((insertNewTechnicalItems.Metered &&
                    insertNewTechnicalItems.Metered[j] === "true" || insertNewTechnicalItems.Metered[j] === "TRUE")) {
                    insertNewTechnicalItems.Metered[j] = true;
                }
                if ((insertNewTechnicalItems.Metered &&
                    insertNewTechnicalItems.Metered[j] === "false" || insertNewTechnicalItems.Metered[j] === "FALSE")) {
                    insertNewTechnicalItems.Metered[j] = false;
                }
                if ((insertNewTechnicalItems.UsagePerDay[j] < 0.001)) {
                    resultErrors.push({ SerialNumber: insertNewTechnicalItems['Name'][j], Status: "Fail", Comment: insertNewTechnicalItems.UsagePerDay[j] + " - " + "UsagePerDay" + " should be greater than or equal to 0.001!!" });
                    errorArr.push(insertNewTechnicalItems.UsagePerDay[j] + " - " + "UsagePerDay " + "should be greater than or equal to 0.001!!");

                }if ((insertNewTechnicalItems.UsagePerDay[j] > 65535.999)) {
                    resultErrors.push({ SerialNumber: insertNewTechnicalItems['Name'][j], Status: "Fail", Comment: insertNewTechnicalItems.UsagePerDay[j] + " - " + "UsagePerDay" + " should be less than or equal to 65535.999!!" });
                    errorArr.push(insertNewTechnicalItems.UsagePerDay[j] + " - " + "UsagePerDay " + "should be less than or equal to 65535.999!!");

                } else {
                    for (var key in insertNewTechnicalItems) {
                        if (checkMinimumLengthValidation(key, insertNewTechnicalItems[key][j]) &&
                            checkMaximumLengthValidation(key, insertNewTechnicalItems[key][j])) {
                            if (checkPatternValidation(key, insertNewTechnicalItems[key][j])) {
                                if (checkValueMatches(key, insertNewTechnicalItems[key][j])) {
                                    objToInsert[key] = insertNewTechnicalItems[key][j];
                                } else {
                                    resultErrors.push({ SerialNumber: insertNewTechnicalItems['TransformerSerialNo'][j], Status: "Fail", Comment: insertNewTechnicalItems[key][j] + " - " + key + " Incorrect Value !!" });
                                    errorArr.push(insertNewTechnicalItems[key][j] + " - " + key + " Incorrect Value !!");
                                }
                            } else {
                                resultErrors.push({ SerialNumber: insertNewTechnicalItems['TransformerSerialNo'][j], Status: "Fail", Comment: insertNewTechnicalItems[key][j] + " - " + key + " pattern doesn't Matches!!" });
                                errorArr.push(insertNewTechnicalItems[key][j] + " - " + key + " pattern doesn't Matches!!");
                            }
                        } else {
                            resultErrors.push({ SerialNumber: insertNewTechnicalItems['TransformerSerialNo'][j], Status: "Fail", Comment: insertNewTechnicalItems[key][j] + " - " + key + " length is Wrong!!" });
                            errorArr.push(insertNewTechnicalItems[key][j] + " - " + key + " length is Wrong!!");
                        }
                    }
                }
                if (Object.keys(insertNewTechnicalItems).length === Object.keys(objToInsert).length) {
                    TID.push(objToInsert);
                }
            }
            if (TID.length === 0) {
                if (insertNewTechnicalItems.TransformerSerialNo.length === 1) {
                    callback(null, "Failed to Add: Duplicate/Incorrect Technical Loss Items!", errorArr, resultErrors);
                } else
                    callback(null, "Failed to Upload: Duplicate/Incorrect file!", errorArr, resultErrors);
            } else {
                insertNewTechnicalItemsfunc(TID, errorArr, resultErrors, db.delta_Transformer_Tech_Item, db.delta_Transformer, function (err, message, Errors, resultErrors) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, message, Errors, resultErrors);
                    }
                });
            }
        }
    });

}

function insertNewTechnicalItemsfunc(TID, errorArr, resultErrors, TechItemCollection, TransformerCollection, callback) {
    if (TID.length > 500) {
        callback("Total number of records should not be more than 500", null);
    } else {
        let insertArr = [];

        async.each(TID,
            function (techItem, callbackEach) {
                checkAlldayStartEndHour(techItem.StartHour,techItem.EndHour,techItem.UsageTime, function (err) {
                    if (err) {
                        resultErrors.push({ SerialNumber: techItem.TransformerSerialNo, Status: 'Fail', Comment: ` Start hour and End hour should be correct for allDay in transformer serial number `+ techItem.TransformerSerialNo});
                        errorArr.push("Start hour and End hour should be correct for allDay in transformer serial number "+ techItem.TransformerSerialNo);
                        callbackEach();
                    } else {
                        let techItemObj = {};
                        findFromCollection(TransformerCollection, { "TransformerSerialNumber": { $regex: new RegExp("^" + techItem.TransformerSerialNo + "$", "i") } }, function (err, transformerDetails) {
                            if (err)
                                callback(err, null);
                            else {
                                if (transformerDetails.length > 0) {
                                    let where = { "TransformerSerialNo": techItem.TransformerSerialNo, "Name": { $regex: new RegExp("^" + techItem.Name + "$", "i") } };
                                    checkUniqueTechnicalItemName(techItem, TechItemCollection, where, function (err, nameNotUnique) {
                                        if (err) {
                                            callbackEach(err);
                                        } else {
                                            if (nameNotUnique) {
                                                resultErrors.push({ SerialNumber: techItem.TransformerSerialNo, Status: 'Fail', Comment: nameNotUnique});
                                                errorArr.push(nameNotUnique);
                                                callbackEach();
                                            } else {
                                                let id = "item_id";
                                                nextID.getValueForNextSequenceItem(id, "TechnicalItem", function (err, nextId) {
                                                    techItemObj.TechitemID = nextId;
                                                    techItemObj.Name = techItem.Name;
                                                    techItemObj.TransformerSerialNo = techItem.TransformerSerialNo;
                                                    techItemObj.Metered = techItem.Metered;
                                                    techItemObj.UsagePerDay = techItem.UsagePerDay;
                                                    techItemObj.NoOfConnectedItems = techItem.NoOfConnectedItems;
                                                    techItemObj.UsageTime = techItem.UsageTime;
                                                    techItemObj.StartHour = techItem.StartHour;
                                                    techItemObj.EndHour = techItem.EndHour;
                                                    insertArr.push(techItemObj);
                                                    resultErrors.push({ SerialNumber: techItem.Name, Status: "Pass", Comment: "Technical Loss Items Successfully Added!" });
                                                    callbackEach();
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    resultErrors.push({ SerialNumber: techItem.TransformerSerialNo, Status: 'Fail', Comment: techItem.TransformerSerialNo + ` Invalid Transformer Serial Number!!`});         
                                    errorArr.push(techItem.TransformerSerialNo + " Invalid Transformer Serial Number!!");
                                    callbackEach();
                                }
                            }
                        });
                    }
                });
            }, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    if (insertArr.length) {
                        TechItemCollection.insertMany(insertArr, function (err, success) {
                            if (err)
                                callback(err)
                            else
                                callback(null, "Technical Loss Items Successfully Added!", errorArr, resultErrors);
                        });
                    } else {
                        callback(null, "No items to add!", errorArr, resultErrors);
                    }
                }
            });
    }

}

function checkUniqueTechnicalItemName(techItem, collectionName, where, callback) {
    let trnfSerialNo = techItem.TransformerSerialNo;
    let name = techItem.Name;
    findFromCollection(collectionName, where, function (err, transformerDetails) {
        if (err) {
            callback(err, null);
        } else {
            if (transformerDetails.length) {
                let msg = name + ' already exist in ' + trnfSerialNo;
                callback(null, msg);
            } else {
                callback(null, null);
            }
        }
    });
}

/**
* @description - transformer validation
* @params  newDeltalinkEntryDetails
* @return callback function
*/
function findFromCollection(collectionName, where, callback) {
    collectionName.find(where).toArray(function (err, details) {
        if (err)
            callback(err, null);
        else {
            callback(null, details)
        }
    })


}

function checkAlldayStartEndHour(StartHour, EndHour, UsageTime,callback) {

    if (UsageTime == 'allDay') {
        if (StartHour == "0" && EndHour == "23") {
            callback(null, null);
        } else {
            callback("Start hour and End hour should be correct for allDay", null);
        }
    } else {
        callback(null, null);
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

function displayAllTechnicalItems(data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            if (!data.search || data.search == null || data.search == "null") {
                let techItemCollection = db.delta_Transformer_Tech_Item;
                let whereCondition = { "TransformerSerialNo": data.transformerSN };
                paginatedResults.paginatedResults(techItemCollection, whereCondition, data, "TechnicalItems", function (err, List) {
                    if (err) {
                        callback("Invalid Transformer Serial Number/Technical Items not available for this Transformer", null)
                    } else {
                        callback(null, List)
                    }
                })
            } else {
                let techItemCollection = db.delta_Transformer_Tech_Item;
                let query = { Name: { $regex: new RegExp(data.search, "i") } };
                let whereCondition = { $and: [{ "TransformerSerialNo": data.transformerSN }, query] }
                paginatedResults.paginatedResults(techItemCollection, whereCondition, data, "TechnicalItems", function (err, List) {
                    if (err) {
                        callback("Invalid Transformer Serial Number/Technical Items not available for this Transformer", null)
                    } else {
                        callback(null, List)
                    }
                })
            }
        }
    });
}

function editTechItemEntry(editNewTechnicalItems, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            if (editNewTechnicalItems.UsagePerDay < 0.001) {
                return callback(editNewTechnicalItems.UsagePerDay + " - " + "UsagePerDay " + "should be greater than or equal to 0.001!!", null);

            }else if ( (editNewTechnicalItems.UsagePerDay > 65535.999)) {
                return callback(editNewTechnicalItems.UsagePerDay + " - " + "UsagePerDay " + "should be less than or equal to 65535.999!!", null);

            } else {
                let techitemID = editNewTechnicalItems.TechitemID;
                findFromCollection(db.delta_Transformer_Tech_Item, { "TechitemID": techitemID }, function (err, nonTechItems) {
                    if (err)
                        callback(err, null);
                    else {
                        if (nonTechItems.length) {

                            //change string to boolean
                            if ((editNewTechnicalItems.Metered &&
                                editNewTechnicalItems.Metered === "true" || editNewTechnicalItems.Metered === "TRUE")) {
                                editNewTechnicalItems.Metered = true;
                            }
                            if ((editNewTechnicalItems.Metered &&
                                editNewTechnicalItems.Metered === "false" || editNewTechnicalItems.Metered === "FALSE")) {
                                editNewTechnicalItems.Metered = false;
                            }
                            checkAlldayStartEndHour(editNewTechnicalItems.StartHour, editNewTechnicalItems.EndHour, editNewTechnicalItems.UsageTime, function (err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    let where = { "TransformerSerialNo": editNewTechnicalItems.TransformerSerialNo, "Name": { $regex: new RegExp("^" + editNewTechnicalItems.Name + "$", "i") }, "TechitemID": { $ne: techitemID } };
                                    checkUniqueTechnicalItemName(editNewTechnicalItems, db.delta_Transformer_Tech_Item, where, function (err, nameNotUnique) {
                                        if (err) {
                                            callbackEach(err);
                                        } else {
                                            if (nameNotUnique) {
                                                callback(nameNotUnique, null);
                                            } else {

                                                delete editNewTechnicalItems.TechitemID;
                                                delete editNewTechnicalItems.TransformerSerialNo;

                                                editTechItemValues(db.delta_Transformer_Tech_Item, { "TechitemID": techitemID }, editNewTechnicalItems, function (err, updateVal) {
                                                    if (err)
                                                        callback(err, null)
                                                    else
                                                        callback(null, 'Technical Loss Item Successfully Updated!');
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            callback("Invalid TechitemID!");
                        }
                    }

                });
            }

        }
    });
}

function editTechItemValues(collectionName, where, updateData, callback) {
    collectionName.update(where, { $set: updateData }, function (err, updateVal) {
        if (err)
            callback(err, null);
        else {
            callback(null, updateVal);
        }
    });
}

function deleteTechItems(deleteTechnicalItems, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else {
            let techitemID = deleteTechnicalItems.TechitemID;
            findFromCollection(db.delta_Transformer_Tech_Item, { "TechitemID": { $in: techitemID } }, function (err, nonTechItems) {
                if (nonTechItems) {
                    let techIDarr = [];
                    for (var i = 0; i < nonTechItems.length; i++) {
                        techIDarr.push(nonTechItems[i].TechitemID)
                    }
                    let invalidTechitemID = techitemID.filter(x => !techIDarr.includes(x));
                    let errors = [];
                    if (invalidTechitemID.length)
                        errors.push(invalidTechitemID.toString() + ' Invalid ID(s)');
                    deleteFromCollection(db.delta_Transformer_Tech_Item, { "TechitemID": { $in: techitemID } }, function (err, deletedTechItems) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, "Technical Loss Item(s) Deleted Successfuly!", errors);
                        }
                    });
                } else {
                    callback("Invalid techitemID(s)!", null);;
                }
            })
        }
    });
}

function deleteFromCollection(collectionName, where, callback) {
    collectionName.deleteMany(where, function (err, deletedTechItems) {
        if (err)
            callback(err, null);
        else
            callback(null, deletedTechItems);
    });
}

module.exports = {
    toCheckDuplicate: toCheckDuplicate,
    createNewTechItemEntry: createNewTechItemEntry,
    displayAllTechnicalItems: displayAllTechnicalItems,
    editTechItemEntry: editTechItemEntry,
    deleteTechItems: deleteTechItems

}