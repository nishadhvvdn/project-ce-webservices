var binaryconvertor = require('./sToBParser.js');
var sToIOT = require('./sendToiot.js');
var onParser = require('./parser.js');
var dbCmd = require('./dbCommandsOnDemand.js');
var dbCon = require('./dbConnection.js');

/**
* @description - Firmware upload event
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename,MeterList,NoOfMeters,serialNumber, callback
* @return callback function
*/
function onBackHaul(Data,JobID ,callback) {
    Data.countrycode = Data.countrycode?Data.countrycode:0;
    Data.regioncode = Data.regioncode?Data.countrycode:0;
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                onParser.hexaCreation(Data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, Data.deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(Data.rev, Data.cellid, Data.meterid, Data.messageid, Data.Action, Data.Attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getRebootCurrentStatus(jobsCollection, Data.messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 30000);

                                    }
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
}
function onCarrierList(Data,JobID ,callback) {
    
    Data.countrycode = Data.countrycode?Data.countrycode:0;
    Data.regioncode = Data.regioncode?Data.countrycode:0;
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                onParser.hexaCreation(Data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, Data.deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(Data.rev, Data.cellid, Data.meterid, Data.messageid, Data.Action, Data.Attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getCarrierList(jobsCollection, Data.messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 50000);

                                    }
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
}
function onMeshScan(Data,JobID ,callback) {
    Data.countrycode = Data.countrycode?Data.countrycode:0;
    Data.regioncode = Data.regioncode?Data.countrycode:0;
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                onParser.hexaCreation(Data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, Data.deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(Data.rev, Data.cellid, Data.meterid, Data.messageid, Data.Action, Data.Attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getMeshScan(jobsCollection, Data.messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 50000);

                                    }
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
}
/**
* @description - Firmware upload event
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename,MeterList,NoOfMeters,serialNumber, callback
* @return callback function
*/
function onMeterConfig(Data,JobID, callback) {
    Data.countrycode = Data.countrycode?Data.countrycode:0;
    Data.regioncode = Data.regioncode?Data.countrycode:0;
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                onParser.hexaCreation(Data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, Data.deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(Data.rev, Data.cellid, Data.meterid, Data.messageid, Data.Action, Data.Attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getRebootCurrentStatus(jobsCollection, Data.messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 30000);

                                    }
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
}

function onConnectivityConfig(Data,JobID, callback) {
    Data.countrycode = Data.countrycode?Data.countrycode:0;
    Data.regioncode = Data.regioncode?Data.countrycode:0;
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                onParser.hexaCreation(Data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, Data.deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(Data.rev, Data.cellid, Data.meterid, Data.messageid, Data.action, Data.attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getRebootCurrentStatus(jobsCollection, Data.messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 30000);

                                    }
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
}
/**
* @description - Firmware upload event
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename,MeterList,NoOfMeters,serialNumber, callback
* @return callback function
*/
function onSystemSettingsConfig(Data,JobID, callback) {
    Data.countrycode = Data.countrycode?Data.countrycode:0;
    Data.regioncode = Data.regioncode?Data.countrycode:0;
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                onParser.hexaCreation(Data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, Data.deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(Data.rev, Data.cellid, Data.meterid, Data.messageid, Data.action, Data.attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getRebootCurrentStatus(jobsCollection, Data.messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 30000);

                                    }
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
}
function onFrontHaul(Data,JobID, callback) {
    Data.countrycode = Data.countrycode?Data.countrycode:0;
    Data.regioncode = Data.regioncode?Data.countrycode:0;
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var jobsCollection = db.delta_Jobs;
                onParser.hexaCreation(Data, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, Data.deviceID, function (err, out) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmd.OnDemandSystemEventInsert(Data.rev, Data.cellid, Data.meterid, Data.messageid, Data.action, Data.attribute, result, function (err, onDemandRawData) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        setTimeout(function () {
                                            getRebootCurrentStatus(jobsCollection, Data.messageid, JobID, function (err, result) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, result);
                                                }
                                            });
                                        }, 30000);

                                    }
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
}





/**
* @description - get Meter Current Status
* @param jobsCollection
* @param meterID
* @param messageid
* @param jobID
* @param callback - callback function returns success or error response
* @return callback function
*/

function getRebootCurrentStatus(jobsCollection, messageid, jobID, callback) {
    jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Completed" } }, function (err, insertResponse) {
        jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "Status": "Completed" } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, ConfigStatus: 1 } }, function (err, result) {
            if (err)
                callback(err, null);
            else {
                callback(null, result.value.ConfigStatus)
            }

        });
    });
}

function getCarrierList(jobsCollection, messageid, jobID, callback) {
    jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Completed" } }, function (err, insertResponse) {
        jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "Status": "Completed" } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, CarrierData: 1 } }, function (err, result) {
            if (err)
                callback(err, null);
            else {
                callback(null, result.value.CarrierData)
            }

        });
    });
}
function getMeshScan(jobsCollection, messageid, jobID, callback) {
    jobsCollection.update({ JobID: jobID }, { "$set": { "Status": "Completed" } }, function (err, insertResponse) {
        jobsCollection.findAndModify({ JobID: jobID }, [], { $set: { "Status": "Completed" } }, { remove: false, new: true, upsert: false, fields: { SerialNumber: 1, scanList: 1 } }, function (err, result) {
            if (err)
                callback(err, null);
            else {
                callback(null, result.value.scanList)
            }

        });
    });
}
module.exports = {
    onBackHaul: onBackHaul,
    onSystemSettingsConfig: onSystemSettingsConfig,
    onMeterConfig: onMeterConfig,
    onFrontHaul: onFrontHaul,
    onConnectivityConfig : onConnectivityConfig,
    onCarrierList : onCarrierList,
    getCarrierList : getCarrierList,
    onMeshScan : onMeshScan,
    getMeshScan : getMeshScan
}