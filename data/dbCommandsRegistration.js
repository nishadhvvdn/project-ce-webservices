//REQUIRED PACKAGES AND FILES.
var async = require('async');
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var fs = require('fs');
var generator = require('generate-password');
var unique = require('array-unique');
var objdaoimpl = require('./mysqldaoimpl.js');
var objLatestTransactionModel = require('./latesttransactionmodel.js');
var validator = require('validator');
var insertError = require('./insertErrorLogsToDB.js');
var dao = require('../dao/MongoDAO.js');
var validation = './config/Validation.json';
validation = fs.readFileSync(validation, 'utf-8');
var objValidation = JSON.parse(validation);
var sendToIot = require('./sendToiot');
var sToIOT = require('./sendToiot.js');
var async = require("async");
var dbCmd = require('../data/dbCommandsTransactionScheduler.js');
var parser = require('../data/parser.js');
var nextID = require('../config/Helpers/getSequenceNextID');
var IOTConnectionString = process.env.CONNECTION_STRING;
var res = IOTConnectionString.split(";");
var hostnameSplit = res[0].split("=");
var Hostname = hostnameSplit[1];
const flatten = require('lodash.flatten')
const paginatedResults = require('../config/Helpers/Pagination');
var configUpload = require('../data/configUpload');
var Registry = require('azure-iothub').Registry;
let duplicateItems = require('../config/Helpers/duplicateEntry.js');
var session = require('./../routes/sessionCheck');
var dbUsr = require('./dbCommandsUserDetails.js');
// const sms = require('./sendSms');
const sms = require('./sendSmsAZ.js')
const redis = require('redis');

// function to push bootstrap data into redis list
function pushBootstrapData(HypersproutSerialNumber, sak, callback) {
    const publisher  = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST,
        { auth_pass: process.env.REDIS_PASS, tls: { servername: process.env.REDIS_HOST } });
    let deviceId = `HS-${HypersproutSerialNumber}`;
    let bootstrapdata = {"HypersproutSerialNumber":HypersproutSerialNumber,"HostName":process.env.IOT_HOSTNAME,"SAK":sak}
    publisher.send_command('rpush',[deviceId,JSON.stringify(bootstrapdata)], function(err,res) {
        if(err) {
            callback(err,null);
        } else {
            callback(null, res);
        }
    });
}

/**
* @description - DataSCAPE WebService - NewCircuitEntry,    Desc - CREATE new Circuit Entry in MONGODB
* @param insertNewCircuitDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function createNewCircuitEntry(insertNewCircuitDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            createNewCircuitEntryFromMongoDB(db.delta_Circuit, insertNewCircuitDetails, callback);
    });
};


/**
* @description - DataSCAPE WebService - NewMeterEntry,    Desc - CREATE new Meter Entry in MONGODB
* @params insertNewMeterDetails, callback
* @return callback function
*/



function createNewMeterEntry(insertNewMeterDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            createNewMeterEntryFromMongoDB(db.delta_Meters, db.delta_Jobs, insertNewMeterDetails, callback);
    });
};

/**
* @description - DataSCAPE WebService - NewTransformerHypersproutEntry,    Desc - CREATE new Transformer & Hypersprout Entry in MONGODB
* @params insertNewTransformerHypersproutDetails, callback
* @return callback function
*/


function createNewTransformerHypersproutEntry(insertNewTransformerHypersproutDetails, sessionId, toMob, flowType, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            createNewTransformerHypersproutEntryFromMongoDB(db.delta_Hypersprouts, db.delta_Transformer, db.delta_Jobs, db.delta_Config, insertNewTransformerHypersproutDetails, sessionId, toMob, flowType,callback);
    });
};
/**
* @description - For the Webservice - EditCircuitDetails,    Desc - UPDATE Circuit details IN MONGODB
* @params updateCircuitValues, callback
* @return callback function
*/
function updateCircuitDetails(updateCircuitValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            updateCircuitDetailsFromMongoDB(db.delta_Circuit, updateCircuitValues, callback);
    });
};

/**
* @description -  For the Webservice - EditMeterDetails, UPDATE Meter details IN MONGODB
* @params updateMeterValues, callback
* @return callback function
*/
function editMeterDetails(updateMeterValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            editMeterDetailsFromMongoDB(db.delta_Meters, updateMeterValues, callback);
    });
};

/**
* @description -  edit Meter Wifi Details
* @params MeterID, callback
* @return callback function
*/
function editMeterWifiDetails(MeterID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            editMeterWifiDetailsFromMongoDB(db.delta_Meters, db.delta_Hypersprouts, db.delta_SchedulerFlags, MeterID, callback);
    });
};

/**
* @description - edit Meter Wifi Reponse
* @params MeterID, Status, callback
* @return callback function
*/

function editMeterWifiReponse(MeterID, Status, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                editMeterWifiReponseFromMongoDB(db.delta_Meters, db.delta_Jobs, MeterID, Status, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

//for upload bulk config
function UpdateMeterConfig(insertMeterConfigurationDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            UpdateMeterConfiguration(db.delta_Config, db.delta_Jobs, insertMeterConfigurationDetails, callback);
    });
};
function UpdateHyperSproutConfig(insertHypersproutConfigurationDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            UpdateHyperSproutConfiguration(db.delta_Config, db.delta_Jobs, insertHypersproutConfigurationDetails, callback);
    });
};

/**
 * @description - to check the status of isverified field in hypersprout collection
 * @param {string} HypersproutSerialNumber 
 * @param {Function} 
 */
function isTransformerVerified(HypersproutSerialNumber, callback) {
    dbCon.getDb(function (err, db) {
        if(err) {
            callback(err, null);
        } else {
            db.delta_Hypersprouts.find({'HypersproutSerialNumber': HypersproutSerialNumber}).toArray(function (err, result) {
                if(err) {
                    callback(err,null);
                } else {
                    if(result.length) {
                        callback(null,result[0].isVerfied ? result[0].isVerfied : false);
                    } else {
                        callback("Hypersprout Not found", null);
                    }
                }
            });
        }
    });
}

/**
 * @description update otp in hypersprout in edit flow if otp generated
 * @param {string} HypersproutSerialNumber 
 * @param {string} otp 
 * @param {Function} callback 
 */
function updateOtpInHypersproupt(HypersproutSerialNumber, otp, callback) {
    dbCon.getDb(function (err, db) {
        if(err) {
            callback(err, null);
        } else {
            db.delta_Hypersprouts.findOneAndUpdate({'HypersproutSerialNumber': HypersproutSerialNumber},{$set:{'otp':otp,'isVerfied':false}}, function (err, result) {
                callback(err, 'OTP updated');
            })
        }
    })
}

/**
 * @description verify otp in hypersprout in edit flow
 * @param {string} HypersproutSerialNumber 
 * @param {string} otp 
 * @param {Function} callback 
 */
function verifyOtpInHypersproutUpdate(HypersproutSerialNumber, otp, callback) {
    dbCon.getDb(function (err, db) {
        if(err) {
            callback(err, null);
        } else {
            db.delta_Hypersprouts.find({'HypersproutSerialNumber': HypersproutSerialNumber}).toArray(function (err, result) {
                callback(err,(result[0].otp == otp) ? true : false);
            });
        }
    });
}

/**
 * @description - update sak value in config in edit flow
 * @param {string} HypersproutSerialNumber 
 * @param {string} sak 
 * @param {Function} callback 
 */
function updateConfigAfterVerification(HypersproutSerialNumber, sak, callback) {
    dbCon.getDb(function (err, db) {
        if(err) {
            callback(err, null);
        } else {
            db.delta_Config.findOneAndUpdate({'HypersproutSerialNumber': HypersproutSerialNumber},{$set:{'Cloud_Connectivity_Settings.SAK': sak}}, function(err, res) {
                if(err) {
                    callback(err, 'Config update failed');
                } else {
                    callback(null, "Config update successful");
                }
            })
        }
    })
}

/**
* @description -  For the Webservice - EditTransformerHypersproutDetails, UPDATE TransformerHypersprout details IN MONGODB
* @params updateTransformerHypersproutValues, callback
* @return callback function
*/

function editTransformerHypersproutDetails(updateTransformerHypersproutValues, callback) {
    try {
        updateTransformerHypersproutValues.HSWiFiMacID = updateTransformerHypersproutValues.HSWiFiMacID.toLowerCase();
        updateTransformerHypersproutValues.HSGPRSMacID = updateTransformerHypersproutValues.HSGPRSMacID.toLowerCase();
        var docTransformer = {
            "TransformerID": updateTransformerHypersproutValues.TransformerID, "HypersproutID": updateTransformerHypersproutValues.HypersproutID, "TransformerSerialNumber": updateTransformerHypersproutValues.TFMRSerialNumber, "TFMRName": updateTransformerHypersproutValues.TFMRName, "Make": updateTransformerHypersproutValues.TFMRMake, "RatingCapacity": updateTransformerHypersproutValues.TFMRRatingCapacity, "HighLineVoltage": updateTransformerHypersproutValues.TFMRHighLineVoltage, "LowLineVoltage": updateTransformerHypersproutValues.TFMRLowLineVoltage, "HighLineCurrent": updateTransformerHypersproutValues.TFMRHighLineCurrent, "LowLineCurrent": updateTransformerHypersproutValues.TFMRLowLineCurrent, "Type": updateTransformerHypersproutValues.TFMRType, "WireSize": updateTransformerHypersproutValues.WireSize, "MaxOilTemp": updateTransformerHypersproutValues.MaxOilTemp, "MinOilTemp": updateTransformerHypersproutValues.MinOilTemp, "CameraConnect": updateTransformerHypersproutValues.CameraConnect
        };
        var docHypersprout = {
            "HypersproutID": updateTransformerHypersproutValues.HypersproutID, "HypersproutSerialNumber": updateTransformerHypersproutValues.HypersproutSerialNumber,
            "Hypersprout_Communications": {
                "MAC_ID_GPRS": updateTransformerHypersproutValues.HSGPRSMacID, "Latitude": updateTransformerHypersproutValues.HSLatitude, "Longitude": updateTransformerHypersproutValues.HSLongitude, "MAC_ID_WiFi": updateTransformerHypersproutValues.HSWiFiMacID, "IP_address_WiFi": updateTransformerHypersproutValues.HSWiFiIpAddress, "AccessPointPassword": updateTransformerHypersproutValues.HSWiFiAccessPointPassword, "SimCardNumber": updateTransformerHypersproutValues.HSSimCardNumber
            },
            "Hypersprout_DeviceDetails": {
                "CT_Ratio": updateTransformerHypersproutValues.HSCTRatio, "PT_Ratio": updateTransformerHypersproutValues.HSPTRatio, "RatedVoltage": updateTransformerHypersproutValues.HSRatedVoltage, "Phase": updateTransformerHypersproutValues.HSNumberOfPhases, "Coils": updateTransformerHypersproutValues.HSCoils, "Frequency": updateTransformerHypersproutValues.HSRatedFrequency, "Accuracy": updateTransformerHypersproutValues.HSAccuracy, "HSDemandResetDate": updateTransformerHypersproutValues.HSDemandResetDate, "HSCompliantToStandards": updateTransformerHypersproutValues.HSCompliantToStandards, "MaxDemandWindow": updateTransformerHypersproutValues.HSMaxDemandWindow, "MaxDemandSlidingWindowInterval": updateTransformerHypersproutValues.HSMaxDemandSlidingWindowInterval, "Sensor Details": updateTransformerHypersproutValues.HSSensorDetails, "HypersproutVersion": updateTransformerHypersproutValues.HypersproutVersion, "HypersproutMake": updateTransformerHypersproutValues.HypersproutMake
            }
        };
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                editTransformerHypersproutDetailsFromMongoDB(db.delta_Transformer, db.delta_Hypersprouts, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description -  edit HS Wifi Details 
* @params HypersproutID, callback
* @return callback function
*/

function editHSWifiDetails(HypersproutID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            editHSWifiDetailsFromMongoDB(db.delta_Hypersprouts, db.delta_SchedulerFlags, HypersproutID, callback);
    });
};
/**
* @description -  edit Hypersprout Wifi Reponse   
* @params HypersproutID, Status, callback
* @return callback function
*/
function editHypersproutWifiReponse(HypersproutID, Status, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                editHypersproutWifiReponseFromMongoDB(db.delta_Hypersprouts, db.delta_Jobs, HypersproutID, Status, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  For the Webservice - DisplayAllCircuitDetails,    Desc - SELECT All Circuit details FROM MONGODB   
* @params callback
* @return callback function
*/
function selectAllCircuitDetails(data, callback) {
    var collection = "delta_Circuit";
    if (!data.search || data.search == null || data.search == "null") {
        dao.findAllPaginationAndSearch(collection, data, "", "Circuit", callback);
    } else {
        let whereCondition = { CircuitID: { $regex: new RegExp(data.search, "i") } };
        dao.findAllPaginationAndSearch(collection, data, whereCondition, "Circuit", callback);

    }
};

// function selectAllCircuitDetails(callback) {
//     var collection = "delta_Circuit";
//     dao.findAll(collection, callback);
// };



/**
* @description -  For the Webservice - DisplayAllTransformerDetails     Desc - SELECT All Transformer details FROM MONGODB   
* @params callback
* @return callback function
*/
// function selectAllTransformerDetails(callback) {
//     dbCon.getDb(function (err, db) {
//         if (err)
//             callback(err, null);
//         else
//             selectAllTransformerDetailsFromMongoDB(db.delta_Transformer, db.delta_Hypersprouts, callback);
//     });
// };

function selectAllTransformerDetails(data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        }
        else {
            let transformerCollection = db.delta_Transformer;
            let hypersproutCollection = db.delta_Hypersprouts;
            selectAllTransformerDetailsFromMongoDB(transformerCollection, hypersproutCollection, data, callback);
        }
    });
};

/**
* @description - For the Webservice - DeleteCircuitDetails     Desc - DELETE Circuit details IN MONGODB   
* @params deleteCircuitValues, callback
* @return callback function
*/
function deleteCircuitDetails(deleteCircuitValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            deleteCircuitDetailsFromMongoDB(db.delta_Circuit, db.delta_Transformer, deleteCircuitValues, callback);
    });
};

/**
* @description - For the Webservice - DeleteMeterDetails, DELETE Meter details IN MONGODB   
* @params deleteTransformerHypersproutValues, callback
* @return callback function
*/
function deleteMeterDetails(deleteMeterValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            deleteMeterDetailsFromMongoDB(db.delta_Meters, db.delta_Config, deleteMeterValues, callback);
    });
};

/**
* @description -  For the Webservice - DeleteTransformerHypersproutDetails, DELETE Meter details IN MONGODB  
* @params deleteTransformerHypersproutValues, callback
* @return callback function
*/
function deleteTransformerHypersproutDetails(deleteTransformerHypersproutValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            deleteTransformerHypersproutDetailsFromMongoDB(db.delta_Transformer, db.delta_Hypersprouts, db.delta_Meters, deleteTransformerHypersproutValues, callback);
    });
};

/**
* @description -  For the Webservice - AddingTransformerToCircuit - Group Transformer with Circuit IN MONGODB 
* @params addTransformerToCircuitValues, callback
* @return callback function
*/
function addTransformerToCircuit(addTransformerToCircuitValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            addTransformerToCircuitFromMongoDB(db.delta_Transformer, db.delta_Circuit, addTransformerToCircuitValues, callback);
    });
};

/**
* @description - For the Webservice - AddingMeterToTransformer    Desc - Group Meter with Transformer IN MONGODB 
* @params addMeterToTransformerValues, callback
* @return callback function
*/

function addMeterToTransformer(addMeterToTransformerValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            addMeterToTransformerFromMongoDB(db.delta_Meters, db.delta_Transformer, db.delta_Hypersprouts, db.delta_Jobs, addMeterToTransformerValues, callback);
    });
};

/**
* @description - For the Webservice - RemovingMeterFromTransformer, Ungrouping Meter from Transformer IN MONGODB 
* @params metIDs, TransformerID, removeMeterFromTransformerValues, callback
* @return callback function
*/

