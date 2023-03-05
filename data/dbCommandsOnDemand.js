//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var insertError = require('./insertErrorLogsToDB.js');
let fs = require('fs');
let validation = './config/configParams.json';
validation = fs.readFileSync(validation, 'utf-8');
let objValidation = JSON.parse(validation);

/* *************** DB Commands SECTION 2 - EXPOSED METHODS ************************ */

/**
* @description - For the Webservice - MeterKwH ,Desc - OnDemand Meter Transaction data Response IN MONGODB 
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/

function MeterKwH(MeterID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterKwHFromMongoDB(db.delta_Meters, db.delta_Hypersprouts, db.delta_SchedulerFlags, db.delta_Meters_OnDemand_Transactions, MeterID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - OnDemand Raw Data,  Desc - OnDemand insertion of data in db
* @params rev, cellid, meterid, messageid, Action, Attribute, data, callback
* @return callback function
*/
function OnDemandSystemEventInsert(rev, cellid, meterid, messageid, Action, Attribute, data, callback) {
    try {
        var SystemEventforInsert = [];
        var doc = {
            "Rev": rev,
            "CellID": cellid,
            "MeterID": meterid,
            "MessageID": messageid,
            "Action": Action,
            "Attribute": Attribute,
            "DBTimestamp": new Date(),
            "Data": data
        };
        SystemEventforInsert.push(doc);

        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                OnDemandSystemEventInsertMongoDB(db.delta_SystemEvents, SystemEventforInsert, callback);
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};

/**
* @description - For the Webservice - MeterKwH, Desc - OnDemand Meter Transaction data IN MONGODB 
* @param DeviceID
* @param MessageID
* @param MeterID
* @param MeterSerialNumber
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterKwHRequested(DeviceID, MessageID, /*Flag,*/ MeterID, MeterSerialNumber, callback) {
    try {
        var jobInsert = {
            "JobID": shortid.generate(),
            "DeviceID": MeterID,
            "SerialNumber": MeterSerialNumber,
            "DeviceType": "Meter",
            "JobName": "OnDemand",
            "JobType": "Meter Read",
            "Status": "Pending",
            "Group": "None",
            "CreatedDateTimestamp": new Date(),
        };
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                MeterKwHRequestedFromMongoDB(db.delta_SchedulerFlags, db.delta_Jobs, db.delta_Meters, DeviceID, MessageID, /*Flag,*/ MeterID, jobInsert, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - MeterKwH, Desc - OnDemand Meter KwH Delay in response
* @param MeterID
* @param JobID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterKwHRequestDelayed(MeterID, JobID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterKwHRequestDelayedMongoDB(db.delta_Jobs, MeterID, JobID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  For the Webservice - MeterKwHDetails, OnDemand Meter Connect Disconnect Status from MONGODB
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/

function MeterKwHDetails(MeterID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterKwHDetailsFromMongoDB(db.delta_Meters_OnDemand_Transactions, MeterID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - MeterKwHResponse, OnDemand Meter Transaction data Response
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterKwHResponse(MeterID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterKwHResponseMongoDB(db.delta_Meters, db.delta_Jobs, MeterID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - For the Webservice - MeterConnectDisconnect, OnDemand Meter Connect Disconnect IN MONGODB 
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconn(MeterID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterConnDisconnFromMongoDB(db.delta_Meters, db.delta_Hypersprouts, db.delta_SchedulerFlags, MeterID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description -  For the Webservice - MeterConnectDisconnect, Desc - OnDemand Meter Connect Disconnect Status Update in MONGODB
* @params MeterID, OnDemandType, DeviceID, MessageID, MeterSerialNumber, callback
* @return callback function
*/
function MeterConnDisconnInitiated(MeterID, OnDemandType, DeviceID, MessageID, MeterSerialNumber, callback) {
    try {
        if (OnDemandType === "Connect") {
            var jobInsert = {
                "JobID": shortid.generate(), "DeviceID": MeterID, "SerialNumber": MeterSerialNumber, "DeviceType": "Meter", "JobName": "Remote Connect Jobs", "JobType": "OnDemand Connect/Disconnect", "Status": "Pending", "Group": "None", "CreatedDateTimestamp": new Date(),
            };
        } else {
            var jobInsert = {
                "JobID": shortid.generate(), "DeviceID": MeterID, "SerialNumber": MeterSerialNumber, "DeviceType": "Meter", "JobName": "Remote Disconnect Jobs", "JobType": "OnDemand Connect/Disconnect", "Status": "Pending", "Group": "None", "CreatedDateTimestamp": new Date(),
            };
        }
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterConnDisconnInitiatedFromMongoDB(db.delta_Meters, db.delta_SchedulerFlags, db.delta_Jobs, MeterID, OnDemandType, DeviceID, MessageID, jobInsert, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - For the Webservice - MeterConnectDisconnect, OnDemand Meter ConnectDisconnect Delay in response
* @param MeterID
* @param JobID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconnDelayed(MeterID, JobID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterConnDisconnDelayedMongoDB(db.delta_Meters, db.delta_Jobs, MeterID, JobID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  For the Webservice - MeterConnectDisconnectDetails,OnDemand Meter Connect Disconnect Status from MONGODB
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconnDetails(MeterID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterConnDisconnDetailsFromMongoDB(db.delta_Meters, MeterID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - MeterConnectDisconnectresponse, Desc - OnDemand Meter Connect Disconnect Status Update IN MONGODB from IoT
* @param meterID
* @param MessageID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconnResponse(meterID, MessageID, Attribute, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                MeterConnDisconnResponseFromMongoDB(db.delta_Meters, db.delta_Jobs, meterID, MessageID, Attribute, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/* ********** DB Commands SECTION 2 - NON-EXPOSED METHODS************************ */


/**
* @description - // For the Webservice - MeterKwH
* @param collectionName, collectionName1, collectionName2, collectionName3, MeterID, callback
* @return callback function
*/
function MeterKwHFromMongoDB(collectionName, collectionName1, collectionName2, collectionName3, MeterID, callback) {
    try {
        collectionName3.remove({ "result.meters.DeviceID": MeterID }, function (err, meterTransactionalDataDeleted) {
            if (err)
                insertError.putErrorDetails(err, callback);
        });
        collectionName.find({
            "MeterID": MeterID
        },
            {
                "ConnDisconnStatus": 1,
                "MeterSerialNumber": 1,
                "HypersproutID": 1,
                "TransformerID": 1,
                "Meters_DeviceDetails.CountryCode": 1,
                "Meters_DeviceDetails.RegionCode": 1,
                "Status": 1
            }).toArray(function (err, meterKwHdetails) {
                if (err)
                    callback(err, null);
                else {
                    if (meterKwHdetails.length !== 0) {
                        // var TransformerID = meterKwHdetails[0].TransformerID;
                        if (meterKwHdetails[0].hasOwnProperty("HypersproutID")) {
                            collectionName1.find({ "HypersproutID": meterKwHdetails[0].HypersproutID }, { "_id": 0, "DeviceID": 1 }).toArray(function (err1, deviceDetails) {
                                if (err1) {
                                    callback(err1, null);
                                }
                                else {
                                    if (deviceDetails.length !== 0) {
                                        meterKwHdetails.push(deviceDetails[0].DeviceID);
                                    }
                                    var DeviceID = meterKwHdetails[1];

                                    collectionName2.find({ "DeviceID": DeviceID }, { "MessageID": 1, /*"Flag": 1,*/ "_id": 0 }).toArray(function (err, messageIDdetails) {
                                        if (err)
                                            callback(err, null);
                                        else {
                                            //var Flag = [];

                                            if ((messageIDdetails != null) && (messageIDdetails.length != 0)) {
                                                //Flag.push(messageIDdetails[0].Flag);

                                                meterKwHdetails.push(messageIDdetails[0].MessageID);
                                                //meterKwHdetails.push(messageIDdetails[0].Flag);
                                            }
                                            /* Commented for SchedulerFlag - start
                                            if (Flag[0] >= 3) {
                                                callback("Meter Disconnected !!", null);
                                            } else {
                                                Commented for SchedulerFlag - End*/
                                            callback(null, meterKwHdetails);
                                            /* Commented for SchedulerFlag - start
                                        }
                                        Commented for SchedulerFlag - End*/
                                        }
                                    })
                                }
                            })
                        } else {
                            callback("Invalid HypersproutID", null);
                        }
                    } else {
                        callback('Meter data not available', null);
                    }
                }
            })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - On Demand Read & Connect Disconnect 
* @param collectionName
* @param doc
* @param callback - callback function returns success or error response
* @return callback function
*/
function OnDemandSystemEventInsertMongoDB(collectionName, doc, callback) {
    try {
        collectionName.insert(doc, function (err, onDemandRawDataInsert) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else
                callback(null, "On Demand Raw Data Inserted Successfully");
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
};


/**
* @description - // For the Webservice - MeterKwH Response
* @param ollectionName, collectionName1, collectionName2, DeviceID, MessageID,MeterID, jobInsert, callback
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterKwHRequestedFromMongoDB(collectionName, collectionName1, collectionName2, DeviceID, MessageID, /*Flag,*/ MeterID, jobInsert, callback) {
    try {
        var JobID = [];
        collectionName.update({ "DeviceID": DeviceID }, { "$set": { "MessageID": MessageID/*, "Flag": Flag*/ } }, function (err, schedulerFlagUpdated) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                collectionName1.insertOne(jobInsert, function (err, jobsInserted) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        collectionName2.update({ "MeterID": MeterID }, { "$set": { "JobID": jobInsert.JobID } }, function (err, jobDetailsUpdatedMeters) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else {
                                JobID = jobInsert.JobID;
                                callback(null, JobID);
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - // For the Webservice - MeterKwH
* @param collectionName
* @param MeterID
* @param JobID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterKwHRequestDelayedMongoDB(collectionName, MeterID, JobID, callback) {
    try {
        collectionName.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, meterKwHJobStatus) {
            if (err)
                callback(err, null);
            else {
                if (meterKwHJobStatus.length) {
                    var Status = meterKwHJobStatus[0].Status;
                    if (Status === "Pending") {
                        collectionName.update({ "JobID": JobID }, { "$set": { "Status": "Failed", "EndTime": new Date() } }, function (err, delayStatusUpdate) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else
                                callback(null, "Meter KwH Delayed in Response handled Successfully");
                        });
                    } else
                        callback(null, "Meter KwH Delayed Completed Successfully");
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
* @description - // For the Webservice - MeterKwHDetails
* @param collectionName
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterKwHDetailsFromMongoDB(collectionName, MeterID, callback) {
    try {
        collectionName.find({ "result.meters.DeviceID": MeterID }, { "result.meters.ActiveReceivedCumulativeRate_Total": 1, "_id": 0 }).limit(1).sort({ $natural: 1 }).toArray(function (err, meterOnDemandKwHDetails) {
            if (err)
                callback(err, null);
            else {
                var meterOnDemandKwHValue = "NoValueFound";
                if (meterOnDemandKwHDetails != null) {
                    for (var i in meterOnDemandKwHDetails) {
                        //console.log('==> meterOnDemandKwHDetails ==>', meterOnDemandKwHDetails[i].result);
                        if (meterOnDemandKwHDetails.hasOwnProperty(i))
                            meterOnDemandKwHValue = meterOnDemandKwHDetails[i].result.meters[i].ActiveReceivedCumulativeRate_Total;
                    }
                }
                callback(null, meterOnDemandKwHValue);
            }
        })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - // For the Webservice - MeterKwHResponse
* @param collectionName
* @param collectionName1
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterKwHResponseMongoDB(collectionName, collectionName1, MeterID, callback) {
    try {
        collectionName.find({ "MeterID": MeterID }, { "JobID": 1, "_id": 0 }).toArray(function (err, meterKwHJobIDFetched) {
            if (err)
                callback(err, null);
            else {
                if ((meterKwHJobIDFetched.length) && (meterKwHJobIDFetched[0].JobID != undefined)) {
                    var JobID = meterKwHJobIDFetched[0].JobID;
                    collectionName1.find({ "SerialNumber": meterKwHJobIDFetched[0].MeterSerialNumber, "JobType": "OnDemand Connect/Disconnect", Status: "Pending" }, { "JobID": 1, "_id": 0 }).toArray(function (err, JobsFetched) {
                        if (err)
                            callback(err, null);
                        else {
                            let Flag;
                            let Remarks;
                            if (JobsFetched.length > 0) {
                                if (meterKwHJobIDFetched[0].ConnDisconnStatus === "ConnectInitiated") {
                                    Flag = "Disconnected";
                                    Remarks = "Meter connect Unsuccessful"

                                } else if (meterKwHJobIDFetched[0].ConnDisconnStatus === "DisconnectInitiated") {
                                    Flag = "Connected";
                                    Remarks = "Meter Diconnect Unsuccessful"

                                }
                                for (let i in JobsFetched) {
                                    if (JobsFetched.hasOwnProperty(i)) {
                                        let JobID1 = JobsFetched[i].JobID;
                                        let createdTime = new Date(JobsFetched[i].CreatedDateTimestamp).getTime();
                                        let curretTime = new Date().getTime();
                                        let diff = curretTime - createdTime;
                                        if (diff > 300000) {
                                            let JobStatus = "Failed";
                                            collectionName1.update({ "DeviceID": MeterID, "JobID": JobID1 }, { "$set": { "Status": JobStatus, "Remark": Remarks, "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                                                if (err)
                                                    insertError.putErrorDetails(err, callback);
                                                else {
                                                    console.log("Meter KwH Requested Successfully")
                                                }
                                            });
                                            if (i == JobsFetched.length - 1) {
                                                if (Flag) {
                                                    collectionName.update({ "MeterID": MeterID }, { "$set": { "ConnDisconnStatus": Flag } }, function (err, DetailsUpdated) {
                                                        if (err) {
                                                            insertError.putErrorDetails(err, callback);
                                                            callback(err, null)
                                                        }
                                                        else {
                                                            collectionName1.update({ "DeviceID": MeterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                                                                if (err) {
                                                                    insertError.putErrorDetails(err, callback);
                                                                    callback(err, null)
                                                                }
                                                                else
                                                                    callback(null, "Meter KwH Requested Successfully");
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    callback(null, "Meter KwH Requested Successfully");
                                                }

                                            }
                                        }
                                        else {
                                            if (i == JobsFetched.length - 1) {
                                                collectionName1.update({ "DeviceID": MeterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                                                    if (err)
                                                        insertError.putErrorDetails(err, callback);
                                                    else
                                                        callback(null, "Meter KwH Requested Successfully");
                                                });

                                            }
                                        }
                                    }
                                }
                            } else {
                                let Flag;
                                if (meterKwHJobIDFetched[0].ConnDisconnStatus === "ConnectInitiated") {
                                    Flag = "Disconnected";

                                } else if (meterKwHJobIDFetched[0].ConnDisconnStatus === "DisconnectInitiated") {
                                    Flag = "Connected";
                                }
                                if (Flag) {
                                    collectionName.update({ "MeterID": MeterID }, { "$set": { "ConnDisconnStatus": Flag } }, function (err, DetailsUpdated) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            collectionName1.update({ "DeviceID": MeterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                                                if (err)
                                                    insertError.putErrorDetails(err, callback);
                                                else
                                                    callback(null, "Meter KwH Requested Successfully");
                                            });
                                        }
                                    });
                                } else {
                                    collectionName1.update({ "DeviceID": MeterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else
                                            callback(null, "Meter KwH Requested Successfully");
                                    });
                                }

                            }

                        }
                    })

                    // collectionName1.update({ "DeviceID": MeterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                    //     if (err)
                    //         insertError.putErrorDetails(err, callback);
                    //     else
                    //         callback(null, "Meter KwH Requested Successfully");
                    // });
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
* @description - // For the Webservice - MeterConnectDisconnect
* @params collectionName, collectionName1, collectionName2, MeterID, callback
* @return callback function
*/
function MeterConnDisconnFromMongoDB(collectionName, collectionName1, collectionName2, MeterID, callback) {
    try {
        //collectionName.find({ MeterSerialNumber: MeterSerialNumber, /*"Meters_DeviceDetails.MeterDisconnector": "Yes" */ },
        collectionName.find({ MeterID: MeterID, /*"Meters_DeviceDetails.MeterDisconnector": "Yes" */ },
            {
                "MeterSerialNumber": 1,
                "Meters_DeviceDetails.MeterDisconnector": 1,
                "ConnDisconnStatus": 1,
                "Meters_Communications.MeterAdminPassword": 1,
                "HypersproutID": 1,
                "TransformerID": 1,
                "Meters_DeviceDetails.CountryCode": 1,
                "Meters_DeviceDetails.RegionCode": 1
            }).toArray(function (err, meterdetails) {
                if (err)
                    callback(err, null);
                else {
                    if (meterdetails.length !== 0) {
                        var TransformerID = meterdetails[0].TransformerID;
                        if (meterdetails[0].hasOwnProperty("HypersproutID")) {
                            collectionName1.find({ "HypersproutID": meterdetails[0].HypersproutID }, { "DeviceID": 1, "_id": 0 }).toArray(function (err, deviceIDdetails) {
                                if (err)
                                    callback(err, null);
                                else {
                                    if ((deviceIDdetails !== null) && (deviceIDdetails.length > 0)) {
                                        meterdetails.push(deviceIDdetails[0].DeviceID);
                                    }
                                    var DeviceID = meterdetails[1];

                                    collectionName2.find({ "DeviceID": DeviceID }, { "MessageID": 1, /*"Flag": 1, */"_id": 0 }).toArray(function (err, messageIDdetails) {
                                        if (err)
                                            callback(err, null);
                                        else {
                                            //var Flag = [];
                                            if ((messageIDdetails != null) && (messageIDdetails.length > 0)) {
                                                //Flag.push(messageIDdetails[0].Flag);

                                                meterdetails.push(messageIDdetails[0].MessageID);
                                                //meterdetails.push(messageIDdetails[0].Flag);
                                            }
                                            /* Commented for SchedulerFlag - start
                                            if (Flag[0] >= 3) {
                                                callback("Meter Disconnected !!", null);
                                            } else {
                                            Commented for SchedulerFlag - End*/
                                            callback(null, meterdetails);
                                            /* Commented for SchedulerFlag - start
                                        }
                                        Commented for SchedulerFlag - End*/
                                        }
                                    })

                                }
                            })
                        } else {
                            callback("Invalid HypersproutID", null);
                        }
                    } else {
                        callback("Invalid meterId", null);
                    }
                }
            })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - For the Webservice - MeterConnectDisconnect
* @param collectionName, collectionName1, collectionName2, MeterID, OnDemandType, DeviceID, MessageID, jobInsert, callback
* @param callback - callback function returns success or error response
* @return callback function
*/

function MeterConnDisconnInitiatedFromMongoDB(collectionName, collectionName1, collectionName2, MeterID, OnDemandType, DeviceID, MessageID, jobInsert, callback) {
    try {
        var Flag;
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Meters;
                var CName1 = db.delta_SchedulerFlags;
                var CName2 = db.delta_Jobs;

                if (OnDemandType === "Disconnect") {
                    Flag = "DisconnectInitiated";
                    MeterConnDisconnInitiatedInsert(CName, CName1, CName2, MeterID, OnDemandType, DeviceID, MessageID, Flag, jobInsert, callback);
                }
                else {
                    Flag = "ConnectInitiated";
                    MeterConnDisconnInitiatedInsert(CName, CName1, CName2, MeterID, OnDemandType, DeviceID, MessageID, Flag, jobInsert, callback);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - Meter Connected Disconnected Initiated Insert
* @param collectionName
* @param collectionName1
* @param collectionName2
* @param MeterID
* @param OnDemandType
* @param DeviceID
* @param MessageID
* @param Flag
* @param jobInsert
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconnInitiatedInsert(collectionName, collectionName1, collectionName2, MeterID, OnDemandType, DeviceID, MessageID, Flag, jobInsert, callback) {
    try {
        collectionName.update({ MeterID: MeterID }, { "$set": { "ConnDisconnStatus": Flag, "JobID": jobInsert.JobID } }, function (err, MtrConnDissconStatusUpdate) {
            if (err)
                insertError.putErrorDetails(err, callback);
            else {
                collectionName1.update({ "DeviceID": DeviceID }, { "$set": { "MessageID": MessageID } }, function (err, schedulerFlagUpdated) {
                    if (err)
                        insertError.putErrorDetails(err, callback);
                    else {
                        collectionName2.insertOne(jobInsert, function (err, jobsInserted) {
                            console.log('==> Inserted Job :  ==>', jobInsert);
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else {
                                var JobID = jobInsert.JobID;
                                callback(null, JobID);
                            }
                        });

                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - MeterConnectDisconnect Delay response
* @param collectionName
* @param collectionName1
* @param MeterID
* @param JobID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconnDelayedMongoDB(collectionName, collectionName1, MeterID, JobID, callback) {
    try {
        var Flag;
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Meters;
                var CName1 = db.delta_Jobs;

                collectionName.find({ "MeterID": MeterID }, { "ConnDisconnStatus": 1, "_id": 0 }).toArray(function (err, meterKwHConnDisconnStatus) {
                    if (err)
                        callback(err, null);
                    else {
                        if (meterKwHConnDisconnStatus.length) {
                            var ConnDisconnStatus = meterKwHConnDisconnStatus[0].ConnDisconnStatus != undefined ? meterKwHConnDisconnStatus[0].ConnDisconnStatus : 'NA';
                            console.log('************** meterKwHConnDisconnStatus[0].ConnDisconnStatus *******', meterKwHConnDisconnStatus[0].ConnDisconnStatus);
                            if (ConnDisconnStatus === "ConnectInitiated") {
                                Flag = "Disconnected";
                                MeterConnDisconnDelayedUpdate(CName, CName1, MeterID, JobID, Flag, 'Connect', callback);
                            } else if (ConnDisconnStatus === "DisconnectInitiated") {
                                Flag = "Connected";
                                MeterConnDisconnDelayedUpdate(CName, CName1, MeterID, JobID, Flag, 'Disconnect', callback);
                            } else {
                                console.log('==> Nothing matched ==>');
                                callback('Invalid meter data', null);
                            }
                        } else {
                            callback('No data available', null);
                        }
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - Meter Connected  Disconnected Delayed Update
* @param collectionName
* @param collectionName1
* @param MeterID
* @param JobID
* @param Flag
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconnDelayedUpdate(collectionName, collectionName1, MeterID, JobID, Flag, demandType, callback) {
    try {
        collectionName.update({ "MeterID": MeterID }, { "$set": { "ConnDisconnStatus": Flag } }, function (err, delayStatusUpdate) {
            if (err)
                insertError.putErrorDetails(error, callback);
            else {
                collectionName1.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, meterKwHJobStatus) {
                    if (err)
                        callback(err, null);
                    else {
                        if (meterKwHJobStatus.length) {
                            var Status = meterKwHJobStatus[0].Status;
                            if (Status === "Pending") {
                                collectionName1.update({ "JobID": JobID }, { "$set": { "Status": "Failed", "EndTime": new Date(), "Remark": `Failed to ${demandType}` } }, function (err, delayStatusUpdate) {
                                    if (err)
                                        insertError.putErrorDetails(err, callback);
                                    else
                                        callback(null, "Meter KwH Delayed in response handled Successfully !!");
                                });
                            }
                        } else {
                            callback('No data available', null);
                        }
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};


/**
* @description - // For the Webservice - MeterConnectDisconnectDetails
* @param collectionName
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function MeterConnDisconnDetailsFromMongoDB(collectionName, MeterID, callback) {
    try {
        collectionName.find({ MeterID: MeterID }, { "Status": 1, "ConnDisconnStatus": 1, "_id": 0 }).toArray(function (err, meterOnDemandDetails) {
            if (err)
                callback(err, null);
            else
                callback(null, meterOnDemandDetails);
        })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - MeterConnectDisconnectResponse
* @param collectionName
* @param collectionName1
* @param meterID
* @param MessageID
* @param callback - callback function returns success or error response
* @return callback function
*/

function MeterConnDisconnResponseFromMongoDB(collectionName, collectionName1, meterID, MessageID, Attribute, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null, null);
            else {
                var CName = db.delta_Meters;
                var CName1 = db.delta_Jobs;

                // MessageID = 0, Success
                if (MessageID === 0) {
                    collectionName.find({ MeterID: meterID }, { "ConnDisconnStatus": 1, "JobID": 1, "_id": 0 }).toArray(function (err, MtrConnDissconResp) {
                        if (err)
                            callback(err, null);
                        else {
                            if (MtrConnDissconResp.length) {
                                var ConnDisconnStatus = MtrConnDissconResp[0].ConnDisconnStatus != undefined ? MtrConnDissconResp[0].ConnDisconnStatus : 'NA';
                                var JobID = MtrConnDissconResp[0].JobID != undefined ? MtrConnDissconResp[0].JobID : 'NA';
                                if (ConnDisconnStatus === "DisconnectInitiated") {
                                    collectionName.update({ MeterID: meterID }, { "$set": { "ConnDisconnStatus": "Disconnected" } }, function (err, MtrConnDissconResp) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            collectionName1.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, meterJobStatus) {
                                                if (err)
                                                    callback(err, null);
                                                else {
                                                    if (meterJobStatus.length) {
                                                        var Status = meterJobStatus[0].Status;
                                                        if (Status === "Pending") {
                                                            collectionName1.update({ "DeviceID": meterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date(), "Remark": "Meter Disconnected Successfully" } }, function (err, jobDetailsUpdated) {
                                                                if (err)
                                                                    insertError.putErrorDetails(err, callback);
                                                                else
                                                                    callback(null, "Meter Disconnect Request Successfull");
                                                            });
                                                        } else
                                                            callback(null, "Meter Successfully Disconnected !!");
                                                    } else {
                                                        callback('Job data not available', null);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                } else if (ConnDisconnStatus === "ConnectInitiated") {
                                    collectionName.update({ MeterID: meterID }, { "$set": { "ConnDisconnStatus": "Connected" } }, function (err, MtrConnDissconResp) {
                                        if (err)
                                            insertError.putErrorDetails(err, callback);
                                        else {
                                            collectionName1.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, meterJobStatus) {
                                                if (err)
                                                    callback(err, null);
                                                else {
                                                    if (meterJobStatus.length) {
                                                        var Status = meterJobStatus[0].Status;
                                                        if (Status === "Pending") {
                                                            collectionName1.update({ "DeviceID": meterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date(), "Remark": "Meter Connected Successfully" } }, function (err, jobDetailsUpdated) {
                                                                if (err)
                                                                    insertError.putErrorDetails(err, callback);
                                                                else
                                                                    callback(null, "Meter Disconnect Request Successfull");
                                                            });
                                                        } else
                                                            callback(null, "Meter Successfully Connected !!");
                                                    } else {
                                                        callback('Job data not available', null);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                } else {

                                    //update Connect Disconnect Satatus if inititaed from device GUI
                                    let status;
                                    if (Attribute == 'METER_DISCONNECT') {
                                        status = 'Disconnected';

                                        collectionName.update({ MeterID: meterID }, { "$set": { "ConnDisconnStatus": status } }, function (err, MtrConnDissconResp) {


                                            if (err)
                                                insertError.putErrorDetails(err, callback);
                                            else
                                                callback(null, "Meter Disconnect Request Successfull");
                                        });
                                    }
                                    else if (Attribute == 'METER_CONNECT') {
                                        status = 'Connected';

                                        collectionName.update({ MeterID: meterID }, { "$set": { "ConnDisconnStatus": status } }, function (err, MtrConnDissconResp) {

                                            if (err)
                                                insertError.putErrorDetails(err, callback);
                                            else
                                                callback(null, "Meter Connect Request Successfull");
                                        });
                                    }
                                    else {
                                        callback('Invalid attribute data', null);
                                    }
                                    //callback('Invalid meter connection status data', null);
                                }
                            } else {
                                callback('Invalid meter data', null);
                            }
                        }
                    });
                }
                // MessageID = 1 or 2, i.e. Wrong Password from User or HS-Meter Comm Failure respectively
                else
                    MeterConnDisconnResponseFailure(CName, CName1, meterID, MessageID, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - Meter Connected Disconnected Response Failure
* @param collectionName
* @param collectionName1
* @param meterID
* @param MessageID
* @param callback - callback function returns success or error response
* @return callback function
*/

function MeterConnDisconnResponseFailure(collectionName, collectionName1, meterID, MessageID, callback) {
    try {
        collectionName.find({ MeterID: meterID }, { "Status": 1, "ConnDisconnStatus": 1, "JobID": 1, "_id": 0 }).toArray(function (err, MtrConnDissconResp) {
            if (err)
                callback(err, null);
            else {
                if (MtrConnDissconResp.length) {
                    var ConnDisconnStatus = MtrConnDissconResp[0].ConnDisconnStatus != undefined ? MtrConnDissconResp[0].ConnDisconnStatus : 'NA';
                    var JobID = MtrConnDissconResp[0].JobID != undefined ? MtrConnDissconResp[0].JobID : 'NA';
                    if (ConnDisconnStatus === "DisconnectInitiated") {
                        collectionName.update({ MeterID: meterID }, { "$set": { "ConnDisconnStatus": "Connected" } }, function (err, MtrConnDissconResp) {
                            if (err)
                                insertError.putErrorDetails(err, callback);
                            else {
                                collectionName1.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, meterJobStatus) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        if (meterJobStatus.length) {
                                            var Status = meterJobStatus[0].Status;
                                            if (Status === "Pending") {
                                                collectionName1.update({ "DeviceID": meterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                                                    if (err)
                                                        insertError.putErrorDetails(err, callback);
                                                    else
                                                        callback(null, "Meter Connect Disconnected Unsuccessfully !!");
                                                });
                                            } else
                                                callback(null, "Meter Connect Disconnected Unsuccessfully !!");
                                        } else {
                                            callback('Job data not available', null);
                                        }
                                    }
                                });
                            }
                        });
                    } else if (ConnDisconnStatus === "ConnectInitiated") {
                        collectionName.update({ MeterID: meterID }, { "$set": { "ConnDisconnStatus": "Disconnected" } }, function (err, MtrConnDissconResp) {
                            if (err)
                                insertError.putErrorDetails(error, callback);
                            else {
                                collectionName1.find({ "JobID": JobID }, { "Status": 1, "_id": 0 }).toArray(function (err, meterJobStatus) {
                                    if (err)
                                        callback(err, null);
                                    else {
                                        if (meterJobStatus.length) {
                                            var Status = meterJobStatus[0].Status;
                                            if (Status === "Pending") {
                                                collectionName1.update({ "DeviceID": meterID, "JobID": JobID }, { "$set": { "Status": "Completed", "EndTime": new Date() } }, function (err, jobDetailsUpdated) {
                                                    if (err)
                                                        insertError.putErrorDetails(err, callback);
                                                    else
                                                        callback(null, "Meter Connect Disconnected Unsuccessfully !!");
                                                });
                                            } else
                                                callback(null, "Meter Connect Disconnected Unsuccessfully !!");
                                        } else {
                                            callback('Job data not available', null);
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        callback('Invalid meter data', null);
                    }
                } else {
                    callback('Invalid meter data', null);
                }
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - OnDemand Raw Data,  Desc - OnDemand insertion of data in db
* @params rev, cellid, meterid, messageid, Action, Attribute, data, callback
* @return callback function
*/
function deltalinkOnDemandSystemEventInsert(rev, cellid, deltalinkID, messageid, Action, Attribute, data, callback) {
    try {
        let SystemEventforInsert = [];
        let doc = {
            "Rev": rev,
            "CellID": cellid,
            "DeltaLinkID": deltalinkID,
            "MessageID": messageid,
            "Action": Action,
            "Attribute": Attribute,
            "DBTimestamp": new Date(),
            "Data": data
        };

        SystemEventforInsert.push(doc);
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                OnDemandSystemEventInsertMongoDB(db.delta_SystemEvents, SystemEventforInsert, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - decrypt encrypted text
*
* @param encryptedString  - encryptedtext
*
* @return callback function.
*/

function validatePassword(encryptedString, callback) {
    var buff = Buffer.from(encryptedString, 'base64');
    var decryptedString = buff.toString('ascii');
    if (decryptedString == objValidation['Passwords']['ConnectDisconnectPassword'])
        callback(null, "Password Matched");
    else
        callback("Wrong Password", null);
}


/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    MeterKwH: MeterKwH,
    OnDemandSystemEventInsert: OnDemandSystemEventInsert,
    MeterKwHRequested: MeterKwHRequested,
    MeterKwHRequestDelayed: MeterKwHRequestDelayed,
    MeterKwHDetails: MeterKwHDetails,
    MeterKwHResponse: MeterKwHResponse,
    MeterConnDisconn: MeterConnDisconn,
    MeterConnDisconnInitiated: MeterConnDisconnInitiated,
    MeterConnDisconnDelayed: MeterConnDisconnDelayed,
    MeterConnDisconnDetails: MeterConnDisconnDetails,
    MeterConnDisconnResponse: MeterConnDisconnResponse,
    MeterConnDisconnInitiatedFromMongoDB: MeterConnDisconnInitiatedFromMongoDB,
    MeterKwHRequestedFromMongoDB: MeterKwHRequestedFromMongoDB,
    MeterConnDisconnDelayedUpdate: MeterConnDisconnDelayedUpdate,
    deltalinkOnDemandSystemEventInsert: deltalinkOnDemandSystemEventInsert,
    validatePassword: validatePassword
};
