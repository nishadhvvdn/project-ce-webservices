//REQUIRED PACKAGES AND FILES.
var async = require('async');
var insertError = require('./insertErrorLogsToDB.js');
var dbMysqlCon = require('./mySqlConnection.js');
var dbMongoCon = require('./dbConnection.js');
const sendToIOT = require('./sendToiot.js');
const parser = require('../data/parser.js');
const paginatedResults = require('../config/Helpers/Pagination');
const shortid = require('shortid');






/**
* @description - Get all Unique Circuit Entries in MYSQL SummaryMap ,WebService - getCircuitDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectAllUniqueCircuitIDs(callback) {
    try {
        let tableName = "summarymap";
        let columns = 'DISTINCT CircuitID';
        let result1 = [];

        getDataFromMYSQL(tableName, columns, "", function (err, rows) {
            if(err){
                callback(err, null)
            }
            else if (rows.length > 0) {
                async.each(rows, function (row, callbackEach) {
                    let DTC = row['CircuitID'];
                    let condition = { "CircuitID": DTC };
                    let collection = "delta_Circuit"
                    let project = { "_id": 0, "CircuitID": 1, "CircuitNumber": 1 }
                    getData(collection, condition, project, function (err, results) {
                        if (err) {
                            callbackEach(err, null)
                        } else {
                            if (results.length > 0) {
                                let data = { "DTC": results[0].CircuitID, "DTCID": results[0].CircuitNumber }
                                result1.push(data)
                                callbackEach()
                            } else {
                                callbackEach()
                            }

                        }

                    })
                }, function (err) {
                    if (err) {
                        callback(err, null)
                    } else {
                        callback(null, result1);

                    }
                });
            } else {
                callback("DTC Details not available in the System", null);
            }

        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

function getTransformerPhaseDetails(transformerId, startDate, endDate, callback) {
    try {

        if (startDate != undefined && endDate != undefined)
            var query = 'SELECT distinct CELLID, Line1Current, Line2Current, Line3Current, Line1Voltage, Line2Voltage, Line3Voltage ,Line1PhaseAngle, Line2PhaseAngle, Line3PhaseAngle, DBTimestamp as ReadTimestamp FROM deltamart.transformertransactions where CELLID =  ' + transformerId + '  and DBTimestamp >= "' + startDate + '" and DBTimestamp <= "' + endDate + '"order by DBTimestamp';
        else
            var query = 'SELECT distinct CELLID, Line1Current, Line2Current, Line3Current, Line1Voltage, Line2Voltage, Line3Voltage ,Line1PhaseAngle, Line2PhaseAngle, Line3PhaseAngle, DBTimestamp as ReadTimestamp FROM deltamart.transformertransactions where CELLID =  ' + transformerId + '  order by DBTimestamp desc limit 1';

        dbMysqlCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                connection.query(query, function (err, rows, fields) {
                    if (err) {
                        connection.end();
                        callback(err, null);
                    } else {
                        connection.end();
                        callback(null, rows)

                    }
                })

            }
        });

    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - Get all Unique Circuit Entries from query in MYSQL SummaryMap ,WebService - getCircuitDetails
* @param tableName, findColumns, queryCondition, callback
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDataFromMYSQL(tableName, findColumns, queryCondition, callback) {
    try {
        let query;
        if (queryCondition) {
            query = `select ${findColumns} from ${tableName} where ${queryCondition}`
        } else {
            query = `select ${findColumns} from ${tableName}`
        }
        dbMysqlCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                connection.query(query, function (err, rows, fields) {
                    if (err) {
                        connection.end();
                        callback(err, null);
                    } else {
                        connection.end();
                        callback(null, rows)

                    }
                })

            }
        })

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};


/**
* @description - Get data from MongoDB collection ,WebService - for all required APIs
* @param collection, condition, project, callback
* @param callback - callback function returns success or error response
* @return callback function
*/