function removeMeterFromTransformer(metIDs, TransformerID, removeMeterFromTransformerValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            removeMeterFromTransformerFromMongoDB(db.delta_Meters, db.delta_Transformer, TransformerID, metIDs, removeMeterFromTransformerValues, callback);
    });
};
/**
* @description - removing MeterFrom Transformer Response
* @params MID, MIDFailure, HypersproutID, callback
* @return callback function
*/
function removingMeterFromTransformerResponse(MID, MIDFailure, HypersproutID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                removingMeterFromTransformerResponseFromMongoDB(db.delta_Meters, db.delta_Transformer, db.delta_Hypersprouts, db.delta_Jobs, MID, MIDFailure, HypersproutID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - removing DL From Meter Response
* @params DID, DIDFailure, HypersproutID, callback
* @return callback function
*/
function removingDLFromMeterResponse(DID, status, messageid, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                removingDLFromMeterResponseFromMongoDB(db.delta_DeltaLink, db.delta_Meters, db.delta_Jobs, DID, status, messageid, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
//meter validation
function meterValidation(meterCollection, where, callback) {
    try {
        meterCollection.find(where).toArray(function (err, meterDet) {
            if (err)
                callback(err, null);
            else {
                callback(null, meterDet)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }


}

//deltalink validation
function deltalinkValidation(deltalinkCollection, where, callback) {
    deltalinkCollection.find(where).toArray(function (err, deltalinkDet) {
        if (err)
            callback(err, null);
        else {
            callback(null, deltalinkDet)
        }
    })

}
//transformer Validation
function transformerValidation(transformerCollection, where, callback) {
    try {
        transformerCollection.find(where).toArray(function (err, transformerDet) {
            if (err)
                callback(err, null);
            else {
                callback(null, transformerDet)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

// function to check Transformer Id exists or not , to check MeterID is grouped or not 
function meterTransformerValidation(TransformerID, MID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            meterTransformerValidationFromMongoDB(db.delta_Meters, db.delta_Transformer, db.delta_DeltaLink, TransformerID, MID, callback);
    });
};

//to check if transformer is grouped or not

function toCheckIfTransformerGrouped(ArrayOfObject, TransformerID, Meter, callback) {
    try {
        var MeterDetails = [];
        var meterArr;
        async.each(ArrayOfObject, function (ArrayOfObjectDetails, callbackEach) {
            if (ArrayOfObjectDetails.TransformerID !== TransformerID) {
                callbackEach("error", null)
            }
            else {
                meterArr = {};
                meterArr.meterID = ArrayOfObjectDetails.MeterID;
                meterArr.meterSerialNo = ArrayOfObjectDetails.MeterSerialNumber;
                meterArr.meterMac = ArrayOfObjectDetails.Meters_Communications.MAC_ID_WiFi;
                MeterDetails.push(meterArr);
                callbackEach()
            }

        }, function (err, result) {
            if (!err) {
                callback(null, MeterDetails);
            }
            else {
                callback("Either " + Meter + " is not grouped or grouped to any other transformer", null);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}

//to check if transformer is grouped or not


function toCheckIfTransformerGroupedToHH(ArrayOfObject, TransformerID, Meter, callback) {
    try {
        var HHDetails = [];
        var hhArr;
        async.each(ArrayOfObject, function (ArrayOfObjectDetails, callbackEach) {
            if (ArrayOfObjectDetails.TransformerID !== TransformerID) {
                callbackEach("error", null)
            }
            else {
                hhArr = {};
                hhArr.hypersproutID = ArrayOfObjectDetails.HypersproutID;
                hhArr.hypersproutSerialNumber = ArrayOfObjectDetails.HypersproutSerialNumber;
                hhArr.hhMac = ArrayOfObjectDetails.Hypersprout_Communications.MAC_ID_GPRS;
                HHDetails.push(hhArr);
                callbackEach()
            }

        }, function (err, result) {
            if (!err) {
                callback(null, HHDetails);
            }
            else {
                callback("Either " + Meter + " is not grouped or grouped to any other transformer", null);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}

// function to check Transformer Id exists or not , to check MeterID is grouped or not 
function meterTransformerValidationFromMongoDB(meterCollection, transformerCollection, deltalinkCollection, TransformerID, MID, callback) {
    try {
        transformerValidation(transformerCollection, { "TransformerID": TransformerID }, function (err, transformerDet) {
            if (err)
                callback(err, null);
            else {
                if (transformerDet.length > 0) {
                    meterValidation(meterCollection, { "MeterID": { $in: MID } }, function (err, metergroupDet) {
                        if (err)
                            callback(err, null);
                        else {
                            if (!metergroupDet) {
                                callback("Meter not available!!", null);
                            }
                            else if (metergroupDet.length > 0) {
                                if (metergroupDet.length == MID.length) {
                                    deltalinkValidation(deltalinkCollection, { "MeterID": { $in: MID } }, function (err, deltalinkDet) {
                                        if (err)
                                            callback(err, null);
                                        else {
                                            if (deltalinkDet.length > 0) {
                                                callback("Meter(s) linked by Deltalink(s), try to unlink Deltalink(s) first!!", null);

                                            } else {
                                                toCheckIfTransformerGrouped(metergroupDet, TransformerID, "Meter", function (err, result) {
                                                    if (err) {
                                                        callback(err, null)

                                                    } else {
                                                        callback(null, result)
                                                    }
                                                })
                                            }
                                        }
                                    })


                                } else {
                                    callback("Either Meter is not grouped or grouped to any other transformer", null);
                                }
                            } else {
                                callback("Meter not available!!", null);
                            }
                        }
                    });

                } else {
                    callback("Transformer not available!!", null);
                }
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}




/**
* @description - For the Webservice - RemovingMeterFromTransformer, Fetching Details for sending req to IoT 
* @params TransformerID, callback
* @return callback function
*/
function meterUnGroupDetails(TransformerID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            meterUnGroupDetailsFromMongoDB(db.delta_Hypersprouts, db.delta_SchedulerFlags, TransformerID, callback);
    });
};




/**
* @description - For the Webservice - RemovingTransformerFromCircuit, Remove Transformer from Circuit IN MONGODB
* @params removeTransformerFromCircuitValues, callback
* @return callback function
*/
function removeTransformerFromCircuit(removeTransformerFromCircuitValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            removeTransformerFromCircuitFromMongoDB(db.delta_Transformer, db.delta_Circuit, removeTransformerFromCircuitValues, callback);
    });
};
/**
* @description -removing Transformer From Circuit Response
* @params TID, Status, callback
* @return callback function
*/
function removingTransformerFromCircuitResponse(TID, Status, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                removingTransformerFromCircuitResponseFromMongoDB(db.delta_Transformer, db.delta_Hypersprouts, db.delta_Jobs, TID, Status, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description -removing HH From Transformer Response
* @params HID, Status, callback
* @return callback function
*/
function removingHHFromTransformerResponse(HID, Status, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                removingHHFromTransformerResponseFromMongoDB(db.delta_Hypersprouts, db.delta_Jobs, HID, Status, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - remove TransFormer CircuitDetails
* @params TID, callback
* @return callback function
*/
function removeTransFromCircuitDetails(TID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            removeTransFromCircuitDetailsFromMongoDB(db.delta_Hypersprouts, db.delta_SchedulerFlags, db.delta_Transformer, TID, callback);
    });
};
/**
* @description - transformer Deregister Insert
* @params TID, HypersproutSerialNumber, parsedData, callback 
* @return callback function
*/
function transformerDeregisterInsert(TID, HypersproutSerialNumber, parsedData, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            transformerDeregisterInsertFromMongoDB(db.delta_Transformer, db.delta_Jobs, TID, HypersproutSerialNumber, parsedData, callback);
    });
};

/**
* @description - hyperhub Deregister Insert
* @params HID, HypersproutSerialNumber, parsedData, callback 
* @return callback function
*/
function hyperhubDeregisterInsert(HID, HypersproutSerialNumber, parsedData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                hyperhubDeregisterInsertFromMongoDB(db.delta_Hypersprouts, db.delta_Jobs, HID, HypersproutSerialNumber, parsedData, callback);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - For the Webservice - EditMeterDetails,Job creation for WifiPass change req in Meter Edit 
* @params MeterID, MeterSerialNumber, callback
* @return callback function
*/
function MeterWifiPassJobInsert(MeterID, MeterSerialNumber, callback) {
    try {
        var jobInsert = {
            "JobID": shortid.generate(),
            "DeviceID": MeterID,
            "SerialNumber": MeterSerialNumber,
            "DeviceType": "Meter",
            "JobName": "MeterWifiPassChange",
            "JobType": "WifiPassChangeJobs",
            "Status": "Pending",
            "Group": "None",
            "CreatedDateTimestamp": new Date(),
        };
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                MeterWifiPassJobInsertFromMongoDB(db.delta_Jobs, db.delta_Meters, MeterID, jobInsert, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - For the Webservice - EditMeterDetails
* @params HypersproutID, JobID, callback  
* @return callback function
*/

function MeterWifiPassRequestDelayed(MeterID, JobID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            MeterWifiPassRequestDelayedMongoDB(db.delta_Jobs, MeterID, JobID, callback);
    });
};

/**
* @description - For the Webservice - EditTransformerHypersproutDetails, Desc - Job creation for WifiPass change req in HS Edit 
* @params HypersproutID, JobID, callback  
* @return callback function
*/
function HSWifiPassJobInsert(HSID, HypersproutSerialNumber, deviceType, callback) {
    try {
        var jobInsert = {
            "JobID": shortid.generate(),
            "DeviceID": HSID,
            "SerialNumber": HypersproutSerialNumber,
            "DeviceType": "HyperSprout",
            "JobName": "HSWifiPassChange",
            "JobType": "WifiPassChangeJobs",
            "Status": "Pending",
            "Group": "None",
            "CreatedDateTimestamp": new Date(),
        };
        if (deviceType === "Hyperhub") {
            jobInsert.JobName = "HHWifiPassChange";
            jobInsert.DeviceType = "Hyperhub";
        }
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                HSWifiPassJobInsertFromMongoDB(db.delta_Jobs, db.delta_Hypersprouts, HSID, jobInsert, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description -For the Webservice - EditTransformerHypersproutDetails
* @params HypersproutID, JobID, callback  
* @return callback function
*/

function HSWifiPassRequestDelayed(HypersproutID, JobID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            HSWifiPassRequestDelayedMongoDB(db.delta_Jobs, HypersproutID, JobID, callback);
    });
};

/**
* @description - For the Webservice - RemovingMeterFromTransformer 
* @params result, meterId, deviceID, callback
* @return callback function
*/

function meterDeregisterInsert(result, meterId, deviceID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            meterDeregisterInsertFromMongoDB(db.delta_Meters, db.delta_Jobs, result, meterId, deviceID, callback);
    });
};

/**
* @description - check Mandatory Validation
* @params key, value
* @return boolean
*/

function checkMandatoryValidation(key, value) {
    // adding this line for skip HScoils validation
    if (key == "HSCoils") {
        return true;
    }
    if (objValidation[key].Required && (value.length > 0 || isNaN(value) === false)) {
        return true;
    } else if (objValidation[key].Required && (value.length === 0 || isNaN(value) === true)) {
        return false;
    } else {
        return true;
    }
}


/**
* @description - coil validation
* @params coilsData, phase 
* @return boolean
*/

function checkCoilValidation(coilsData, phase) {
    if (coilsData.length == phase) {
        for (var data of coilsData) {
            if (!(data.hasOwnProperty("_id"))) {
                return false
            }
        }
        return true
    } else {
        return false
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

/**
* @description - check if hypersprout registered on IOT hub. Also check if hypersprout and transformer serial number is same
* @params THID errorFinal
* @return errorFinal arrToInsert
*/

function checkIfDeviceRegistered(THID, errorFinal, callback) {
    try {
        var arrToInsert = [];
        let devicesArray = [];
        let digit = getDigit(THID.length);
        var count = THID.length;
        var limit = 100;
        var pageNocount = Math.ceil(count / limit);
        var pageNo;
        var startInd;
        let devicesToRegister;
        let bulkInsertArr1;
        loopcount = 0;
        for (var i in THID) {
            if (THID.hasOwnProperty(i))
                deviceID = 'HS-' + THID[i].HypersproutSerialNumber;
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
                bulkInsertArr1 = THID.slice(startInd, endInd);
            }
            else {
                devicesToRegister = devicesArray;
                bulkInsertArr1 = THID
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
* @description - For the Webservice - NewCircuitEntry
* @params collectionName, insertNewCircuitDetails, callback
* @return callback function
*/

function createNewCircuitEntryFromMongoDB(collectionName, insertNewCircuitDetails, callback) {
    try {
        var CID = [];
        var dupCID = [];
        var dupCIDFinal = [];
        var emptyCount = 0;
        var resultErrors = [];
        var circuitIdArr = insertNewCircuitDetails.CircuitID;
        let type;
        let insertDocs;
        //Added to fetch value from db with case insensitivity
        var regex = circuitIdArr.map(function (e) { return new RegExp("^" + e + "$", "i"); });
        collectionName.find({ CircuitID: { "$in": regex } }, { "CircuitID": 1, "_id": 0 }).toArray(function (err, dupCircuitID) {
            if (err)
                callback(err, null, null);
            else {
                if (dupCircuitID.length > 0) {
                    for (var i in dupCircuitID) {
                        if (dupCircuitID.hasOwnProperty(i)) {
                            dupCID.push(dupCircuitID[i].CircuitID.toLowerCase());
                            dupCIDFinal.push(dupCircuitID[i].CircuitID + " - " + "Duplicate DTC!");
                            resultErrors.push({ SerialNumber: dupCircuitID[i].CircuitID, Status: 'Fail', Comment: "Duplicate DTC!" });
                        }
                    }
                }
                type = insertNewCircuitDetails.Type;
                delete insertNewCircuitDetails.Type;
                for (var j in insertNewCircuitDetails.CircuitID) {
                    if (dupCID.indexOf(insertNewCircuitDetails.CircuitID[j].toLowerCase()) === -1) {
                        if (!insertNewCircuitDetails.CircuitID[j]) {
                            emptyCount = emptyCount + 1;
                            dupCIDFinal.push(j + " - " + "CircuitID is Null/Empty !!");
                            resultErrors.push({ SerialNumber: "NULL", Status: 'Fail', Comment: j + " - " + "CircuitID is Null/Empty !!" });
                        } else {

                            /* 
                            Multiple If-Else statements to Validate Data and
                            return a customised message on validation failure
                            */
                            var doc = {};
                            for (var key in insertNewCircuitDetails) {
                                if (checkMandatoryValidation(key, insertNewCircuitDetails[key][j])) {
                                    if (checkMinimumLengthValidation(key, insertNewCircuitDetails[key][j]) &&
                                        checkMaximumLengthValidation(key, insertNewCircuitDetails[key][j])) {
                                        if (checkTypeValidation(key, insertNewCircuitDetails[key][j])) {
                                            if (checkPatternValidation(key, insertNewCircuitDetails[key][j])) {
                                                doc[key] = insertNewCircuitDetails[key][j];
                                            } else {
                                                dupCIDFinal.push(insertNewCircuitDetails[key][j] + " - " + key + " pattern doesn't Matches!!");
                                                resultErrors.push({ SerialNumber: insertNewCircuitDetails['CircuitID'][j], Status: 'Fail', Comment: insertNewCircuitDetails[key][j] + " - " + key + " pattern doesn't Matches!!" });
                                            }
                                        } else {
                                            dupCIDFinal.push(insertNewCircuitDetails[key][j] + " - " + key + " Type is Wrong!!");
                                            resultErrors.push({ SerialNumber: insertNewCircuitDetails['CircuitID'][j], Status: 'Fail', Comment: insertNewCircuitDetails[key][j] + " - " + key + " Type is Wrong!!" });
                                        }
                                    } else {
                                        dupCIDFinal.push(insertNewCircuitDetails[key][j] + " - " + key + " length is Wrong!!");
                                        resultErrors.push({ SerialNumber: insertNewCircuitDetails['CircuitID'][j], Status: 'Fail', Comment: insertNewCircuitDetails[key][j] + " - " + key + " length is Wrong!!" });
                                    }
                                } else {
                                    dupCIDFinal.push(insertNewCircuitDetails[key][j] + " - " + key + " Field is Required!!");
                                    resultErrors.push({ SerialNumber: insertNewCircuitDetails['CircuitID'][j], Status: 'Fail', Comment: insertNewCircuitDetails[key][j] + " - " + key + " Field is Required!!" });
                                }
                            }
                            if (Object.keys(insertNewCircuitDetails).length === Object.keys(doc).length) {
                                CID.push(doc);
                            }
                        }
                    }
                }

                if (CID.length > 0) {
                    if (CID.length > 500) {
                        callback("Total number of records should not be more than 500", null);
                    } else {
                        async.each(CID,
                            function (CId, callbackEach) {
                                resultErrors.push({ SerialNumber: CId.CircuitID, Status: 'Pass', Comment: "DTC Details Successfully Added!" });
                                nextID.getValueForNextSequenceItem("item_id", "Circuit", function (err, nextId) {
                                    insertDocs = {
                                        "CircuitNumber": nextId,
                                        "CircuitID": CId.CircuitID,
                                        "KVARating": CId.KVARating,
                                        "SubstationID": CId.SubstationID,
                                        "SubstationName": CId.SubstationName,
                                        "Address": CId.Address,
                                        "Country": CId.Country,
                                        "State": CId.State,
                                        "City": CId.City,
                                        "ZipCode": CId.ZipCode,
                                        "Latitude": parseFloat(CId.Latitude),
                                        "Longitude": parseFloat(CId.Longitude),
                                        "Status": '', "NoOfTransformerAllocated": 0,
                                        "CreatedOn": new Date()
                                    }
                                    collectionName.insert(insertDocs, function (err, result) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callbackEach);
                                            callbackEach(err)
                                        }
                                        else {
                                            //continue the loop
                                            callbackEach()
                                        }
                                    });

                                })

                            }, function (err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, "DTC Details Successfully Added!", dupCIDFinal, resultErrors);
                                }
                            });
                    }
                }
                else {
                    if (type == "Add") {
                        callback(null, "Failed to Add: Duplicate/Incorrect DTC Details!", dupCIDFinal, resultErrors);
                    } else
                        callback(null, "Failed to Upload: Duplicate/Incorrect file!", dupCIDFinal, resultErrors);
                }
            }
        })
    } catch (e) {
        callback("Something went wrong :" + e.name + " " + e.message, null)
    }
};


/**
* @description - For the Webservice - NewMeterEntry
* @params collectionName, jobsCollection, insertNewMeterDetails, callback
* @return callback function
*/
function createNewMeterEntryFromMongoDB(collectionName, jobsCollection, insertNewMeterDetails, callback) {
    try {
        var MID = [];
        var dupID = [];
        var dupMID = [];
        var dupMIDFinal = [];
        var emptyCount = 0;
        var resultErrors = [];
        let type;
        let dubConsumerNumber = [];

        getdupMeterMACID(collectionName, function (err, dupMACID) {
            if (err) {
                callback(err, null, null);

            } else {
                var condition = insertNewMeterDetails.MeterConsumerNumber.map(function (e) { return new RegExp("^" + e + "$", "i"); });
                collectionName.find({ "Meters_Billing.MeterConsumerNumber": { "$in": condition } }, { "Meters_Billing.MeterConsumerNumber": 1, "_id": 0 }).toArray(function (err, dupConsumerNumber) {
                    if (err)
                        callback(err, null, null);
                    else {
                        if (dupConsumerNumber.length > 0) {
                            for (var i in dupConsumerNumber) {
                                if (dupConsumerNumber.hasOwnProperty(i)) {
                                    let Meters_Billing = dupConsumerNumber[i].Meters_Billing;
                                    dubConsumerNumber.push(Meters_Billing.MeterConsumerNumber.toLowerCase());
                                }
                            }
                        }
                        var regex = insertNewMeterDetails.MeterSerialNumber.map(function (e) { return new RegExp("^" + e + "$", "i"); });
                        collectionName.find({ MeterSerialNumber: { "$in": regex } }, { "MeterSerialNumber": 1, "_id": 0 }).toArray(function (err, dupMeterID) {
                            if (err)
                                callback(err, null, null);
                            else {
                                if (dupMeterID.length > 0) {
                                    for (var i in dupMeterID) {
                                        if (dupMeterID.hasOwnProperty(i)) {
                                            dupMID.push(dupMeterID[i].MeterSerialNumber.toLowerCase());
                                            //dupMIDFinal.push(dupMeterID[i].MeterSerialNumber + " - " + " Duplicate Meter!");
                                            dupMIDFinal.push("MeterSerialNumber: " + dupMeterID[i].MeterSerialNumber + " - " + " Duplicate Meter!");
                                            resultErrors.push({ SerialNumber: dupMeterID[i].MeterSerialNumber, Status: 'Fail', Comment: "Duplicate Meter!" });
                                        }
                                    }
                                }
                                for (var j in insertNewMeterDetails.MeterSerialNumber) {
                                    if (dupMID.indexOf(insertNewMeterDetails.MeterSerialNumber[j].toLowerCase()) === -1) {
                                        // Checking for null rows in CSV upload file
                                        if ((insertNewMeterDetails.MeterSerialNumber[j] === "") || (insertNewMeterDetails.MeterSerialNumber[j] === null) ||
                                            (insertNewMeterDetails.MeterSerialNumber[j] === '') || (insertNewMeterDetails.MeterSerialNumber[j] === undefined)) {
                                            emptyCount = emptyCount + 1;
                                            dupMIDFinal.push(j + " - " + "Meter Serial Number is Null/Empty !!");
                                            resultErrors.push({ SerialNumber: "NULL", Status: 'Fail', Comment: `${j} Meter Serial Number is Null/Empty !!` });
                                        } else if (dupMACID.includes(insertNewMeterDetails.MeterWiFiMacID[j].toLowerCase())) {
                                            emptyCount = emptyCount + 1;
                                            dupMIDFinal.push(insertNewMeterDetails.MeterWiFiMacID[j] + " Mac ID already in use!!");
                                            resultErrors.push({ SerialNumber: insertNewMeterDetails.MeterSerialNumber[j], Status: 'Fail', Comment: `${insertNewMeterDetails.MeterWiFiMacID[j]} Mac ID already in use!!` });
                                        } else if (dubConsumerNumber.includes(insertNewMeterDetails.MeterConsumerNumber[j].toLowerCase())) {
                                            emptyCount = emptyCount + 1;
                                            dupMIDFinal.push(insertNewMeterDetails.MeterConsumerNumber[j] + " Meter Consumer Number already in use!!");
                                            resultErrors.push({ SerialNumber: insertNewMeterDetails.MeterSerialNumber[j], Status: 'Fail', Comment: insertNewMeterDetails.MeterConsumerNumber[j] + " Meter Consumer Number already in use!!" });
                                        } else if (insertNewMeterDetails.MeterVersion[j] > 255 && insertNewMeterDetails.MeterVersion[j] > "255.255") {
                                            emptyCount = emptyCount + 1;
                                            dupMIDFinal.push(insertNewMeterDetails.MeterVersion[j] + " - " + "Meter Version should be less than or equal to  255.255 !!");
                                            resultErrors.push({ SerialNumber: insertNewMeterDetails.MeterSerialNumber[j], Status: 'Fail', Comment: `${insertNewMeterDetails.MeterVersion[j]} Meter Version should be less than or equal to  255.255 !!` });
                                        }
                                        else {
                                            /* 
                                            Multiple If-Else statements to Validate Data and
                                            return a customised message on validation failure
                                            */
                                            type = insertNewMeterDetails.Type;
                                            delete insertNewMeterDetails.Type;
                                            var doc = {};
                                            for (var key in insertNewMeterDetails) {
                                                if (checkMandatoryValidation(key, insertNewMeterDetails[key][j])) {
                                                    if (checkMinimumLengthValidation(key, insertNewMeterDetails[key][j]) &&
                                                        checkMaximumLengthValidation(key, insertNewMeterDetails[key][j])) {
                                                        if (checkTypeValidation(key, insertNewMeterDetails[key][j])) {
                                                            if (checkPatternValidation(key, insertNewMeterDetails[key][j])) {
                                                                if (checkValueMatches(key, insertNewMeterDetails[key][j])) {
                                                                    if (checkMaxValueValidation(key, insertNewMeterDetails[key][j], j, insertNewMeterDetails)) {
                                                                        if (checkMinValueValidation(key, insertNewMeterDetails[key][j], j, insertNewMeterDetails)) {
                                                                            doc[key] = insertNewMeterDetails[key][j];
                                                                            //dupMIDFinal.push({SerialNumber : insertNewMeterDetails['MeterSerialNumber'][j], Status : 'Pass', Comment : "Successfully uploaded"});
                                                                        } else {
                                                                            dupMIDFinal.push(insertNewMeterDetails[key][j] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!");
                                                                            resultErrors.push({ SerialNumber: insertNewMeterDetails['MeterSerialNumber'][j], Status: 'Fail', Comment: insertNewMeterDetails[key][j] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!" });
                                                                        }
                                                                    } else {
                                                                        dupMIDFinal.push(insertNewMeterDetails[key][j] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!");
                                                                        resultErrors.push({ SerialNumber: insertNewMeterDetails['MeterSerialNumber'][j], Status: 'Fail', Comment: insertNewMeterDetails[key][j] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!" });
                                                                    }
                                                                } else {
                                                                    dupMIDFinal.push(insertNewMeterDetails[key][j] + " - " + key + " Incorrect Value !!");
                                                                    resultErrors.push({ SerialNumber: insertNewMeterDetails['MeterSerialNumber'][j], Status: 'Fail', Comment: insertNewMeterDetails[key][j] + " - " + key + " Incorrect Value !!" });
                                                                }
                                                            } else {
                                                                dupMIDFinal.push(insertNewMeterDetails[key][j] + " - " + key + " pattern doesn't Matches!!");
                                                                resultErrors.push({ SerialNumber: insertNewMeterDetails['MeterSerialNumber'][j], Status: 'Fail', Comment: insertNewMeterDetails[key][j] + " - " + key + " pattern doesn't Matches!!" });
                                                            }
                                                        } else {
                                                            dupMIDFinal.push(insertNewMeterDetails[key][j] + " - " + key + " Type is Wrong!!");
                                                            resultErrors.push({ SerialNumber: insertNewMeterDetails['MeterSerialNumber'][j], Status: 'Fail', Comment: insertNewMeterDetails[key][j] + " - " + key + " Type is Wrong!!" });
                                                        }
                                                    } else {
                                                        dupMIDFinal.push(insertNewMeterDetails[key][j] + " - " + key + " length is Wrong!!");
                                                        resultErrors.push({ SerialNumber: insertNewMeterDetails['MeterSerialNumber'][j], Status: 'Fail', Comment: insertNewMeterDetails[key][j] + " - " + key + " length is Wrong!!" });

                                                    }
                                                } else {
                                                    dupMIDFinal.push(insertNewMeterDetails[key][j] + " - " + key + " Field is Required!!");
                                                    resultErrors.push({ SerialNumber: insertNewMeterDetails['MeterSerialNumber'][j], Status: 'Fail', Comment: insertNewMeterDetails[key][j] + " - " + key + " Field is Required!!" });
                                                }
                                            }
                                            if (Object.keys(insertNewMeterDetails).length === Object.keys(doc).length) {
                                                MID.push(doc);
                                            }
                                        }

                                    }
                                }
                                //Case I: All Duplicate/Incorrect Entries
                                if (MID.length === 0) {
                                    if (type === "Add") {
                                        callback(null, "Failed to Add: Duplicate/Incorrect Meter Details!", dupMIDFinal, resultErrors);
                                    } else
                                        callback(null, "Failed to Upload: Duplicate/Incorrect file!", dupMIDFinal, resultErrors);
                                } else {
                                    dbCon.getDb(function (err, db) {
                                        if (err)
                                            callback(err, null, null);
                                        else {
                                            var CName = db.delta_Meters;
                                            var configCollection = db.delta_Config;
                                            var transformerCollection = db.delta_Transformer;
                                            //Case II : With New Entries
                                            if (MID.length > 0) {
                                                insertMeter(MID, dupMID, CName, jobsCollection, transformerCollection, configCollection, dupMIDFinal, resultErrors, callback);
                                            }
                                        }
                                    });
                                }
                            }
                        })
                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};
/**
* @description - insert meter
* @params MID, dupMID, collectionName, jobsCollection, dupMIDFinal, callback 
* @return callback function
*/
function insertMeter(MID, dupMID, collectionName, jobsCollection, transformerCollection, configCollection, dupMIDFinal, resultErrors, callback) {
    try {
        var JobToInsert = [];
        var ConfigToInsert = [];
        let insertDocs;
        //const uniqueTransformerID = [...new Set(MID.map(item => item.GroupTransformerID))];
        const uniqueTransformerID = [];
        if (MID.length > 500) {
            callback("Total number of records should not be more than 500", null);
        } else {
            async.each(MID,
                function (mid, callbackEach) {
                    let TID;
                    var jobDoc = {
                        "JobID": shortid.generate(),
                        "DeviceID": "NA",
                        "SerialNumber": mid.MeterSerialNumber,
                        "DeviceType": "Meter",
                        "JobName": "Registration Job",
                        "JobType": "Meter Registration",
                        "Status": "Pending",
                        "Group": "NA",
                        "CreatedDateTimestamp": new Date()
                    }
                    JobToInsert.push(jobDoc);
                    transformerCollection.find({ TransformerSerialNumber: { $regex: new RegExp("^" + mid.GroupTransformerSerialNo + "$", "i") } }).toArray(function (err, transformerDetails) {
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

                        var id = "item_id";
                        nextID.getValueForNextSequenceItem(id, "Meter", function (err, nextId) {
                            var configdoc = CreateConfigMeter(mid, nextId);
                            ConfigToInsert.push(configdoc);
                            insertDocs = {
                                "MeterID": nextId, "MeterSerialNumber": mid.MeterSerialNumber,
                                "ConfigID": 2, "AppIDs": [], "ConfigStatus": 'M',
                                "TransformerID": TID, "Status": 'NotRegistered',
                                "HypersproutID": TID,
                                "ConnDisconnStatus": 'Connected', "device_lock": 0,
                                "SealID": mid.SealID, "BiDirectional": mid.BiDirectional,
                                "EVMeter": mid.EVMeter, "SolarPanel": mid.SolarPanel,
                                "CreatedOn": new Date(), "RegistrationJobID": jobDoc.JobID,
                                "Meters_Billing": {
                                    "BillingDate": mid.MeterBillingCycleDate,
                                    "BillingTime": mid.MeterBillingTime,
                                    "MeterConsumerNumber": mid.MeterConsumerNumber,
                                    "MeterConsumerName": mid.MeterConsumerName,
                                    "MeterConsumerAddress": mid.MeterConsumerAddress,
                                    "MeterConsumerContactNumber": mid.MeterConsumerContactNumber,
                                    "MeterDemandResetDate": mid.MeterDemandResetDate,
                                    "ImpulseCountperKWh": mid.ImpulseCountKWh,
                                    "ImpulseCountPerKVARh": mid.ImpulseCountKVARh,
                                    "MeterConsumerCountry": mid.MeterConsumerCountry,
                                    "MeterConsumerState": mid.MeterConsumerState,
                                    "MeterConsumerCity": mid.MeterConsumerCity,
                                    "MeterConsumerZipCode": mid.MeterConsumerZipCode
                                },
                                "Meters_Communications": {
                                    "MeterAdminPassword": mid.MeterAdminPassword,
                                    "Latitude": parseFloat(mid.MeterLatitude), "Longitude": parseFloat(mid.MeterLongitude),
                                    "IP_address_WiFi": mid.MeterWiFiIpAddress, "MAC_ID_WiFi": mid.MeterWiFiMacID,
                                    "AccessPointPassword": mid.MeterWiFiAccessPointPassword
                                },
                                "Meters_DeviceDetails": {
                                    "MeterApptype": mid.MeterApptype,
                                    "MeterVersion": mid.MeterVersion,
                                    "MeterInstallationLocation": mid.MeterInstallationLocation,
                                    "CT_Ratio": mid.MeterCTRatio, "PT_Ratio": mid.MeterPTRatio, "Phase": mid.MeterNumberOfPhases,
                                    "Frequency": mid.MeterRatedFrequency, "RatedVoltage": mid.MeterRatedVoltage,
                                    "MeterNominalCurrent": mid.MeterNominalCurrent, "MeterMaximumCurrent": mid.MeterMaximumCurrent,
                                    "MeterAccuracy": mid.MeterAccuracy, "MeterCompliantToStandards": mid.MeterCompliantToStandards,
                                    "MeterMake": mid.MeterMake, "MeterDisconnector": mid.MeterDisconnector
                                }
                            }

                            collectionName.insertOne(insertDocs, function (err, result) {
                                if (err) {
                                    insertError.putErrorDetails(err, callbackEach);
                                    callbackEach(err)
                                }
                                else {
                                    if (TID == null && mid.GroupTransformerSerialNo != "" && mid.GroupTransformerSerialNo)
                                        resultErrors.push({ SerialNumber: mid.MeterSerialNumber, Status: 'Pass', Comment: "Meter Details Successfully Added But Meter Not Grouped Due To Transformer not registered or Invalid Transformer SerialNumber: " + mid.GroupTransformerSerialNo });
                                    else
                                        resultErrors.push({ SerialNumber: mid.MeterSerialNumber, Status: 'Pass', Comment: "Meter Details Successfully Added!" });
                                    //Continue the loop
                                    callbackEach()

                                }
                            });
                        })
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        async.each(uniqueTransformerID,
                            function (transformerID, callbackcideach) {
                                collectionName.find({ TransformerID: transformerID }).count(function (err, noOfMeterAllocated) {
                                    transformerCollection.updateOne({ "TransformerID": transformerID }, { $set: { NoOfMeterAllocated: noOfMeterAllocated } });
                                    callbackcideach();
                                });
                            }),
                            jobsCollection.insertMany(JobToInsert, function (err, success) {
                                if (err)
                                    callback(err, null, null, null);
                                else {
                                    //callback(null, "Meter Details Successfully Added!", dupMIDFinal, resultErrors);
                                    configCollection.insertMany(ConfigToInsert, function (err, success) {
                                        if (err)
                                            callback(err, null, null);
                                        else
                                            callback(null, "Meter Details Successfully Added!", dupMIDFinal, resultErrors);
                                    });
                                }
                            });
                    }
                });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

function CreateConfigMeter(mid, nextId) {
    var configdoc = {
        "MeterID": nextId, "TransformerID": 'null', "MeterSerialNumber": mid.MeterSerialNumber, "DeviceType": "meter",
        "System_Info": {
            "country": "INDIA", "timezone": "Asia/Kolkata - GMT+5:30", "current_fw": "",
            "backup_fw": "", "wifi0_antenna": "", "wifi0_mode": "", "wifi_mac_2": mid.MeterWiFiMacID,
            "wifi_mac_5": "", "wifi0_freq": mid.MeterRatedFrequency, "Status": "", "Manufacturer_serial_number": mid.MeterSerialNumber,
            "Manufacturer_model": "", "Firmware_version": "", "up_time": "",
            "Hardware_version": "", "Device_type": mid.MeterMake,
            "Phase_type": mid.MeterNumberOfPhases, "Standard_type": ""
        },
        "FrontHaul": {
            "Radio_Configuration": {
                "radio_mode": "11ng", "radio_band": "2.4 GHz", "chan_bw": "20MHz", "channel": 11, "txpower": 17, "stream_selection": "1x1"
            },
            "Mesh_Configuration": {
                "Primary": {
                    "meshID": "",
                    "securityType": "Open",
                    "PSK": "",
                    "Mac": "",
                    "DeviceType": "",
                    "SerialNumber": ""
                },
                "Secondary": {
                    "meshID": "",
                    "securityType": "Open",
                    "PSK": "",
                    "Mac": "",
                    "DeviceType": "",
                    "SerialNumber": ""
                }
            },
            "Hotspot_Configuration": {
                "ssid": "MeshCard" + mid.MeterWiFiMacID, "security": "WPA2-PSK", "password": mid.MeterWiFiMacID
            },
            "DHCP": {
                "Status": 1, "Mode": 1, "StartIpAddr": "192.168.30.100",
                "EndIpAddr": "192.168.30.200", "Gateway": "192.168.30.1",
                "Subnet": "255.255.255.0", "PrimaryDNS": "8.8.8.8",
                "SecondaryDNS": "1.0.0.1"
            }
        },
        "Meter_Configuration": {
            "uti_ID": "1", "cir_ID": "1", "cer_num": "1", "esn": "1"
        },
        "Alarm": {
            "VoltageSagLine1": true,
            "VoltageSagLine2": true,
            "VoltageSagLine3": true,
            "VoltageSwellLine1": true,
            "VoltageSwellLine2": true,
            "VoltageSwellLine3": true,
            "VoltageUnbalance": true,
            "VoltageCablelossLine1": true,
            "VoltageCablelossLine2": true,
            "VoltageCablelossLine3": true,
            "VoltageTHDOverLimitLine1": true,
            "VoltageTHDOverLimitLine2": true,
            "VoltageTHDOverLimitLine3": true,
            "CurrentTHDOverLimitLine1": true,
            "CurrentTHDOverLimitLine2": true,
            "CurrentTHDOverLimitLine3": true,
            "PrimaryPowerUp": true,
            "PrimaryPowerDown": true,
            "LongOutagedetection": true,
            "ShortOutagedetection": true,
            "NonvolatileMemoryFailed": true,
            "Clockerrordetected": true,
            "LowBatteryVoltage": true,
            "FlashMemoryFailed": true,
            "Firmwareupgraded": true,
            "Demandreset": true,
            "TimeSynchronized": true,
            "Historylogcleared": true,
            "Coverremoval": true,
            "Terminalcoverremoval": true,
            "MeterDisconnected": true,
            "MeterConnected": true,
            "DemandresponseofimportactpwrkWplus": true,
            "DemandresponseofexportactpwrkWminus": true,
            "DemandresponseofimportreactpwrkVarplus": true,
            "DemandresponseofexportreactpwrkVarminus": true
        },
        "System_Settings": {
            "Status": 1, "sysname": "MESHCARD", "country": "INDIA", "timezone": "Asia/Kolkata - GMT+5:30", "bandwidth": 33
        },
        "Bandwidth_Details": {
            "Bandwidth": 0, "DownloadBandwidth": 1, "UploadBandwidth": 1
        },
        "config_UpdateTime": parseInt(Date.now() / 1000)
    }
    return configdoc;
}

function getdupMACID(collectionName, callback) {
    var dupMACID = [];

    collectionName.find({}).toArray(function (err, dupHubID) {
        if (err) {
            callback(err, null, null);
        }
        else {
            if (dupHubID.length > 0) {
                for (var i in dupHubID) {
                    if (dupHubID.hasOwnProperty(i)) {
                        dupMACID.push(dupHubID[i].Hypersprout_Communications.MAC_ID_GPRS.toLowerCase());
                        dupMACID.push(dupHubID[i].Hypersprout_Communications.MAC_ID_WiFi.toLowerCase());

                    }
                }
            }
            callback(null, dupMACID)
        }
    })

}

function getdupMeterMACID(collectionName, callback) {
    try {
        var dupMACID = [];
        collectionName.find({}).toArray(function (err, MeterDetails) {
            if (err) {
                callback(err, null, null);
            }
            else {
                if (MeterDetails.length > 0) {
                    for (var i in MeterDetails) {
                        if (MeterDetails.hasOwnProperty(i)) {
                            dupMACID.push(MeterDetails[i].Meters_Communications.MAC_ID_WiFi.toLowerCase())
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
* @description -  Webservice - NewTransformerHypersproutEntry
* @params collectionName, collectionName1, jobsCollection, insertNewTransformerHypersproutDetails, callback
* @return callback function
*/
function createNewTransformerHypersproutEntryFromMongoDB(collectionName, collectionName1, jobsCollection, configCollection, insertNewTransformerHypersproutDetails, sessionID, toMob, flowType, callback) {
    try {
        var THID = [];
        var dupID = [];
        var dupHID = [];
        var dupTID = [];
        var dupHSID = [];
        var errorFinal = [];
        var emptyCount = 0;
        var dupGprsMacID = [];
        var dupWifiMacID = [];
        var resultErrors = [];
        let type;
        let temp;
        if(insertNewTransformerHypersproutDetails.Type == "Upload") {
            session.findUser(sessionID, function (err, result) {
                if (err) {
                    errorFinal.push(err);
                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: err });
                } else {
                    dbUsr.getUserDetails(result, function (err, user, securitygrp, sysSettings) {
                        if (err) {
                            errorFinal.push(err);
                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: err });
                        }
                        else {
                            temp = (user.Temprature == "Celsius") ? 'C' : 'F';
                        }
                    });
                }
            });
        }
        for (var i in insertNewTransformerHypersproutDetails.HSGPRSMacID) {
            dupGprsMacID[i] = insertNewTransformerHypersproutDetails.HSGPRSMacID[i];
        }
        for (var i in insertNewTransformerHypersproutDetails.HSWiFiMacID) {
            dupWifiMacID[i] = insertNewTransformerHypersproutDetails.HSWiFiMacID[i];
        }

        for (var i in insertNewTransformerHypersproutDetails.TFMRSerialNumber) {
            dupID[i] = insertNewTransformerHypersproutDetails.TFMRSerialNumber[i];
        }
        for (var j in insertNewTransformerHypersproutDetails.HypersproutSerialNumber) {
            dupHID[j] = insertNewTransformerHypersproutDetails.HypersproutSerialNumber[j];
        }
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Hypersprouts;
                var CName1 = db.delta_Transformer;
                var CName2 = db.delta_Circuit;
                getdupMACID(CName, function (err, dupMACID) {
                    if (err) {
                        callback(err, null, null);

                    } else {
                        var regex = dupID.map(function (e) { return new RegExp("^" + e + "$", "i"); });
                        collectionName1.find({ TransformerSerialNumber: { "$in": regex } }, { "TransformerSerialNumber": 1, "_id": 0 }).toArray(function (err, dupTransformerID) {
                            if (err)
                                callback(err, null, null);
                            else {
                                if (dupTransformerID.length === 0) {
                                    var regex = dupHID.map(function (e) { return new RegExp("^" + e + "$", "i"); });
                                    collectionName.find({ HypersproutSerialNumber: { "$in": regex } }, { "HypersproutSerialNumber": 1, "_id": 0 }).toArray(function (err, dupHypersproutID) {
                                        if (err)
                                            callback(err, null, null);
                                        else {
                                            if (dupHypersproutID.length === 0) {

                                                let tempRange = {
                                                    C: {
                                                        max: 300.00,
                                                        min: 30.00
                                                    },
                                                    F: {
                                                        max: 572.00,
                                                        min: 86.00
                                                    }
                                                }

                                                for (var i in insertNewTransformerHypersproutDetails.TFMRSerialNumber) {
                                                    if ((insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === "") || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === '') ||
                                                        (insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === null) || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === undefined) ||
                                                        (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === "") || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === '') ||
                                                        (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === null) || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === undefined)) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(i + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!");
                                                        resultErrors.push({ SerialNumber: "NULL", Status: "Fail", Comment: i + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!" });
                                                    } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSGPRSMacID[i].toLowerCase())) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(insertNewTransformerHypersproutDetails.HSGPRSMacID[i] + " Mac ID already in use!!");
                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSGPRSMacID[i] + " Mac ID already in use!!" });
                                                    } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSWiFiMacID[i].toLowerCase())) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(insertNewTransformerHypersproutDetails.HSWiFiMacID[i] + " Mac ID already in use!!");
                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSWiFiMacID[i] + " Mac ID already in use!!" });
                                                    } else if ((insertNewTransformerHypersproutDetails.HypersproutVersion[i]) > 255 && (insertNewTransformerHypersproutDetails.HypersproutVersion[i]) > 255.255) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(insertNewTransformerHypersproutDetails.HypersproutVersion[i] + " Hypersprout Version should be less than or equal to  255.255 !!");
                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HypersproutVersion[i] + " Hypersprout Version should be less than or equal to  255.255 !!" });
                                                    } else {
                                                        /* 
                                                        Multiple If-Else statements to Validate Data and
                                                        return a customised message on validation failure
                                                        */
                                                        type = insertNewTransformerHypersproutDetails.Type;

                                                        if (type == 'Upload') {
                                                            if (((insertNewTransformerHypersproutDetails.MaxOilTemp[i]) > tempRange[temp].max || (insertNewTransformerHypersproutDetails.MaxOilTemp[i]) > tempRange[temp].max)) {
                                                                emptyCount = emptyCount + 1;
                                                                errorFinal.push(`${insertNewTransformerHypersproutDetails.MaxOilTemp[i]} MaxOilTemp should be less than or equal to ${tempRange[temp].max} !!`);
                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: `${insertNewTransformerHypersproutDetails.MaxOilTemp[i]} MaxOilTemp should be less than or equal  to  ${tempRange[temp].max} !! !!` });
                                                            } else if (((insertNewTransformerHypersproutDetails.MaxOilTemp[i]) < tempRange[temp].min || insertNewTransformerHypersproutDetails.MaxOilTemp[i] < tempRange[temp].min)) {
                                                                emptyCount = emptyCount + 1;
                                                                errorFinal.push(`${insertNewTransformerHypersproutDetails.MaxOilTemp[i]} MaxOilTemp should be greater than or equal to  ${tempRange[temp].min} !!`);
                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: `${insertNewTransformerHypersproutDetails.MaxOilTemp[i]} MaxOilTemp should be greater than or equal to ${tempRange[temp].min} !! !!` });
                                                            } else if (((insertNewTransformerHypersproutDetails.MinOilTemp[i]) > tempRange[temp].max || (insertNewTransformerHypersproutDetails.MinOilTemp[i]) > tempRange[temp].max)) {
                                                                emptyCount = emptyCount + 1;
                                                                errorFinal.push(`${insertNewTransformerHypersproutDetails.MaxOilTemp[i]} MaxOilTemp should be less than or equal to  ${tempRange[temp].max} !!`);
                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: `${insertNewTransformerHypersproutDetails.MinOilTemp[i]} MinOilTemp should be less than or equal  to  ${tempRange[temp].max} !!` });
                                                            } else if (((insertNewTransformerHypersproutDetails.MinOilTemp[i]) < tempRange[temp].min || insertNewTransformerHypersproutDetails.MinOilTemp[i] < tempRange[temp].min)) {
                                                                emptyCount = emptyCount + 1;
                                                                errorFinal.push(`${insertNewTransformerHypersproutDetails.MinOilTemp[i]} MinOilTemp should be greater than or equal to  ${tempRange[temp].min} !!`);
                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: `${insertNewTransformerHypersproutDetails.MinOilTemp[i]} MinOilTemp should be greater than or equal to ${tempRange[temp].min} !!` });
                                                            }
                                                        }

                                                        delete insertNewTransformerHypersproutDetails.Type;
                                                        var doc = {};
                                                        for (var key in insertNewTransformerHypersproutDetails) {
                                                            if (checkMandatoryValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                if (checkMinimumLengthValidation(key, insertNewTransformerHypersproutDetails[key][i]) &&
                                                                    checkMaximumLengthValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                    if (checkTypeValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                        if (checkPatternValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                            if (checkValueMatches(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                                if (checkMaxValueValidation(key, insertNewTransformerHypersproutDetails[key][i], i, insertNewTransformerHypersproutDetails)) {
                                                                                    if (checkMinValueValidation(key, insertNewTransformerHypersproutDetails[key][i], i, insertNewTransformerHypersproutDetails)) {

                                                                                        if (key == "HSCoils") {

                                                                                            if (checkCoilValidation(insertNewTransformerHypersproutDetails[key], parseInt(insertNewTransformerHypersproutDetails["HSNumberOfPhases"][0]))) {

                                                                                                doc[key] = insertNewTransformerHypersproutDetails[key];
                                                                                            }
                                                                                            else {

                                                                                                errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!");
                                                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " length mismatch" });

                                                                                            }
                                                                                        } else {
                                                                                            doc[key] = insertNewTransformerHypersproutDetails[key][i];
                                                                                        }
                                                                                    } else {
                                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!");
                                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!" });
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!");
                                                                                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!" });
                                                                                }
                                                                            } else {
                                                                                errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Incorrect Value !!");
                                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Incorrect Value !!" });
                                                                            }
                                                                        } else {
                                                                            errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " pattern doesn't Matches!!");
                                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " pattern doesn't Matches!!" });
                                                                        }
                                                                    } else {
                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Type is Wrong!!");
                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Type is Wrong!!" });
                                                                    }
                                                                } else {
                                                                    errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " length is Wrong!!");
                                                                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " length is Wrong!!" });
                                                                }
                                                            } else {
                                                                errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Field is Required!!");
                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails['TFMRSerialNumber'][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Field is Required!!" });
                                                            }
                                                        }
                                                        if (Object.keys(insertNewTransformerHypersproutDetails).length === Object.keys(doc).length) {
                                                            THID.push(doc);
                                                        }

                                                    }
                                                }
                                                if ((THID.length > 0) && (dupTID.length === 0) && (dupHSID.length === 0) && (errorFinal.length === 0)) {
                                                    // insertTransformerHypersprout(THID, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, callback);  

                                                    //check if hypersprout is registered, if not register hypersprout on IOT
                        
                                                    if(flowType == 0) {
                                                        checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                            // 1) Insert command for all new details with no duplicates
                                                              
                                                            if (arrToInsert.length > 0) {
                                                                insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, toMob,flowType, callback);
                                                            }
                                                            else {
                                                                callback(null, "unable to register on IOT", errorFinal, resultErrors)
                                                            }
                                                        });
                                                    } else if(flowType == 1) {
                                                        insertTransformerHypersprout(THID, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, toMob, flowType, callback);    
                                                    }
                                                } else {
                                                    //Case II : THID,TID & HSID = 0
                                                    callback(null, "Failed to Upload: Duplicate/Incorrect file!", errorFinal, resultErrors);
                                                }
                                            } 
                                            else {
                                                for (var k in dupHypersproutID) {
                                                    if (dupHypersproutID.hasOwnProperty(k)) {
                                                        dupHSID.push(dupHypersproutID[k].HypersproutSerialNumber.toLowerCase());
                                                        errorFinal.push(dupHypersproutID[k].HypersproutSerialNumber + " - " + " Duplicate Hypersprout!");
                                                        resultErrors.push({ SerialNumber: dupHypersproutID[k].HypersproutSerialNumber, Status: "Fail", Comment: dupHypersproutID[k].HypersproutSerialNumber + " - " + " Duplicate Hypersprout!" });
                                                    }
                                                }
                                                for (var l in insertNewTransformerHypersproutDetails.TFMRSerialNumber) {
                                                    if ((insertNewTransformerHypersproutDetails.TFMRSerialNumber[l] === "") || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[l] === '') ||
                                                        (insertNewTransformerHypersproutDetails.TFMRSerialNumber[l] === null) || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[l] === undefined) ||
                                                        (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[l] === "") || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[l] === '') ||
                                                        (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[l] === null) || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[l] === undefined)) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(l + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!");
                                                        resultErrors.push({ SerialNumber: "NULL", Status: "Fail", Comment: l + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!" });
                                                    } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSGPRSMacID[l].toLowerCase())) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(insertNewTransformerHypersproutDetails.HSGPRSMacID[l] + " Mac ID already in use!!");
                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSGPRSMacID[l] + " Mac ID already in use!!" });
                                                    } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSWiFiMacID[l].toLowerCase())) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(insertNewTransformerHypersproutDetails.HSWiFiMacID[l] + " Mac ID already in use!!");
                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSWiFiMacID[l] + " Mac ID already in use!!" });
                                                    } else {
                                                        if (dupHSID.indexOf(insertNewTransformerHypersproutDetails.HypersproutSerialNumber[l].toLowerCase()) === -1) {
                                                            /* 
                                                            Multiple If-Else statements to Validate Data and
                                                            return a customised message on validation failure
                                                            */
                                                            delete insertNewTransformerHypersproutDetails.Type;
                                                            var doc = {};
                                                            for (var key in insertNewTransformerHypersproutDetails) {
                                                                if (checkMandatoryValidation(key, insertNewTransformerHypersproutDetails[key][l])) {
                                                                    if (checkMinimumLengthValidation(key, insertNewTransformerHypersproutDetails[key][l]) &&
                                                                        checkMaximumLengthValidation(key, insertNewTransformerHypersproutDetails[key][l])) {
                                                                        if (checkTypeValidation(key, insertNewTransformerHypersproutDetails[key][l])) {
                                                                            if (checkPatternValidation(key, insertNewTransformerHypersproutDetails[key][l])) {
                                                                                if (checkValueMatches(key, insertNewTransformerHypersproutDetails[key][l])) {
                                                                                    if (checkMaxValueValidation(key, insertNewTransformerHypersproutDetails[key][l], l, insertNewTransformerHypersproutDetails)) {
                                                                                        if (checkMinValueValidation(key, insertNewTransformerHypersproutDetails[key][l], l, insertNewTransformerHypersproutDetails)) {
                                                                                            doc[key] = insertNewTransformerHypersproutDetails[key][l];
                                                                                        } else {
                                                                                            errorFinal.push(insertNewTransformerHypersproutDetails[key][l] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!");
                                                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][l] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!" });
                                                                                        }
                                                                                    } else {
                                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][l] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!");
                                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][l] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!" });
                                                                                    }
                                                                                } else {
                                                                                    errorFinal.push(insertNewTransformerHypersproutDetails[key][l] + " - " + key + " Incorrect Value !!");
                                                                                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][l] + " - " + key + " Incorrect Value !!" });
                                                                                }
                                                                            } else {
                                                                                errorFinal.push(insertNewTransformerHypersproutDetails[key][l] + " - " + key + " pattern doesn't Matches!!");
                                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][l] + " - " + key + " pattern doesn't Matches!!" });
                                                                            }
                                                                        } else {
                                                                            errorFinal.push(insertNewTransformerHypersproutDetails[key][l] + " - " + key + " Type is Wrong!!");
                                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][l] + " - " + key + " Type is Wrong!!" });
                                                                        }
                                                                    } else {
                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][l] + " - " + key + " length is Wrong!!");
                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][l] + " - " + key + " length is Wrong!!" });
                                                                    }
                                                                } else {
                                                                    errorFinal.push(insertNewTransformerHypersproutDetails[key][l] + " - " + key + " Field is Required!!");
                                                                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][l], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][l] + " - " + key + " Field is Required!!" });
                                                                }
                                                            }
                                                            if (Object.keys(insertNewTransformerHypersproutDetails).length === Object.keys(doc).length) {
                                                                THID.push(doc);
                                                            }

                                                        }
                                                    }
                                                }
                                                if ((THID.length > 0) && (dupTID.length === 0) && (dupHSID.length === 0)) {
                                                    //check if hypersprout is registered, if not register hypersprout on IOT
                                                    checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                        // 2) Insert command for all new details with dup HS
                                                        if (arrToInsert.length > 0) {
                                                            insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, callback);
                                                        }
                                                        else {
                                                            callback(null, "unable to register on IOT", errorFinal, resultErrors)
                                                        }
                                                    });

                                                } else {
                                                    //Case IV : THID =0 & TID =0 & HSID >0
                                                    for (var m in insertNewTransformerHypersproutDetails.HypersproutSerialNumber) {
                                                        if (insertNewTransformerHypersproutDetails.HypersproutSerialNumber.hasOwnProperty(m)) {
                                                            for (var n in dupHSID) {
                                                                if (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[m] === dupHSID[n]) {
                                                                    dupTID.push(insertNewTransformerHypersproutDetails.TFMRSerialNumber[m]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (type === "Add") {
                                                        callback(null, "Failed to Add: Duplicate/Incorrect Transformer Details!", errorFinal, resultErrors);
                                                    } else
                                                        callback(null, "Failed to Upload: Duplicate/Incorrect file!", errorFinal, resultErrors);
                                                }
                                            }
                                        }
                                    });
                                }
                                else {
                                    for (var i in dupTransformerID) {
                                        if (dupTransformerID.hasOwnProperty(i)) {
                                            dupTID.push(dupTransformerID[i].TransformerSerialNumber.toLowerCase());
                                            errorFinal.push(dupTransformerID[i].TransformerSerialNumber + " - " + " Duplicate Transformer!");
                                            resultErrors.push({ SerialNumber: dupTransformerID[i].TransformerSerialNumber, Status: "Fail", Comment: dupTransformerID[i].TransformerSerialNumber + " - " + " Duplicate Transformer!" });
                                        }
                                    }
                                    var regex = dupHID.map(function (e) { return new RegExp("^" + e + "$", "i"); });
                                    collectionName.find({ HypersproutSerialNumber: { "$in": regex } }, { "HypersproutSerialNumber": 1, "_id": 0, "otp": 1 }).toArray(function (err, dupHypersproutID) {
                                        if (err)
                                            callback(err, null, null);
                                        else {
                                            if (dupHypersproutID.length === 0) {
                                                for (var i in insertNewTransformerHypersproutDetails.TFMRSerialNumber) {
                                                    if ((insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === "") || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === '') ||
                                                        (insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === null) || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[i] === undefined) ||
                                                        (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === "") || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === '') ||
                                                        (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === null) || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[i] === undefined)) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(i + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!");
                                                        resultErrors.push({ SerialNumber: "NULL", Status: "Fail", Comment: i + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!" });
                                                    } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSGPRSMacID[i].toLowerCase())) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(insertNewTransformerHypersproutDetails.HSGPRSMacID[i] + " Mac ID already in use!!");
                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSGPRSMacID[i] + " Mac ID already in use!!" });
                                                    } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSWiFiMacID[i].toLowerCase())) {
                                                        emptyCount = emptyCount + 1;
                                                        errorFinal.push(insertNewTransformerHypersproutDetails.HSWiFiMacID[i] + " Mac ID already in use!!");
                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSWiFiMacID[i] + " Mac ID already in use!!" });
                                                    } else {
                                                        if (dupTID.indexOf(insertNewTransformerHypersproutDetails.TFMRSerialNumber[i].toLowerCase()) === -1) {
                                                            /* 
                                                            Multiple If-Else statements to Validate Data and
                                                            return a customised message on validation failure
                                                            */
                                                            delete insertNewTransformerHypersproutDetails.Type;
                                                            var doc = {};
                                                            for (var key in insertNewTransformerHypersproutDetails) {
                                                                if (checkMandatoryValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                    if (checkMinimumLengthValidation(key, insertNewTransformerHypersproutDetails[key][i]) &&
                                                                        checkMaximumLengthValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                        if (checkTypeValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                            if (checkPatternValidation(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                                if (checkValueMatches(key, insertNewTransformerHypersproutDetails[key][i])) {
                                                                                    if (checkMaxValueValidation(key, insertNewTransformerHypersproutDetails[key][i], i, insertNewTransformerHypersproutDetails)) {
                                                                                        if (checkMinValueValidation(key, insertNewTransformerHypersproutDetails[key][i], i, insertNewTransformerHypersproutDetails)) {
                                                                                            doc[key] = insertNewTransformerHypersproutDetails[key][i];
                                                                                        } else {
                                                                                            errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!");
                                                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!" });
                                                                                        }
                                                                                    } else {
                                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!");
                                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!" });
                                                                                    }
                                                                                } else {
                                                                                    errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Incorrect Value !!");
                                                                                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Incorrect Value !!" });
                                                                                }
                                                                            } else {
                                                                                errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " pattern doesn't Matches!!");
                                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " pattern doesn't Matches!!" });
                                                                            }
                                                                        } else {
                                                                            errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Type is Wrong!!");
                                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Type is Wrong!!" });
                                                                        }
                                                                    } else {
                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " length is Wrong!!");
                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " length is Wrong!!" });
                                                                    }
                                                                } else {
                                                                    errorFinal.push(insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Field is Required!!");
                                                                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][i], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][i] + " - " + key + " Field is Required!!" });
                                                                }
                                                            }
                                                            if (Object.keys(insertNewTransformerHypersproutDetails).length === Object.keys(doc).length) {
                                                                THID.push(doc);
                                                            }
                                                        }
                                                    }
                                                }
                                                if ((THID.length > 0) && (dupTID.length > 0) && (dupHSID.length === 0)) {
                                                    //check if hypersprout is registered, if not register hypersprout on IOT
                                                    checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                        // 3) Insert command for all new details with dup TFMR
                                                        insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, callback);
                                                    });
                                                } else if ((THID.length > 0) && (dupTID.length == 0) && (dupHSID.length > 0)) {
                                                    //check if hypersprout is registered, if not register hypersprout on IOT
                                                    checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                        // 3) Insert command for all new details with dup TFMR
                                                        insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, callback);
                                                    });
                                                } else if ((THID.length > 0) && (dupTID.length > 0) && (dupHSID.length > 0)) {
                                                    //check if hypersprout is registered, if not register hypersprout on IOT
                                                    checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                        // 3) Insert command for all new details with dup TFMR
                                                        insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, callback);
                                                    });
                                                } else {
                                                    // Case VI : THID =0 & TID >0 & HSID =0
                                                    if (type === "Add") {
                                                        callback(null, "Failed to Add: Duplicate/Incorrect Transformer Details!", errorFinal, resultErrors);
                                                    } else
                                                        callback(null, "Failed to Upload: Duplicate/Incorrect file!", errorFinal, resultErrors);
                                                }
                                            }
                                            else {
                                                if (dupHypersproutID.length > 0) {
                                                    for (var p in dupHypersproutID) {
                                                        if (dupHypersproutID.hasOwnProperty(p)) {
                                                            dupHSID.push(dupHypersproutID[p].HypersproutSerialNumber.toLowerCase());
                                                            errorFinal.push(dupHypersproutID[p].HypersproutSerialNumber + " - " + "Duplicate Hypersprout!");
                                                            resultErrors.push({ SerialNumber: dupHypersproutID[p].HypersproutSerialNumber, Status: "Fail", Comment: dupHypersproutID[p].HypersproutSerialNumber + " - " + "Duplicate Hypersprout!" });
                                                        }
                                                    }
                                                    for (var q in insertNewTransformerHypersproutDetails.TFMRSerialNumber) {
                                                        if ((insertNewTransformerHypersproutDetails.TFMRSerialNumber[q] === "") || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[q] === '') ||
                                                            (insertNewTransformerHypersproutDetails.TFMRSerialNumber[q] === null) || (insertNewTransformerHypersproutDetails.TFMRSerialNumber[q] === undefined) ||
                                                            (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[q] === "") || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[q] === '') ||
                                                            (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[q] === null) || (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[q] === undefined)) {
                                                                emptyCount = emptyCount + 1;
                                                            errorFinal.push(q + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!");
                                                            resultErrors.push({ SerialNumber: "NULL", Status: "Fail", Comment: q + " - " + "Transformer/Hypersprout Serial Number is Null/Empty !!" });
                                                        } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSGPRSMacID[q].toLowerCase() && (flowType == 0 || flowType == 1))) {
                                                            emptyCount = emptyCount + 1;
                                                            errorFinal.push(insertNewTransformerHypersproutDetails.HSGPRSMacID[q] + " Mac ID already in use!!");
                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSGPRSMacID[q] + " Mac ID already in use!!" });
                                                        } else if (dupMACID.includes(insertNewTransformerHypersproutDetails.HSWiFiMacID[q].toLowerCase()) && (flowType == 0 || flowType == 1)) {
                                                            emptyCount = emptyCount + 1;
                                                            errorFinal.push(insertNewTransformerHypersproutDetails.HSWiFiMacID[q] + " Mac ID already in use!!");
                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails.TFMRSerialNumber[q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails.HSWiFiMacID[q] + " Mac ID already in use!!" });
                                                        } else {
                                                            if (dupTID.indexOf(insertNewTransformerHypersproutDetails.TFMRSerialNumber[q].toLowerCase()) === -1 || flowType == 2 ) {
                                                                /* 
                                                                Multiple If-Else statements to Validate Data and
                                                                return a customised message on validation failure
                                                                */

                                                                delete insertNewTransformerHypersproutDetails.Type;
                                                                var doc = {};
                                                                var otp=insertNewTransformerHypersproutDetails.otp
                                                                for (var key in insertNewTransformerHypersproutDetails) {
                                                                    if (checkMandatoryValidation(key, insertNewTransformerHypersproutDetails[key][q])) {
                                                                        if (checkMinimumLengthValidation(key, insertNewTransformerHypersproutDetails[key][q]) &&
                                                                            checkMaximumLengthValidation(key, insertNewTransformerHypersproutDetails[key][q])) {
                                                                            if (checkTypeValidation(key, insertNewTransformerHypersproutDetails[key][q])) {
                                                                                if (checkPatternValidation(key, insertNewTransformerHypersproutDetails[key][q])) {
                                                                                    if (checkValueMatches(key, insertNewTransformerHypersproutDetails[key][q])) {
                                                                                        if (checkMaxValueValidation(key, insertNewTransformerHypersproutDetails[key][q], q, insertNewTransformerHypersproutDetails)) {
                                                                                            if (checkMinValueValidation(key, insertNewTransformerHypersproutDetails[key][q], q, insertNewTransformerHypersproutDetails)) {
                                                                                                doc[key] = insertNewTransformerHypersproutDetails[key][q];
                                                                                            } else {
                                                                                                errorFinal.push(insertNewTransformerHypersproutDetails[key][q] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!");
                                                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][q] + " - " + key + " is Minimum than " + objValidation[key].MinValue + "Value !!" });
                                                                                            }
                                                                                        } else {
                                                                                            errorFinal.push(insertNewTransformerHypersproutDetails[key][q] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!");
                                                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][q] + " - " + key + " is Maximum than " + objValidation[key].MaxValue + "Value !!" });
                                                                                        }
                                                                                    } else {
                                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][q] + " - " + key + " Incorrect Value !!");
                                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][q] + " - " + key + " Incorrect Value !!" });
                                                                                    }
                                                                                } else {
                                                                                    errorFinal.push(insertNewTransformerHypersproutDetails[key][q] + " - " + key + " pattern doesn't Matches!!");
                                                                                    resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][q] + " - " + key + " pattern doesn't Matches!!" });
                                                                                }
                                                                            } else {
                                                                                errorFinal.push(insertNewTransformerHypersproutDetails[key][q] + " - " + key + " Type is Wrong!!");
                                                                                resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][q] + " - " + key + " Type is Wrong!!" });
                                                                            }
                                                                        } else {
                                                                            errorFinal.push(insertNewTransformerHypersproutDetails[key][q] + " - " + key + " length is Wrong!!");
                                                                            resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][q] + " - " + key + " length is Wrong!!" });
                                                                        }
                                                                    } else {
                                                                        errorFinal.push(insertNewTransformerHypersproutDetails[key][q] + " - " + key + " Field is Required!!");
                                                                        resultErrors.push({ SerialNumber: insertNewTransformerHypersproutDetails["TFMRSerialNumber"][q], Status: "Fail", Comment: insertNewTransformerHypersproutDetails[key][q] + " - " + key + " Field is Required!!" });
                                                                    }
                                                                }
                                                                if (Object.keys(insertNewTransformerHypersproutDetails).length === Object.keys(doc).length) {
                                                                    THID.push(doc);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if ((THID.length > 0) && (dupTID.length > 0) && (dupHSID.length === 0)) {
                                                        //check if hypersprout is registered, if not register hypersprout on IOT
                                                        checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                            // 4) Insert command for all new details with both duplicate TFMR and  HS
                                                            insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, callback);
                                                        });
                                                    } else if ((THID.length > 0) && (dupTID.length == 0) && (dupHSID.length > 0)) {
                                                        //check if hypersprout is registered, if not register hypersprout on IOT
                                                        checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                            // 3) Insert command for all new details with dup TFMR
                                                            insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors, callback);
                                                        });
                                                    } else if ((THID.length > 0) && (dupTID.length > 0) && (dupHSID.length > 0)) {                                                        
                                                        if(flowType == 2 ) {
                                                            if(dupHypersproutID[0].otp != otp) {
                                                                callback(null, "Failed: OTP does not match!", errorFinal, resultErrors);
                                                            } else {
                                                                        //check if hypersprout is registered, if not register hypersprout on IOT
                                                                checkIfDeviceRegistered(THID, errorFinal, function (errorFinal, arrToInsert) {
                                                                    // 3) Insert command for all new details with dup TFMR
                                                                    insertTransformerHypersprout(arrToInsert, dupTID, dupHSID, errorFinal, CName, CName1, CName2, jobsCollection, configCollection, resultErrors,toMob, flowType, callback);
                                                                });
                                                            }
                                                        }
                                                    } else {
                                                        // Case VIII : THID =0 & TID >0 & HSID >0
                                                        for (var r in insertNewTransformerHypersproutDetails.HypersproutSerialNumber) {
                                                            if (insertNewTransformerHypersproutDetails.HypersproutSerialNumber.hasOwnProperty(r)) {
                                                                for (var s in dupHSID) {
                                                                    if (insertNewTransformerHypersproutDetails.HypersproutSerialNumber[r] === dupHSID[s]) {
                                                                        dupTID.push(insertNewTransformerHypersproutDetails.TFMRSerialNumber[r]);
                                                                    }
                                                                }
                                                            }
                                                        } if (type === "Add") {
                                                            callback(null, "Failed to Add: Duplicate/Incorrect Transformer Details!", errorFinal, resultErrors);
                                                        } else
                                                            callback(null, "Failed to Upload: Duplicate/Incorrect file!", errorFinal, resultErrors);
                                                    }
                                                }
                                            }
                                        }
                                    });
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
* @description - insert Transformer Hypersprout
* @params THID, dupTID, dupHSID, errorFinal, collectionName, collectionName1, jobsCollection, callback
* @return callback function
*/


function insertTransformerHypersprout(THID, dupTID, dupHSID, errorFinal, collectionName, collectionName1, collectionName2, jobsCollection, configCollection, resultErrors, toMob, flowType, callback) {
    try {
        let JobsToInsert = [];
        let HypersproutToInsert = [];
        let ConfigToInsert = [];
        let doc;
        let jobDoc;
        let status = false;
        let validUniqueCircuitID = [];
        //new change
        let digit = getDigit(THID.length);
        let count = THID.length;
        let limit = 100;
        let pageNocount = Math.ceil(count / limit);
        let pageNo;
        let startInd;
        let bulkInsertArr1;
        let loopcount = 0;
        let otpCount=true;
        let bulkOtp;
        let i=0;
        if (THID.length > 500) {
            callback("Total number of records should not be more than 500", null);
        } else {
            if (digit >= 3) {
                for (pageNo = 0; pageNo < pageNocount; pageNo++) {
                    startInd = (pageNo) * limit;
                    endInd = (startInd + limit);
                    bulkInsertArr1 = THID.slice(startInd, endInd);
                    async.each(bulkInsertArr1,
                        function (thid, callbackEach) {
                            var groupCircuitID;
                            if (thid.HypersproutSerialNumber.toLowerCase() === thid.TFMRSerialNumber.toLowerCase()) {
                                var jobID = shortid.generate();
                                jobDoc = {
                                    "JobID": jobID,
                                    "SerialNumber": thid.HypersproutSerialNumber,
                                    "DeviceType": "HyperSprout",
                                    "JobName": "Registration Job",
                                    "JobType": "HS Registration",
                                    "Status": "Pending",
                                    "Group": "NA",
                                    "CreatedDateTimestamp": new Date(),
                                }
                                JobsToInsert.push(jobDoc);
                                thid.GroupCircuitID = thid.GroupCircuitID ? (thid.GroupCircuitID).trim() : thid.GroupCircuitID;
                                collectionName2.find({ CircuitID: thid.GroupCircuitID }).toArray(function (err, circuitDetails) {
                                    if (err)
                                        callbackEach(err, null);
                                    else {
                                        if (circuitDetails.length > 0) {
                                            groupCircuitID = circuitDetails[0].CircuitID;
                                            if (!validUniqueCircuitID.includes(groupCircuitID))
                                                validUniqueCircuitID.push(groupCircuitID);
                                        }
                                        else {
                                            groupCircuitID = null;
                                        }
                                    }
                                    var id = "item_id";
                                    nextID.getValueForNextSequenceItem(id, "Transformer", function (err, nextId) {
                                        doc = {
                                            "HypersproutID": nextId, "TransformerID": nextId, "HypersproutSerialNumber": thid.HypersproutSerialNumber, "IsHyperHub": false, "device_lock": 0, "ConfigID": 1, "AppIDs": [], "ConfigStatus": 'M', "Status": 'NotRegistered', "ConnDisconnStatus": 'Connected', "CreatedOn": new Date(), "RegistrationJobID": jobID,
                                            "Hypersprout_Communications": {
                                                "MAC_ID_GPRS": thid.HSGPRSMacID, "Latitude": parseFloat(thid.HSLatitude), "Longitude": parseFloat(thid.HSLongitude), "MAC_ID_WiFi": thid.HSWiFiMacID, "IP_address_WiFi": thid.HSWiFiIpAddress, "SimCardNumber": thid.HSSimCardNumber, "AccessPointPassword": thid.HSWiFiAccessPointPassword
                                            },
                                            "Hypersprout_DeviceDetails": {
                                                "CT_Ratio": thid.HSCTRatio, "PT_Ratio": thid.HSPTRatio, "RatedVoltage": thid.HSRatedVoltage, "Phase": thid.HSNumberOfPhases, "Frequency": thid.HSRatedFrequency, "Accuracy": thid.HSAccuracy, "HSDemandResetDate": thid.HSDemandResetDate, "HSCompliantToStandards": thid.HSCompliantToStandards, "MaxDemandWindow": thid.HSMaxDemandWindow, "MaxDemandSlidingWindowInterval": thid.HSMaxDemandSlidingWindowInterval, "Sensor Details": thid.HSSensorDetails, "HypersproutVersion": thid.HypersproutVersion, "HypersproutMake": thid.HypersproutMake, Coils: thid.HSCoils
                                            }
                                        };
                                        HypersproutToInsert.push(doc);
                                        thid.Country = "INDIA";
                                        var configdoc = CreateConfigHS(thid, nextId);
                                        var SakDeviceID = "HS-" + thid.HypersproutSerialNumber;
                                        sendToIot.checkDeviceConnectionSAS(SakDeviceID, function (err, status) {
                                            if (err) {
                                                callbackEach(err)
                                            } else {
                                                Sak = status;
                                                configdoc.Cloud_Connectivity_Settings.SAK = Sak;
                                                ConfigToInsert.push(configdoc);
                                                collectionName1.insert({
                                                    "TransformerID": nextId, "CircuitID": groupCircuitID, "TransformerSerialNumber": thid.TFMRSerialNumber, "TFMRName": thid.TFMRName, "Make": thid.TFMRMake, "RatingCapacity": thid.TFMRRatingCapacity, "HighLineVoltage": thid.TFMRHighLineVoltage, "LowLineVoltage": thid.TFMRLowLineVoltage, "HighLineCurrent": thid.TFMRHighLineCurrent, "LowLineCurrent": thid.TFMRLowLineCurrent, "Type": thid.TFMRType, "WireSize": thid.WireSize, "MaxOilTemp": thid.MaxOilTemp, "MinOilTemp": thid.MinOilTemp, "Status": '', "NoOfMeterAllocated": 0, "NoOfHyperHubAllocated": 0, "CameraConnect": thid.CameraConnect, "CreatedOn": new Date()
                                                }, function (err, result) {
                                                    if (err) {
                                                        insertError.putErrorDetails(err, callbackEach);
                                                        callbackEach(err)
                                                    }
                                                    else {
                                                        if (groupCircuitID == null && thid.GroupCircuitID != "" && thid.GroupCircuitID) {
                                                            resultErrors.push({ SerialNumber: thid.HypersproutSerialNumber, Status: "Pass", Comment: "Transformer Details Successfully Added But Transformer Not Grouped Due To Invalid CircuitID: " + thid.GroupCircuitID });
                                                        }
                                                        else {
                                                            resultErrors.push({ SerialNumber: thid.HypersproutSerialNumber, Status: "Pass", Comment: "Transformer Details Successfully Added!" });
                                                        }
                                                        callbackEach()
                                                    }
                                                });
                                            }
                                        });
                                    })
                                });
                            } else {
                                //serial number should be same for both
                                errorFinal.push('Hypersprout Serial number ' + thid.HypersproutSerialNumber + ' should be same as Transformer Serial number ' + thid.TFMRSerialNumber);
                                resultErrors.push({ SerialNumber: thid.TFMRSerialNumber, Status: "Fail", Comment: 'Hypersprout Serial number ' + thid.HypersproutSerialNumber + ' should be same as Transformer Serial number ' + thid.TFMRSerialNumber });
                                callbackEach()
                            }
                        }, function (err) {
                            if (err) {
                                loopcount++;
                                if (loopcount == pageNocount) {
                                    return callback(err, null);
                                }
                            } else {
                                if (HypersproutToInsert.length > 0) {
                                    loopcount++;
                                    if (loopcount == pageNocount) {
                                        async.each(validUniqueCircuitID,
                                            function (circuitID, callbackcideach) {
                                                collectionName1.find({ CircuitID: circuitID }).count(function (err, noOfTransformerAllocated) {
                                                    collectionName2.update({ "CircuitID": circuitID }, { $set: { NoOfTransformerAllocated: noOfTransformerAllocated } });
                                                    callbackcideach();
                                                });
                                            }),

                                            collectionName.insertMany(HypersproutToInsert, function (err, result) {
                                                if (err) {
                                                    insertError.putErrorDetails(err, callback);

                                                }
                                                else {
                                                    jobsCollection.insertMany(JobsToInsert, function (err, success) {
                                                        if (err) {
                                                            if (loopcount == pageNocount) {
                                                                callback(err, null);
                                                            }
                                                        } else {
                                                            configCollection.insertMany(ConfigToInsert, function (err, success) {
                                                                if (err) {
                                                                    if (loopcount == pageNocount) {
                                                                        callback(err, null);
                                                                    }
                                                                } else {
                                                                    status = true;
                                                                    callback(null, "Transformer Details Successfully Added!", errorFinal, resultErrors);

                                                                }
                                                            });
                                                        }

                                                    });
                                                }
                                            })
                                    }

                                }
                                else {
                                    loopcount++;
                                    if (loopcount == pageNocount) {
                                        return callback(null, "Failed to Add/Upload!", errorFinal, resultErrors);
                                    }
                                }
                            }
                        });
                }
            } else {
                async.each(THID,
                    function (thid, callbackEach) {
                        var groupCircuitID;
                        if (thid.HypersproutSerialNumber.toLowerCase() === thid.TFMRSerialNumber.toLowerCase()) {
                            
                            var jobID = shortid.generate();
                            jobDoc = {
                                "JobID": jobID,
                                "SerialNumber": thid.HypersproutSerialNumber,
                                "DeviceType": "HyperSprout",
                                "JobName": "Registration Job",
                                "JobType": "HS Registration",
                                "Status": "Pending",
                                "Group": "NA",
                                "CreatedDateTimestamp": new Date(),
                            }
                            JobsToInsert.push(jobDoc);
                            thid.GroupCircuitID = thid.GroupCircuitID ? (thid.GroupCircuitID).trim() : thid.GroupCircuitID;
                            collectionName2.find({ CircuitID: thid.GroupCircuitID }).toArray(function (err, circuitDetails) {
                                if (err)
                                    callback(err, null);
                                else {
                                    if (circuitDetails.length > 0) {
                                        groupCircuitID = circuitDetails[0].CircuitID;
                                        if (!validUniqueCircuitID.includes(groupCircuitID))
                                            validUniqueCircuitID.push(groupCircuitID);
                                    }
                                    else {
                                        groupCircuitID = null;
                                    }
                                }
                                var id = "item_id";
                                nextID.getValueForNextSequenceItem(id, "Transformer", function (err, nextId) {
                                    doc = {
                                        "HypersproutID": nextId, "TransformerID": nextId, "HypersproutSerialNumber": thid.HypersproutSerialNumber, "IsHyperHub": false, "device_lock": 0, "ConfigID": 1, "AppIDs": [], "ConfigStatus": 'M', "Status": 'NotRegistered', "ConnDisconnStatus": 'Connected', "CreatedOn": new Date(), "RegistrationJobID": jobID,
                                        "Hypersprout_Communications": {
                                            "MAC_ID_GPRS": thid.HSGPRSMacID, "Latitude": parseFloat(thid.HSLatitude), "Longitude": parseFloat(thid.HSLongitude), "MAC_ID_WiFi": thid.HSWiFiMacID, "IP_address_WiFi": thid.HSWiFiIpAddress, "SimCardNumber": thid.HSSimCardNumber, "AccessPointPassword": thid.HSWiFiAccessPointPassword
                                        },
                                        "Hypersprout_DeviceDetails": {
                                            "CT_Ratio": thid.HSCTRatio, "PT_Ratio": thid.HSPTRatio, "RatedVoltage": thid.HSRatedVoltage, "Phase": thid.HSNumberOfPhases, "Frequency": thid.HSRatedFrequency, "Accuracy": thid.HSAccuracy, "HSDemandResetDate": thid.HSDemandResetDate, "HSCompliantToStandards": thid.HSCompliantToStandards, "MaxDemandWindow": thid.HSMaxDemandWindow, "MaxDemandSlidingWindowInterval": thid.HSMaxDemandSlidingWindowInterval, "Sensor Details": thid.HSSensorDetails, "HypersproutVersion": thid.HypersproutVersion, "HypersproutMake": thid.HypersproutMake, "Coils": thid.HSCoils
                                        }
                                    };
                                    HypersproutToInsert.push(doc);
                                    thid.Country = "INDIA";
                                    var configdoc = CreateConfigHS(thid, nextId);
                                    var SakDeviceID = "HS-" + thid.HypersproutSerialNumber;
                                    if(flowType == 1 || flowType == 0) {
                                        if(otpCount){
                                        otpCount=false;
                                        /* OTP generation and SMS for OTP */
                                        bulkOtp= Math.floor(1000 + Math.random() * 9000);
                                        let messageData = {
                                            from: process.env.AzSmsNumber,
                                            to: toMob,
                                            message: "OTP Verification for Delta Account " + bulkOtp
                                        }
                                        sms.sendSms(messageData, function(err, success) {
                                            if(err) {
                                                callbackEach(err)
                                            } else {
                                                console.log(success);
                                            }
                                        });

                                    }
                                        HypersproutToInsert[i].otp=bulkOtp
                                        HypersproutToInsert[i].isVerfied = false;
                                        i++;
                                        ConfigToInsert.push(configdoc);
                                        collectionName1.insert({
                                            "TransformerID": nextId, "CircuitID": groupCircuitID, "TransformerSerialNumber": thid.TFMRSerialNumber, "TFMRName": thid.TFMRName, "Make": thid.TFMRMake, "RatingCapacity": thid.TFMRRatingCapacity, "HighLineVoltage": thid.TFMRHighLineVoltage, "LowLineVoltage": thid.TFMRLowLineVoltage, "HighLineCurrent": thid.TFMRHighLineCurrent, "LowLineCurrent": thid.TFMRLowLineCurrent, "Type": thid.TFMRType, "WireSize": thid.WireSize, "MaxOilTemp": thid.MaxOilTemp, "MinOilTemp": thid.MinOilTemp, "Status": '', "NoOfMeterAllocated": 0, "NoOfHyperHubAllocated": 0, "CameraConnect": thid.CameraConnect, "CreatedOn": new Date()
                                        }, function (err, result) {
                                            if (err) {
                                                insertError.putErrorDetails(err, callbackEach);
                                                callbackEach(err)
                                            }
                                            else {
                                                if (groupCircuitID == null && thid.GroupCircuitID != "" && thid.GroupCircuitID) {
                                                    resultErrors.push({ SerialNumber: thid.HypersproutSerialNumber, Status: "Pass", Comment: "Transformer Details Successfully Added But Transformer Not Grouped Due To Invalid CircuitID: " + thid.GroupCircuitID });
                                                }
                                                else {
                                                    resultErrors.push({ SerialNumber: thid.HypersproutSerialNumber, Status: "Pass", Comment: "Transformer Details Successfully Added!" });
                                                }
                                                callbackEach()
                                            }
                                        });
                                    } else if(flowType == 2 ) {
                                        sendToIot.checkDeviceConnectionSAS(SakDeviceID, function (err, status) {
                                            if(err) {
                                                callbackEach(err)
                                            } else {
                                                configdoc.Cloud_Connectivity_Settings.SAK = status;
                                                ConfigToInsert.push(configdoc);
                                                pushBootstrapData(thid.HypersproutSerialNumber,status,function(err, res) {
                                                    if(err) {
                                                        callbackEach(err);
                                                    } else {
                                                        callbackEach()
                                                    }
                                                })
                                            }
                                        });
                                    } 
                                })
                            });
                        } else {
                            //serial number should be same for both
                            errorFinal.push('Hypersprout Serial number ' + thid.HypersproutSerialNumber + ' should be same as Transformer Serial number ' + thid.TFMRSerialNumber);
                            resultErrors.push({ SerialNumber: thid.TFMRSerialNumber, Status: "Fail", Comment: 'Hypersprout Serial number ' + thid.HypersproutSerialNumber + ' should be same as Transformer Serial number ' + thid.TFMRSerialNumber });
                            callbackEach()
                        }
                    }, function (err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            
                            if (HypersproutToInsert.length > 0) {
                                if(flowType == 1 || flowType == 0) {
                                    async.each(validUniqueCircuitID,
                                        function (circuitID, callbackcideach) {
                                            collectionName1.find({ CircuitID: circuitID }).count(function (err, noOfTransformerAllocated) {
                                                collectionName2.update({ "CircuitID": circuitID }, { $set: { NoOfTransformerAllocated: noOfTransformerAllocated } });
                                                callbackcideach();
                                            });
                                        }),
                                        collectionName.insertMany(HypersproutToInsert, function (err, result) {
                                            if (err)
                                                insertError.putErrorDetails(err, callbackEach);
                                            else {
                                                jobsCollection.insertMany(JobsToInsert, function (err, success) {
                                                    configCollection.insertMany(ConfigToInsert, function (err, success) {
                                                        status = true;
                                                        callback(null, "Transformer Details Successfully Added!", errorFinal, resultErrors);
                                                    });
                                                });
                                            }
                                        })
                                } else if (flowType == 2) {
                                    for (let j = 0; j < HypersproutToInsert.length; j++) {
                                        collectionName.findOneAndUpdate({HypersproutSerialNumber: HypersproutToInsert[j].HypersproutSerialNumber},{$set:{isVerfied : true}},function(err, res) {
                                            if(err) {
                                                insertError.putErrorDetails(err, callbackEach);
                                            }
                                            configCollection.findOneAndUpdate({'HypersproutSerialNumber': HypersproutToInsert[j].HypersproutSerialNumber},{$set:{'Cloud_Connectivity_Settings.SAK': ConfigToInsert[0].Cloud_Connectivity_Settings.SAK}}, function(err, res) {
                                                if(err) {
                                                    callback(err, 'config upload failed', errorFinal, resultErrors);
                                                }
                                                if (j == HypersproutToInsert.length-1) {
                                                callback(null, "Transformer Details Successfully Added!", errorFinal, resultErrors);
                                                   
                                                }
                                            })
                                        })
                                        
                                    }
                                }
                            }
                            else {
                                callback(null, "Failed to Add/Upload!", errorFinal, resultErrors);
                            }
                        }
                    });
            }
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}


function updateCount(uniqueArray, callback) {
    try {
        console.log(uniqueArray);
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

function CreateConfigHS(thid, nextId) {
    if (thid.Country == "INDIA") {
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
    } else if (thid.Country == "CANADA") {
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
    } else if (thid.Country == "SINGAPORE") {
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
    } else if (thid.Country == "MEXICO") {
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
    } else if (thid.Country == "RUSSIA") {
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
    } else if (thid.Country == "UZBEKISTAN") {
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
    } else if (thid.Country == "SOUTH AFRICA") {
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
    } else if (thid.Country == "PHILIPPINES") {
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
    }

    var Sak = "";

    var configdoc = {
        "HypersproutID": nextId, "TransformerID": nextId, "HypersproutSerialNumber": thid.HypersproutSerialNumber, "DeviceType": "hs",
        "System_Info": {
            "power_src": "", "country": "INDIA", "timezone": "Asia/Kolkata - GMT+5:30", "current_fw": "1.1.1",
            "eth_mac": "", "cellular_mac": "", "wifi_mac_2": thid.HSWiFiMacID, "wifi_mac_5": "",
            "backup_fw": "", "cloud_status": "", "eth_ipv4": "", "eth_subnet": "",
            "eth_gw": "", "eth_pridns": "", "eth_secdns": "", "eth_conf_type": true,
            "eth_link_speed": "", "eth_status": "", "cellular_state": "", "cellular_ipv4": "",
            "cellular_gw": "", "cellular_sig_strength": "", "cellular_carrier": "", "up_time": "",
            "itm_status": "", "itm_serial_num": "", "itm_model_num": "", "itm_fw_version": thid.HypersproutVersion,
            "itm_phase_type": thid.HSNumberOfPhases
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
                    "ssid": 'HyperSprout' + thid.HSWiFiMacID, "security": "WPA2-PSK", "password": thid.HSWiFiMacID,
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
            "Hostname": Hostname, "SAK": Sak, "status": "Open"
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
            "Status": 1, "sysname": "HYPERSPROUT", "country": "INDIA", "timezone": "Asia/Kolkata - GMT+5:30", "bandwidth": 33
        },
        "Bandwidth_Details": {
            "Bandwidth": 0, "DownloadBandwidth": 1, "UploadBandwidth": 1
        },
        "config_UpdateTime": parseInt(Date.now() / 1000)
    };
    return configdoc;
}

/**
* @description - For the Webservice - EditCircuitDetails
* @params collectionName, updateCircuitValues, callback
* @return callback function
*/
function updateCircuitDetailsFromMongoDB(collectionName, updateCircuitValues, callback) {
    try {
        var CNum = parseInt(updateCircuitValues.CircuitNumber);
        var CID = updateCircuitValues.CircuitID;
        var dupCID = [];
        var dupCIDNum = [];
        for (var key in updateCircuitValues) {
            if (checkMandatoryValidation(key, updateCircuitValues[key])) {
                if (checkMinimumLengthValidation(key, updateCircuitValues[key]) &&
                    checkMaximumLengthValidation(key, updateCircuitValues[key])) {
                    if (checkTypeValidation(key, updateCircuitValues[key])) {
                        if (checkPatternValidation(key, updateCircuitValues[key])) {

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
        collectionName.find({ CircuitNumber: CNum }).toArray(function (err, circuitDetails) {
            if (err)
                callback(err, null);
            else {
                if (circuitDetails.length > 0) {
                    collectionName.find({ CircuitID: { $regex: new RegExp("^" + CID + "$", "i") } }).toArray(function (err, dupCircuitID) {
                        if (err)
                            callback(err, null);
                        else {
                            updateCircuitValues.CircuitNumber = parseInt(updateCircuitValues.CircuitNumber)
                            if (dupCircuitID.length > 0) {
                                for (var i in dupCircuitID) {
                                    if (dupCircuitID.hasOwnProperty(i)) {
                                        dupCID.push(dupCircuitID[i].CircuitID);
                                        dupCIDNum.push(dupCircuitID[i].CircuitNumber);
                                    }
                                }
                                if (dupCircuitID.length == 1 && dupCIDNum[0] == CNum && dupCID[0] === CID) {
                                    //Case I : CID not changed for Update
                                    delete updateCircuitValues.CircuitID; //CircuitID is non editable field
                                    collectionName.update({ CircuitNumber: updateCircuitValues.CircuitNumber }, { $set: updateCircuitValues }, function (err, updateCircuit) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            if (updateCircuit !== null) {
                                                callback(null, "DTC Details Successfully Updated!");
                                            }
                                        }
                                    });
                                } else {
                                    // Case II: Duplicate CID or CID already present in system
                                    callback("Duplicate DTC ID!", null);
                                }
                            } else {
                                if (dupCircuitID.length === 0) {
                                    // Case III : When CID is not duplicate
                                    delete updateCircuitValues.CircuitID; //CircuitID is non editable field
                                    collectionName.update({ CircuitNumber: updateCircuitValues.CircuitNumber }, { $set: updateCircuitValues }, function (err, updateCircuit) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            if (updateCircuit !== null) {
                                                callback(null, "DTC Details Successfully Updated!");
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                } else {
                    callback("Invalid Circuit Number", null)
                }

            }
        })
    } catch (e) {
        callback("Something went wrong: " + e.name + " " + e.message, null)
    }
};

/**
* @description -  For the Webservice - EditMeterDetails
* @params collectionName, updateMeterValues, callback
* @return callback function
*/

function editMeterDetailsFromMongoDB(collectionName, updateMeterValues, callback) {
    var MID = updateMeterValues.MeterID;
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null, null);
        else {
            var CName = db.delta_Meters;
            if (updateMeterValues.MeterWiFiPassFlag === "Y") {
                collectionName.find({ MeterID: MID, /*WifiPasswordChangeStatus: "Success"*/ }, { _id: 0, MeterID: 1, WifiPasswordChangeStatus: 1, 'Meters_Communications.AccessPointPassword': 1 }).toArray(function (err, wifiPassStatus) {
                    if (err)
                        callback(err, null);
                    else {
                        if (wifiPassStatus[0].WifiPasswordChangeStatus === "Success") {
                            updateMeter(updateMeterValues, CName, callback);
                        }
                        else if (wifiPassStatus[0].WifiPasswordChangeStatus === "Sent") {
                            updateMeterValues.MeterWiFiAccessPointPassword = wifiPassStatus[0].Meters_Communications.AccessPointPassword;
                            updateMeter(updateMeterValues, CName, function (err) {
                                if (err)
                                    callback(err, null);
                                else
                                    callback(null, "Unable to Update Wifi Access Point Password due to no response from device!");
                            });
                        }
                        else {
                            updateMeterValues.MeterWiFiAccessPointPassword = wifiPassStatus[0].Meters_Communications.AccessPointPassword;
                            updateMeter(updateMeterValues, CName, function (err) {
                                if (err)
                                    callback(err, null);
                                else
                                    callback(null, "Unable to Update Wifi Access Point Password due to no response from device!");
                            });
                        }
                    }
                });
            } else
                updateMeter(updateMeterValues, CName, callback);
        }
    });
};
/**
* @description - update meter
* @params updateMeterValues, collectionName, callback
* @return callback function
*/
function updateMeter(updateMeterValues, collectionName, callback) {
    var MSN = updateMeterValues.MeterSerialNumber;
    var MID = updateMeterValues.MeterID;
    var dupMID = [];
    var dupMSN = [];

    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null, null);
        else {
            var CName = db.delta_Meters;
            var HsCollection = db.delta_Hypersprouts;
            var jobsCollection = db.delta_Jobs;
            var configCollection = db.delta_Config;
            let dubConsumerNumber = [];

            var condition = new RegExp("^" + updateMeterValues.MeterConsumerNumber + "$", "i");

            collectionName.find({ "Meters_Billing.MeterConsumerNumber": condition, "MeterID": { $ne: updateMeterValues.MeterID } }, { "Meters_Billing.MeterConsumerNumber": 1, "_id": 0 }).toArray(function (err, dupConsumerNumber) {
                if (err)
                    callback(err, null);
                else {
                    if (dupConsumerNumber.length > 0) {
                        for (var i in dupConsumerNumber) {
                            if (dupConsumerNumber.hasOwnProperty(i)) {
                                let Meters_Billing = dupConsumerNumber[i].Meters_Billing;
                                dubConsumerNumber.push(Meters_Billing.MeterConsumerNumber.toLowerCase());
                            }
                        }
                    }

                    if (dubConsumerNumber.includes(updateMeterValues.MeterConsumerNumber.toLowerCase())) {
                        callback("Consumer Number " + updateMeterValues.MeterConsumerNumber + " already in use", null);
                    } else {
                        collectionName.find({ MeterSerialNumber: { $regex: new RegExp("^" + MSN + "$", "i") } }).toArray(function (err, dupMeterSerialNum) {
                            if (err)
                                callback(err, null);
                            else {
                                if (dupMeterSerialNum.length > 0) {
                                    for (var i in dupMeterSerialNum) {
                                        if (dupMeterSerialNum.hasOwnProperty(i)) {
                                            dupMID.push(dupMeterSerialNum[i].MeterID);
                                            dupMSN.push(dupMeterSerialNum[i].MeterSerialNumber);
                                        }
                                    }
                                    if (dupMID[0] === MID) {
                                        //Case I : MeterSerialNumber not changed for Update
                                        updateMeterDetailsMongoDB(updateMeterValues, CName, HsCollection, jobsCollection, configCollection, callback);
                                    } else {
                                        // Case II: Duplicate MeterSerialNumber or MeterSerialNumber already present in system
                                        callback("Duplicate Meter Serial Number!", null);
                                    }
                                } else {
                                    if (dupMeterSerialNum.length === 0) {
                                        // Case III : When MeterSerialNumber is not duplicate
                                        updateMeterDetailsMongoDB(updateMeterValues, CName, HsCollection, jobsCollection, configCollection, callback);
                                    }
                                }
                            }
                        });
                    }
                }
            })
        }
    });
};

/**
* @description - update Meter Details MongoDB
* @params updateMeterValues, collectionName, callback
* @return callback function
*/

function updateMeterDetailsMongoDB(updateMeterValues, collectionName, HsCollection, jobsCollection, configCollection, callback) {
    updateMeterValues.MeterWiFiMacID = updateMeterValues.MeterWiFiMacID.toLowerCase();
    collectionName.find({ MeterID: updateMeterValues.MeterID }).toArray(function (err, MDetails) {
        if (err)
            callback(err, null);
        else if (MDetails.length === 0)
            callback(new Error("No such Meter available"), null);
        else {
            updateMeterValues.MeterBillingCycleDate = parseInt(updateMeterValues.MeterBillingCycleDate);
            updateMeterValues.MeterDemandResetDate = parseInt(updateMeterValues.MeterDemandResetDate);

            if ((updateMeterValues.BiDirectional === "true")) {
                updateMeterValues.BiDirectional = true;
            }
            if ((updateMeterValues.EVMeter === "true")) {
                updateMeterValues.EVMeter = true;
            }
            if ((updateMeterValues.SolarPanel === "true")) {
                updateMeterValues.SolarPanel = true;
            }
            if ((updateMeterValues.BiDirectional === "false")) {
                updateMeterValues.BiDirectional = false;
            }
            if ((updateMeterValues.EVMeter === "false")) {
                updateMeterValues.EVMeter = false;
            }
            if ((updateMeterValues.SolarPanel === "false")) {
                updateMeterValues.SolarPanel = false;
            }

            for (var key in updateMeterValues) {
                if (checkMandatoryValidation(key, updateMeterValues[key])) {
                    if (checkMinimumLengthValidation(key, updateMeterValues[key]) &&
                        checkMaximumLengthValidation(key, updateMeterValues[key])) {
                        if (checkTypeValidation(key, updateMeterValues[key])) {
                            if (checkPatternValidation(key, updateMeterValues[key])) {
                                if (checkValueMatches(key, updateMeterValues[key])) {
                                    if (checkMaxValueValidationEdit(key, updateMeterValues[key], updateMeterValues)) {
                                        if (checkMinValueValidationEdit(key, updateMeterValues[key], updateMeterValues)) {
                                        } else {
                                            return callback(key + " is Minimum than " + objValidation[key].MinValue + "Value !!", null)
                                        } if (updateMeterValues.MeterVersion > 255 && updateMeterValues.MeterVersion > "255.255") {
                                            return callback("Meter Version should be less than or equal to 255.255 !!", null);
                                        } if (duplicateItems.toCheckMulticastMACAddress(updateMeterValues.MeterWiFiMacID.toLowerCase()) == 1) {
                                            return callback(`${updateMeterValues.MeterWiFiMacID} multicast Wifi Mac ID not allowed!!`, null);
                                        } else {
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


            if (MDetails[0].Meters_Communications.MAC_ID_WiFi !== updateMeterValues.MeterWiFiMacID) {
                var newMacIDs = [];
                collectionName.find({ "Meters_Communications.MAC_ID_WiFi": updateMeterValues.MeterWiFiMacID }).toArray(function (err, macIDs) {
                    if (err)
                        callback(err, null);
                    else if (macIDs.length > 0)
                        callback("MAC ID already in use !!", null);
                    else {
                        var regMac = /^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/;
                        if (regMac.test(updateMeterValues.MeterWiFiMacID)) {
                            var oldMac = MDetails[0].Meters_Communications.MAC_ID_WiFi;
                            newMacIDs.push(oldMac);
                            var MacAdd = [];
                            newMacIDs.push(updateMeterValues.MeterWiFiMacID);
                            MacAdd[updateMeterValues.MeterWiFiMacID.toLowerCase()] = 'meshcard';
                            collectionName.update({ MeterID: updateMeterValues.MeterID }, { $set: { "MeterID": updateMeterValues.MeterID, "MeterSerialNumber": updateMeterValues.MeterSerialNumber, "SealID": updateMeterValues.SealID, "BiDirectional": updateMeterValues.BiDirectional, "EVMeter": updateMeterValues.EVMeter, "SolarPanel": updateMeterValues.SolarPanel, "Meters_Billing.BillingDate": updateMeterValues.MeterBillingCycleDate, "Meters_Billing.BillingTime": updateMeterValues.MeterBillingTime, "Meters_Billing.MeterConsumerNumber": updateMeterValues.MeterConsumerNumber, "Meters_Billing.MeterConsumerName": updateMeterValues.MeterConsumerName, "Meters_Billing.MeterConsumerAddress": updateMeterValues.MeterConsumerAddress, "Meters_Billing.MeterConsumerContactNumber": updateMeterValues.MeterConsumerContactNumber, "Meters_Billing.MeterDemandResetDate": updateMeterValues.MeterDemandResetDate, "Meters_Billing.ImpulseCountperKWh": updateMeterValues.ImpulseCountKWh, "Meters_Billing.ImpulseCountPerKVARh": updateMeterValues.ImpulseCountKVARh, "Meters_Billing.MeterConsumerCountry": updateMeterValues.MeterConsumerCountry, "Meters_Billing.MeterConsumerState": updateMeterValues.MeterConsumerState, "Meters_Billing.MeterConsumerCity": updateMeterValues.MeterConsumerCity, "Meters_Billing.MeterConsumerZipCode": updateMeterValues.MeterConsumerZipCode, "Meters_Communications.MeterAdminPassword": updateMeterValues.MeterAdminPassword, "Meters_Communications.Latitude": updateMeterValues.MeterLatitude, "Meters_Communications.Longitude": updateMeterValues.MeterLongitude, "Meters_Communications.IP_address_WiFi": updateMeterValues.MeterWiFiIpAddress, "Meters_Communications.MAC_ID_WiFi": updateMeterValues.MeterWiFiMacID, "Meters_Communications.AccessPointPassword": updateMeterValues.MeterWiFiAccessPointPassword, "Meters_DeviceDetails.MeterApptype": updateMeterValues.MeterApptype, "Meters_DeviceDetails.MeterVersion": updateMeterValues.MeterVersion, "Meters_DeviceDetails.MeterInstallationLocation": updateMeterValues.MeterInstallationLocation, "Meters_DeviceDetails.CT_Ratio": updateMeterValues.MeterCTRatio, "Meters_DeviceDetails.PT_Ratio": updateMeterValues.MeterPTRatio, "Meters_DeviceDetails.Phase": updateMeterValues.MeterNumberOfPhases, "Meters_DeviceDetails.Frequency": updateMeterValues.MeterRatedFrequency, "Meters_DeviceDetails.RatedVoltage": updateMeterValues.MeterRatedVoltage, "Meters_DeviceDetails.MeterNominalCurrent": updateMeterValues.MeterNominalCurrent, "Meters_DeviceDetails.MeterMaximumCurrent": updateMeterValues.MeterMaximumCurrent, "Meters_DeviceDetails.MeterAccuracy": updateMeterValues.MeterAccuracy, "Meters_DeviceDetails.MeterCompliantToStandards": updateMeterValues.MeterCompliantToStandards, "Meters_DeviceDetails.MeterMake": updateMeterValues.MeterMake, "Meters_DeviceDetails.MeterDisconnector": updateMeterValues.MeterDisconnector } }, function (err, updateMeter) {
                                if (err)
                                    insertError.putErrorDetails(err, callback);
                                else {
                                    configCollection.update({ MeterID: updateMeterValues.MeterID }, { $set: { "MeterSerialNumber": updateMeterValues.MeterSerialNumber } }, function (err, updateConfig) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            var JobType = "Mac Acl Meter Update"
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
                                                        JobType = "Mac Acl Meter Update";

                                                        jobdoc.push({
                                                            "JobID": shortid.generate(),
                                                            "DeviceID": HSDetail.DeviceID,
                                                            "SerialNumber": HSDetail.HypersproutSerialNumber,
                                                            "DeviceType": "Meter",
                                                            "JobName": "Mac Updation Job",
                                                            "JobType": JobType,
                                                            "Status": "Pending",
                                                            "Group": "NA",
                                                            "MessageID": msgID,
                                                            "CreatedDateTimestamp": new Date(),
                                                            "MacID": newMacIDs[1]
                                                        });
                                                        sendMacIDs(HsCollection, newMacIDs, msgID, HSDetail, JobType, function (err, resp) {
                                                            for (var key in jobdoc) {
                                                                jobdoc[key].PacketSent = resp;
                                                            }
                                                            jobsCollection.insertOne(jobdoc, function (err, res) {
                                                                if (updateMeter !== null) {
                                                                    callback(null, "Meter Details Successfully Updated!");
                                                                }
                                                            });

                                                        });

                                                    } else {
                                                        return callback(null, "Meter Details Successfully Updated!");
                                                    }
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        } else {
                            callback("Wrong Mac ID", null);
                        }
                    }
                });
            } else {
                collectionName.update({ MeterID: updateMeterValues.MeterID }, { $set: { "MeterID": updateMeterValues.MeterID, "MeterSerialNumber": updateMeterValues.MeterSerialNumber, "SealID": updateMeterValues.SealID, "BiDirectional": updateMeterValues.BiDirectional, "EVMeter": updateMeterValues.EVMeter, "SolarPanel": updateMeterValues.SolarPanel, "Meters_Billing.BillingDate": updateMeterValues.MeterBillingCycleDate, "Meters_Billing.BillingTime": updateMeterValues.MeterBillingTime, "Meters_Billing.MeterConsumerNumber": updateMeterValues.MeterConsumerNumber, "Meters_Billing.MeterConsumerName": updateMeterValues.MeterConsumerName, "Meters_Billing.MeterConsumerAddress": updateMeterValues.MeterConsumerAddress, "Meters_Billing.MeterConsumerContactNumber": updateMeterValues.MeterConsumerContactNumber, "Meters_Billing.MeterDemandResetDate": updateMeterValues.MeterDemandResetDate, "Meters_Billing.ImpulseCountperKWh": updateMeterValues.ImpulseCountKWh, "Meters_Billing.ImpulseCountPerKVARh": updateMeterValues.ImpulseCountKVARh, "Meters_Billing.MeterConsumerCountry": updateMeterValues.MeterConsumerCountry, "Meters_Billing.MeterConsumerState": updateMeterValues.MeterConsumerState, "Meters_Billing.MeterConsumerCity": updateMeterValues.MeterConsumerCity, "Meters_Billing.MeterConsumerZipCode": updateMeterValues.MeterConsumerZipCode, "Meters_Communications.MeterAdminPassword": updateMeterValues.MeterAdminPassword, "Meters_Communications.Latitude": updateMeterValues.MeterLatitude, "Meters_Communications.Longitude": updateMeterValues.MeterLongitude, "Meters_Communications.IP_address_WiFi": updateMeterValues.MeterWiFiIpAddress, "Meters_Communications.MAC_ID_WiFi": updateMeterValues.MeterWiFiMacID, "Meters_Communications.AccessPointPassword": updateMeterValues.MeterWiFiAccessPointPassword, "Meters_DeviceDetails.MeterApptype": updateMeterValues.MeterApptype, "Meters_DeviceDetails.MeterVersion": updateMeterValues.MeterVersion, "Meters_DeviceDetails.MeterInstallationLocation": updateMeterValues.MeterInstallationLocation, "Meters_DeviceDetails.CT_Ratio": updateMeterValues.MeterCTRatio, "Meters_DeviceDetails.PT_Ratio": updateMeterValues.MeterPTRatio, "Meters_DeviceDetails.Phase": updateMeterValues.MeterNumberOfPhases, "Meters_DeviceDetails.Frequency": updateMeterValues.MeterRatedFrequency, "Meters_DeviceDetails.RatedVoltage": updateMeterValues.MeterRatedVoltage, "Meters_DeviceDetails.MeterNominalCurrent": updateMeterValues.MeterNominalCurrent, "Meters_DeviceDetails.MeterMaximumCurrent": updateMeterValues.MeterMaximumCurrent, "Meters_DeviceDetails.MeterAccuracy": updateMeterValues.MeterAccuracy, "Meters_DeviceDetails.MeterCompliantToStandards": updateMeterValues.MeterCompliantToStandards, "Meters_DeviceDetails.MeterMake": updateMeterValues.MeterMake, "Meters_DeviceDetails.MeterDisconnector": updateMeterValues.MeterDisconnector } }, function (err, updateMeter) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        configCollection.update({ MeterID: updateMeterValues.MeterID }, { $set: { "MeterSerialNumber": updateMeterValues.MeterSerialNumber } }, function (err, updateConfig) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else {
                                if (updateMeter !== null) {
                                    callback(null, "Meter Details Successfully Updated!");
                                }
                            }
                        })
                    }
                });
            }

        }
    })
};

/**
* @description - edit Meter Wifi Details From MongoDB
* @params collectionName, collectionName1, collectionName2, MeterID, callback
* @return callback function
*/
function editMeterWifiDetailsFromMongoDB(collectionName, collectionName1, collectionName2, MeterID, callback) {
    try {
        collectionName.find({ "MeterID": MeterID, "Status": "Registered", }, { "ConnDisconnStatus": 1, "MeterSerialNumber": 1, "TransformerID": 1, "Meters_DeviceDetails.CountryCode": 1, "Meters_DeviceDetails.RegionCode": 1 }).toArray(function (err, meterKwHdetails) {
            if (err)
                callback(err, null);
            else {
                if (meterKwHdetails.length !== 0) {
                    if (meterKwHdetails[0].TransformerID != null) {
                        var TransformerID = meterKwHdetails[0].TransformerID;
                        collectionName1.find({ "TransformerID": TransformerID }, { "DeviceID": 1, "_id": 0 }).toArray(function (err, deviceIDdetails) {
                            if (err)
                                callback(err, null);
                            else {
                                if (deviceIDdetails.length !== 0) {
                                    if (deviceIDdetails[0].DeviceID) {
                                        meterKwHdetails.push(deviceIDdetails[0].DeviceID);
                                        var DeviceID = meterKwHdetails[1];
                                        collectionName2.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 }).toArray(function (err, messageIDdetails) {
                                            if (err)
                                                callback(err, null);
                                            else {
                                                var Flag = [];
                                                if (messageIDdetails != null) {
                                                    if (messageIDdetails[0].MessageID) {
                                                        Flag.push(messageIDdetails[0].Flag);
                                                        meterKwHdetails.push(messageIDdetails[0].MessageID);
                                                        meterKwHdetails.push(messageIDdetails[0].Flag);
                                                    } else {
                                                        callback("Message ID not found!!", null)
                                                    }

                                                }
                                                callback(null, meterKwHdetails);
                                            }
                                        })

                                    } else {
                                        callback("Device ID not found!!", null)
                                    }
                                }

                            }
                        })
                    } else {
                        callback("Meter not grouped to the transformer!", null)
                    }

                } else {
                    callback("Meter Not Registered!", null)
                }
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - edit Meter Wifi Reponse From MongoDB
* @params collectionName, collectionName1, MeterID, Status, callback
* @return callback function
*/

function editMeterWifiReponseFromMongoDB(collectionName, collectionName1, MeterID, Status, callback) {
    try {
        var Message;
        collectionName.find({ MeterID: MeterID }, { WifiPassEditJobID: 1 }).toArray(function (err, wifiPassMeterJobID) {
            if (err)
                callback(err, null);
            else {
                if (wifiPassMeterJobID.length) {
                    if (wifiPassMeterJobID[0].WifiPassEditJobID != undefined) {
                        var JobID = wifiPassMeterJobID[0].WifiPassEditJobID;
                        if (Status === 1) {
                            collectionName.update({ MeterID: MeterID }, { $set: { "WifiPasswordChangeStatus": "Success" } }, function (err, updateMeterWifi) {
                                if (err)
                                    callback(err, null);
                                else {
                                    collectionName1.update({ JobID: JobID }, { $set: { "Status": "Completed", "EndTime": new Date() } }, function (err, updateMeterWifiJob) {
                                        if (err)
                                            callback(err, null);
                                        else
                                            callback(null, updateMeterWifiJob);
                                    });
                                }
                            });
                        } else {
                            if (Status === 2) {
                                Message = "Invalid Lengh(Length!=6 OR the parameters) !!";
                            } else if (Status === 3) {
                                Message = "Invalid Characters Received !!";
                            } else {
                                Message = "Parameters Not in Range !!";
                            }
                            collectionName.update({ MeterID: MeterID }, { $set: { "WifiPasswordChangeStatus": "Failed:" + Message } }, function (err, updateMeterWifi) {
                                if (err)
                                    callback(err, null);
                                else {
                                    collectionName1.update({ JobID: JobID }, { $set: { "Status": "Failed", "EndTime": new Date() } }, function (err, updateMeterWifiJob) {
                                        if (err)
                                            callback(err, null);
                                        else
                                            callback(null, updateMeterWifiJob);
                                    });
                                }
                            });
                        }
                    } else {
                        callback('Invalid data', null);
                    }
                } else {
                    callback('No data available', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - // For the Webservice - EditTransformerHypersproutDetails
* @params - collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback
* @return callback function
*/
function editTransformerHypersproutDetailsFromMongoDB(collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Transformer;
                var CName1 = db.delta_Hypersprouts;

                if (updateTransformerHypersproutValues.TFMRSerialNumber.toLowerCase() === updateTransformerHypersproutValues.HypersproutSerialNumber.toLowerCase()) {
                    if (updateTransformerHypersproutValues.HSWifiPassFlag === "Y") {
                        collectionName1.find({ HypersproutID: updateTransformerHypersproutValues.HypersproutID /*,WifiPasswordChangeStatus: "Success"*/ }, { _id: 0, HypersproutID: 1, WifiPasswordChangeStatus: 1, 'Hypersprout_Communications.AccessPointPassword': 1 }).toArray(function (err, wifiPassStatus) {
                            if (err)
                                callback(err, null);
                            else {
                                if (wifiPassStatus[0].WifiPasswordChangeStatus === "Success")
                                    updateTransformerHypersprout(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback);
                                else if (wifiPassStatus[0].WifiPasswordChangeStatus === "Sent") {
                                    updateTransformerHypersproutValues.HSWiFiAccessPointPassword = wifiPassStatus[0].Hypersprout_Communications.AccessPointPassword;
                                    updateTransformerHypersprout(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, function (err, qwer) {
                                        if (err)
                                            callback(err, null)
                                        else
                                            callback(null, "Unable to Update Wifi Access Point Password due to no response from device!");
                                    });
                                }
                                else {
                                    updateTransformerHypersproutValues.HSWiFiAccessPointPassword = wifiPassStatus[0].Hypersprout_Communications.AccessPointPassword;
                                    updateTransformerHypersprout(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, function (err, qwer) {
                                        if (err)
                                            callback(err, null)
                                        else
                                            callback(null, "Unable to Update Wifi Access Point Password!");
                                    });
                                }
                            }
                        });
                    } else
                        updateTransformerHypersprout(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback);
                } else {
                    callback("TFMRSerialNumber serial number should be same as HypersproutSerialNumber", null);
                }
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
/**
* @description - update Transformer Hypersprout
* @params collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback
* @return callback function
*/
function updateTransformerHypersprout(collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback) {
    try {
        var TID = docTransformer.TransformerID;
        var TSN = docTransformer.TransformerSerialNumber;
        var dupTID = [];
        var dupTSN = [];
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Transformer;
                var CName1 = db.delta_Hypersprouts;
                collectionName.find({ TransformerSerialNumber: { $regex: new RegExp("^" + TSN + "$", "i") } }).toArray(function (err, dupTransformerSerialNum) {
                    if (err)
                        callback(err, null);
                    else {
                        if (dupTransformerSerialNum.length > 0) {
                            for (var i in dupTransformerSerialNum) {
                                if (dupTransformerSerialNum.hasOwnProperty(i)) {
                                    dupTID.push(dupTransformerSerialNum[i].TransformerID);
                                    dupTSN.push(dupTransformerSerialNum[i].TransformerSerialNumber);
                                }
                            }
                            if (dupTID[0] === TID) {
                                //Case I : TransformerSerialNumber not changed for Update
                                updateTransformerHypersproutMongoDB(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback);
                            } else {
                                // Case II: TransformerSerialNumber already present in system
                                callback("Error : Duplicate Transformer Serial Number!", null);
                            }
                        } else {
                            if (dupTransformerSerialNum.length === 0) {
                                // Case III : When TransformerSerialNumber is not duplicate
                                updateTransformerHypersproutMongoDB(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback);
                            }
                        }
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
/**
* @description update Transformer Hypersprout MongoDB
* @params collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback
* @return callback function
*/
function updateTransformerHypersproutMongoDB(collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback) {
    try {
        var dupHSID = [];
        var dupHSSN = [];
        var HSID = docHypersprout.HypersproutID;
        var HSSN = docHypersprout.HypersproutSerialNumber;

        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Transformer;
                var CName1 = db.delta_Hypersprouts;

                collectionName1.find({ HypersproutSerialNumber: HSSN }).toArray(function (err, dupHypersproutSerialNum) {
                    if (err)
                        callback(err, null);
                    else {
                        if (dupHypersproutSerialNum.length > 0) {
                            for (var i in dupHypersproutSerialNum) {
                                if (dupHypersproutSerialNum.hasOwnProperty(i)) {
                                    dupHSID.push(dupHypersproutSerialNum[i].HypersproutID);
                                    dupHSSN.push(dupHypersproutSerialNum[i].HypersproutSerialNumber);
                                }
                            }
                            if (dupHSID[0] === HSID) {
                                //Case A : HypersproutSerialNumber not changed for Update
                                updateTransformerHypersproutMongoDBInsert(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback);
                            } else {
                                // Case B : HypersproutSerialNumber already present in system
                                callback("Duplicate Hypersprout Serial Number!", null);
                            }
                        } else if (dupHypersproutSerialNum.length === 0) {
                            // Case C : When HypersproutSerialNumber is not duplicate
                            //fetch old serial number 
                            collectionName1.findOne({ "HypersproutID": HSID }, function (err, hypersproutDetails) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (hypersproutDetails != null) {
                                        //only edit serial number if device is not registered
                                        if (hypersproutDetails.Status == 'Registered') {
                                            callback("Serial number can not be updated as Hypersprout is already registered", null);
                                        } else {
                                            var hsToDelete = "HS-" + hypersproutDetails.HypersproutSerialNumber;
                                            //Delete old deviceId on iot hub
                                            sendToIot.deleteDeviceOnIot(hsToDelete, function (err, data) {
                                                if (err) {
                                                    if (err.name == 'DeviceNotFoundError') {
                                                        //register on iot hub with new serial number
                                                        registerAndUpdateHypersprout(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, function (err, data) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                callback(null, data);
                                                            }
                                                        });
                                                    } else {
                                                        callback("Error Occured while updating hypersprout " + err.name, null)
                                                    }
                                                } else {
                                                    //register on iot hub with new serial number
                                                    registerAndUpdateHypersprout(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, function (err, data) {
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
                                        callback("Invalid HypersproutID", null);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description - For the Webservice - register and update hyperhub
* @param CName
* @param CName1
* @param docTransformer
* @param docHypersprout
* @param updateTransformerHypersproutValues
*/
function registerAndUpdateHypersprout(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback) {
    try {
        var hsToUpdate = "HS-" + updateTransformerHypersproutValues.HypersproutSerialNumber;
        var device = {
            deviceId: hsToUpdate
        };

        sendToIot.registerDeviceOnIot(device, function (err, data) {
            if (err) {
                callback("Error Occured while updating hypersprout" + err.name, null)
            } else {
                updateTransformerHypersproutMongoDBInsert(CName, CName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, function (err, data) {
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
* @description update Transformer Hypersprout MongoDB Insert and after insert we are checking the  hyperprout is registe or not if register  we are sending coil update to device 
* @params collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback
* @return callback function
*/
function updateTransformerHypersproutMongoDBInsert(collectionName, collectionName1, docTransformer, docHypersprout, updateTransformerHypersproutValues, callback) {
    try {
        let MacID = [];
        let dupMACID = [];
        MacID.push(updateTransformerHypersproutValues.HSGPRSMacID)
        MacID.push(updateTransformerHypersproutValues.HSWiFiMacID)
        updateTransformerHypersproutValues.CameraConnect = updateTransformerHypersproutValues.CameraConnect.toLowerCase();
        updateTransformerHypersproutValues.HSWiFiMacID = updateTransformerHypersproutValues.HSWiFiMacID.toLowerCase();
        updateTransformerHypersproutValues.HSGPRSMacID = updateTransformerHypersproutValues.HSGPRSMacID.toLowerCase();
        updateTransformerHypersproutValues.HSLatitude = parseFloat(updateTransformerHypersproutValues.HSLatitude);
        updateTransformerHypersproutValues.HSLongitude = parseFloat(updateTransformerHypersproutValues.HSLongitude);
        updateTransformerHypersproutValues.HSDemandResetDate = parseInt(updateTransformerHypersproutValues.HSDemandResetDate)
        //Convert string to boolean          
        if ((updateTransformerHypersproutValues.CameraConnect &&
            updateTransformerHypersproutValues.CameraConnect === "true")) {
            updateTransformerHypersproutValues.CameraConnect = true;
        }
        if ((updateTransformerHypersproutValues.CameraConnect === "false")) {
            updateTransformerHypersproutValues.CameraConnect = false;
        }

        //Convert string to boolean    

        if ((docTransformer.CameraConnect &&
            docTransformer.CameraConnect === "true")) {
            docTransformer.CameraConnect = true;
        }
        if ((docTransformer.CameraConnect === "false")) {
            docTransformer.CameraConnect = false;
        }
        for (var key in updateTransformerHypersproutValues) {
            if (checkMandatoryValidation(key, updateTransformerHypersproutValues[key])) {
                if (checkMinimumLengthValidation(key, updateTransformerHypersproutValues[key]) &&
                    checkMaximumLengthValidation(key, updateTransformerHypersproutValues[key])) {
                    if (checkTypeValidation(key, updateTransformerHypersproutValues[key])) {
                        if (checkPatternValidation(key, updateTransformerHypersproutValues[key])) {
                            if (checkValueMatches(key, updateTransformerHypersproutValues[key])) {
                                if (checkMaxValueValidationEdit(key, updateTransformerHypersproutValues[key], updateTransformerHypersproutValues)) {
                                    if (checkMinValueValidationEdit(key, updateTransformerHypersproutValues[key], updateTransformerHypersproutValues)) {
                                        if (updateTransformerHypersproutValues.HypersproutVersion > 255 && updateTransformerHypersproutValues.HypersproutVersion > 255.255) {
                                            return callback(updateTransformerHypersproutValues.HypersproutVersion + " - " + " Hypersprout Version should be less than or equal to 255.255!!", null)
                                        } if (updateTransformerHypersproutValues.MaxOilTemp > 572 || updateTransformerHypersproutValues.MaxOilTemp > 572.00) {
                                            return callback(updateTransformerHypersproutValues.MaxOilTemp + " - " + " MaxOilTemp should be less than or equal to 572!!", null)
                                        } if (updateTransformerHypersproutValues.MaxOilTemp < 86 || updateTransformerHypersproutValues.MaxOilTemp < 86.00) {
                                            return callback(updateTransformerHypersproutValues.MaxOilTemp + " - " + " MaxOilTemp should be greater than or equal to 86!!", null)
                                        } if (updateTransformerHypersproutValues.MinOilTemp > 572 || updateTransformerHypersproutValues.MinOilTemp > 572.00) {
                                            return callback(updateTransformerHypersproutValues.MinOilTemp + " - " + " MinOilTemp should be less than or equal to 572!!", null)
                                        } if (updateTransformerHypersproutValues.MinOilTemp < 86 || updateTransformerHypersproutValues.MinOilTemp < 86.00) {
                                            return callback(updateTransformerHypersproutValues.MinOilTemp + " - " + " MinOilTemp should be greater than or equal to 86!!", null)
                                        } if (duplicateItems.toCheckMulticastMACAddress(updateTransformerHypersproutValues.HSWiFiMacID.toLowerCase()) == 1) {
                                            return callback(`${updateTransformerHypersproutValues.HSWiFiMacID} multicast WiFi Mac ID not allowed!!`, null);
                                        } if (duplicateItems.toCheckMulticastMACAddress(updateTransformerHypersproutValues.HSGPRSMacID.toLowerCase()) == 1) {
                                            return callback(`${updateTransformerHypersproutValues.HSGPRSMacID} multicast Gprs Mac ID not allowed!!`, null);
                                        } else {

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
        // if(updateTransformerHypersproutValues.HSCoils.length) {
        //     updateTransformerHypersproutValues.HSCoils.forEach(function(coil){
        //         coil["coil_id"] = coil["_id"];
        //         delete coil["_id"];
        //     })
        // }
        collectionName.update({ TransformerID: docTransformer.TransformerID }, { $set: docTransformer }, function (err, updateTransformer) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                if (updateTransformer !== null) {
                                        collectionName1.find({ HypersproutID: docHypersprout.HypersproutID }).toArray(function (err, HSDetails) {
                        if (err)
                            callback(err, null);
                        else if (HSDetails.length === 0)
                            callback("No such Hypersprout available", null);
                        else {
                            collectionName1.find({ '$and': [{ 'HypersproutID': { '$ne': docHypersprout.HypersproutID } }, { '$or': [{ "Hypersprout_Communications.MAC_ID_GPRS": { $in: MacID } }, { "Hypersprout_Communications.MAC_ID_WiFi": { $in: MacID } }] }] }).toArray(function (err, dubMacId) {
                                if (err) {
                                    callback(err, null);
                                }
                                else if (dubMacId.length > 0) {
                                    for (var i in dubMacId) {
                                        if (dubMacId.hasOwnProperty(i)) {
                                            dupMACID.push(dubMacId[i].Hypersprout_Communications.MAC_ID_GPRS)
                                            dupMACID.push(dubMacId[i].Hypersprout_Communications.MAC_ID_WiFi)
                                        }
                                    }
                                    if (dupMACID.includes(updateTransformerHypersproutValues.HSGPRSMacID)) {
                                        callback(updateTransformerHypersproutValues.HSGPRSMacID + " Mac ID already in use!!", null);

                                    } else if (dupMACID.includes(updateTransformerHypersproutValues.HSWiFiMacID)) {
                                        callback(updateTransformerHypersproutValues.HSWiFiMacID + " Mac ID already in use!!", null);
                                    }
                                }
                                else {
                                    // update Hscoil field in Delt a hypersprout collection
                                    collectionName1.update({ HypersproutID: docHypersprout.HypersproutID }, { $set: { "HypersproutID": updateTransformerHypersproutValues.HypersproutID, "HypersproutSerialNumber": updateTransformerHypersproutValues.HypersproutSerialNumber, "Hypersprout_Communications.MAC_ID_GPRS": updateTransformerHypersproutValues.HSGPRSMacID, "Hypersprout_Communications.Latitude": updateTransformerHypersproutValues.HSLatitude, "Hypersprout_Communications.Longitude": updateTransformerHypersproutValues.HSLongitude, "Hypersprout_Communications.MAC_ID_WiFi": updateTransformerHypersproutValues.HSWiFiMacID, "Hypersprout_Communications.IP_address_WiFi": updateTransformerHypersproutValues.HSWiFiIpAddress, "Hypersprout_Communications.AccessPointPassword": updateTransformerHypersproutValues.HSWiFiAccessPointPassword, "Hypersprout_Communications.SimCardNumber": updateTransformerHypersproutValues.HSSimCardNumber, "Hypersprout_DeviceDetails.CT_Ratio": updateTransformerHypersproutValues.HSCTRatio, "Hypersprout_DeviceDetails.PT_Ratio": updateTransformerHypersproutValues.HSPTRatio, "Hypersprout_DeviceDetails.RatedVoltage": updateTransformerHypersproutValues.HSRatedVoltage, "Hypersprout_DeviceDetails.Phase": updateTransformerHypersproutValues.HSNumberOfPhases, "Hypersprout_DeviceDetails.Frequency": updateTransformerHypersproutValues.HSRatedFrequency, "Hypersprout_DeviceDetails.Accuracy": updateTransformerHypersproutValues.HSAccuracy, "Hypersprout_DeviceDetails.HSDemandResetDate": updateTransformerHypersproutValues.HSDemandResetDate, "Hypersprout_DeviceDetails.HSCompliantToStandards": updateTransformerHypersproutValues.HSCompliantToStandards, "Hypersprout_DeviceDetails.MaxDemandWindow": updateTransformerHypersproutValues.HSMaxDemandWindow, "Hypersprout_DeviceDetails.MaxDemandSlidingWindowInterval": updateTransformerHypersproutValues.HSMaxDemandSlidingWindowInterval, "Hypersprout_DeviceDetails.Sensor Details": updateTransformerHypersproutValues.HSSensorDetails, "Hypersprout_DeviceDetails.HypersproutVersion": updateTransformerHypersproutValues.HypersproutVersion, "Hypersprout_DeviceDetails.HypersproutMake": updateTransformerHypersproutValues.HypersproutMake ,"Hypersprout_DeviceDetails.Coils":updateTransformerHypersproutValues.HSCoils,"isVerfied": updateTransformerHypersproutValues.isVerfied} }, function (err, updateHypersprout) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            if (updateHypersprout !== null) {
                                                //checking the Hypersprout is register or not  if register we are sending coil update to device
                                                if (HSDetails[0].Status == "Registered" && updateTransformerHypersproutValues.HSCoils.length) {
                                                    console.log('coil update indentified');
                                                    let rev = 0;
                                                    let countrycode = (docHypersprout.CountryCode) ? docHypersprout.CountryCode : 0;
                                                    let regioncode = (docHypersprout.RegionCode) ? docHypersprout.RegionCode : 0;
                                                    let messageid = 0;
                                                    let cellid = (docHypersprout.HypersproutID) ? docHypersprout.HypersproutID : 0;
                                                    let deviceID = "HS-" + docHypersprout.HypersproutSerialNumber
                                                    let inputData = {
                                                        "action": "COIL_UPDATE",
                                                        "attribute": "COIL_DATA",
                                                        "serialNumber": docHypersprout.HypersproutSerialNumber,
                                                        "rev": rev,
                                                        "messageid": messageid,
                                                        "countrycode": countrycode,
                                                        "regioncode": regioncode,
                                                        "cellid": cellid,
                                                        "deviceID": deviceID,
                                                        "Purpose": "COIL_DATA",
                                                        "parameter": "updateCoil",
                                                        "coilData": {
                                                            "multiplier": updateTransformerHypersproutValues.HSCoils[0].multiplier,
                                                            "coilId": updateTransformerHypersproutValues.HSCoils[0]["_id"]
                                                        },
                                                        "meterid": 0
                                                    }
                                                    //convert the payload to hex
                                                    parser.hexaCreation(inputData, function (err, response) {
                                                        if (err)
                                                            insertError.putErrorDetails(err, callback);
                                                        else {
                                                            //push the hex to IoT
                                                            sToIOT.sendToIOT(response, deviceID, function (err, resp) {
                                                                if (err) {
                                                                    insertError.putErrorDetails(err, callback);
                                                                } else {
                                                                    callback(null, "Transformer Details Successfully Updated!");
                                                                }
                                                            });
                                                        }
                                                    })

                                                }
                                                 else{
                                                    callback(null, "Transformer Details Successfully Updated!");

                                                 }
                                            }
                                        }
                                    });


                                }
                            })
                        }
                    })
                }
            }
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
/**
* @description edit HS Wifi Details From MongoDB
* @params collectionName1, collectionName2, HypersproutID, callback
* @return callback function
*/
function editHSWifiDetailsFromMongoDB(collectionName1, collectionName2, HypersproutID, callback) {
    try {
        collectionName1.find({ "HypersproutID": HypersproutID },
            { "HypersproutSerialNumber": 1, "DeviceID": 1, "Hypersprout_DeviceDetails.CountryCode": 1, "Hypersprout_DeviceDetails.RegionCode": 1, "Status": 1, "AccessPointPassword": 1, "_id": 0 }).toArray(function (err, HSWifiDetails) {
                if (err)
                    callback(err, null);
                else {
                    if (HSWifiDetails.length !== 0) {
                        var DeviceID = HSWifiDetails[0].DeviceID;
                        if (HSWifiDetails[0].DeviceID) {
                            collectionName2.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 }).toArray(function (err, messageIDdetails) {
                                if (err)
                                    callback(err, null);
                                else {
                                    if (messageIDdetails.length > 0) {
                                        HSWifiDetails.push(messageIDdetails[0].MessageID);
                                        callback(null, HSWifiDetails);
                                    } else {
                                        callback("Message ID not found !!", null);
                                    }
                                }
                            });
                        } else {
                            callback("Device ID not found !!", null);
                        }
                    }
                    else {
                        callback("Hypersprout not availbale !!", null);
                    }
                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }

};
/**
* @description edit Hypersprout Wifi Reponse From MongoDB
* @params collectionName, collectionName1, HypersproutID, Status, callback
* @return callback function
*/
function editHypersproutWifiReponseFromMongoDB(collectionName, collectionName1, HypersproutID, Status, callback) {
    try {
        var JobID = [];
        collectionName.find({ HypersproutID: HypersproutID }, { WifiPassEditJobID: 1 }).toArray(function (err, wifiPassHSJobID) {
            if (err)
                callback(err, null);
            else {
                if (wifiPassHSJobID.length) {
                    if (wifiPassHSJobID[0].WifiPassEditJobID != undefined) {
                        JobID = wifiPassHSJobID[0].WifiPassEditJobID;
                        if (Status === 1) {
                            collectionName.update({ HypersproutID: HypersproutID }, { $set: { "WifiPasswordChangeStatus": "Success" } }, function (err, updateHSWifi) {
                                if (err)
                                    callback(err, null);
                                else {
                                    collectionName1.update({ JobID: JobID }, { $set: { "Status": "Completed", "EndTime": new Date() } }, function (err, updateHSWifiJob) {
                                        if (err)
                                            callback(err, null);
                                        else
                                            callback(null, updateHSWifiJob);
                                    });
                                }
                            });
                        } else {
                            collectionName.update({ HypersproutID: HypersproutID }, { $set: { "WifiPasswordChangeStatus": "Failure" } }, function (err, updateHSWifi) {
                                if (err)
                                    callback(err, null);
                                else {
                                    collectionName1.update({ JobID: JobID }, { $set: { "Status": "Failed", "EndTime": new Date() } }, function (err, updateHSWifiJob) {
                                        if (err)
                                            callback(err, null);
                                        else
                                            callback(null, updateHSWifiJob);
                                    });
                                }
                            });
                        }
                    } else {
                        callback('No data available', null);
                    }
                } else {
                    callback('No data available', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description For the Webservice - DisplayAllTransformerDetails
* @params collectionName, collectionName1, callback
* @return callback function
*/

function selectAllTransformerDetailsFromMongoDB(transformerCollection, hypersproutCollection, data, callback) {
    try {
        // pagination in System Managemnet-> Gropuing
        if (data.isGrouping) {
            if (data.CID) {
                if (data.groupSearch.searchByAll) {
                    //let query = { "CircuitID": { $regex: new RegExp(data.CID, "i") } };
                    let query = { "CircuitID": { $regex: new RegExp('^' + data.CID + '$', "i") } };
                    let whereCondition = query;
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false, $or: [{ "HypersproutSerialNumber": data.groupSearch.searchByAll }, { "Hypersprout_DeviceDetails.HypersproutMake": data.groupSearch.searchByAll }, { "Hypersprout_DeviceDetails.HypersproutVersion": data.groupSearch.searchByAll }] };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()
                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }

                            });
                        }
                    })
                }
                else if (data.groupSearch.searchByHypersproutSerialNumber) {
                    //let query = { "CircuitID": { $regex: new RegExp(data.CID, "i") } };
                    let query = { "CircuitID": { $regex: new RegExp('^' + data.CID + '$', "i") } };
                    let whereCondition = { $and: [{ TransformerSerialNumber: { $regex: new RegExp(data.groupSearch.searchByHypersproutSerialNumber, "i") } }, query] };
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }
                            });
                        }
                    })
                } else if (data.groupSearch.searchByHypersproutName) {
                    //let query = { "CircuitID": { $regex: new RegExp(data.CID, "i") } };
                    let query = { "CircuitID": { $regex: new RegExp('^' + data.CID + '$', "i") } };
                    let whereCondition = query;
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false, "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.groupSearch.searchByHypersproutName, "i") } };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()
                                        }

                                    }
                                });
                            }, function (err, result) {

                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }

                            });
                        }
                    })
                } else if (data.groupSearch.searchByHypersproutHarwareVersion) {
                    //let query = { "CircuitID": { $regex: new RegExp(data.CID, "i") } };
                    let query = { "CircuitID": { $regex: new RegExp('^' + data.CID + '$', "i") } };
                    let whereCondition = query;
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false, "Hypersprout_DeviceDetails.HypersproutVersion": data.groupSearch.searchByHypersproutHarwareVersion };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()
                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }

                            });
                        }
                    })
                } else if (data.groupSearch.searchByNoOfMeters) {
                    //let query = { "CircuitID": { $regex: new RegExp(data.CID, "i") } };
                    let query = { "CircuitID": { $regex: new RegExp('^' + data.CID + '$', "i") } };
                    let whereCondition = { $and: [{ "NoOfMeterAllocated": parseInt(data.groupSearch.searchByNoOfMeters) }, query] };
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {

                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }

                            });
                        }
                    })
                }
                else {
                    //var whereCondition = { "CircuitID": { $regex: new RegExp(data.CID, "i") } };
                    var whereCondition = { "CircuitID": { $regex: new RegExp('^' + data.CID + '$', "i") } };
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {

                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }

                            });
                        }
                    })
                }
            } else {

                if (data.groupSearch.searchByAll) {
                    let whereCondition = { IsHyperHub: false, $or: [{ "HypersproutSerialNumber": data.groupSearch.searchByAll }, { "Hypersprout_DeviceDetails.HypersproutMake": data.groupSearch.searchByAll }, { "Hypersprout_DeviceDetails.HypersproutVersion": data.groupSearch.searchByAll }] };
                    paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let query = { $or: [{ "CircuitID": "null" }, { "CircuitID": null }] };
                                let whereCondition = query;
                                transformerCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            transformerDetails.Status = hypersproutDetail.Status;

                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }

                            });
                        }
                    })
                }
                else if (data.groupSearch.searchByHypersproutSerialNumber) {
                    let query = { $or: [{ "CircuitID": "null" }, { "CircuitID": null }] };
                    let whereCondition = { $and: [{ TransformerSerialNumber: { $regex: new RegExp(data.groupSearch.searchByHypersproutSerialNumber, "i") } }, query] };
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {

                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;

                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }



                            });
                        }
                    })
                } else if (data.groupSearch.searchByHypersproutName) {
                    let query = { IsHyperHub: false };
                    let whereCondition = { $and: [{ "Hypersprout_DeviceDetails.HypersproutMake": { $regex: new RegExp(data.groupSearch.searchByHypersproutName, "i") } }, query] };
                    paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, $or: [{ "CircuitID": "null" }, { "CircuitID": null }] };
                                transformerCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {

                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            transformerDetails.Status = hypersproutDetail.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()

                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }

                            });
                        }
                    })
                } else if (data.groupSearch.searchByHypersproutHarwareVersion) {
                    let query = { IsHyperHub: false };
                    let whereCondition = { $and: [{ "Hypersprout_DeviceDetails.HypersproutVersion": data.groupSearch.searchByHypersproutHarwareVersion }, query] };
                    paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, $or: [{ "CircuitID": "null" }, { "CircuitID": null }] };
                                transformerCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            transformerDetails.Status = hypersproutDetail.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }
                            });
                        }
                    })
                } else if (data.groupSearch.searchByNoOfMeters) {
                    let query = { $or: [{ "CircuitID": "null" }, { "CircuitID": null }] };
                    let whereCondition = { $and: [{ "NoOfMeterAllocated": parseInt(data.groupSearch.searchByNoOfMeters) }, query] };
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                delete hypersproutDetail._id;
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;

                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }
                            });
                        }
                    })
                }
                else {
                    var whereCondition = { $or: [{ "CircuitID": "null" }, { "CircuitID": null }] };
                    paginatedResults.paginatedResults(transformerCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let tfHSAllDetails = []
                            async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                                let whereCondition = { TransformerID: hypersproutDetail.TransformerID, IsHyperHub: false };
                                hypersproutCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                    if (err) {
                                        callbackEach()
                                    }
                                    else {
                                        if (dataFromMatchingTfmrIds.length > 0) {
                                            let transformerDetails = dataFromMatchingTfmrIds[0];
                                            hypersproutDetail.Status = transformerDetails.Status;
                                            let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                            tfHSAllDetails.push(tfHSDetails)
                                            callbackEach()
                                        } else {
                                            callbackEach()

                                        }

                                    }
                                });
                            }, function (err, result) {
                                if (tfHSAllDetails.length > 0) {
                                    hypersproutDetails.results = tfHSAllDetails;
                                    callback(null, hypersproutDetails);

                                } else {
                                    callback("Transformer Details not available in the System", null);

                                }
                            });
                        }
                    })
                }
            }
        } else {
            // pagination in SystemManagement->Add Devices->Transformer
            if (data.search) {
                let query = { IsHyperHub: false };
                let whereCondition = { $and: [{ HypersproutSerialNumber: { $regex: new RegExp(data.search, "i") } }, query] };
                paginatedResults.paginatedResults(hypersproutCollection, whereCondition, data, "Transformer", function (err, hypersproutDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        let tfHSAllDetails = []
                        async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                            delete hypersproutDetail._id;

                            let whereCondition = { TransformerID: hypersproutDetail.TransformerID };
                            transformerCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                if (err) {
                                    callbackEach()
                                }
                                else {
                                    if (dataFromMatchingTfmrIds.length > 0) {
                                        let transformerDetails = dataFromMatchingTfmrIds[0];
                                        transformerDetails.Status = hypersproutDetail.Status;
                                        let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                                        tfHSAllDetails.push(tfHSDetails)
                                        callbackEach()
                                    } else {
                                        callbackEach()
                                    }

                                }
                            });
                        }, function (err, result) {
                            if (tfHSAllDetails.length > 0) {
                                hypersproutDetails.results = tfHSAllDetails;
                                callback(null, hypersproutDetails);

                            } else {
                                callback("Transformer Details not available in the System", null);

                            }

                        });
                    }
                })
            }
            else {
                var whereCondition = { IsHyperHub: false };
                paginatedResults.paginatedResultsSortASC(hypersproutCollection, whereCondition, data, "Transformer", "CreatedOn", function (err, hypersproutDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        let tfHSAllDetails = []
                        let hypersproutDetail = hypersproutDetails.results;
                        for (i = 0; i < hypersproutDetail.length; i++) {
                            let k = i;
                            let Status = hypersproutDetail[i].Status;
                            let hsDetails = hypersproutDetail[i];
                            let whereCondition = { TransformerID: hypersproutDetail[i].TransformerID };
                            transformerCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                                if (err) {
                                    //  continue;
                                }
                                else {
                                    if (dataFromMatchingTfmrIds.length > 0) {
                                        let transformerDetails = dataFromMatchingTfmrIds[0];
                                        transformerDetails.Status = Status;
                                        let tfHSDetails = { ...hsDetails, ...transformerDetails };
                                        tfHSAllDetails.push(tfHSDetails)

                                    } else {
                                        //  continue;
                                    }


                                }
                                if (tfHSAllDetails.length > 0 && (k == (hypersproutDetail.length - 1))) {
                                    delete hypersproutDetails.results;
                                    tfHSAllDetails.sort(function (a, b) {
                                        var keyA = new Date(a.CreatedOn),
                                            keyB = new Date(b.CreatedOn);
                                        // Compare the 2 dates
                                        if (keyA < keyB) return -1;
                                        if (keyA > keyB) return 1;
                                        return 0;
                                    });
                                    hypersproutDetails.results = tfHSAllDetails;

                                    callback(null, hypersproutDetails);

                                } else if ((k == (hypersproutDetail.length - 1))) {
                                    callback("Transformer Details not available in the System", null);

                                } else {

                                }
                            });

                        }
                        // async.each(hypersproutDetails.results, function (hypersproutDetail, callbackEach) {
                        //     let whereCondition = { TransformerID: hypersproutDetail.TransformerID };
                        //     transformerCollection.find(whereCondition).project({ "_id": 0 }).limit(1).toArray(function (err, dataFromMatchingTfmrIds) {
                        //         if (err) {
                        //             callbackEach()
                        //         }
                        //         else {
                        //             if (dataFromMatchingTfmrIds.length > 0) {
                        //                 let transformerDetails = dataFromMatchingTfmrIds[0];
                        //                 transformerDetails.Status = hypersproutDetail.Status;
                        //                 let tfHSDetails = { ...hypersproutDetail, ...transformerDetails };
                        //                 tfHSAllDetails.push(tfHSDetails)
                        //                 callbackEach()
                        //             } else {
                        //                 callbackEach()
                        //             }

                        //         }
                        //     });
                        // }, function (err, result) {
                        //     if (tfHSAllDetails.length > 0) {
                        //         hypersproutDetails.results = tfHSAllDetails;
                        //         callback(null, hypersproutDetails);

                        //     } else {
                        //         callback("Transformer Details not available in the System", null);

                        //     }

                        // });
                    }
                })
            }
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};