function getData(collection, condition, project, callback) {
    try {
        dbMongoCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            }
            else {
                var collectionName = db[collection];
                getDataFromMongoB(collectionName, condition, project, callback);
            }

        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - Get data from query in  MongoDB collection ,WebService - for all required APIs
* @param collection, condition, project, callback
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDataFromMongoB(collectionName, condition, project, callback) {
    try {
        if (project) {
            collectionName.find(condition).project(project).toArray(function (err, Details) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, Details);
                }
            });
        } else {
            collectionName.find(condition).toArray(function (err, Details) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, Details);
                }
            });
        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - Get all Unique Transformer BY DTC Entries in MYSQL SummaryMap ,WebService - getCircuitDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectAllTransformerIDsByDTC(circuitID, IsHyperHub, callback) {
    try {
        if (IsHyperHub) {
            // code for Data Rate
            let condition;
            let collection;
            let DeviceType;
            let project;
            let result1 = [];
            let transformerid = [];
            let transformerserialnumer = [];
            condition = { "CircuitID": circuitID };
            collection = "delta_Transformer"
            project = { "_id": 0, "TransformerSerialNumber": 1, "TransformerID": 1 }
            getData(collection, condition, project, function (err, results) {
                if (err) {
                    callback(err, null)
                } else {
                    if (results.length > 0) {
                        results.forEach(function (row) {
                            transformerid.push(row['TransformerID'])
                            transformerserialnumer.push(row['TransformerSerialNumber'])
                        });
                        if (transformerid.length > 0) {
                            if (IsHyperHub == "true") {
                                //hyperhub
                                DeviceType = "Hyperhub";
                            } else {
                                //hypersprout
                                DeviceType = "Hypersprout";
                            }
                            condition = { "TransformerID": { "$in": transformerid }, "Status": "Registered" };
                            let collection = "delta_Hypersprouts"
                            let project = { "_id": 0, "HypersproutSerialNumber": 1, "HypersproutID": 1, "TransformerID": 1, "IsHyperHub": 1 }
                            getData(collection, condition, project, function (err, results) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    if (results.length > 0) {
                                        async.each(results, function (row, callbackEach) {
                                            let HypersproutID = row['HypersproutID'];
                                            let TransformerID = row['TransformerID'];
                                            let HypersproutSerialNumber = row['HypersproutSerialNumber'];
                                            let IsHyperHub = row["IsHyperHub"];
                                            let data = { "HypersproutID": HypersproutID, "TransformerID": TransformerID, "HypersproutSerialNumber": HypersproutSerialNumber, "IsHyperHub": IsHyperHub }
                                            result1.push(data);
                                            callbackEach()
                                        }, function (err) {
                                            if (err) {
                                                callback(err, null)
                                            } else {
                                                callback(null, result1);
                                            }
                                        });

                                    } else {
                                        callback(DeviceType + " Details not available in the system!!", null)
                                    }

                                }

                            })
                        }

                    } else {
                        callback("Transformer Details not available in the system!!", null)
                    }

                }

            })

        } else {
            // code for phaser values
            let result1 = [];
            let condition = { "CircuitID": circuitID };
            let collection = "delta_Transformer"
            let project = { "_id": 0, "TransformerSerialNumber": 1, "TransformerID": 1 }
            getData(collection, condition, project, function (err, results) {
                if (err) {
                    callback(err, null)
                } else {
                    if (results.length > 0) {
                        async.each(results, function (row, callbackEach) {
                            condition = { "TransformerID": row['TransformerID'], "HypersproutID": row['TransformerID'] };
                            let collection = "delta_Hypersprouts"
                            let project = { "_id": 0, "Hypersprout_DeviceDetails.Phase": 1}
                            getData(collection, condition, project, function (err, results1) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    if (results1.length > 0) {
                                            let TransformerSerialNumber = row['TransformerSerialNumber'];
                                            let TransformerID = row['TransformerID'];
                                            let Phase = results1[0]["Hypersprout_DeviceDetails"].Phase;
                                            let data = { "TransformerSerialNumber": TransformerSerialNumber, "TransformerID": TransformerID, "Phase": Phase }
                                            result1.push(data);
                                            callbackEach()
                                    } else {
                                        callback(DeviceType + " Details not available in the system!!", null)
                                    }

                                }

                            })
                        }, function (err) {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, result1);

                            }
                        });

                    } else {
                        callback("Transformer Details not available in the system!!", null)
                    }

                }

            })

        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - Get all Registered Unique Deltalink Entries in MYSQL NetworkCovergae ,WebService - getDeltalinkDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectAllUniqueDeltalink(data, callback) {
    try {
        let result1 = [];
        let condition = { "Status": "Registered", "IsMaster": true, "MeterID": { $exists: true, $nin: [null, "null"] }, "MeterID":data.meterID };
        let collection = "delta_DeltaLink"
        let project = { "_id": 0, "DeltalinkSerialNumber": 1, "DeltalinkID": 1, "IsMaster": 1 }
        getData(collection, condition, project, function (err, results) {
            if (err) {
                callback(err, null)
            } else {
                if (results.length > 0) {
                    async.each(results, function (row, callbackEach) {
                        let DeltalinkSerialNumber = row['DeltalinkSerialNumber'];
                        let DeltalinkID = row['DeltalinkID'];
                        let IsMaster = row["IsMaster"]
                        let data = { "DeltalinkID": DeltalinkID, "DeltalinkSerialNumber": DeltalinkSerialNumber, "IsMaster": IsMaster }
                        result1.push(data)
                        callbackEach()
                    }, function (err) {
                        if (err) {
                            callback(err, null)
                        } else {
                            callback(null, result1);

                        }
                    });

                } else {
                    callback("Deltalink Details not available in the system!!", null)
                }

            }

        })





    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


function selectAllMeterByTransformerID(transformerID, callback) {
    try {
        let tableName = "managerialdata";
        let columns = 'TransformerID, HypersproutID, MeterID, TransformerSerialNumber, HypersproutSerialNumber, MeterSerialNumber, MeterStatus';
        let where = `TransformerID= '${transformerID}'`
        let result1 = [];

        getDataFromMYSQL(tableName, columns, where, function (err, rows) {
            if (rows.length > 0) {
                callback(null, rows)

            } else {
                callback("Meter Details not available in the System", null);
            }

        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

function getDataRate(details, callback) {
    try {
        dbMongoCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                let meterCollection = db.delta_Meters;
                let hyperSproutCollection = db.delta_Hypersprouts;
                let deltalinkCollection = db.delta_DeltaLink;
                let jobsCollection = db.delta_Jobs;
                findCollection(db, details.deviceType, function (err, collection) {
                    if (!err) {
                        getDataRateFromMongoDB(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, collection, details, callback);
                    } else {
                        callback("inavlid condition !!", null)
                    }
                })
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};






/* ***************************************************************************** */










/**
* @description - For the Webservice - findCollection, SELECT Collection Name on the basis of Device Type
* @param db database parameter
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function findCollection(db, Device, callback) {
    try {
        var collectionName;
        if (Device == "Meter") {
            collectionName = db.delta_Meters
        } else if (Device == "HyperSprout" || Device == "HyperHub") {
            collectionName = db.delta_Hypersprouts
        } else {
            collectionName = db.delta_DeltaLink
        }

        callback(null, collectionName)
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}







/**
* @description - Fetch Device Log Status from Mongo DB query
* @param deviceLogCollection
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param collection
* @param dataRateDetails
* @param callback - callback function returns success or error response
* @return callback function
*/


function getDataRateFromMongoDB(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, collection, dataRateDetails, callback) {
    try {
        getDeviceHSDetails(meterCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, collection, dataRateDetails, function (err, response) {
            if (err) {
                callback(err, null);
            } else {
                let action, attribute, Purpose;
                switch (dataRateDetails.deviceType) {
                    case "Meter":
                        action = 'DATA_RATE';
                        attribute = 'METER_DATA_RATE';
                        Purpose = 'METER_DATA_RATE';
                        break;
                    case "HyperHub":
                        action = 'DATA_RATE';
                        attribute = 'HH_DATA_RATE';
                        Purpose = 'HH_DATA_RATE';
                        break;
                    case "HyperSprout":
                        action = 'DATA_RATE';
                        attribute = 'HS_DATA_RATE';
                        Purpose = 'HS_DATA_RATE';
                        break;
                    case "DeltaLink":
                        action = 'DATA_RATE';
                        attribute = 'DL_DATA_RATE';
                        Purpose = 'DL_DATA_RATE';
                        break;
                    default:
                        callback("Invalid data!!", null)
                }
                getDataToParse(dataRateDetails, response, action, attribute, Purpose, "", function (err, data) {
                    if (err) {
                        callback(err, null)
                    } else {
                        getjobdoc(response, data, dataRateDetails, Purpose, function (err, jobdoc) {
                            updateMessageIDAndCreateJob(jobsCollection, jobdoc, data.messageid, function (err, successResponse) {
                                sendToIOT.checkDeviceConnectionState(response.DeviceID, function (err, status) {
                                    if (err) {
                                        callback(err.name != undefined ? err.name : err, null);
                                    } else {
                                        console.log("data", data)
                                        if (status == 'Connected') {
                                            parser.hexaCreation(data, function (err, Hexresult) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    sendToIOT.sendToIOT(Hexresult, response.DeviceID, function (err, success) {
                                                        if (err) {
                                                            callback(err.name, null);
                                                        } else {
                                                            setTimeout(function () {
                                                                getCurrentStatus(jobsCollection, dataRateDetails.deviceId, data.messageid, jobdoc.JobID, "DataRate", function (err, result) {
                                                                    if (err) {
                                                                        callback(err, null);
                                                                    } else {
                                                                        systemEvents(data.rev, data.cellid, dataRateDetails.deviceId, data.messageid, data.action, data.attribute, Hexresult, dataRateDetails.deviceType, function (err, _successEve) {
                                                                            if (err) {
                                                                                callback(err, null)
                                                                            } else {
                                                                                callback(null, result);
                                                                            }
                                                                        })

                                                                    }
                                                                });
                                                            }, 6000);
                                                        }
                                                    })
                                                }
                                            })
                                        } else {
                                            //Device is not connected
                                            updateDeviceLogJob(jobsCollection, jobdoc, function (err, result) {
                                                callback("Data Rate Fetch Unsuccessful", true);
                                            });


                                        }
                                    }
                                })
                            })
                        })
                    }
                })
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - get Device HS Details
* @param hyperSproutCollection
* @param meterCollection
* @param DeltalinkCollection
* @param DeviceId
* @param callback - callback function returns success or error response
* @return callback function
*/

function getDeviceHSDetails(meterCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, CollectionName, dataRateDetails, callback) {
    try {
        findCondition(dataRateDetails.deviceType, dataRateDetails.deviceId, function (err, condition) {
            if (!err) {
                collectionStatus(CollectionName, condition, dataRateDetails, function (err, result) {
                    if (err) {
                        callback(err, null)
                    } else {
                        let whereCondition;
                        if (dataRateDetails.deviceType == "Meter") {
                            whereCondition = { "HypersproutID": result[0].HypersproutID, Status: "Registered" }
                            findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else if (res.length > 0) {
                                    if (res[0].Status === "NotRegistered") {
                                        callback(dataRateDetails.deviceType + " Not Registered", null);
                                    } else {
                                        HSDetails(res, result, dataRateDetails.deviceType, function (err, response) {
                                            if (err) {
                                                callback(err, null)
                                            } else {
                                                if ((res[0].MessageID === undefined) || (res[0].MessageID === null) || (res[0].MessageID === 255))
                                                    response.messageid = 0;
                                                else
                                                    response.messageid = res[0].MessageID;
                                                callback(null, response)
                                            }
                                        })
                                    }
                                } else {
                                    callback("Hypersprout not available", null);
                                }
                            })
                        }
                        else if (dataRateDetails.deviceType == "HyperSprout" || dataRateDetails.deviceType == "HyperHub") {
                            whereCondition = { 'HypersproutID': result[0].HypersproutID }
                            findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                if (err) {
                                    callback(err, null)
                                } else if (res.length > 0) {
                                    if (res[0].Status === "NotRegistered") {
                                        callback(dataRateDetails.deviceType + " Not Registered", null);
                                    } else {
                                        HSDetails(res, result, dataRateDetails.deviceType, function (err, response) {
                                            if (err) {
                                                callback(err, null)
                                            } else {
                                                if ((res[0].MessageID === undefined) || (res[0].MessageID === null) || (res[0].MessageID === 255))
                                                    response.messageid = 0;
                                                else
                                                    response.messageid = res[0].MessageID;
                                                callback(null, response)
                                            }
                                        })
                                    }
                                } else {
                                    callback("Hypersprout not available", null);
                                }
                            })
                        } else {
                            if (result[0].MeterID) {
                                let condition = { 'MeterID': result[0].MeterID, "Status": "Registered" }
                                collectionStatusDeltalink(meterCollection, condition, "DeltaLink", function (err, Meterresult) {
                                    if (err) {
                                        callback(err, null)
                                    } else if (Meterresult.length > 0) {
                                        whereCondition = { 'HypersproutID': Meterresult[0].HypersproutID, Status: "Registered" }
                                        findCursor(hyperSproutCollection, whereCondition, "HyperSprout", function (err, res) {
                                            if (err) {
                                                callback(err, null)
                                            } else if (res.length > 0) {
                                                if (res[0].Status === "NotRegistered") {
                                                    callback(dataRateDetails.deviceType + " Not Registered", null);
                                                } else {
                                                    HSDetails(res, result, dataRateDetails.deviceType, function (err, response) {
                                                        if (err) {
                                                            callback(err, null)
                                                        } else {
                                                            if ((res[0].MessageID === undefined) || (res[0].MessageID === null) || (res[0].MessageID === 255))
                                                                response.messageid = 0;
                                                            else
                                                                response.messageid = res[0].MessageID;
                                                            callback(null, response)
                                                        }
                                                    })
                                                }
                                            } else {
                                                callback("Hypersprout not available", null);
                                            }
                                        })
                                    } else {
                                        callback("Meter not grouped to the Transformer !!", null)
                                    }
                                })
                            } else {
                                callback("Deltalink not grouped to the Meter !!", null)
                            }
                        }

                    }
                })
            } else {
                callback("inavlid condition !!", null)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}



/**
* @description - For the Webservice - find where condition on the basis of where condition , query from mongodb
* @param Device DeviceDetails i.e DeviceType
* @param DeviceId Device Id i.e MeterID, HypersproutID, DeltalinkID
* @param callback - callback function returns success or error response
* @return callback function
*/

function findCondition(Device, DeviceId, callback) {
    try {
        let condition;
        switch (Device) {
            case "Meter": condition = { MeterID: DeviceId, Status: "Registered" }
                callback(null, condition)
                break;
            case "HyperSprout": condition = { HypersproutID: DeviceId, Status: "Registered", IsHyperHub: false }
                callback(null, condition)
                break;
            case "HyperHub":
                condition = { HypersproutID: DeviceId, Status: "Registered", IsHyperHub: true }
                callback(null, condition)
                break;
            case "DeltaLink": condition = { DeltalinkID: DeviceId, Status: "Registered" }
                callback(null, condition)
                break;
            default:
                callback("Invalid Condition!!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - For the Webservice - collectionStatus, SELECT All Device  details which is registered FROM MONGODB after query
* @param CollectionName MongodbCollection 
* @param condition condition used for mongodb query
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function collectionStatus(CollectionName, condition, Device, callback) {
    try {
        CollectionName.find(condition).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length > 0) {
                    callback(null, result);
                } else {
                    callback(Device.deviceType + " not registered", null);
                }
            }
        });
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
    try {
        collectionName.find(condition).toArray(function (err, res) {
            if (err) {
                callback(err, null);
            } else if (res.length > 0) {
                callback(null, res)
            } else {
                callback(DeviceType + " not available", null);
            }

        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description -get response deatils object from hypersprout
* @param HSResponse
* @param DeviceResponse -( Response from Meter/Hyperhub/Hypersprout/Deltalink)
* @param DeviceType - (Meter/Hyperhub/Hypersprout/Deltalink)
* @param callback - callback function returns success or error response
* @return callback function
*/
function HSDetails(HSResponse, DeviceResponse, DeviceType, callback) {
    try {
        var response;
        switch (DeviceType) {
            case "Meter":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].Meters_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].Meters_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "MeterID": DeviceResponse[0].MeterID,
                    "MeterSerialNumber": DeviceResponse[0].MeterSerialNumber
                }
                callback(null, response)
                break;
            case "HyperSprout":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].Hypersprout_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].Hypersprout_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "HypersproutID": DeviceResponse[0].HypersproutID,
                    "HypersproutSerialNumber": DeviceResponse[0].HypersproutSerialNumber
                }
                callback(null, response)
                break;
            case "HyperHub":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].Hypersprout_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].Hypersprout_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "HypersproutID": DeviceResponse[0].HypersproutID,
                    "HypersproutSerialNumber": DeviceResponse[0].HypersproutSerialNumber
                }
                callback(null, response)
                break;
            case "DeltaLink":
                response = {
                    "DeviceID": HSResponse[0].DeviceID,
                    "Rev": HSResponse[0].ProtocolVersion,
                    "CountryCode": DeviceResponse[0].DeltaLinks_DeviceDetails.CountryCode,
                    "RegionCode": DeviceResponse[0].DeltaLinks_DeviceDetails.RegionCode,
                    "CellID": HSResponse[0].HypersproutID,
                    "DeltalinkID": DeviceResponse[0].DeltalinkID,
                    "DeltalinkSerialNumber": DeviceResponse[0].DeltalinkSerialNumber
                }
                callback(null, response)
                break;
            default:
                callback("Invalid Hypersprout details!!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - For the Webservice - collectionStatus, SELECT All Device  details which is registered FROM MONGODB after query
* @param CollectionName MongodbCollection 
* @param condition condition used for mongodb query
* @param Device DeviceDetails i.e DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/
function collectionStatusDeltalink(CollectionName, condition, Device, callback) {
    try {
        CollectionName.find(condition).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length > 0) {
                    callback(null, result);
                } else {
                    callback(Device + " not registered", null);
                }
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description - get data to parse - parse the data to send at Devices end 
* @params - dataRateDetails, response, action, attribute, purpose, callback
* @return callback function
*/

function getDataToParse(dataRateDetails, response, action, attribute, purpose, AdditionalParam, callback) {
    try {
        let data;
        let rev = response.Rev ? response.Rev : 0;
        let countryCode = response.RegionCode ? response.RegionCode : 0;
        let regionCode = response.RegionCode ? response.RegionCode : 0;
        if ((purpose == "METER_DATA_RATE") || (purpose == "HH_DATA_RATE") || (purpose == "HS_DATA_RATE") || (purpose == "DL_DATA_RATE")) {
            data = {
                "rev": rev,
                "messageid": Number(response.messageid) + 1,
                "countrycode": countryCode,
                "regioncode": regionCode,
                "cellid": response.CellID
            }
        
        } else {
            data = {
                "rev": rev,
                "messageid": Number(response.messageid) + 1,
                "countrycode": countryCode,
                "regioncode": regionCode,
                "cellid": response.CellID
            }
        }
        switch (dataRateDetails.deviceType) {
            case "Meter":
                data.meterid = dataRateDetails.deviceId;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            case "HyperHub":
                data.meterid = 0;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            case "HyperSprout":
                data.meterid = 0;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            case "DeltaLink":
                data.meterid = dataRateDetails.deviceId;
                data.action = action
                data.attribute = attribute
                data.Purpose = purpose
                break;
            default:
                callback("Invalid data !!", null)
        }

        callback(null, data)
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - get data to job status - Get the jobdoc to create job 
* @params - response(HS details), data(data to parse), DeviceValues , purpose, callback)
* @return callback function
*/


function getjobdoc(response, data, dataRateDetails, purpose, callback) {
    try {
        let jobdoc;
        if (dataRateDetails.deviceType == "Meter" && purpose == 'METER_DATA_RATE') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.MeterSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "Meter",
                "JobName": "Data Rate",
                "JobType": "Meter Data Rate",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "DataRateStatus": "Data Rate Fetch Unsuccessful"
            };
        } else if (dataRateDetails.deviceType == "HyperHub" && purpose == 'HH_DATA_RATE') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperHub",
                "JobName": "Data Rate",
                "JobType": "HyperHub Data Rate",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "DataRateStatus": "Data Rate Fetch  Unsuccessful"
            };
        } else if (dataRateDetails.deviceType == "HyperSprout" && purpose == 'HS_DATA_RATE') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.HypersproutSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "HyperSprout",
                "JobName": "Data Rate",
                "JobType": "HyperSprout Data Rate",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "DataRateStatus": "Data Rate Fetch Unsuccessful"
            };

        } else if ((dataRateDetails.deviceType == "DeltaLink") && purpose == 'DL_DATA_RATE') {
            jobdoc = {
                "JobID": shortid.generate(),
                "SerialNumber": response.DeltalinkSerialNumber,
                "DeviceID": response.DeviceID,
                "DeviceType": "DeltaLink",
                "JobName": "Data Rate",
                "JobType": "DeltaLink Data Rate",
                "Status": "Pending",
                "CreatedDateTimestamp": new Date(),
                "MessageID": data.messageid,
                "EndTime": null,
                "DataRateStatus": "Data Rate Fetch Unsuccessful"
            };
        
        }else {
            callback("invalid job details !!", null)
        }
        callback(null, jobdoc)
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description - Insert Message ID And Create Job
* @param jobsCollection
* @param jobJSON
* @param messageid
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateMessageIDAndCreateJob(jobsCollection, jobJSON, messageid, callback) {
    try {
        jobsCollection.insertOne(jobJSON, function (err, response) {
            callback(err, response);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - get Current Status
* @param jobsCollection
* @param meterID
* @param messageid
* @param jobID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getCurrentStatus(jobsCollection, deviceId, messageid, jobID, LogType, callback) {
    try {
        switch (LogType) {
            case "DataRate":
                jobsCollection.find({ JobID: jobID }).toArray(function (err, res) {
                    if (err) {
                        callback(err, null);
                    } else if (res.length > 0) {
                        if (res[0].Status == "Pending") {
                            jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Failed", "EndTime": new Date } }, function (err, insertResponse) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    callback(res[0].DataRateStatus, null)
                                }
                            })

                        } else if (res[0].Status == "Failed") {
                            jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Failed", "EndTime": new Date } }, function (err, insertResponse) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    callback(res[0].DataRateStatus, null)
                                }
                            })
                        } else {
                            jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Completed", "EndTime": new Date } }, function (err, insertResponse) {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    if (res[0].DataRateStatus == "Data Rate Fetch Successful") {
                                        let data = {
                                            "UploadRate": res[0].UploadRate,
                                            "DownloadRate": res[0].DownloadRate,
                                            "Latency": res[0].Latency,
                                            "SerialNumber": res[0].SerialNumber,
                                            "DataRateStatus": res[0].DataRateStatus
                                        }
                                        callback(null, data)
                                    } else {
                                        callback(res[0].DataRateStatus, null)
                                    }

                                }
                            })
                        }
                    } else {
                        callback(DeviceType + " not available", null);
                    }

                });

                break;
            default:
                callback("Invalid Job Status!!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}



/**
* @description - Save System Events - All Communicaion with the Devices
* @params - rev, cellid, meterid, messageid, action, attribute, data, callback
* @return callback function
*/
function systemEvents(rev, cellid, deviceid, messageid, action, attribute, data, DeviceType, callback) {
    try {
        dbMongoCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var systemEventsCollection = db.delta_SystemEvents;
                saveSystemEvent(systemEventsCollection, rev, cellid, deviceid, messageid, action, attribute, data, DeviceType, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - Save System Event
* @params - systemEventsCollection, rev, cellid, meterid, messageid, action, attribute, data, callback
* @return callback function
*/

function saveSystemEvent(systemEventsCollection, rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, callback) {
    try {
        getSystemEventData(rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, function (err, sysEvent) {
            if (err) {
                callback(err, null)
            } else {
                systemEventsCollection.insertOne(sysEvent, function (err, response) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        callback(null, "Success")
                    }
                });
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - system event data on the basis of Device Type
* @params - rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, callback)
* @return callback function
*/
function getSystemEventData(rev, cellid, Deviceid, messageid, action, attribute, data, DeviceType, callback) {
    try {
        var sysEvent;
        switch (DeviceType) {
            case "Meter":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "MeterID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            case "HyperSprout":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "HypersproutID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            case "HyperHub":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "HypersproutID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            case "DeltaLink":
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "DeltalinkID": Deviceid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
                break;
            default:
                sysEvent = {
                    "Rev": rev,
                    "CellID": cellid,
                    "MessageID": messageid,
                    "Action": action,
                    "Attribute": attribute,
                    "DBTimestamp": new Date(),
                    "Data": data
                }
                callback(null, sysEvent)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}



/**
* @description - get Current Status
* @param jobsCollection
* @param jobdoc
* @param callback - callback function returns success or error response
* @return callback function
*/


function updateDeviceLogJob(jobsCollection, jobData, callback) {
    try {
        jobsCollection.updateMany({
            $or: [
                { "CreatedDateTimestamp": { $lte: new Date(new Date().getTime() - 1000 * 60 * 60) } },
                { "JobID": jobData.JobID }
            ],
            "JobName": "Data Rate",
            "SerialNumber": jobData.SerialNumber, "Status": 'Pending'
        }, { "$set": { "Status": 'Failed', "DataRateStatus": "Data Rate Fetch Unsuccessful","EndTime": new Date() } }, function (err, insertResponse) {
            if (err)
                callback(err, null);
            else
                callback(null, insertResponse)
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description - save  Device  fetch log Status
* @param FetchLogStatusValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function saveDeviceDataRateStatus(ResponseValues, callback) {
    try {
        dbMongoCon.getDb(function (err, db) {
            if (err) {
                return callback(err, null);
            } else {
                var meterCollection = db.delta_Meters;
                var hyperSproutCollection = db.delta_Hypersprouts;
                var deltalinkCollection = db.delta_DeltaLink;
                var transformerCollection = db.delta_Transformer;
                var jobsCollection = db.delta_Jobs;
                saveDeviceDataRateStatusFromMongoDB(meterCollection,transformerCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, ResponseValues, callback);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}



/**
* @description - save fetch log status
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param jobsCollection
* @param data i.e MeterID, CellID, MessageID, Status, Action and Attribute
* @param callback - callback function returns success or error response
* @return callback function
*/

function saveDeviceDataRateStatusFromMongoDB(meterCollection, transformerCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, data, callback) {
    try {
        let jobSetCondition;
        if (data.Status == 1) {
            jobSetCondition = { DataRateStatus: data.Status1, Status: "Completed", "EndTime": new Date }
        } else {
            jobSetCondition = { DataRateStatus: data.Status1, Status: "Failed", "EndTime": new Date }
        }
        if (data.Action == 'DATA_RATE' && data.Status == 1) {
            switchCaseDeviceResponse(meterCollection, transformerCollection, hyperSproutCollection, deltalinkCollection, jobsCollection, data, jobSetCondition, function (err, switchresult) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, switchresult)
                }
            })

        } else if (data.Action == 'DATA_RATE' && data.Status1 != 1) {
            switch (data.Attribute) {
                case 'METER_DATA_RATE':
                    deviceCondition = { MeterID: data.MeterID };
                    findCursor(meterCollection, deviceCondition, "Meter", function (err, res) {
                        if (err) {
                            callback(err, null)
                        } else if (res.length > 0) {
                            jobCondition = { SerialNumber: res[0].MeterSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                            updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, result)
                                }
                            })
                        }
                    })

                    break;
                case 'HS_DATA_RATE':
                    deviceCondition = { HypersproutID: data.CellID, IsHyperHub: false };
                    findCursor(hyperSproutCollection, deviceCondition, "HyperSprout", function (err, res) {
                        if (err) {
                            callback(err, null)
                        } else if (res.length > 0) {
                            jobCondition = { SerialNumber: res[0].HypersproutSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                            updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, result)
                                }
                            })


                        }
                    })

                    break;
                case 'HH_DATA_RATE':
                    deviceCondition = { HypersproutID: data.CellID, IsHyperHub: true };
                    findCursor(hyperSproutCollection, deviceCondition, "HyperHub", function (err, res) {
                        if (err) {
                            callback(err, null)
                        } else if (res.length > 0) {
                            jobCondition = { SerialNumber: res[0].HypersproutSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                            updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, result)
                                }
                            })
                        }
                    })
                    break;

                case 'DL_DATA_RATE':
                    deviceCondition = { DeltalinkID: data.MeterID };
                    findCursor(deltalinkCollection, deviceCondition, "DeltaLink", function (err, res) {
                        if (err) {
                            callback(err, null)
                        } else if (res.length > 0) {
                            jobCondition = { SerialNumber: res[0].DeltalinkSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                            updatejobStatus(jobsCollection, jobCondition, jobSetCondition, function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, result)
                                }
                            })

                        }
                    })
                    break;

                default:
                    callback("Invalid Attribute!!", null)

            }

        } else {
            callback("inavalid Action !!", null)
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - save Clear log status
* @param meterCollection
* @param hyperSproutCollection
* @param DeltalinkCollection
* @param jobsCollection
* @param data i.e MeterID, CellID, MessageID, Status, Action and Attribute
* @param JobSetCondition  set job status parameter
* @param callback - callback function returns success or error response
* @return callback function
*/

function switchCaseDeviceResponse(meterCollection, transformerCollection, hyperSproutCollection, DeltalinkCollection, jobsCollection, data, JobSetCondition, callback) {
    try {
        let deviceCondition;
        let jobCondition;
        let values;
        let sql = `INSERT INTO device_datarate 
        (
            Circuit_ID, Transformer_ID, Transformer_SerialNumber, Hypersprout_ID, Hypersprout_SerialNumber,IsHyperHub, Meter_ID, Meter_SerialNumber, Deltalink_ID, Deltalink_SerialNumber, DeviceType , DeviceStatus, Download_Rate, Upload_Rate, Latency, DBTimestamp, createdAt, updatedAt
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? 
        )`;
        let now = new Date(Date.now()).toISOString();
        switch (data.Attribute) {
            case 'METER_DATA_RATE':
                deviceCondition = { MeterID: data.MeterID };
                findCursor(meterCollection, deviceCondition, "Meter", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        deviceCondition = { HypersproutID: res[0].HypersproutID };
                        findCursor(hyperSproutCollection, deviceCondition, "Hypersprout", function (err, res1) {
                            if (err) {
                                callback(err, null)
                            } else if (res1.length > 0) {
                                deviceCondition = { TransformerID: res1[0].TransformerID };
                                findCursor(transformerCollection, deviceCondition, "Transformer", function (err, res2) {
                                    if (err) {
                                        callback(err, null)
                                    } else if (res2.length > 0) {
                                        jobCondition = {  SerialNumber: res[0].MeterSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                                        updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                values = [res2[0].CircuitID, res1[0].TransformerID, res2[0].TransformerSerialNumber, res1[0].HypersproutID, res1[0].HypersproutSerialNumber, res1[0].IsHyperHub, res[0].MeterID, res[0].MeterSerialNumber, "", "", "Meter", res[0].Status, data.Data[0].UploadRate, data.Data[0].DownloadRate, data.Data[0].Latency, now, now, now]

                                                insertIntoMysql(sql, values, function (err, resultMysql) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        callback(null, result)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })

                break;
            case 'HS_DATA_RATE':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: false };
                findCursor(hyperSproutCollection, deviceCondition, "HyperSprout", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        deviceCondition = { TransformerID: res[0].TransformerID };
                        findCursor(transformerCollection, deviceCondition, "Transformer", function (err, res2) {
                            if (err) {
                                callback(err, null)
                            } else if (res2.length > 0) {
                                jobCondition = {SerialNumber: res[0].HypersproutSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                                updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        values = [res2[0].CircuitID, res2[0].TransformerID, res2[0].TransformerSerialNumber, res[0].HypersproutID, res[0].HypersproutSerialNumber, res[0].IsHyperHub, data.MeterID, "", "", "", "HyperSprout", res[0].Status, data.Data[0].UploadRate, data.Data[0].DownloadRate, data.Data[0].Latency, now, now, now]
                                        insertIntoMysql(sql, values, function (err, resultMysql) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                callback(null, result)
                                            }
                                        })
                                    }
                                })
                            }
                        })


                    }
                })

                break;

            case 'HH_DATA_RATE':
                deviceCondition = { HypersproutID: data.CellID, IsHyperHub: true };
                findCursor(hyperSproutCollection, deviceCondition, "HyperHub", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        deviceCondition = { TransformerID: res[0].TransformerID };
                        findCursor(transformerCollection, deviceCondition, "Transformer", function (err, res2) {
                            if (err) {
                                callback(err, null)
                            } else if (res2.length > 0) {
                                jobCondition = { SerialNumber: res[0].HypersproutSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                                updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        values = [res2[0].CircuitID, res2[0].TransformerID, res2[0].TransformerSerialNumber, res[0].HypersproutID, res[0].HypersproutSerialNumber, res[0].IsHyperHub, data.MeterID, "", "", "", "HyperHub", res[0].Status, data.Data[0].UploadRate, data.Data[0].DownloadRate, data.Data[0].Latency, now, now, now]

                                        insertIntoMysql(sql, values, function (err, resultMysql) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                callback(null, result)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
                break;

            case 'DL_DATA_RATE':
                deviceCondition = { DeltalinkID: data.MeterID };
                findCursor(DeltalinkCollection, deviceCondition, "DeltaLink", function (err, res) {
                    if (err) {
                        callback(err, null)
                    } else if (res.length > 0) {
                        deviceCondition = { MeterID: res[0].MeterID };
                        findCursor(meterCollection, deviceCondition, "Meter", function (err, res1) {
                            if (err) {
                                callback(err, null)
                            } else if (res1.length > 0) {
                                deviceCondition = { HypersproutID: res1[0].HypersproutID };
                                findCursor(hyperSproutCollection, deviceCondition, "Hypersprout", function (err, res2) {
                                    if (err) {
                                        callback(err, null)
                                    } else if (res2.length > 0) {
                                        deviceCondition = { TransformerID: res2[0].TransformerID };
                                        findCursor(transformerCollection, deviceCondition, "Transformer", function (err, res3) {
                                            if (err) {
                                                callback(err, null)
                                            } else if (res2.length > 0) {
                                                jobCondition = {  SerialNumber: res[0].DeltalinkSerialNumber, JobName: "Data Rate", "Status": "Pending", EndTime: null };
                                                updatejobStatus(jobsCollection, jobCondition, JobSetCondition, function (err, result) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        values = [res3[0].CircuitID, res3[0].TransformerID, res3[0].TransformerSerialNumber, res2[0].HypersproutID, res2[0].HypersproutSerialNumber, res2[0].IsHyperHub, "", "", data.MeterID, res[0].DeltalinkSerialNumber, "DeltaLink", res[0].Status,  data.Data[0].DownloadRate, data.Data[0].UploadRate, data.Data[0].Latency, now, now, now]
                                                        insertIntoMysql(sql, values, function (err, resultMysql) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                callback(null, result)
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })

                    }
                })
               break;

            default:
                callback("Invalid Attribute!!", null)

        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}


/**
* @description - function to update the Job Status
* @param jobsCollection
* @param JobSetCondition
* @param JobCondition
* @param callback - callback function returns success or error response
* @return callback function
*/
function updatejobStatus(jobsCollection, JobCondition, JobSetCondition, callback) {
    try {
        jobsCollection.updateMany(JobCondition, { $set: JobSetCondition }, function (err, result) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, result)
            }
        })
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }

}

/**
* @description - function to insert data in mysql Data Rate table
* @param data - data to insert
* @param callback - callback function returns success or error response
* @return callback function
*/
function insertIntoMysql(sql, values, callback){
    try {
        dbMysqlCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                connection.query(sql,values,  function (err, rows, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.end();
                        callback(null, rows)
                    }
                })
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
}



/**
* @description - get DataRateReport
* @param data i.e page , limit, deviceType, startTime, endTime, search
* @param callback - callback function returns success or error response
* @return callback function
*/
function getDataRateReport(data, callback) {
    try {
        if (!data.search || data.search == null || data.search == "null") {
            let TableName = "device_datarate";
            let ColumnName = "Circuit_ID, Transformer_ID, Transformer_SerialNumber, Hypersprout_ID,Hypersprout_SerialNumber, Meter_ID,Meter_SerialNumber, Deltalink_ID, Deltalink_SerialNumber, DeviceType, Download_Rate, Upload_Rate, Latency, IsHyperHub, DBTimestamp ";
            let start = `${new Date(data.startTime).toLocaleString()}`;
            let end = `${new Date(data.endTime).toLocaleString()}`;
            let WhereCondition = `DBTimestamp >= '${start}' AND  DBTimestamp <= '${end}' AND DeviceType = '${data.deviceType}'`;
            let Count = "DISTINCT DBTimestamp";
            let CountWhereCondition = `DBTimestamp >= '${start}' AND  DBTimestamp <= '${end}' AND DeviceType = '${data.deviceType}'`
            paginatedResults.paginatedResultsMySQLSortBYDesc(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, data, "DataRateReport", "DBTimestamp", function (err, Details) {

                if (err) {
                    callback(err, null)
                } else {
                    callback(null, Details)
                   
                }
            })
        } else {
            let TableName = "device_datarate";
            let ColumnName = "Circuit_ID, Transformer_ID, Transformer_SerialNumber, Hypersprout_ID,Hypersprout_SerialNumber, Meter_ID,Meter_SerialNumber, Deltalink_ID, Deltalink_SerialNumber, DeviceType, Download_Rate, Upload_Rate, Latency, IsHyperHub, DBTimestamp ";
            let start = `${new Date(data.startTime).toLocaleString()}`;
            let end = `${new Date(data.endTime).toLocaleString()}`;
            let WhereCondition = ` Circuit_ID LIKE '%${data.search}%' AND DBTimestamp >= '${start}' AND  DBTimestamp <= '${end}' AND DeviceType = '${data.deviceType}'`;
            let Count = "DISTINCT DBTimestamp";
            let CountWhereCondition = ` Circuit_ID LIKE '%${data.search}%' AND DBTimestamp >= '${start}' AND  DBTimestamp <= '${end}' AND DeviceType = '${data.deviceType}'`
            paginatedResults.paginatedResultsMySQLSortBYDesc(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, data, "NetworkResponseRate", "DBTimestamp", function (err, Details) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, Details);
                }
            })
        }

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
};
module.exports = {
    selectAllUniqueCircuitIDs: selectAllUniqueCircuitIDs,
    selectAllTransformerIDsByDTC: selectAllTransformerIDsByDTC,
    getTransformerPhaseDetails: getTransformerPhaseDetails,
    selectAllUniqueDeltalink: selectAllUniqueDeltalink,
    selectAllMeterByTransformerID:selectAllMeterByTransformerID,
    getDataRate:getDataRate,
    saveDeviceDataRateStatus:saveDeviceDataRateStatus,
    getDataRateReport:getDataRateReport
};