// function selectAllTransformerDetailsFromMongoDB(collectionName, collectionName1, callback) {
//     try {
//         collectionName1.find({ IsHyperHub: false }).toArray(function (err, hypersproutDetails) {
//             if (err)
//                 callback(err, null);
//             else {
//                 if (hypersproutDetails.length !== 0) {
//                     var tfmrIds = [];
//                     for (var i in hypersproutDetails) {
//                         if (hypersproutDetails.hasOwnProperty(i))
//                             tfmrIds.push(hypersproutDetails[i].TransformerID);
//                     }
//                     collectionName.find({ TransformerID: { $in: tfmrIds } }).toArray(function (err, dataFromMatchingTfmrIds) {
//                         if (err)
//                             return callback(err, null, null);
//                         else
//                             return callback(null, hypersproutDetails, dataFromMatchingTfmrIds);
//                     });
//                 } else
//                     return callback(new Error('Transformer Details not available in the System'), null, null);
//             }
//         });
//     } catch (e) {
//         callback("Something went wrong : " + e.name + " " + e.message, null)
//     }
// };




/**
* @description -For the Webservice - DeleteCircuitDetails
* @params collectionName, collectionName1, deleteCircuitValues, callback
* @return callback function
*/


function deleteCircuitDetailsFromMongoDB(collectionName, collectionName1, deleteCircuitValues, callback) {
    try {
        var CID = [];
        var noGroupedDTC = [];
        let errorFinal = [];
        collectionName.find({ CircuitID: { $in: deleteCircuitValues.CircuitID } }).toArray(function (err, result) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                if (result.length > 0) {
                    for (var i in result) {
                        CID.push(result[i].CircuitID);
                        if (result[i].NoOfTransformerAllocated == 0) {
                            noGroupedDTC.push(result[i].NoOfTransformerAllocated)
                        }
                    }
                    if (deleteCircuitValues.CircuitID.length == CID.length && deleteCircuitValues.CircuitID.length == noGroupedDTC.length) {
                        collectionName.deleteMany({ CircuitID: { $in: CID }, NoOfTransformerAllocated: 0 }, function (err, circuitDelete) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else {
                                if (circuitDelete.result.n > 0) {
                                    callback(null, "DTC Details Successfully Deleted!", errorFinal);
                                } else {
                                    callback(null, "DTC(s) not deleted! before deleting, please try to ungroup", errorFinal);
                                }
                            }
                        });
                    } else {
                        for (let i in deleteCircuitValues.CircuitID) {
                            if (!(CID.includes(deleteCircuitValues.CircuitID[i]))) {
                                errorFinal.push("Invalid CircuitID : " + deleteCircuitValues.CircuitID[i]);
                            }
                        }
                        collectionName.deleteMany({ CircuitID: { $in: CID }, NoOfTransformerAllocated: 0 }, function (err, circuitDelete) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else {
                                if (circuitDelete.result.n > 0) {
                                    callback(null, "DTC deleted successfully! If not deleted, please try to ungroup before deleting", errorFinal);
                                } else {
                                    callback(null, "DTC(s) not deleted! before deleting, please try to ungroup", errorFinal);
                                }
                            }
                        });
                    }

                } else {
                    callback("Invalid CircuitID(s)!!", null);

                }

            }
        })

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description -For the Webservice - DeleteMeterDetails
* @params collectionName, deleteMeterValues, callback
* @return callback function
*/
function deleteMeterDetailsFromMongoDB(collectionName, configCollection, deleteMeterValues, callback) {
    var MIDtoDelete = [];
    let msg;
    let errorFinal = [];
    let groupedMeter = [];
    // map() return a new array of LogID having only integer values and  integerValue function return an Integer values
    deleteMeterValues.MeterID = (deleteMeterValues.MeterID).map(integerValue);
    let MID = deleteMeterValues.MeterID;
    collectionName.find({ MeterID: { $in: MID } }).toArray(function (err, metertoDelete) {
        if (err)
            callback(err, null);
        else if (metertoDelete.length > 0) {
            for (var i in metertoDelete) {
                if (metertoDelete.hasOwnProperty(i)) {
                    if (metertoDelete[i].NoOfDeltalinkAllocated) {
                        if ((metertoDelete[i].TransformerID == null || metertoDelete[i].TransformerID == "null") && (metertoDelete[i].NoOfDeltalinkAllocated == 0)) {
                            MIDtoDelete.push(metertoDelete[i].MeterID);
                        } else {
                            groupedMeter.push(metertoDelete[i].MeterID)

                        }
                    } else {
                        if ((metertoDelete[i].TransformerID == null || metertoDelete[i].TransformerID == "null")) {
                            MIDtoDelete.push(metertoDelete[i].MeterID);
                        } else {
                            groupedMeter.push(metertoDelete[i].MeterID)

                        }
                    }

                }
            }
            if (MIDtoDelete.length === MID.length) {
                msg = "Meters Deleted Successfully!"
            } else {
                for (let i in deleteMeterValues.MeterID) {
                    if (!(MIDtoDelete.includes(MID[i])) && (!groupedMeter.includes(MID[i]))) {
                        errorFinal.push("Invalid MeterID : " + MID[i]);
                    }
                }
                msg = "Meters deleted successfully! If not deleted, please try Ungrouping/Unlinking them before Deleting"
            }
            collectionName.deleteMany({ MeterID: { $in: MIDtoDelete } }, function (err, meterDeleted) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (MIDtoDelete.length === MID.length) {
                    configCollection.deleteMany({ MeterID: { $in: MIDtoDelete } }, function (err, meterDeleted) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else
                            callback(null, msg, errorFinal);
                    });
                } else {
                    configCollection.deleteMany({ MeterID: { $in: MIDtoDelete } }, function (err, meterDeleted) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else
                            callback(null, msg, errorFinal);
                    });
                }
            });
        } else {
            callback("invalid MeterID(s)!!", null)
        }
    });
};

/**
* @description - For the Webservice - DeleteTransformerHypersproutDetails
* @params collectionName, collectionName1, collectionName2, deleteTransformerHypersproutValues, callback
* @return callback function
*/
function deleteTransformerHypersproutDetailsFromMongoDB(collectionName, collectionName1, collectionName2, deleteTransformerHypersproutValues, callback) {
    try {
        let errorFinal = [];
        var TID = deleteTransformerHypersproutValues.TransformerID;
        TID = (TID).map(integerValue);
        var HSID = deleteTransformerHypersproutValues.HypersproutID;
        HSID = (HSID).map(integerValue);
        var TIDtoDelete = [];
        var groupedTID = [];
        var transformerSerialNo = [];

        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Transformer;
                var CName1 = db.delta_Hypersprouts;
                var configCollection = db.delta_Config;
                collectionName.find({ TransformerID: { $in: TID } }, { _id: 0, TransformerID: 1, CircuitID: 1, TransformerSerialNumber: 1 }).toArray(function (err, transformerToDelete) {
                    if (err)
                        callback(err, null);
                    else {
                        if (transformerToDelete.length !== 0) {
                            for (var i in transformerToDelete) {
                                if (transformerToDelete[i].CircuitID === "null" || transformerToDelete[i].CircuitID === null) {
                                    TIDtoDelete.push(transformerToDelete[i].TransformerID);
                                    //push serial numbers to be deleted from iot
                                    transformerSerialNo.push("HS-" + transformerToDelete[i].TransformerSerialNumber)
                                }
                                else {
                                    groupedTID.push(transformerToDelete[i].TransformerID);
                                }
                            }
                            if (TIDtoDelete.length !== 0) {
                                //function to delete devices from iot
                                deleteHypersproutFromIot(transformerSerialNo, errorFinal, function (err, data) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        var msg;
                                        if (TIDtoDelete.length === TID.length && transformerSerialNo.length == TID.length) {
                                            msg = "Transformer Details Successfully Deleted!"
                                        } else {
                                            for (let i in deleteTransformerHypersproutValues.TransformerID) {
                                                if (!(TIDtoDelete.includes(deleteTransformerHypersproutValues.TransformerID[i])) && !(groupedTID.includes(deleteTransformerHypersproutValues.TransformerID[i]))) {
                                                    errorFinal.push("Invalid TransformerID : " + deleteTransformerHypersproutValues.TransformerID[i]);
                                                }
                                            }
                                            msg = "Transformer Details Successfully Deleted! If not deleted, please try Ungrouping them before Deleting."
                                        }
                                        collectionName2.find({ "TransformerID": { $in: TIDtoDelete } }, { MeterID: 1 }).toArray(function (err, meterIds) {
                                            if (err)
                                                callback(err, null);
                                            else {
                                                if (meterIds.length !== 0) {
                                                    var MID = [];
                                                    for (var i in meterIds) {
                                                        if (meterIds.hasOwnProperty(i))
                                                            MID.push(meterIds[i].MeterID);
                                                    }
                                                    collectionName2.updateMany({ "MeterID": { $in: MID } }, { $set: { "TransformerID": "null" } }, function (err, transformerIdRemoved) {
                                                        if (err)
                                                            insertError.putErrorDetails(err, callback);
                                                        else {
                                                            if (transformerIdRemoved !== null)
                                                                collectionName1.find({ "TransformerID": { $in: TIDtoDelete }, "IsHyperHub": true }, { HypersproutID: 1 }).toArray(function (err, hyperhubIds) {
                                                                    if (err)
                                                                        callback(err, null);
                                                                    else {
                                                                        if (hyperhubIds.length !== 0) {
                                                                            var HID = [];
                                                                            for (var i in hyperhubIds) {
                                                                                if (hyperhubIds.hasOwnProperty(i))
                                                                                    HID.push(hyperhubIds[i].HypersproutID);
                                                                            }
                                                                            collectionName1.updateMany({ "HypersproutID": { $in: HID }, "IsHyperHub": true }, { $set: { "TransformerID": "null" } }, function (err, transformerIdRemovedfromHyperhub) {
                                                                                if (err)
                                                                                    insertError.putErrorDetails(err, callback);
                                                                                else {
                                                                                    if (transformerIdRemovedfromHyperhub !== null)
                                                                                        deleteTransformerHypersproutUpdate(CName, CName1, configCollection, TIDtoDelete, HSID, msg, errorFinal, callback);
                                                                                }
                                                                            });
                                                                        } else
                                                                            deleteTransformerHypersproutUpdate(CName, CName1, configCollection, TIDtoDelete, HSID, msg, errorFinal, callback);
                                                                    }
                                                                });

                                                        }
                                                    });
                                                } else {
                                                    collectionName1.find({ "TransformerID": { $in: TIDtoDelete }, "IsHyperHub": true }, { HypersproutID: 1 }).toArray(function (err, hyperhubIds) {
                                                        if (err)
                                                            callback(err, null);
                                                        else {
                                                            if (hyperhubIds.length !== 0) {
                                                                var HID = [];
                                                                for (var i in hyperhubIds) {
                                                                    if (hyperhubIds.hasOwnProperty(i))
                                                                        HID.push(hyperhubIds[i].HypersproutID);
                                                                }
                                                                collectionName1.updateMany({ "HypersproutID": { $in: HID }, "IsHyperHub": true }, { $set: { "TransformerID": "null" } }, function (err, transformerIdRemovedfromHyperhub) {
                                                                    if (err)
                                                                        insertError.putErrorDetails(err, callback);
                                                                    else {
                                                                        if (transformerIdRemovedfromHyperhub !== null)
                                                                            deleteTransformerHypersproutUpdate(CName, CName1, configCollection, TIDtoDelete, HSID, msg, errorFinal, callback);
                                                                    }
                                                                });
                                                            } else
                                                                deleteTransformerHypersproutUpdate(CName, CName1, configCollection, TIDtoDelete, HSID, msg, errorFinal, callback);
                                                        }
                                                    });
                                                    // deleteTransformerHypersproutUpdate(CName, CName1, TIDtoDelete, HSID, msg, callback);
                                                }
                                            }
                                        });
                                    }
                                });
                            } else
                                callback(null, "Transformer details successfully deleted! If not deleted, please try to ungroup before deleting", errorFinal);
                        } else
                            callback("Invalid Transformer!", null);
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
/**
* @description - delete Hypersprout from iot hub
* @params transformerSerialNo,callback
* @return callback function
*/
function deleteHypersproutFromIot(transformerSerialNo, errorFinal, callback) {
    try {
        var count = transformerSerialNo.length;
        var limit = 10;
        var pageNocount = Math.ceil(count / limit);
        var pageNo;
        var startInd;
        var devicesToDelete;
        var loopcount = 1;

        for (pageNo = 0; pageNo < pageNocount; pageNo++) {
            startInd = (pageNo) * limit;
            endInd = (startInd + limit);

            devicesToDelete = transformerSerialNo.slice(startInd, endInd);

            sendToIot.deleteDeviceOnIot(devicesToDelete, function (err, data) {


                if (err) {
                    if (err.name != 'DeviceNotFoundError') {
                        //callback(null, "Device deleted");
                        errorFinal.push("Error occured while deleting Devices from IOT hub " + devicesToDelete);
                    }
                    if (loopcount == pageNocount) {
                        if (errorFinal.length)
                            callback(errorFinal, null);
                        else
                            callback(null, "Device deleted");
                    }
                    loopcount++;
                    // } else {
                    //     callback("Error occured while deleting Devices from IOT hub", null)
                    // }
                } else {
                    if (loopcount == pageNocount) {
                        if (errorFinal.length)
                            callback(errorFinal, null);
                        else
                            callback(null, "Device deleted");
                    }
                    loopcount++;
                }
                //else {
                // callback(null, "Device deleted");
                //}
            });
        }

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}
/**
* @description - delete Transformer from Hypersprout Update
* @params collectionName, collectionName1, TIDtoDelete, HSID, msg, callback
* @return callback function
*/
function deleteTransformerHypersproutUpdate(collectionName, collectionName1, configCollection, TIDtoDelete, HSID, msg, errorFinal, callback) {
    collectionName.deleteMany({ TransformerID: { $in: TIDtoDelete } }, function (err, transformerDelete) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else {
            if (transformerDelete !== null) {
                if (HSID.length !== 0) {
                    collectionName1.deleteMany({ TransformerID: { $in: TIDtoDelete } }, function (err, hypersproutDelete) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else {
                            configCollection.deleteMany({ HypersproutID: { $in: TIDtoDelete } }, function (err, configdelete) {
                                if (err)
                                    insertError.putErrorDetails(err, callback);
                                else {
                                    if (hypersproutDelete !== null) {
                                        callback(null, msg, errorFinal);
                                    }
                                }
                            });
                        }
                    });
                } else
                    callback("HypersproutID ojbect- HSID is null", null);
            } else
                callback("TransformerID ojbect- TID is null", null);
        }
    });
};

/**
* @description - For the Webservice - AddingTransformerToCircuit
* @params collectionName, collectionName1, addTransformerToCircuitValues, callback
* @return callback function
*/
function addTransformerToCircuitFromMongoDB(collectionName, collectionName1, addTransformerToCircuitValues, callback) {
    try {
        var TID = [];
        var CID1 = addTransformerToCircuitValues.CircuitID;
        let CID;
        var TIDCount = 0;
        for (var i in addTransformerToCircuitValues.TransformerID) {
            if (addTransformerToCircuitValues.TransformerID.hasOwnProperty(i)) {
                TID.push(addTransformerToCircuitValues.TransformerID[i]);
                TIDCount = TIDCount + 1;
            }
        }
        TID = (TID).map(integerValue);
        TIDCount = TID.length;
        collectionName1.find({ "CircuitID": { $regex: new RegExp("^" + CID1 + "$", "i") } }).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length > 0) {
                    CID = result[0].CircuitID;
                    if (TID.length !== 0) {
                        transformerValidation(collectionName, { "TransformerID": { $in: TID } }, function (err, transformerDet) {
                            if (transformerDet.length > 0) {
                                if (TID.length == transformerDet.length) {
                                    toCheckIfNotGrouped(transformerDet, "Transformer", function (err, alreadygroupedTransformer) {
                                        if (err) {
                                            callback(err, null)
                                        } else {
                                            collectionName.updateMany({ "TransformerID": { $in: TID } }, { $set: { "CircuitID": CID } }, function (err, transformerToCircuit) {
                                                if (err)
                                                    insertError.putErrorDetails(err, callback);
                                                else {
                                                    if (transformerToCircuit.length !== 0) {
                                                        collectionName1.find({ "CircuitID": CID }, { "NoOfTransformerAllocated": 1, "_id": 0 }).toArray(function (err, NoOfTransformerAllocatedCount) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                var TransformerAllocatedToUpdate = 0;
                                                                if (NoOfTransformerAllocatedCount !== null) {
                                                                    for (var i in NoOfTransformerAllocatedCount) {
                                                                        if (NoOfTransformerAllocatedCount.hasOwnProperty(i))
                                                                            TransformerAllocatedToUpdate = NoOfTransformerAllocatedCount[i].NoOfTransformerAllocated;
                                                                    }
                                                                    TransformerAllocatedToUpdate = TransformerAllocatedToUpdate + TIDCount;
                                                                    collectionName1.update({ "CircuitID": CID }, { $set: { NoOfTransformerAllocated: TransformerAllocatedToUpdate } }, function (err, CircuitAllocatedUpdated) {
                                                                        if (err)
                                                                            insertError.putErrorDetails(err, callback);
                                                                        else
                                                                            callback(null, "Transformer Successfully Grouped with DTC!");
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
                                    return callback("Invalid Transformer ID(s)!!", null)
                                }
                            } else {
                                callback("Transformer not available !!", null)
                            }
                        })
                    }
                } else {
                    callback("Invalid CircuitID", null);
                }
            }
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

};


//to check if circuit is grouped or not

function toCheckIfNotGrouped(ArrayOfObject, Device, callback) {
    try {
        let Id = [];
        let ID;
        async.each(ArrayOfObject, function (ArrayOfObjectDetails, callbackEach) {
            if (Device == "Meter") {
                ID = ArrayOfObjectDetails.MeterID
                condition = ArrayOfObjectDetails.TransformerID
                key = "Transformer"

            } else if (Device == "HyperHub") {
                ID = ArrayOfObjectDetails.HypersproutID
                condition = ArrayOfObjectDetails.TransformerID
                key = "Transformer"
            } else if (Device == "DeltaLink") {
                ID = ArrayOfObjectDetails.DeltalinkID
                condition = ArrayOfObjectDetails.MeterID
                key = "Meter"
            }
            else {
                ID = ArrayOfObjectDetails.TransformerID
                condition = ArrayOfObjectDetails.CircuitID
                key = "Circuit"

            }
            // if Device not grouped with associated item
            if (condition == null || condition == "null") {
                callbackEach()
            }
            else {
                Id.push(ID)
                callbackEach("error", null)
            }

        }, function (err, result) {
            if (!err) {
                callback(null, "success");
            }
            else {
                callback(Id + " " + Device + " already grouped to the " + key + " !!", null)

            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

function getID(ArrayOfObject, Device, callback) {
    let Id = [];
    async.each(ArrayOfObject,
        function (Data, callbackEach) {
            if (Device == "Meter" && Data.MeterID) {
                Id.push(Data.MeterID)
            } else if (Device == "HyperHub" && Data.HypersproutID) {
                Id.push(Data.HypersproutID)
            } else if (Device == "Transformer" && Data.TransformerID) {
                Id.push(Data.TransformerID)

            } else {
                Id.push(Data.CircuitID)

            }
        }
    );
    callback(null, Id)
}

/**
* @description - For the Webservice - AddingMeterToTransformer
* @params collectionName, collectionName1, addMeterToTransformerValues, callback
* @return callback function
*/

function addMeterToTransformerFromMongoDB(collectionName, collectionName1, hypersproutCollection, jobsCollection, addMeterToTransformerValues, callback) {
    try {
        var MID = [];
        var TID = parseInt(addMeterToTransformerValues.TransformerID);
        var MIDCount = 0;
        let MeterId = [];
        for (var i in addMeterToTransformerValues.MeterID) {
            if (addMeterToTransformerValues.MeterID.hasOwnProperty(i)) {
                MID.push(addMeterToTransformerValues.MeterID[i]);
                MIDCount = MIDCount + 1;
            }
        }
        MID = (MID).map(integerValue);
        MIDCount = MID.length;
        if (MID.length !== 0) {
            collectionName.find({ "MeterID": { $in: MID } }, { 'Meters_Communications.MAC_ID_WiFi': 1, 'MeterID': 1 }).toArray(function (err, MeterData) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (MeterData) {
                    var MMacId = [];
                    if (MeterData.length > 0) {
                        async.each(MeterData,
                            function (MData, callbackEach) {
                                MeterId.push(MData.MeterID)
                                if (MData.Meters_Communications.MAC_ID_WiFi) {
                                    MMacId.push(MData.Meters_Communications.MAC_ID_WiFi)
                                } else {
                                    callbackEach()
                                }
                            }
                        );
                    }
                    if (MID.length == MeterId.length) {
                        meterValidation(collectionName, { "MeterID": { $in: MID } }, function (err, alreadygroupedMeter) {
                            if (alreadygroupedMeter.length > 0) {
                                toCheckIfNotGrouped(alreadygroupedMeter, "Meter", function (err, alreadygroupedMeter) {
                                    if (err) {
                                        callback(err, null)
                                    } else {
                                        collectionName.updateMany({ "MeterID": { $in: MID } }, { $set: { "TransformerID": TID } }, function (err, meterToTransformer) {
                                            if (err)
                                                insertError.putErrorDetails(err, callback);
                                            else {
                                                if (meterToTransformer.length !== 0) {
                                                    collectionName1.find({ "TransformerID": TID }, { "NoOfMeterAllocated": 1, "_id": 0 }).toArray(function (err, NoOfMeterAllocatedCount) {
                                                        if (err) {
                                                            callback(err, null);
                                                        } else {
                                                            var MeterAllocatedToUpdate = 0;
                                                            if (NoOfMeterAllocatedCount !== null) {
                                                                for (var i in NoOfMeterAllocatedCount) {
                                                                    if (NoOfMeterAllocatedCount.hasOwnProperty(i))
                                                                        MeterAllocatedToUpdate = NoOfMeterAllocatedCount[i].NoOfMeterAllocated;
                                                                }
                                                                MeterAllocatedToUpdate = MeterAllocatedToUpdate + MIDCount;
                                                                collectionName1.update({ "TransformerID": TID }, { $set: { NoOfMeterAllocated: MeterAllocatedToUpdate } }, function (err, CircuitAllocatedUpdated) {
                                                                    if (err)
                                                                        insertError.putErrorDetails(err, callback);
                                                                    else {

                                                                        hypersproutCollection.find({ "TransformerID": TID, "Status": "Registered" }, { "Hypersprout_DeviceDetails.CountryCode": 1, "HypersproutID": 1, "Hypersprout_DeviceDetails.RegionCode": 1, "DeviceID": 1, "HypersproutSerialNumber": 1, "MessageID": 1, "ProtocolVersion": 1, "Status": 1 }).toArray(function (err, HSDatas) {
                                                                            if (err)
                                                                                insertError.putErrorDetails(err, callback);
                                                                            else if (HSDatas.length > 0) {
                                                                                let msgID, JobType;
                                                                                let hsCount = HSDatas.length;
                                                                                let index = 0;
                                                                                HSDatas.forEach(function (HSData) {
                                                                                    if ((HSData.MessageID == 255) || (HSData.MessageID == null) || (HSData.MessageID == undefined) || (isNaN(HSData.MessageID)))
                                                                                        msgID = 0;
                                                                                    else
                                                                                        msgID = ++HSData.MessageID;
                                                                                    var jobdoc = [];
                                                                                    JobType = "Mac ACl Meter Registration"
                                                                                    for (var key in MMacId) {
                                                                                        jobdoc.push({
                                                                                            "JobID": shortid.generate(),
                                                                                            "DeviceID": HSData.DeviceID,
                                                                                            "SerialNumber": HSData.HypersproutSerialNumber,
                                                                                            "DeviceType": "Meter",
                                                                                            "JobName": "Registration Job",
                                                                                            "JobType": JobType,
                                                                                            "Status": "Pending",
                                                                                            "Group": "NA",
                                                                                            "MessageID": msgID,
                                                                                            "CreatedDateTimestamp": new Date(),
                                                                                            "MacID": MMacId[key]
                                                                                        });
                                                                                    }
                                                                                    sendMacIDs(collectionName1, MMacId, msgID, HSData, JobType, function (err, resp) {
                                                                                        for (var key in jobdoc) {
                                                                                            jobdoc[key].PacketSent = resp;
                                                                                        }
                                                                                        index++;
                                                                                        if (index == hsCount) {
                                                                                            jobsCollection.insertMany(jobdoc, function (err, response) {
                                                                                                if (err) {
                                                                                                    callback(err, null)
                                                                                                } else {
                                                                                                    callback(null, "Meter Successfully Grouped with Transformer!")

                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                })

                                                                            } else {
                                                                                callback(null, "Meter Successfully Grouped with Transformer!");
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

                            }
                        })

                    } else {
                        return callback("Invalid Meter ID(s)!!", null)
                    }
                } else {
                    return callback("Meter Not Found!!", null)
                }
            })
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

};

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
function sendMacIDs(hypersproutCollection, macids, messageid, HSDetail, JobType, callback) {
    try {
        for (var i = 0; i < macids.length; i++) {
            if ((macids[i] != '') || (macids[i] != null))
                macids[i] = macids[i].replace(/:/g, "");
            else
                delete macids[i];
        }
        let rev = (HSDetail.ProtocolVersion == "null") || (HSDetail.ProtocolVersion == null) || (HSDetail.ProtocolVersion == undefined) || (HSDetail.ProtocolVersion == "") ? 0 : HSDetail.ProtocolVersion;
        let countrycode = (HSDetail.Hypersprout_DeviceDetails.CountryCode == "null") || (HSDetail.Hypersprout_DeviceDetails.CountryCode == null) || (HSDetail.Hypersprout_DeviceDetails.CountryCode == undefined) || (HSDetail.Hypersprout_DeviceDetails.CountryCode == "") ? 0 : HSDetail.Hypersprout_DeviceDetails.CountryCode;
        let regioncode = (HSDetail.Hypersprout_DeviceDetails.RegionCode == "null") || (HSDetail.Hypersprout_DeviceDetails.RegionCode == null) || (HSDetail.Hypersprout_DeviceDetails.RegionCode == undefined) || (HSDetail.Hypersprout_DeviceDetails.RegionCode == "") ? 0 : HSDetail.Hypersprout_DeviceDetails.RegionCode;
        var data = {
            "rev": rev,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": HSDetail.HypersproutID,
            "meterid": 0,
            // "attribute": "ALL_DEVICE",
            "Purpose": "SendMACIDs",
            "Length": macids.length,
            "MacIDDetails": macids
        };
        data.action = "MAC_ACL";
        if ((JobType == "Mac ACl Meter Registration") || (JobType == "Mac ACl Deltalink Registration") || (JobType == "Mac ACl HH Registration")) {
            data.attribute = "MAC_ACL_REGISTER";
            if (JobType == "Mac ACl Meter Registration")
                data.deviceType = "meshcard";
            else if (JobType == "Mac ACl HH Registration")
                data.deviceType = "hyperhub";
            else
                data.deviceType = "deltalink";
        } else if ((JobType == "Mac ACl Meter Deregistration") || (JobType == "Mac ACl Deltalink Deregistration")) {
            data.attribute = "MAC_ACL_DEREGISTER";
            if (JobType == "Mac ACl Meter Deregistration")
                data.deviceType = "meshcard";
            else
                data.deviceType = "deltalink";
        } else {
            data.attribute = "MAC_ACL_UPDATE";
            data.update = macids[0].replace(/:/g, "");
            data.Length = 1;
            if (JobType == "Mac Acl Meter Update") {
                data.deviceType = "meshcard";
            } else
                data.deviceType = "deltalink";
        }
        parser.hexaCreation(data, function (err, response) {
            if (err)
                callback(err, null);
            else {
                sToIOT.sendToIOT(response, HSDetail.DeviceID, function (err, resp) {
                    if (err) {
                        callback(err, null)
                    } else {
                        callback(null, "success");
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}

/**
* @description - For the Webservice - RemovingMeterFromTransformer
* @params - collectionName, collectionName1, TransformerID, metIDs, removeMeterFromTransformerValues, callback 
* @return callback function
*/
function removeMeterFromTransformerFromMongoDB(collectionName, collectionName1, TransformerID, metIDs, removeMeterFromTransformerValues, callback) {
    try {
        var MID = [];
        var TID = TransformerID;
        var MIDCount = 0;
        var MIDDeregistered = [];

        collectionName.find({ "MeterID": { $in: metIDs } }, { MeterID: 1, _id: 0 }).toArray(function (err, meterForUngrouping) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else if (meterForUngrouping.length !== 0) {
                for (var i in meterForUngrouping) {
                    if (meterForUngrouping.hasOwnProperty(i)) {
                        MIDDeregistered.push(meterForUngrouping[i].MeterID);
                        MIDCount = MIDCount + 1;
                    }
                }
                MIDCount = MIDDeregistered.length;
                if (MIDDeregistered.length !== 0) {
                    collectionName.updateMany({ "MeterID": { $in: MIDDeregistered } }, { $set: { "TransformerID": 'null', "HypersproutID": 'null', "Status": "NotRegistered", "RegisteredTime": null } }, function (err, meterFromTransformer) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else {
                            if (meterFromTransformer.length !== 0) {
                                collectionName1.find({ "TransformerID": TransformerID }, { "NoOfMeterAllocated": 1, "_id": 0 }).toArray(function (err, NoOfMeterAllocatedCount) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        var MeterDeAllocatedToUpdate = 0;
                                        if (NoOfMeterAllocatedCount !== null) {
                                            for (var i in NoOfMeterAllocatedCount) {
                                                if (NoOfMeterAllocatedCount.hasOwnProperty(i))
                                                    MeterDeAllocatedToUpdate = NoOfMeterAllocatedCount[i].NoOfMeterAllocated;
                                            }
                                            MeterDeAllocatedToUpdate = MeterDeAllocatedToUpdate - MIDCount;
                                            collectionName1.update({ "TransformerID": TransformerID }, { $set: { NoOfMeterAllocated: MeterDeAllocatedToUpdate } }, function (err, CircuitAllocatedUpdated) {
                                                if (err)
                                                    insertError.putErrorDetails(error, callback);
                                                else
                                                    callback(null, "Meter Successfully Ungrouped from Transformer!");
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            } else
                callback(null, "Meter Ungroup not Successful due to Device Connectivity failure!");
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};
/**
* @description - meter UnGroup Details From MongoDB
* @params collectionName1, collectionName2, HSID, callback
* @return callback function
*/

function meterUnGroupDetailsFromMongoDB(collectionName1, collectionName2, HSID, callback) {
    try {
        collectionName1.find({ "HypersproutID": HSID },
            {
                "DeviceID": 1,
                "Status": 1,
                "TransformerID": 1,
                "Hypersprout_DeviceDetails.CountryCode": 1,
                "Hypersprout_DeviceDetails.RegionCode": 1, "_id": 0
            }).toArray(function (err, meterUngroupDetFetched) {
                if (err)
                    callback(err, null);
                else {
                    if (meterUngroupDetFetched.length > 0 &&
                        meterUngroupDetFetched[0].Status === "Registered") {
                        if (meterUngroupDetFetched[0].DeviceID) {
                            var DeviceID = meterUngroupDetFetched[0].DeviceID;
                            collectionName2.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 }).toArray(function (err, messageIDdetails) {
                                if (err)
                                    callback(err, null);
                                else {
                                    if (messageIDdetails.length > 0) {
                                        if (messageIDdetails[0].MessageID) {
                                            meterUngroupDetFetched.push(messageIDdetails[0].MessageID);
                                            callback(null, meterUngroupDetFetched);
                                        } else {
                                            callback("Message ID not found !!", null)
                                        }
                                    } else {
                                        callback("DeviceID not found !!", null)
                                    }
                                }
                            });
                        } else {
                            callback("Device not found!!", null)
                        }

                    } else {
                        callback(null, meterUngroupDetFetched);
                    }
                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - removing Meter From Transformer Response From sMongoDB
* @params collectionName, collectionName1, collectionName2, collectionName3, MID, MIDFailure, HypersproutID, callback 
* @return callback function
*/
function removingMeterFromTransformerResponseFromMongoDB(collectionName, collectionName1, collectionName2, collectionName3, MID, MIDFailure, HypersproutID, callback) {
    try {
        if ((MID.length !== 0) && (MIDFailure.length !== 0)) {
            collectionName.updateMany({ "MeterID": { $in: MID } }, { $set: { "TransformerID": null, "HypersproutID": null, "Status": "NotRegistered", "RegisteredTime": null } }, function (err, result) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else {
                    collectionName.find({ "MeterID": { $in: MID } }, { "UngroupingJobID": 1, "_id": 0 }).toArray(function (err, UngroupingJobIDFetched) {
                        if (err)
                            callback(err, null);
                        else {
                            if (UngroupingJobIDFetched !== 0) {
                                var JobID = [];
                                for (var i in UngroupingJobIDFetched) {
                                    if (UngroupingJobIDFetched.hasOwnProperty(i)) {
                                        JobID.push(UngroupingJobIDFetched[i].UngroupingJobID);
                                    }
                                }
                                collectionName3.updateMany({ JobID: { $in: JobID } }, { $set: { "Status": "Completed", "EndTime": new Date() } }, function (err, updateMeterUngroupJob) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        collectionName.find({ "MeterID": { $in: MIDFailure } }, { "UngroupingJobID": 1, "_id": 0 }).toArray(function (err, failedUngroupingJobIDFetched) {
                                            if (err)
                                                callback(err, null);
                                            else {
                                                if (failedUngroupingJobIDFetched !== 0) {
                                                    var JobID = [];
                                                    for (var i in failedUngroupingJobIDFetched) {
                                                        if (failedUngroupingJobIDFetched.hasOwnProperty(i)) {
                                                            JobID.push(failedUngroupingJobIDFetched[i].UngroupingJobID);
                                                        }
                                                    }
                                                    collectionName3.updateMany({ JobID: { $in: JobID } }, { $set: { Status: "Failed", EndTime: new Date() } }, function (err, updateMeterUngroupJob) {
                                                        if (err)
                                                            callback(err, null);
                                                        else {
                                                            collectionName1.find({ "TransformerID": HypersproutID }, { "NoOfMeterAllocated": 1, "_id": 0 }).toArray(function (err, NoOfMeterAllocatedCount) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    var MeterDeAllocatedToUpdate = 0;

                                                                    if (NoOfMeterAllocatedCount !== null) {
                                                                        for (var i in NoOfMeterAllocatedCount) {
                                                                            if (NoOfMeterAllocatedCount.hasOwnProperty(i))
                                                                                MeterDeAllocatedToUpdate = NoOfMeterAllocatedCount[i].NoOfMeterAllocated;
                                                                        }
                                                                        MeterDeAllocatedToUpdate = MeterDeAllocatedToUpdate - MID.length;
                                                                        collectionName1.update({ "TransformerID": HypersproutID }, { $set: { NoOfMeterAllocated: MeterDeAllocatedToUpdate } }, function (err, CircuitAllocatedUpdated) {
                                                                            if (err)
                                                                                insertError.putErrorDetails(error, callback);
                                                                            else
                                                                                callback(null, updateMeterUngroupJob);
                                                                        });
                                                                    } else {
                                                                        callback(null, updateMeterUngroupJob);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    callback('No data available', null);
                                                }
                                            }
                                        });
                                    }
                                });
                            } else {
                                callback('No data available', null);
                            }
                        }
                    });
                }
            });
        }
        else if ((MID.length !== 0) && (MIDFailure.length === 0)) {
            collectionName.updateMany({ "MeterID": { $in: MID } }, { $set: { "TransformerID": null, "HypersproutID": null, "Status": "NotRegistered", "RegisteredTime": null } }, function (err, result) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else {
                    collectionName.find({ "MeterID": { $in: MID } }, { "UngroupingJobID": 1, "_id": 0 }).toArray(function (err, UngroupingJobIDFetched) {
                        if (err)
                            callback(err, null);
                        else {
                            if (UngroupingJobIDFetched !== 0) {
                                var JobID = [];
                                for (var i in UngroupingJobIDFetched) {
                                    if (UngroupingJobIDFetched.hasOwnProperty(i)) {
                                        JobID.push(UngroupingJobIDFetched[i].UngroupingJobID);
                                    }
                                }
                                collectionName3.update({ JobID: { $in: JobID } }, { $set: { Status: "Completed", EndTime: new Date() } }, { multi: true }, function (err, updateMeterUngroupJob) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        //callback(null, updateMeterUngroupJob);
                                        collectionName1.find({ "TransformerID": HypersproutID }, { "NoOfMeterAllocated": 1, "_id": 0 }).toArray(function (err, NoOfMeterAllocatedCount) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                var MeterDeAllocatedToUpdate = 0;

                                                if (NoOfMeterAllocatedCount !== null) {
                                                    for (var i in NoOfMeterAllocatedCount) {
                                                        if (NoOfMeterAllocatedCount.hasOwnProperty(i))
                                                            MeterDeAllocatedToUpdate = NoOfMeterAllocatedCount[i].NoOfMeterAllocated;
                                                    }
                                                    MeterDeAllocatedToUpdate = MeterDeAllocatedToUpdate - MID.length;
                                                    collectionName1.update({ "TransformerID": HypersproutID }, { $set: { NoOfMeterAllocated: MeterDeAllocatedToUpdate } }, function (err, CircuitAllocatedUpdated) {
                                                        if (err)
                                                            insertError.putErrorDetails(error, callback);
                                                        else
                                                            callback(null, updateMeterUngroupJob);
                                                    });
                                                } else {
                                                    callback(null, updateMeterUngroupJob);
                                                }
                                            }
                                        });
                                    }
                                });
                            } else {
                                callback('No data available', null);
                            }
                        }
                    });
                }
            });
        } else if ((MID.length === 0) && (MIDFailure.length !== 0)) {
            collectionName.find({ "MeterID": { $in: MIDFailure } }, { "UngroupingJobID": 1, "_id": 0 }).toArray(function (err, failedUngroupingJobIDFetched) {
                if (err)
                    callback(err, null);
                else {
                    if (failedUngroupingJobIDFetched !== 0) {
                        var JobID = [];
                        for (var i in failedUngroupingJobIDFetched) {
                            if (failedUngroupingJobIDFetched.hasOwnProperty(i)) {
                                JobID.push(failedUngroupingJobIDFetched[i].UngroupingJobID);
                            }
                        }
                        collectionName3.updateMany({ JobID: { $in: JobID } }, { $set: { Status: "Failed", EndTime: new Date() } }, function (err, updateMeterUngroupJob) {
                            if (err)
                                callback(err, null);
                            else {
                                callback(null, updateMeterUngroupJob);
                            }
                        });
                    } else {
                        callback('No data available', null);
                    }
                }
            });
        } else {
            callback(null, "No Ungrouping Job to Update!!");
        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - removing Meter From Transformer Response From sMongoDB
* @params collectionName, collectionName1, collectionName2, collectionName3, MID, MIDFailure, HypersproutID, callback 
* @return callback function
*/
function removingDLFromMeterResponseFromMongoDB(collectionName, collectionName1, collectionName3, DID, status, messageid, callback) {
    try {
        if (DID) {
            collectionName.updateMany({ "DeltalinkID": DID }, { $set: { "Status": "NotRegistered", "RegisteredTime": null } }, function (err, result) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else {
                    collectionName.find({ "DeltalinkID": DID }, { "UngroupingJobID": 1, "_id": 0 }).toArray(function (err, UngroupingJobIDFetched) {
                        if (err)
                            callback(err, null);
                        else {
                            if (UngroupingJobIDFetched !== 0) {
                                var JobID = [];
                                for (var i in UngroupingJobIDFetched) {
                                    if (UngroupingJobIDFetched.hasOwnProperty(i)) {
                                        JobID.push(UngroupingJobIDFetched[i].UngroupingJobID);
                                    }
                                }
                                if (status == "Success") {
                                    jobStatus = "Completed";
                                } else {
                                    jobStatus = "Failed";
                                }
                                collectionName3.updateMany({ JobID: { $in: JobID } }, { $set: { "Status": jobStatus, "EndTime": new Date() } }, function (err, updateMeterUngroupJob) {
                                    if (err)
                                        callback(err, null);
                                    else {


                                        callback(null, updateMeterUngroupJob);
                                    }
                                });


                            } else {
                                callback(null, "No Ungrouping Job to Update!!");
                            }
                        }
                    });
                }
            });
        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

//Circuit validation
function circuitValidation(circuitCollection, where, callback) {
    circuitCollection.find(where).toArray(function (err, circuitDet) {
        if (err)
            callback(err, null);
        else {
            callback(null, circuitDet)
        }
    })


}


//to check if circuit is grouped or not

function toCheckIfCircuitGrouped(ArrayOfObject, CircuitID, Transformer, callback) {
    async.each(ArrayOfObject, function (ArrayOfObjectDetails, callbackEach) {
        if (ArrayOfObjectDetails.CircuitID !== CircuitID) {
            callbackEach("error", null)
        }
        else {
            callbackEach()
        }

    }, function (err, result) {
        if (!err) {
            callback(null, Transformer + " grouped");
        }
        else {
            callback("Either " + Transformer + " is not grouped or grouped to any other Circuit", null);
        }
    });

}

/**
* @description - For the Webservice - RemovingTransformerFromCircuit
* @params collectionName, collectionName1, removeTransformerFromCircuitValues1, callback 
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeTransformerFromCircuitFromMongoDB(collectionName, collectionName1, removeTransformerFromCircuitValues1, callback) {

    var TID = [];
    var TID1 = [];
    var CID1 = removeTransformerFromCircuitValues1.CircuitID;
    let CID;
    var TIDCount = 0;

    for (var i in removeTransformerFromCircuitValues1.TransformerID) {
        if (removeTransformerFromCircuitValues1.TransformerID.hasOwnProperty(i)) {
            TID1.push(removeTransformerFromCircuitValues1.TransformerID[i]);
            TIDCount = TID1 + 1;
        }
    }

    TID1 = (TID1).map(integerValue);

    circuitValidation(collectionName1, { "CircuitID": { $regex: new RegExp("^" + CID1 + "$", "i") } }, function (err, circuitDet) {
        if (err) {
            callback(err, null);
        }
        else {
            if (circuitDet.length > 0) {
                CID = circuitDet[0].CircuitID;
                transformerValidation(collectionName, { "TransformerID": { $in: TID1 } }, function (err, transformerDet) {
                    if (err) {
                        callback(err, null);
                    }
                    else if (transformerDet.length > 0) {
                        if (transformerDet.length == TID1.length) {
                            TIDCount = TID1.length;
                            toCheckIfCircuitGrouped(transformerDet, CID, "Transformer", function (err, result) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    collectionName.updateMany({ "TransformerID": { $in: TID1 } }, { $set: { "CircuitID": 'null' } }, function (err, transformerFromCircuit) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            if (transformerFromCircuit.length !== 0) {
                                                collectionName1.find({ "CircuitID": CID }, { "NoOfTransformerAllocated": 1, "_id": 0 }).toArray(function (err, NoOfTransformerAllocatedCount) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        var TransformerDeAllocatedToUpdate = 0;
                                                        if (NoOfTransformerAllocatedCount.length > 0) {
                                                            TransformerDeAllocatedToUpdate = NoOfTransformerAllocatedCount[0].NoOfTransformerAllocated;
                                                            TransformerDeAllocatedToUpdate = TransformerDeAllocatedToUpdate - TIDCount;
                                                            collectionName1.update({ "CircuitID": CID }, { $set: { NoOfTransformerAllocated: TransformerDeAllocatedToUpdate } }, function (err, CircuitAllocatedUpdated) {
                                                                if (err)
                                                                    insertError.putErrorDetails(err, callback);
                                                                else {
                                                                    // continue
                                                                    callback(null, "Transformer Successfully Ungrouped from DTC!");
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
                            callback("Either Transformer is not grouped or grouped to any other Circuit", null);
                        }

                    } else {
                        callback("Transformer not avialable !!", null)
                    }

                })

            } else {
                callback("Circuit not avialable !!", null)
            }

        }
    })





};
/**
* @description - remove Transformer From Circuit Details From MongoDB
* @params collectionName1, collectionName2, collectionName3, TID, callback
* @param callback - callback function returns success or error response
* @return callback function
*/
function removeTransFromCircuitDetailsFromMongoDB(collectionName1, collectionName2, collectionName3, TID, callback) {
    try {
        collectionName1.find({ "TransformerID": TID, IsHyperHub: false },
            { "HypersproutSerialNumber": 1, "HypersproutID": 1, "DeviceID": 1, "Hypersprout_DeviceDetails.CountryCode": 1, "Hypersprout_DeviceDetails.RegionCode": 1, "Status": 1, "_id": 0 }).toArray(function (err, TransformerDetails) {
                if (err)
                    callback(err, null);
                else if (TransformerDetails.length > 0) {
                    if (TransformerDetails[0].Status === "Registered") {
                        if (TransformerDetails[0].DeviceID) {
                            var DeviceID = TransformerDetails[0].DeviceID;
                            collectionName2.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 }).toArray(function (err, messageIDdetails) {
                                if (err)
                                    callback(err, null);
                                else {
                                    if (messageIDdetails.length > 0) {
                                        if (messageIDdetails[0].MessageID) {
                                            TransformerDetails.push(messageIDdetails[0].MessageID);
                                            callback(null, TransformerDetails);

                                        } else {
                                            callback("Message ID not found!", null)
                                        }
                                    }
                                }
                            });
                        } else {
                            callback("Device ID not found !!", null)

                        }


                    } else {
                        callback(null, TransformerDetails);
                    }
                } else {
                    callback(null, "Hypersprout not available");

                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

};
/**
* @description - removing Transformer From Circuit Response From MongoDB
* @params - ollectionName, collectionName1, collectionName2, HID, Status, callback
* @return callback function
*/
function removingTransformerFromCircuitResponseFromMongoDB(collectionName, collectionName1, collectionName2, HID, Status, callback) {
    try {
        collectionName1.find({ HypersproutID: HID }, { TransformerID: 1, _id: 0 }).toArray(function (err, TransformerIDFetched) {
            if (err)
                callback(err, null);
            else {
                if (TransformerIDFetched.length) {
                    if (TransformerIDFetched[0].TransformerID != undefined) {
                        var TID = TransformerIDFetched[0].TransformerID;
                        collectionName.find({ TransformerID: TID }, { UngroupingJobID: 1 }).toArray(function (err, UngroupJobID) {
                            if (err)
                                callback(err, null);
                            else {
                                if (UngroupJobID.length) {
                                    if (UngroupJobID[0].UngroupingJobID != undefined) {
                                        var JobID = UngroupJobID[0].UngroupingJobID;
                                        if (Status === "Success") {
                                            collectionName1.update({ HypersproutID: HID }, { $set: { "Status": "NotRegistered", "RegisteredTime": null } }, function (err, updateHypersproutDeregister) {
                                                if (err)
                                                    callback(err, null);
                                                else {
                                                    collectionName2.update({ JobID: JobID }, { $set: { "Status": "Completed", "EndTime": new Date() } }, function (err, updateTransformerJob) {
                                                        if (err)
                                                            callback(err, null);
                                                        else
                                                            callback(null, updateTransformerJob);
                                                    });
                                                }
                                            });
                                        } else {
                                            collectionName2.update({ JobID: JobID }, { $set: { "Status": "Failed", "EndTime": new Date() } }, function (err, updateTransformerJob) {
                                                if (err)
                                                    callback(err, null);
                                                else
                                                    callback(null, "Unable to Deregister Transformer from Device");
                                            });
                                        }
                                    } else {
                                        callback('No data available', null);
                                    }
                                } else {
                                    callback('No data available', null);
                                }
                            }
                        });
                    } else {
                        callback('No data available', null);
                    }
                } else {
                    callback('No data available', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - removing HH From Transformer Response From MongoDB
* @params - hyperhubCollection, jobsCollection, HID, Status, callback
* @return callback function
*/
function removingHHFromTransformerResponseFromMongoDB(hyperhubCollection, jobsCollection, HID, Status, callback) {
    try {
        hyperhubCollection.find({ HypersproutID: HID }, { "HHUngroupingJobID": 1, _id: 0 }).toArray(function (err, UngroupJobID) {
            if (err)
                callback(err, null);
            else {
                //var TID = TransformerIDFetched[0].TransformerID;
                if (UngroupJobID.length) {
                    if (UngroupJobID[0].HHUngroupingJobID != undefined) {
                        var JobID = UngroupJobID[0].HHUngroupingJobID;
                        if (Status === "Success") {
                            hyperhubCollection.update({ HypersproutID: HID }, { $set: { "Status": "NotRegistered", "RegisteredTime": null } }, function (err, _updateHypersproutDeregister) {
                                if (err)
                                    callback(err, null);
                                else {
                                    jobsCollection.update({ JobID: JobID }, { $set: { "Status": "Completed", "EndTime": new Date() } }, function (err, updateTransformerJob) {
                                        if (err)
                                            callback(err, null);
                                        else
                                            callback(null, updateTransformerJob);
                                    });
                                }
                            });
                        } else {
                            jobsCollection.update({ JobID: JobID }, { $set: { "Status": "Failed", "EndTime": new Date() } }, function (err, _updateTransformerJob) {
                                if (err)
                                    callback(err, null);
                                else
                                    callback(null, "Unable to Deregister Transformer from Device");
                            });
                        }
                    } else {
                        callback('No data available', null);
                    }
                } else {
                    callback('No data available', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - transformer Deregister Insert From MongoDB
* @params collectionName, collectionName1, TID, HypersproutSerialNumber, parsedData, callback
* @return callback function
*/
function transformerDeregisterInsertFromMongoDB(collectionName, collectionName1, TID, HypersproutSerialNumber, parsedData, callback) {
    try {
        var jobInsert = {
            "JobID": shortid.generate(),
            "DeviceID": TID,
            "SerialNumber": HypersproutSerialNumber,
            "DeviceType": "HyperSprout",
            "JobName": "Registration Job",
            "JobType": "Transformer UnGroup",
            "Status": "Pending",
            "Group": "None",
            "CreatedDateTimestamp": new Date(),
            "PacketSent": parsedData
        };
        var JobID = [];
        collectionName1.insertOne(jobInsert, function (err, jobsInserted) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                collectionName.update({ TransformerID: TID }, { $set: { "UngroupingJobID": jobInsert.JobID } }, function (err, updateTransformerDeregisterReq) {
                    if (err)
                        callback(err, null);
                    else {
                        JobID = jobInsert.JobID;
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
* @description - hyperhub Deregister Insert From MongoDB
* @params hyperhubCollection, jobsCollection, HID, HyperhubSerialNumber, parsedData, callback
* @param callback - callback function returns success or error response
* @return callback function
*/
function hyperhubDeregisterInsertFromMongoDB(hyperhubCollection, jobsCollection, HID, HyperhubSerialNumber, parsedData, callback) {
    try {
        var jobInsert = {
            "JobID": shortid.generate(),
            "DeviceID": HID,
            "SerialNumber": HyperhubSerialNumber,
            "DeviceType": "Hyperhub",
            "JobName": "Registration Job",
            "JobType": "Hyperhub UnGroup",
            "Status": "Pending",
            "Group": "None",
            "CreatedDateTimestamp": new Date(),
            "PacketSent": parsedData
        };
        var JobID = jobInsert.JobID;
        jobsCollection.insertOne(jobInsert, function (err, jobsInserted) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                hyperhubCollection.update({ HypersproutSerialNumber: HyperhubSerialNumber }, { $set: { "HHUngroupingJobID": jobInsert.JobID } }, function (err, _updateHHDeregisterReq) {
                    if (err)
                        callback(err, null);
                    else {
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
* @description - For the Webservice - EditMeterDetails 
* @params collectionName, collectionName1, MeterID, jobToInsert, callback 
* @return callback function
*/
function MeterWifiPassJobInsertFromMongoDB(collectionName, collectionName1, MeterID, jobToInsert, callback) {
    try {
        var JobID = [];
        collectionName.insertOne(jobToInsert, function (err, jobsInserted) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                collectionName1.update({ "MeterID": MeterID }, { "$set": { "WifiPassEditJobID": jobToInsert.JobID, "WifiPasswordChangeStatus": "Sent" } }, function (err, jobDetailsUpdatedMeters) {
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
* @description - Meter Wifi Password Request Delayed MongoDB
* @params collectionName, MeterID, JobID, callback
* @return callback function
*/
function MeterWifiPassRequestDelayedMongoDB(collectionName, MeterID, JobID, callback) {
    collectionName.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, meterWifiPassJobStatus) {
        if (err)
            callback(err, null);
        else {
            var Status = meterWifiPassJobStatus[0].Status;
            if (Status === "Pending") {
                collectionName.update({ "JobID": JobID }, { "$set": { "Status": "Failed", "EndTime": new Date() } }, function (err, delayStatusUpdate) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else
                        callback(null, "Meter WifiPass Delayed in Response Successfully handled!");
                });
            }
            else
                callback(null, "Meter WifiPass Delayed Successfully Completed!");
        }
    });
};

/**
* @description - For the Webservice - EditTransformerHypersproutDetails 
* @params collectionName, collectionName1, HSID, jobToInsert, callback
* @return callback function
*/
function HSWifiPassJobInsertFromMongoDB(collectionName, collectionName1, HSID, jobToInsert, callback) {
    try {
        var JobID = [];
        collectionName.insertOne(jobToInsert, function (err, HSJobsInserted) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                collectionName1.update({ "HypersproutID": HSID }, { "$set": { "WifiPassEditJobID": jobToInsert.JobID } }, function (err, jobDetailsUpdatedMeters) {
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
* @description - HS Wifi Password Request Delayed
* @params collectionName, HypersproutID, JobID, callback
* @return callback function
*/
function HSWifiPassRequestDelayedMongoDB(collectionName, HypersproutID, JobID, callback) {
    try {
        collectionName.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, HSWifiPassJobStatus) {
            if (err)
                callback(err, null);
            else {
                var Status = HSWifiPassJobStatus[0].Status;
                if (Status === "Pending") {
                    collectionName.update({ "JobID": JobID }, { "$set": { "Status": "Failed", "EndTime": new Date() } }, function (err, delayStatusUpdate) {
                        if (err)
                            insertError.putErrorDetails(err, callback);
                        else
                            callback(null, "Hypersprout WifiPass Delayed in Response Successfully handled!");
                    });
                }
                else
                    callback(null, "Hypersprout WifiPass Delayed Successfully Completed!");
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};

/**
* @description - meter Deregister Insert From MongoDB
* @params collectionName, collectionName1, result, meterId, deviceID, callback
* @return callback function
*/
function meterDeregisterInsertFromMongoDB(collectionName, collectionName1, result, meterId, deviceID, callback) {
    try {
        var MeterJobs = [];
        collectionName.find({ "MeterID": { "$in": meterId } }, { "MeterID": 1, "MeterSerialNumber": 1, "_id": 0 }).toArray(function (err, meterDetails) {
            if (err)
                callback(err, null);
            else {
                for (var i in meterDetails) {
                    if (meterDetails.hasOwnProperty(i)) {
                        var doc = {
                            "JobID": shortid.generate(),
                            "DeviceID": deviceID,
                            "SerialNumber": meterDetails[i].MeterSerialNumber,
                            "DeviceType": "Meter",
                            "JobName": "Registration Job",
                            "JobType": "Meter UnGroup",
                            "Status": "Pending",
                            "Group": "None",
                            "PacketSent": result,
                            "CreatedDateTimestamp": new Date()
                        };
                        MeterJobs.push(doc);
                    }
                }
                collectionName1.insertMany(MeterJobs, function (err, result) {
                    if (err)
                        callback(err, null);
                    else {
                        for (var i in MeterJobs) {
                            if (MeterJobs.hasOwnProperty(i)) {
                                collectionName.update({ "MeterSerialNumber": MeterJobs[i].SerialNumber }, { "$set": { "UngroupingJobID": MeterJobs[i].JobID } }, function (err, result) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else {
                                        // continue
                                    }
                                });
                            }
                        }
                        callback(err, result);
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description - For the Webservice - AddingDeltalinkToMeter    Desc - Group Deltalink with Meter IN MONGODB 
* @params addDeltalinkToMeterValues, callback
* @return callback function
*/

function addDeltalinkToMeter(addDeltalinkToMeterValues, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            addDeltalinkToMeterFromMongoDB(db.delta_DeltaLink, db.delta_Meters, db.delta_Hypersprouts, db.delta_Jobs, addDeltalinkToMeterValues, callback);
    });
};



/**
* @description - For the Webservice - AddingDeltalinkToMeter
* @params deltalinkCollection, meterCollection, hypersproutCollection, jobsCollection, addDeltalinkToMeterValues,  callback
* @return callback function
*/
function addDeltalinkToMeterFromMongoDB(deltalinkCollection, meterCollection, hypersproutCollection, jobsCollection, addDeltalinkToMeterValues, callback) {
    addDeltalinkToMeterValues.MeterID = parseInt(addDeltalinkToMeterValues.MeterID);
    // map() return a new array of LogID having only integer values and  integerValue function return an Integer values
    addDeltalinkToMeterValues.DeltalinkID = (addDeltalinkToMeterValues.DeltalinkID).map(integerValue);
    let DID = addDeltalinkToMeterValues.DeltalinkID;
    let MID = addDeltalinkToMeterValues.MeterID;
    let DIDCount = 0;
    let deltalinkToGroup = [];
    let DMacId = [];
    if (DID.length !== 0) {
        if (DID.length > 2) {
            callback("You can not link more than two Deltalink!!", null)
        } else {
            deltalinkValidation(deltalinkCollection, { "DeltalinkID": { $in: DID } }, function (err, deltalinkDetails) {
                if (err)
                    insertError.putErrorDetails(err, callback);
                else if (deltalinkDetails.length > 0) {
                    toCheckIfDeltalinkNotGrouped(deltalinkDetails, "Deltalink", function (err, alreadygroupedDeltalink) {
                        if (err) {
                            callback(err, null)
                        } else {
                            if (alreadygroupedDeltalink.dID.length > 0) {
                                for (var i in alreadygroupedDeltalink.dID) {
                                    if (alreadygroupedDeltalink.dID.hasOwnProperty(i)) {
                                        deltalinkToGroup.push(alreadygroupedDeltalink.dID[i].ID)
                                        DMacId.push(alreadygroupedDeltalink.dID[i].macId);
                                    }
                                }
                                DIDCount = deltalinkToGroup.length;
                                deltalinkCollection.updateMany({ "DeltalinkID": { $in: deltalinkToGroup } }, { $set: { "MeterID": MID } }, function (err, deltalinkToMeter) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else {
                                        if (deltalinkToMeter.length !== 0) {
                                            meterCollection.find({ "MeterID": MID }, { "NoOfDeltalinkAllocated": 1, "_id": 0 }).toArray(function (err, NoOfDeltalinkAllocatedCount) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    var DeltalinkAllocatedToUpdate = 0;
                                                    if (NoOfDeltalinkAllocatedCount !== null) {
                                                        for (var i in NoOfDeltalinkAllocatedCount) {
                                                            if (NoOfDeltalinkAllocatedCount.hasOwnProperty(i)) {
                                                                if (isNaN(NoOfDeltalinkAllocatedCount[i].NoOfDeltalinkAllocated) || NoOfDeltalinkAllocatedCount[i].NoOfDeltalinkAllocated == null || NoOfDeltalinkAllocatedCount[i].NoOfDeltalinkAllocated == "null" || NoOfDeltalinkAllocatedCount[i].NoOfDeltalinkAllocated == undefined) {
                                                                    DeltalinkAllocatedToUpdate = 0;
                                                                } else {
                                                                    DeltalinkAllocatedToUpdate = NoOfDeltalinkAllocatedCount[i].NoOfDeltalinkAllocated;
                                                                }
                                                            }
                                                        }
                                                        DeltalinkAllocatedToUpdate = DeltalinkAllocatedToUpdate + DIDCount;
                                                        meterCollection.update({ "MeterID": MID }, { $set: { NoOfDeltalinkAllocated: DeltalinkAllocatedToUpdate } }, function (err, DeltalinkAllocatedToUpdate) {
                                                            if (err) {
                                                                insertError.putErrorDetails(err, callback);
                                                            }
                                                            else {
                                                                meterValidation(meterCollection, { "MeterID": MID }, function (err, meterDet) {
                                                                    if (err) {
                                                                        callback(err, null);
                                                                    } else if (meterDet.length > 0) {
                                                                        if (meterDet[0].TransformerID) {
                                                                            hypersproutCollection.find({ "TransformerID": meterDet[0].TransformerID, "Status": "Registered" }, { "Hypersprout_DeviceDetails.CountryCode": 1, "HypersproutID": 1, "Hypersprout_DeviceDetails.RegionCode": 1, "DeviceID": 1, "HypersproutSerialNumber": 1, "MessageID": 1, "ProtocolVersion": 1, "Status": 1 }).toArray(function (err, HSDatas) {
                                                                                if (err)
                                                                                    insertError.putErrorDetails(err, callback);
                                                                                else if (HSDatas.length > 0) {
                                                                                    var msgID, JobType;
                                                                                    var hsCount = HSDatas.length;
                                                                                    var i = 0;
                                                                                    HSDatas.forEach(function (HSData) {
                                                                                        if ((HSData.MessageID == 255) || (HSData.MessageID == null) || (HSData.MessageID == undefined) || (isNaN(HSData.MessageID)))
                                                                                            msgID = 0;
                                                                                        else
                                                                                            msgID = ++HSData.MessageID;
                                                                                        var jobdoc = [];
                                                                                        JobType = "Mac ACl Deltalink Registration"
                                                                                        for (var key in DMacId) {
                                                                                            jobdoc.push({
                                                                                                "JobID": shortid.generate(),
                                                                                                "DeviceID": HSData.DeviceID,
                                                                                                "SerialNumber": HSData.HypersproutSerialNumber,
                                                                                                "DeviceType": "Circuit",
                                                                                                "JobName": "Registration Job",
                                                                                                "JobType": JobType,
                                                                                                "Status": "Pending",
                                                                                                "Group": "NA",
                                                                                                "MessageID": msgID,
                                                                                                "CreatedDateTimestamp": new Date(),
                                                                                                "MacID": DMacId[key]
                                                                                            });
                                                                                        }
                                                                                        sendMacIDs(hypersproutCollection, DMacId, msgID, HSData, JobType, function (err, resp) {
                                                                                            for (var key in jobdoc) {
                                                                                                jobdoc[key].PacketSent = resp;
                                                                                            }
                                                                                            i++;
                                                                                            if (i == hsCount) {
                                                                                                jobsCollection.insertMany(jobdoc, function (err, response) {
                                                                                                    if (err) {
                                                                                                        callback(err, null)
                                                                                                    } else {
                                                                                                        callback(null, "Deltalink Successfully Linked with Meter!", alreadygroupedDeltalink.errorFinal)

                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    });
                                                                                } else {
                                                                                    callback(null, "Deltalink Successfully Linked with Meter!", alreadygroupedDeltalink.errorFinal);
                                                                                }
                                                                            });
                                                                        } else {
                                                                            callback("Delta Link grouped with the meter but meter not grouped with transformer", null)
                                                                        }

                                                                    } else {
                                                                        callback("Meter not available", null)
                                                                    }
                                                                })

                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            } else { callback(null, "Deltalink can't link", alreadygroupedDeltalink.errorFinal) }
                        }
                    })

                } else {
                    return callback("Invalid Deltalink ID(s)!!", null)
                }
            })
        }
    } else {
        callback("Deltalink Not Found!!", null)
    }
};


//function to check Deltalink  already grouped with meter or not

function toCheckIfDeltalinkNotGrouped(ArrayOfObject, Device, callback) {
    let Id = [];
    let ID;
    let dID = [];
    let errorFinal = [];
    let data;
    let macId;
    let DData = []
    async.each(ArrayOfObject, function (ArrayOfObjectDetails, callbackEach) {
        ID = ArrayOfObjectDetails.DeltalinkID;
        condition = ArrayOfObjectDetails.MeterID;
        key = "Meter";
        macId = ArrayOfObjectDetails.DeltaLinks_Communications.MAC_ID_WiFi;
        DData = { ID, macId }

        // if Device not grouped with associated item
        if (condition == null || condition == "null" || condition == undefined) {
            dID.push(DData)
            callbackEach()
        }
        else {
            Id.push(ID)
            callbackEach()
        }

    }, function (err, result) {
        for (let i in Id) {
            errorFinal.push(Id[i] + " " + Device + " already linked to the " + key + " !!")
        }
        data = { dID, errorFinal }
        if (!err) {
            callback(null, data);
        }
        else {
            callback("something went wrong !!", null)

        }
    });

}



/**
* @description - For the Webservice - to check Meter Id exists or not , to check Deltalink is grouped or not   
* @param deltalinkID
* @param meterID  
* @param callback - callback function returns success or error response
* @return callback function
*/
function deltalinkMeterValidation(meterID, deltalinkID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            deltalinkMeterValidationFromMongoDB(db.delta_DeltaLink, db.delta_Meters, meterID, deltalinkID, callback);
    });
};


/**
* @description - For the Webservice - to check Meter Id exists or not , to check Deltalink is grouped or not , SELECT Deltalink grouping details with meter  FROM MONGODB 
* @param deltalinkCollection
* @param meterCollection
* @param meterID  
* @param deltalinkID  
* @param callback - callback function returns success or error response
* @return callback function
*/

function deltalinkMeterValidationFromMongoDB(deltalinkCollection, meterCollection, meterID, deltalinkID, callback) {
    meterValidation(meterCollection, { "MeterID": meterID }, function (err, meterDet) {
        if (err)
            callback(err, null);
        else {
            if (meterDet.length > 0) {
                deltalinkValidation(deltalinkCollection, { "DeltalinkID": { $in: deltalinkID } }, function (err, deltalinkgroupDet) {
                    if (err)
                        callback(err, null);
                    else if (deltalinkgroupDet.length > 0) {
                        toCheckIfMeterGrouped(deltalinkgroupDet, meterID, "Deltalink", function (err, result) {
                            if (err) {
                                callback(err, null)

                            } else {
                                callback(null, result)
                            }
                        })

                    } else {
                        callback("Deltalink not available!!", null);
                    }
                });

            } else {
                callback("Meter not available!!", null);
            }
        }
    });

}



/**
* @description - For the Webservice - to check if deltalink is grouped or not
* @param ArrayOfObject object 
* @param meterID  
* @param callback - callback function returns success or error response
* @return callback function
*/

function toCheckIfMeterGrouped(ArrayOfObject, meterID, Deltalink, callback) {
    let errorFinal = [];
    let deltalinkId = [];
    var deltalinArr;
    async.each(ArrayOfObject, function (ArrayOfObjectDetails, callbackEach) {
        if (ArrayOfObjectDetails.MeterID == null || ArrayOfObjectDetails.MeterID == "null" || ArrayOfObjectDetails.MeterID == undefined) {
            errorFinal.push("Deltalink - " + ArrayOfObjectDetails.DeltalinkID + " is not linked !")
            callbackEach()
        } else if (ArrayOfObjectDetails.MeterID !== meterID && (ArrayOfObjectDetails.MeterID != null || ArrayOfObjectDetails.MeterID != "null")) {
            errorFinal.push("Deltalink - " + ArrayOfObjectDetails.DeltalinkID + " is linked to any other Meter " + ArrayOfObjectDetails.MeterID)
            callbackEach()
        } else {
            //deltalinkId.push(ArrayOfObjectDetails.DeltalinkID)
            deltalinArr = {};
            deltalinArr.DeltalinkID = ArrayOfObjectDetails.DeltalinkID;
            deltalinArr.DeltalinkMac = ArrayOfObjectDetails.DeltaLinks_Communications.MAC_ID_WiFi;
            deltalinkId.push(deltalinArr);
            callbackEach()
        }

    }, function (err, result) {
        if (!err) {
            let data = { deltalinkId, errorFinal }
            callback(null, data);
        }
        else {
            callback("Either " + Deltalink + " is not linked or linked to any other meter", null);
        }
    });

}


/**
* @description - For the Webservice - RemovingDeltalinkFromMeter, Fetching Details for sending req to IoT 
* @params meterID, callback
* @return callback function
*/
function deltalinkUnGroupDetails(meterID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            deltalinkUnGroupDetailsFromMongoDB(db.delta_Meters, db.delta_Hypersprouts, db.delta_SchedulerFlags, meterID, callback);
    });
};


/**
* @description - deltalink UnGroup Details From MongoDB
* @params meterCollection, collectionName1, collectionName2, meterID, callback
* @return callback function
*/
function deltalinkUnGroupDetailsFromMongoDB(meterCollection, collectionName1, collectionName2, meterID, callback) {
    let HSID;
    meterValidation(meterCollection, { "MeterID": meterID }, function (err, metergroupDet) {
        if (err)
            callback(err, null);
        else if (metergroupDet.length > 0) {
            if (metergroupDet[0].TransformerID) {
                HSID = metergroupDet[0].TransformerID;
                collectionName1.find({ "TransformerID": HSID },
                    {
                        "DeviceID": 1,
                        "Status": 1,
                        "TransformerID": 1,
                        "Hypersprout_DeviceDetails.CountryCode": 1,
                        "Hypersprout_DeviceDetails.RegionCode": 1, "_id": 0
                    }).toArray(function (err, deltalinkUngroupDetFetcheds) {
                        if (err)
                            callback(err, null);
                        else {
                            var i = 0;
                            if (deltalinkUngroupDetFetcheds.length > 0) {
                                deltalinkUngroupDetFetcheds.forEach(function (deltalinkUngroupDetFetched, index) {

                                    if (deltalinkUngroupDetFetched.Status === "Registered") {
                                        var DeviceID = deltalinkUngroupDetFetched.DeviceID;
                                        collectionName2.find({ "DeviceID": DeviceID }, { "MessageID": 1, "_id": 0 }).toArray(function (err, messageIDdetails) {
                                            if (err)
                                                callback(err, null);
                                            else {
                                                i++;
                                                if (messageIDdetails.length > 0) {
                                                    deltalinkUngroupDetFetched["MessageID"] = messageIDdetails[0].MessageID;
                                                }
                                                if (deltalinkUngroupDetFetcheds.length == i)
                                                    callback(null, deltalinkUngroupDetFetcheds);
                                            }
                                        });
                                    }
                                    else {
                                        if (deltalinkUngroupDetFetcheds.length == i)
                                            callback(null, deltalinkUngroupDetFetcheds);
                                        else {
                                            deltalinkUngroupDetFetcheds.splice(index, 1);
                                            if (deltalinkUngroupDetFetcheds.length == i)
                                                callback(null, deltalinkUngroupDetFetcheds);
                                            return;
                                        }

                                    }
                                });
                            } else
                                callback("Sucesss", null)

                        }
                    });
            } else {
                callback("Sucesss", null)
            }
        } else {
            callback("Meter is not available!!", null)
        }
    })
};


/**
* @description - For the Webservice - RemovingDeltalinkFromMeter
* @params  result, deltalinkID, deviceID,  callback
* @return callback function
*/

function deltalinkDeregisterInsert(result, deltalinkID, deviceID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            deltalinkDeregisterInsertFromMongoDB(db.delta_DeltaLink, db.delta_Jobs, result, deltalinkID, deviceID, callback);
    });
};


/**
* @description - deltalink Deregister Insert From MongoDB
* @params deltalinkCollection,  jobsCollection, result, deltalinkID, deviceID,  callback
* @return callback function
*/
function deltalinkDeregisterInsertFromMongoDB(deltalinkCollection, jobsCollection, result, deltalinkID, deviceID, callback) {
    var deltalinkJobs = [];
    deltalinkCollection.find({ "DeltalinkID": { "$in": deltalinkID } }, { "DeltalinkID": 1, "DeltalinkSerialNumber": 1, "_id": 0 }).toArray(function (err, deltalinkDetails) {
        if (err)
            callback(err, null);
        else {
            for (var i in deltalinkDetails) {
                if (deltalinkDetails.hasOwnProperty(i)) {
                    var doc = {
                        "JobID": shortid.generate(),
                        "DeviceID": deviceID,
                        "SerialNumber": deltalinkDetails[i].DeltalinkSerialNumber,
                        "DeviceType": "DeltaLink",
                        "JobName": "Registration Job",
                        "JobType": "DeltaLink UnLink",
                        "Status": "Pending",
                        "Group": "None",
                        "PacketSent": result,
                        "CreatedDateTimestamp": new Date()
                    };
                    deltalinkJobs.push(doc);
                }
            }
            jobsCollection.insertMany(deltalinkJobs, function (err, result) {
                if (err)
                    callback(err, null);
                else {
                    for (var i in deltalinkJobs) {
                        if (deltalinkJobs.hasOwnProperty(i)) {
                            deltalinkCollection.update({ "DeltalinkSerialNumber": deltalinkJobs[i].SerialNumber }, { "$set": { "UngroupingJobID": deltalinkJobs[i].JobID } }, function (err, result) {
                                if (err)
                                    insertError.putErrorDetails(err, callback);
                                else {
                                    // continue
                                }
                            });
                        }
                    }
                    callback(err, result);
                }
            });
        }
    });
};

/**
* @description - For the Webservice - RemovingDeltalinkFRomMeter 
* @params deltalinkIDs, MeterID,callback
* @return callback function
*/

function removeDeltalinkFromMeter(deltalinkIDs, MeterID, callback) {
    dbCon.getDb(function (err, db) {
        if (err)
            callback(err, null);
        else
            removeDeltalinkFromMeterFromMongoDB(db.delta_DeltaLink, db.delta_Meters, MeterID, deltalinkIDs, callback);
    });
};

/**
* @description - For the Webservice -RemovingDeltalinkFRomMeter , Ungrouping Deltalink from Meter IN MONGODB
* @params - collectionName, collectionName1, MeterID, deltalinkIDs,callback 
* @return callback function
*/

function removeDeltalinkFromMeterFromMongoDB(collectionName, collectionName1, MeterID, deltalinkIDs, callback) {
    var DIDCount = 0;
    var DIDDeregistered = [];
    collectionName.find({ "DeltalinkID": { $in: deltalinkIDs } }, { DeltalinkID: 1, DeltalinkSerialNumber: 1, _id: 0 }).toArray(function (err, deltalinkForUngrouping) {
        if (err)
            insertError.putErrorDetails(err, callback);
        else if (deltalinkForUngrouping.length !== 0) {
            for (var i in deltalinkForUngrouping) {
                if (deltalinkForUngrouping.hasOwnProperty(i)) {
                    DIDDeregistered.push(deltalinkForUngrouping[i].DeltalinkID);
                    DIDCount = DIDCount + 1;
                }
            }
            DIDCount = DIDDeregistered.length;
            if (DIDDeregistered.length !== 0) {
                collectionName.updateMany({ "DeltalinkID": { $in: deltalinkIDs } }, { $set: { "MeterID": 'null' } }, function (err, deltalinkFromMeter) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        if (deltalinkFromMeter.length !== 0) {
                            collectionName1.find({ "MeterID": MeterID }, { "NoOfDeltalinkAllocated": 1, "_id": 0 }).toArray(function (err, NoOfDeltalinkAllocatedCount) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    var DeltalinkDeAllocatedToUpdate = 0;
                                    if (NoOfDeltalinkAllocatedCount !== null) {
                                        for (var i in NoOfDeltalinkAllocatedCount) {
                                            if (NoOfDeltalinkAllocatedCount.hasOwnProperty(i))
                                                DeltalinkDeAllocatedToUpdate = NoOfDeltalinkAllocatedCount[i].NoOfDeltalinkAllocated;
                                        }
                                        DeltalinkDeAllocatedToUpdate = DeltalinkDeAllocatedToUpdate - DIDCount;
                                        collectionName1.update({ "MeterID": MeterID }, { $set: { NoOfDeltalinkAllocated: DeltalinkDeAllocatedToUpdate } }, function (err, MeterAllocatedUpdated) {
                                            if (err)
                                                insertError.putErrorDetails(error, callback);
                                            else
                                                callback(null, "Deltalink Successfully Unlinked from Meter!");
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        } else
            callback(null, "Deltalink Unlink not Successful due to Device Connectivity failure!");
    });
};

//configUpload

function UpdateMeterConfiguration(collectionName, jobsCollection, insertMeterConfigurationDetails, callback) {
    let ipV4Reg = new RegExp('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
    let containsSpace = /\s/;
    let pattern = /^[a-zA-Z0-9\s]+$/;
    let numberPattern = /^[0-9]+$/;
    // let ipV4Reg = new RegExp('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
    let ipV4RegStartIP = new RegExp('^192.168.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
    let ipV4RegSubnet = new RegExp('^255.255.255.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
    let pskRegex = /^[A-Za-z0-9^~!@#$%\^&*()_+={}|[\]\\:;"<>?,./]+(?:\s?[A-Za-z0-9^~!@#$%\^&*()_+={}|[\]\\:;"<>?,./]+)?$/;
    let meshidRegex = /^[A-Za-z0-9]+[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*(?:\s?[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*[A-Za-z0-9]+)?$/;

    try {
        var MID = [];
        var dupID = [];
        let validSerailNo = [];
        var dupMIDFinal = [];

        var emptyCount = 0;
        var resultErrors = [];
        let type;
        let dubConsumerNumber = [];
        var condition = insertMeterConfigurationDetails.SerialNumber.map(function (e) { return new RegExp("^" + e + "$", "i"); });
        collectionName.find({ "MeterSerialNumber": { "$in": condition }, 'DeviceType': 'meter'}).project({
            "MeterSerialNumber": 1,
            _id: 0,
        }).toArray(function (err, RegisteredSerailNoArray) {
            if (err)
                callback(err, null, null, null);
            else {
                for (var i in RegisteredSerailNoArray) {
                    if (RegisteredSerailNoArray.hasOwnProperty(i)) {
                        validSerailNo.push(RegisteredSerailNoArray[i].MeterSerialNumber.toLowerCase());
                    }
                }
                if (RegisteredSerailNoArray.length != insertMeterConfigurationDetails.SerialNumber.length) {
                    let result = insertMeterConfigurationDetails.SerialNumber.filter(e => !validSerailNo.includes(e));
                    resultErrors.push({ SerialNumber: result, Status: 'Fail', Comment: "Invalid Serail No" });
                    callback(null, "Failed to Upload: Duplicate/Incorrect file!", [], resultErrors);
                } else {
                    for (var j in insertMeterConfigurationDetails.SerialNumber) {
                        // Checking for null rows in CSV upload file
                        if ((insertMeterConfigurationDetails.SerialNumber[j] === "") || (insertMeterConfigurationDetails.SerialNumber[j] === null) ||
                            (insertMeterConfigurationDetails.SerialNumber[j] === '') || (insertMeterConfigurationDetails.SerialNumber[j] === undefined)) {
                            emptyCount = emptyCount + 1;
                            dupMIDFinal.push(j + " - " + "Meter Serial Number is Null/Empty !!");
                            resultErrors.push({ SerialNumber: "NULL", Status: 'Fail', Comment: `${j} Meter Serial Number is Null/Empty !!` });
                        }
                        else {
                            /* 
                            Multiple If-Else statements to Validate Data and
                            return a customised message on validation failure
                            */
                            type = insertMeterConfigurationDetails.Type;
                            devicetype = insertMeterConfigurationDetails.DeviceType;
                            delete insertMeterConfigurationDetails.Type;
                            delete insertMeterConfigurationDetails.DeviceType;
                            var doc = {};
                            for (var key in insertMeterConfigurationDetails) {
                                doc[key] = insertMeterConfigurationDetails[key][j];
                            }
                            if (Object.keys(insertMeterConfigurationDetails).length === Object.keys(doc).length) {
                                MID.push(doc);
                            }
                        }
                    }
                    //Case I: All Duplicate/Incorrect Entries
                    if (MID.length === 0 || resultErrors.length > 0) {
                        if (type === "Upload") {
                            callback(null, "Failed to Add: Duplicate/Incorrect Meter Details!", dupMIDFinal, resultErrors);
                        } else
                            callback(null, "Failed to Upload: Duplicate/Incorrect file!", dupMIDFinal, resultErrors);
                    } else {
                        dbCon.getDb(function (err, db) {
                            if (err)
                                callback(err, null, null);
                            else {
                                var configCollection = db.delta_Config;
                                if (MID.length > 0) {
                                    UpdateMeterConfigurationbyUpload(MID, jobsCollection, configCollection, dupMIDFinal, resultErrors, callback);
                                }
                            }
                        });
                    }
                }
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

function UpdateHyperSproutConfiguration(collectionName, jobsCollection, insertHypersproutConfigurationDetails, callback) {
    try {
        var MID = [];
        var dupID = [];
        let validSerailNo = [];
        var dupMIDFinal = [];
        var emptyCount = 0;
        var resultErrors = [];
        let type;

        let devicetype = 'hs';
        if (insertHypersproutConfigurationDetails.DeviceType == 'HyperHub') {
            devicetype = 'hh';
        }
        var condition = insertHypersproutConfigurationDetails.SerialNumber.map(function (e) { return new RegExp("^" + e + "$", "i"); });
        collectionName.find({ "HypersproutSerialNumber": { "$in": condition }, 'DeviceType': devicetype }).project({
            "HypersproutSerialNumber": 1,
            _id: 0,
        }).toArray(function (err, RegisteredSerailNoArray) {
            if (err)
                callback(err, null, null, null);
            else {
                for (var i in RegisteredSerailNoArray) {
                    if (RegisteredSerailNoArray.hasOwnProperty(i)) {
                        // validSerailNo.push(RegisteredSerailNoArray[i].HypersproutSerialNumber.toLowerCase());
                        validSerailNo.push(RegisteredSerailNoArray[i].HypersproutSerialNumber);
                    }
                }
                if (RegisteredSerailNoArray.length != insertHypersproutConfigurationDetails.SerialNumber.length) {
                    let result = insertHypersproutConfigurationDetails.SerialNumber.filter(e => !validSerailNo.includes(e));
                    resultErrors.push({ SerialNumber: result, Status: 'Fail', Comment: "Invalid Serail No" });
                    callback(null, "Failed to Upload: Duplicate/Incorrect file!", [], resultErrors);
                } else {
                    for (var j in insertHypersproutConfigurationDetails.SerialNumber) {
                        // Checking for null rows in CSV upload file
                        if ((insertHypersproutConfigurationDetails.SerialNumber[j] === "") || (insertHypersproutConfigurationDetails.SerialNumber[j] === null) ||
                            (insertHypersproutConfigurationDetails.SerialNumber[j] === '') || (insertHypersproutConfigurationDetails.SerialNumber[j] === undefined)) {
                            emptyCount = emptyCount + 1;
                            dupMIDFinal.push(j + " - " + "HS Serial Number is Null/Empty !!");
                            resultErrors.push({ SerialNumber: "NULL", Status: 'Fail', Comment: `${j} Meter Serial Number is Null/Empty !!` });
                        }
                        else {
                            /* 
                            Multiple If-Else statements to Validate Data and
                            return a customised message on validation failure
                            */
                            type = insertHypersproutConfigurationDetails.Type;
                            devicetype = insertHypersproutConfigurationDetails.DeviceType;
                            delete insertHypersproutConfigurationDetails.Type;
                            delete insertHypersproutConfigurationDetails.DeviceType;
                            var doc = {};
                            for (var key in insertHypersproutConfigurationDetails) {
                                doc[key] = insertHypersproutConfigurationDetails[key][j];
                            }
                            if (Object.keys(insertHypersproutConfigurationDetails).length === Object.keys(doc).length) {
                                MID.push(doc);
                            }
                        }
                    }
                    //Case I: All Duplicate/Incorrect Entries
                    if (MID.length === 0 || resultErrors.length > 0) {
                        if (type === "Upload") {
                            callback(null, "Failed to Add: Duplicate/Incorrect HS config Details!", dupMIDFinal, resultErrors);
                        } else
                            callback(null, "Failed to Upload: Duplicate/Incorrect file!", dupMIDFinal, resultErrors);
                    } else {
                        dbCon.getDb(function (err, db) {
                            if (err)
                                callback(err, null, null);
                            else {
                                var configCollection = db.delta_Config;
                                if (MID.length > 0) {
                                    UpdateHSConfigurationbyUpload(MID, devicetype, jobsCollection, configCollection, dupMIDFinal, resultErrors, callback);
                                }
                            }
                        });
                    }
                }
            }


        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};
function UpdateMeterConfigurationbyUpload(MID, jobsCollection, configCollection, dupMIDFinal, resultErrors, callback) {
    try {
        var JobToInsert = [];
        var ConfigToInsert = [];
        let insertDocs;
        //const uniqueTransformerID = [...new Set(MID.map(item => item.GroupTransformerID))];
        const uniqueTransformerID = [];
        if (MID.length > 500) {
            callback("Total number of records should not be more than 500", null);
        } else {
            async.each(MID,
                function (mid, callbackEach) {
                    let TID;
                    let isReg = true;
                    let FrontHaul = {
                        "Radio_Configuration": {
                            "radio_mode": mid.RadioMode, "radio_band": mid.RadioBand, "chan_bw": mid.ChannelWidth, "channel": mid.Channel, "txpower": mid.TransmitPower, "stream_selection": mid.StreamSelection
                        },
                        "Mesh_Configuration": {
                            "Primary": {
                                "status": 1,
                                "radio_band": "2.4 GHz",
                                "meshID": mid.PrimaryMeshID,
                                "securityType": mid.PrimarySecurityType,
                                "PSK": mid.PrimaryPreSharedKey,
                                "Mac": mid.PrimaryMacAddress,
                                "DeviceType": mid.PrimaryDeviceType,
                                "SerialNumber": mid.PrimarySerialNumber,
                                "enable": 1,
                                "action": 1
                            },
                            "Secondary": {
                                "status": 1,
                                "radio_band": "2.4 GHz",
                                "meshID": mid.SecondaryMeshID,
                                "securityType": mid.SecondarySecurityType,
                                "PSK": mid.SecondaryPreSharedKey,
                                "Mac": mid.SecondaryMacAddress,
                                "DeviceType": mid.SecondaryDeviceType,
                                "SerialNumber": mid.SecondarySerialNumber,
                                "enable": 1,
                                "action": 1
                            }
                        },
                        "Hotspot_Configuration": {
                            "action": 1, "radio_band": "2.4 GHz", "ssid": mid.SSID, "security": mid.WirelessSecurity, "password": mid.Password,
                        },
                        "DHCP": {
                            "Status": mid.DHCPStatus, "Mode": 1, "StartIpAddr": mid.StartAddress,
                            "EndIpAddr": mid.EndAddress, "Gateway": mid.DefaultGateway,
                            "Subnet": mid.SubnetMask, "PrimaryDNS": mid.PrimaryDNS,
                            "SecondaryDNS": mid.SecondaryDNS
                        }
                    }
                    let Meter_Configuration = {
                        "uti_ID": mid.UtilityID, "cir_ID": mid.CircuitID, "cer_num": mid.CertificateNumber, "esn": mid.ESN
                    }
                    let System_Settings = {
                        "Status": 1, "sysname": mid.SystemName, "country": mid.SystemName, "timezone": mid.Country
                    }
                    let Bandwidth_Details = {
                        "Bandwidth": mid.BandwidthStatus, "DownloadBandwidth": mid.DownloadBandwidth, "UploadBandwidth": mid.UploadBandwidth
                    }
                    //Send config to Regsisted Data 
                    let configData = {};
                    configData.FrontHaul = FrontHaul;
                    configData.Meter_Configuration = Meter_Configuration;
                    configData.System_Settings = System_Settings;
                    configData.Bandwidth_Details = Bandwidth_Details;
                    dbCon.getDb(function (err, db) {
                        if (err) {
                            callback(err, null,);
                        }
                        else {
                            collectionName_meter = db.delta_Meters;
                            let condition = { MeterSerialNumber: new RegExp("^" + mid.SerialNumber + "$", "i") }
                            collectionName_meter.find(condition).project({
                                "MeterSerialNumber": 1,
                                "MeterID": 1,
                                "Status": 1,
                                "HypersproutID": 1,
                                _id: 0,
                            }).toArray(function (err, meterDetails) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (meterDetails[0]['Status'] == 'Registered') {
                                        collectionName_hs = db.delta_Hypersprouts;
                                        let condition = { HypersproutID: parseInt(meterDetails[0]['HypersproutID']) }
                                        collectionName_hs.find(condition).project({
                                            "DeviceID": 1,
                                            "Hypersprout_DeviceDetails.RegionCode": 1,
                                            "Hypersprout_DeviceDetails.CountryCode": 1,
                                            _id: 0,
                                        }).toArray(function (err, HSDetails) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                let objHypersproutDevDetails = HSDetails[0].Hypersprout_DeviceDetails;
                                                collectionName_sf = db.delta_SchedulerFlags;
                                                let condition = { DeviceID: HSDetails[0]['DeviceID'] }
                                                collectionName_sf.find(condition).project({
                                                    "MessageID": 1,
                                                    _id: 0,
                                                }).toArray(function (err, SfDetails) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        rev = 0;
                                                        countrycode = (objHypersproutDevDetails.CountryCode) ? objHypersproutDevDetails.CountryCode : 0;
                                                        regioncode = (objHypersproutDevDetails.RegionCode) ? objHypersproutDevDetails.RegionCode : 0,
                                                            messageid = (SfDetails[0]['MessageID']) ? SfDetails[0]['MessageID'] : 0,
                                                            cellid = (meterDetails[0]['HypersproutID']) ? meterDetails[0]['HypersproutID'] : 0
                                                        var jobDoc = {
                                                            "JobID": shortid.generate(),
                                                            "DeviceID": HSDetails[0]['DeviceID'],
                                                            "SerialNumber": mid.SerialNumber,
                                                            "MeterID": meterDetails[0].MeterID,
                                                            "CellID": cellid,
                                                            "DeviceType": "Meter",
                                                            "MessageID": messageid,
                                                            "JobName": "configupload Job",
                                                            "JobType": "Config UploadMeter",
                                                            "Status": "Pending",
                                                            "Group": "NA",
                                                            "ConfigData": configData,
                                                            "config_time": parseInt(Date.now() / 1000),
                                                            "CreatedDateTimestamp": new Date()
                                                        }
                                                        let input = {
                                                            "action": "UPLOAD_CONFIG_SETTINGS",
                                                            "attribute": "UPLOAD_METER_CONFIG",
                                                            "serialNumber": mid.SerialNumber,
                                                            "rev": rev,
                                                            "messageid": messageid,
                                                            "countrycode": countrycode,
                                                            "regioncode": regioncode,
                                                            "cellid": cellid,
                                                            "meterid": meterDetails[0].MeterID,
                                                            //hs device id
                                                            "deviceID": HSDetails[0].DeviceID,
                                                            "Purpose": "upload_meter_config",
                                                            "parameter": "setConfig",

                                                        }
                                                        input.config_time = parseInt(Date.now() / 1000);
                                                        let SetConfigMeterData = configUpload.setConfigUpload("UPLOAD_METER_CONFIG", mid);
                                                        input.configData = SetConfigMeterData;
                                                        configUpload.createHexForconfigUpload(input, jobDoc, function (err, result) {
                                                            if (err) {
                                                                resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Fail', Comment: "Meter Configuration could not Uploded" });
                                                                callbackEach(err)
                                                            } else {
                                                                resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Pass', Comment: "Meter Configuration Successfully Added!" });
                                                                callbackEach()
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        regex = { MeterSerialNumber: new RegExp('^' + mid.SerialNumber, 'i') };
                                        let config_time = parseInt(Date.now() / 1000);
                                        configCollection.updateOne(regex, { $set: { "FrontHaul": FrontHaul, "Meter_Configuration": Meter_Configuration, "System_Settings": System_Settings, "Bandwidth_Details": Bandwidth_Details, "config_UpdateTime": config_time } }, function (err, res) {
                                            if (err) {
                                                insertError.putErrorDetails(err, callbackEach);
                                                callbackEach(err)
                                            }
                                            else if (res.result.nModified === 0) {
                                                resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Pass', Comment: "Meter Configuration could not Uploded" });
                                            }
                                            else {
                                                resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Pass', Comment: "Meter Configuration Successfully Added!" });
                                            }
                                            callbackEach()
                                        });
                                    }
                                }
                            })
                        }
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null, null, null);
                    } else {
                        setTimeout(function () {
                            //fetch the jobs and update status
                            dbCon.getDb(function (err, db) {
                                if (err) {
                                    callback(err, null,);
                                }
                                else {
                                    var jobsCollection = db.delta_Jobs;
                                    var statusField = ["Pending", "Running"]
                                    jobsCollection.updateMany({
                                        Status: { $in: statusField }, CreatedDateTimestamp:
                                            { $gt: new Date(new Date().getTime() - 1000 * 60 * 60) }, JobName: "configupload Job", JobType: "Config UploadMeter"
                                    }, { $set: { Status: "Failed", "EndTime": new Date() } }, function (err, jobsToFail) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, "Meter Configuration  Successfully Added!", dupMIDFinal, resultErrors);
                                        }
                                    });
                                }
                            })

                        }, 60000);
                    }
                });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


function UpdateHSConfigurationbyUpload(MID, devicetype, jobsCollection, configCollection, dupMIDFinal, resultErrors, callback) {
    try {
        var JobToInsert = [];
        var ConfigToInsert = [];
        let insertDocs;
        let SAK = "";
        let DeviceID
        //const uniqueTransformerID = [...new Set(MID.map(item => item.GroupTransformerID))];
        const uniqueTransformerID = [];
        if (MID.length > 500) {
            callback("Total number of records should not be more than 500", null);
        } else {
            async.each(MID,
                function (mid, callbackEach) {
                    if (devicetype == "HyperSprout") {
                        DeviceID = "HS-" + mid.SerialNumber;
                    } else {
                        DeviceID = "HH-" + mid.SerialNumber;
                    }
                    sToIOT.checkDeviceConnectionSAS(DeviceID, function (err, status) {
                        if (err) {
                            SAK = "";
                        } else {
                            SAK = status;
                        }
                        var RadioConfig = {
                            "two_four": {
                                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": mid.RadioMode2_4,
                                "chan_bw": mid.ChannelWidth2_4, "channel": mid.Channel2_4, "txpower": mid.TransmitPower2_4, "stream_selection": mid.StreamSelection2_4, "guard_interval": mid.GuardInterval2_4
                            },
                            "five_low": {
                                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": mid.RadioMode5_L,
                                "chan_bw": mid.ChannelWidth5_L, "channel": mid.Channel5_L, "txpower": mid.TransmitPower5_L, "stream_selection": mid.StreamSelection5_L, "guard_interval": mid.GuardInterval5_L
                            },
                            "five_high": {
                                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": mid.RadioMode5_H,
                                "chan_bw": mid.ChannelWidth5_H, "channel": mid.Channel5_H, "txpower": mid.TransmitPower5_H, "stream_selection": mid.StreamSelection5_H, "guard_interval": mid.GuardInterval5_H
                            }
                        }
                        let BackHaul = {
                            "Cellular": {
                                "username": mid.UserName, "password": mid.Password, "sim_pin": mid.SimPin, "network_selection": mid.NetworkSelection, "carrier": mid.CarrierName, "CarrierList": []
                            },
                            "Ethernet": {
                                "mode": 0, "ip": mid.EthernetIPAddress, "gateway": mid.EthernetDefaultGateway, "subnet": mid.EthernetSubnetMask,
                                "primary_dns": mid.EthernetPrimaryDNS, "secondary_dns": mid.EthernetSecondaryDNS
                            },
                            "Advanced": {
                                "primary_backhaul": mid.PrimaryBackhaul, "auto_switchover": mid.AutoSwitchOver
                            }
                        }
                        let FrontHaul = {
                            "Radio_Configuration": RadioConfig,
                            "Mesh_Configuration": {
                                "two_four": {
                                    "status": 1, "radio_band": "2.4 GHz", "meshID": mid.MeshID2_4, "securityType": mid.SecurityType2_4,
                                    "PSK": mid.PreSharedKey2_4, "enable": 1, "action": 1
                                },
                                "five_high": {
                                    "status": 1, "radio_band": "5 GHz(High)", "meshID": mid.MeshID5_H, "securityType": mid.SecurityType5_H,
                                    "PSK": mid.PreSharedKey5_H, "enable": 1, "action": 1
                                }
                            },
                            "Hotspot_Configuration": {
                                "two_four": {
                                    "action": 1, "status": mid.HotspotStatus2_4_1, "radio_band": "2.4 GHz",
                                    "ssid": 'HyperSprout' + mid.SSID2_4_1, "security": mid.WirelessSecurity2_4_1, "password": mid.Password2_4_1,
                                    "vap_details": [{ "status": mid.HotspotStatus2_4_2, "ssid": mid.SSID2_4_2, "security": mid.WirelessSecurity2_4_2, "password": mid.Password2_4_2 }]
                                },
                                "five": {
                                    "action": 1, "status": 1, "radio_band": "5 GHz",
                                    "vap_details": [{ "status": mid.HotspotStatus5_H_1, "ssid": mid.SSID5_H_1, "security": mid.WirelessSecurity5_H_1, "password": mid.Password5_H_1 },
                                    { "status": mid.HotspotStatus5_H_2, "ssid": mid.SSID5_H_2, "security": mid.WirelessSecurity5_H_2, "password": mid.Password5_H_2 }]
                                }
                            },
                            "DHCP": {
                                "Status": mid.DHCPStatus, "Mode": 1, "StartIpAddr": mid.StartAddress,
                                "EndIpAddr": mid.EndAddress, "Gateway": mid.DefaultGateway,
                                "Subnet": mid.SubnetMask, "PrimaryDNS": mid.PrimaryDNS,
                                "SecondaryDNS": mid.SecondaryDNS
                            }
                        }
                        let Cloud_Connectivity_Settings = {
                            "Hostname": Hostname, "SAK": SAK, "status": "Open"
                        }
                        let System_Settings = {
                            "Status": 1, "sysname": mid.SystemName, "country": mid.Country, "timezone": mid.TimeZone,
                        }
                        let Bandwidth_Details = {
                            "Bandwidth": mid.BandwidthStatus, "DownloadBandwidth": mid.DownloadBandwidth, "UploadBandwidth": mid.UploadBandwidth
                        }
                        let configData = {};
                        configData.BackHaul = BackHaul;
                        configData.FrontHaul = FrontHaul;
                        configData.Cloud_Connectivity_Settings = Cloud_Connectivity_Settings;
                        configData.Bandwidth_Details = Bandwidth_Details;
                        configData.System_Settings = System_Settings;
                        dbCon.getDb(function (err, db) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                collectionName_hs = db.delta_Hypersprouts;
                                let condition = { HypersproutSerialNumber: new RegExp("^" + mid.SerialNumber + "$", "i") }
                                collectionName_hs.find(condition).project({
                                    "DeviceID": 1,
                                    "Status": 1,
                                    "Hypersprout_DeviceDetails.RegionCode": 1,
                                    "Hypersprout_DeviceDetails.CountryCode": 1,
                                    "HypersproutID": 1,
                                    _id: 0,
                                }).toArray(function (err, HSDetails) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (HSDetails[0]['Status'] == 'Registered') {
                                            let objHypersproutDevDetails = HSDetails[0].Hypersprout_DeviceDetails;
                                            collectionName_sf = db.delta_SchedulerFlags;
                                            let condition = { DeviceID: HSDetails[0]['DeviceID'] }
                                            collectionName_sf.find(condition).project({
                                                "MessageID": 1,
                                                _id: 0,
                                            }).toArray(function (err, SfDetails) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    rev = 0;
                                                    countrycode = (objHypersproutDevDetails.CountryCode) ? objHypersproutDevDetails.CountryCode : 0;
                                                    regioncode = (objHypersproutDevDetails.RegionCode) ? objHypersproutDevDetails.RegionCode : 0,
                                                        messageid = (SfDetails[0]['MessageID']) ? SfDetails[0]['MessageID'] : 0,
                                                        cellid = (HSDetails[0]['HypersproutID']) ? HSDetails[0]['HypersproutID'] : 0

                                                    var jobDoc = {
                                                        "JobID": shortid.generate(),
                                                        "DeviceID": HSDetails[0]['DeviceID'],
                                                        "SerialNumber": mid.SerialNumber,
                                                        "CellID": cellid,
                                                        "DeviceType": devicetype,
                                                        "MessageID": messageid,
                                                        "JobName": "configupload Job",
                                                        "JobType": "Config UploadHS",
                                                        "Status": "Pending",
                                                        "Group": "NA",
                                                        "ConfigData": configData,
                                                        "config_time": parseInt(Date.now() / 1000),
                                                        "CreatedDateTimestamp": new Date()

                                                    }
                                                    let input = {
                                                        "action": "UPLOAD_CONFIG_SETTINGS",
                                                        "attribute": "UPLOAD_HS_CONFIG",
                                                        "serialNumber": mid.SerialNumber,
                                                        "rev": rev,
                                                        "messageid": messageid,
                                                        "countrycode": countrycode,
                                                        "regioncode": regioncode,
                                                        "cellid": cellid,
                                                        //hs device id
                                                        "deviceID": HSDetails[0].DeviceID,
                                                        "Purpose": "upload_hs_config",
                                                        // input.parameter = "getConfig";
                                                        "parameter": "setConfig"
                                                    }
                                                    input.config_time = parseInt(Date.now() / 1000);
                                                    let SetConfigHSData = configUpload.setConfigUpload("UPLOAD_HS_CONFIG", configData,);
                                                    input.configData = SetConfigHSData;
                                                    configUpload.createHexForconfigUpload(input, jobDoc, function (err, result) {
                                                        if (err) {
                                                            resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Fail', Comment: "HS/HH Configuration could not Uploded" });
                                                            callbackEach(err)
                                                        } else {
                                                            resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Pass', Comment: "HS/HH Configuration Successfully Added!" });
                                                            callbackEach()
                                                        }
                                                    });
                                                }
                                            })
                                        } else {
                                            regex = { HypersproutSerialNumber: new RegExp('^' + mid.SerialNumber, 'i'), 'DeviceType': { $in: ['hh', 'hs'] } };
                                            let config_time = parseInt(Date.now() / 1000);
                                            configCollection.updateOne(regex, { $set: { "FrontHaul": FrontHaul, "BackHaul": BackHaul, "Cloud_Connectivity_Settings": Cloud_Connectivity_Settings, "System_Settings": System_Settings, "Bandwidth_Details": Bandwidth_Details, "config_UpdateTime": config_time } }, function (err, res) {
                                                if (err) {
                                                    insertError.putErrorDetails(err, callbackEach);
                                                    callbackEach(err)
                                                }
                                                else if (res.result.nModified === 0) {
                                                    resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Pass', Comment: "HS/HH Configuration could not Uploded" });
                                                }
                                                else {
                                                    resultErrors.push({ SerialNumber: mid.SerialNumber, Status: 'Pass', Comment: "HS/HH Configuration Successfully Added!" });
                                                }
                                                callbackEach()
                                            });
                                        }
                                    }
                                })
                            }
                        })

                    })
                }, function (err) {
                    if (err) {
                        callback(err, null, null, null);
                    } else {
                        setTimeout(function () {
                            //fetch the jobs and update status
                            dbCon.getDb(function (err, db) {
                                if (err) {
                                    callback(err, null,);
                                }
                                else {
                                    var jobsCollection = db.delta_Jobs;
                                    var statusField = ["Pending", "Running"]
                                    jobsCollection.updateMany({
                                        Status: { $in: statusField }, CreatedDateTimestamp:
                                            { $gt: new Date(new Date().getTime() - 1000 * 60 * 60) }, JobName: "configupload Job", JobType: "Config UploadHS"
                                    }, { $set: { Status: "Failed", "EndTime": new Date() } }, function (err, jobsToFail) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, "HS Configuration  Successfully Added!", dupMIDFinal, resultErrors);
                                        }
                                    });
                                }
                            })
                        }, 60000);
                    }
                });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

// function return an Integer values
function integerValue(x) {
    return parseInt(x);
}
// function  to find uniqueArray of objects
uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))


module.exports = {
    createNewCircuitEntry: createNewCircuitEntry,
    createNewMeterEntry: createNewMeterEntry,
    createNewTransformerHypersproutEntry: createNewTransformerHypersproutEntry,
    updateCircuitDetails: updateCircuitDetails,
    editMeterDetails: editMeterDetails,
    editMeterWifiDetails: editMeterWifiDetails,
    editMeterWifiReponse: editMeterWifiReponse,
    editTransformerHypersproutDetails: editTransformerHypersproutDetails,
    editHSWifiDetails: editHSWifiDetails,
    editHypersproutWifiReponse: editHypersproutWifiReponse,
    selectAllCircuitDetails: selectAllCircuitDetails,
    selectAllTransformerDetails: selectAllTransformerDetails,
    deleteCircuitDetails: deleteCircuitDetails,
    deleteMeterDetails: deleteMeterDetails,
    deleteTransformerHypersproutDetails: deleteTransformerHypersproutDetails,
    addTransformerToCircuit: addTransformerToCircuit,
    addMeterToTransformer: addMeterToTransformer,
    removeMeterFromTransformer: removeMeterFromTransformer,
    removingMeterFromTransformerResponse: removingMeterFromTransformerResponse,
    removeTransformerFromCircuit: removeTransformerFromCircuit,
    removingTransformerFromCircuitResponse: removingTransformerFromCircuitResponse,
    removingHHFromTransformerResponse: removingHHFromTransformerResponse,
    meterUnGroupDetails: meterUnGroupDetails,
    removeTransFromCircuitDetails: removeTransFromCircuitDetails,
    transformerDeregisterInsert: transformerDeregisterInsert,
    hyperhubDeregisterInsert: hyperhubDeregisterInsert,
    MeterWifiPassJobInsert: MeterWifiPassJobInsert,
    MeterWifiPassRequestDelayed: MeterWifiPassRequestDelayed,
    HSWifiPassJobInsert: HSWifiPassJobInsert,
    HSWifiPassRequestDelayed: HSWifiPassRequestDelayed,
    meterDeregisterInsert: meterDeregisterInsert,
    meterTransformerValidation: meterTransformerValidation,
    meterValidation: meterValidation,
    transformerValidation: transformerValidation,
    toCheckIfTransformerGrouped: toCheckIfTransformerGrouped,
    getID: getID,
    toCheckIfNotGrouped: toCheckIfNotGrouped,
    addDeltalinkToMeter: addDeltalinkToMeter,
    deltalinkMeterValidation: deltalinkMeterValidation,
    deltalinkUnGroupDetails: deltalinkUnGroupDetails,
    deltalinkDeregisterInsert: deltalinkDeregisterInsert,
    removeDeltalinkFromMeter: removeDeltalinkFromMeter,
    removingDLFromMeterResponse: removingDLFromMeterResponse,
    uniqueArray: uniqueArray,
    sendMacIDs: sendMacIDs,
    toCheckIfTransformerGroupedToHH: toCheckIfTransformerGroupedToHH,
    UpdateMeterConfig: UpdateMeterConfig,
    UpdateHyperSproutConfig: UpdateHyperSproutConfig,
    isTransformerVerified: isTransformerVerified,
    updateOtpInHypersproupt: updateOtpInHypersproupt,
    verifyOtpInHypersproutUpdate: verifyOtpInHypersproutUpdate,
    checkIfDeviceRegistered: checkIfDeviceRegistered,
    updateConfigAfterVerification: updateConfigAfterVerification,
    pushBootstrapData: pushBootstrapData
};
