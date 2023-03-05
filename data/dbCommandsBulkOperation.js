//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var dbCmd = require('../data/dbCommandsOnDemand.js');
var shortid = require('shortid');
const async = require('async');
const moment = require('moment')


/**
* @description - For the Webservice - MeterConnectDisconnect, OnDemand Meter Connect Disconnect IN MONGODB 
* @param MeterSerialNumber
* @param callback - callback function returns success or error response
* @return callback function
*/
function BulkMeterConnDisconn(MeterSerialNumber, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                BulkMeterConnDisconnFromMongoDB(db.delta_Meters, db.delta_Hypersprouts, db.delta_SchedulerFlags, MeterSerialNumber, callback);
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
function BulkMeterConnDisconnFromMongoDB(collectionName, collectionName1, collectionName2, MeterSerialNumber, callback) {
    //collectionName.find({ MeterID: MeterID, /*"Meters_DeviceDetails.MeterDisconnector": "Yes" */ },
    try {
        collectionName.find({ MeterSerialNumber: MeterSerialNumber, /*"Meters_DeviceDetails.MeterDisconnector": "Yes" */ },
            {
                "MeterSerialNumber": 1,
                "MeterID" : 1,
                "Meters_DeviceDetails.MeterDisconnector": 1,
                "ConnDisconnStatus": 1,
                "Meters_Communications.MeterAdminPassword": 1,
                "HypersproutID": 1,
                "TransformerID": 1,
                "Meters_DeviceDetails.CountryCode": 1,
                "Meters_DeviceDetails.RegionCode": 1,
                "Status" : 1
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
                        }else{
                            callback("Invalid HypersproutID", null);
                        }
                    }else{
                        callback("Invalid meterId", null);
                    }
                }
            })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description -  For the Webservice - MeterConnectDisconnect, Desc - OnDemand Meter Connect Disconnect Status Update in MONGODB
* @params MeterID, OnDemandType, DeviceID, MessageID, MeterSerialNumber, callback
* @return callback function
*/
function BulkMeterConnDisconnInitiated(MeterID, OnDemandType, DeviceID, MessageID, MeterSerialNumber, createdTime , callback) {
   try {
       if (OnDemandType === "Connect") {
           var jobInsert = {
               "JobID": shortid.generate(), "DeviceID": MeterID, "SerialNumber": MeterSerialNumber, "DeviceType": "Meter", "JobName": "Remote Connect Jobs", "JobType": "OnDemand Connect/Disconnect", "Status": "Pending", "Group": "None", "CreatedDateTimestamp": createdTime, "Remark" : "OnDemand Connect Job is running"
           };
       } else {
           var jobInsert = {
               "JobID": shortid.generate(), "DeviceID": MeterID, "SerialNumber": MeterSerialNumber, "DeviceType": "Meter", "JobName": "Remote Disconnect Jobs", "JobType": "OnDemand Connect/Disconnect", "Status": "Pending", "Group": "None", "CreatedDateTimestamp": createdTime,"Remark" : "OnDemand Disconnect Job is running"
           };
       }
       dbCon.getDb(function (err, db) {
           if (err)
               callback(err, null);
           else
               dbCmd.MeterConnDisconnInitiatedFromMongoDB(db.delta_Meters, db.delta_SchedulerFlags, db.delta_Jobs, MeterID, OnDemandType, DeviceID, MessageID, jobInsert, callback);
       });
   } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
   }
};

/**
* @description - For the Webservice - MeterKwH, Desc - OnDemand Bulk Meter Transaction data IN MONGODB 
* @param DeviceID
* @param MessageID
* @param MeterID
* @param MeterSerialNumber
* @param createdTime
* @param callback - callback function returns success or error response
* @return callback function
*/
function BulkMeterKwHRequested(DeviceID, MessageID, /*Flag,*/ MeterID, MeterSerialNumber, createdTime, callback) {
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
            "CreatedDateTimestamp": createdTime,
            "Remark" : "OnDemand Read Job is running"
        };
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                dbCmd.MeterKwHRequestedFromMongoDB(db.delta_SchedulerFlags, db.delta_Jobs, db.delta_Meters, DeviceID, MessageID, /*Flag,*/ MeterID, jobInsert, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - MeterKwH ,Desc - OnDemand Meter Transaction data Response IN MONGODB 
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/

function listJobDetailsForReadConnectDisconnect(payloadData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                getJobListFromMongoDB(db.delta_Jobs, payloadData, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - MeterKwH ,Desc - OnDemand Meter Transaction data Response IN MONGODB 
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/

function listJobDetailsForBulkOperation(payloadData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                GetBulkOperationJobStatusFromMongoDB(db.delta_Jobs, payloadData, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - getListOfJobs, SELECT All Job lists details FROM MONGODB whose jobType is connet/Disconnect/Read
* @param payloadData object 
* @param JobCollection collection name
* @param callback - callback function returns success or error response
* @return callback function
*/
function GetBulkOperationJobStatusFromMongoDB(JobCollection , payloadData, callback) {
    try {
        let currentDate = new Date();
        //fetch the records from Jobs table whose status need to be updated
        var jobIdArrays = [], jobDateArray = [], whereCondition;
        
        whereCondition = { "CreatedDateTimestamp": { $gte: new Date(payloadData.startTime), $lte: new Date(payloadData.startTime) } ,
        $or: [ { JobType: 'OnDemand Connect/Disconnect' }, { JobType: 'Meter Read' } ]};
     
        JobCollection.aggregate([
            {
                $match:  whereCondition
            },
            {
                $group : {
                    _id : "$CreatedDateTimestamp", 
                    JobType: { $addToSet: "$JobType" },
                    JobID: { $addToSet: "$JobID" },
                    count: {$sum: 1}
                }
            },
            {
                $sort: {
                    '_id': -1
                }
            },
            {
                $facet: {
                    metadata: [{ $count: "total" }, { $addFields: { page: Number(1) } }],
                    data: [{ $skip: 0 }]
                }
            }
            ]).toArray(function (err, JobDetails) {
                if(err)
                    callback(err, null);
                    //console.log(err);
                else{
                    if(JobDetails[0].data.length){
                        dbCon.getDb(function (err, db) {
                            if (err)
                                callback(err, null);
                            else{
                                var collectionName = db.delta_Jobs;
                                var collectionName1 = db.delta_Meters;
                                var collectionName3 = db.delta_Meters_OnDemand_Transactions;
                                async.eachOfLimit(JobDetails[0].data, 1, function (jobData, index, chunkLambdaCallback) {
                                    jobIdArrays = [];
                                    async.eachOfLimit(jobData.JobID , 1 , function(JobID , cnt, innerCallback ){
                                        jobIdArrays.push(JobID);
                                        let createdDate = jobData._id;
                                        var startDate = moment(currentDate, 'YYYY-MM-DD HH:mm:ss'); //now
                                        var endDate = moment(createdDate, 'YYYY-MM-DD HH:mm:ss'); //stored in DB
                                        const secondsDiff = startDate.diff(endDate, "seconds");
    
                                        collectionName.find({ "JobID": jobData.JobID[cnt] }, {
                                            "_id" : 0,
                                            "SerialNumber": 1,
                                            "Status" : 1}).toArray(function (err, JobArrayData) {
                                            if(JobArrayData.length){
                                                //If seconds diff is graeter than 30 then marked that job as Failed
                                                if((jobData.JobType[0] == "OnDemand Connect/Disconnect") && (secondsDiff >= 180) && (JobArrayData[0].Status != 'Error')){
                                                    //From Jobs table find serialNumber of meter & Status
                                                    if(err){
                                                        // callback(err, null);
                                                        innerCallback();
                                                    }
                                                    else{
                                                        //From Meters table find MeterID,ConnDisconnStatus
                                                        collectionName1.find({ "MeterSerialNumber": JobArrayData[0].SerialNumber }, {
                                                            "_id" : 0,
                                                            "MeterSerialNumber": 1,
                                                            "MeterID" : 1 ,
                                                            "ConnDisconnStatus": 1}).toArray(function (err, MeterID) {
                                                                if(err){
                                                                    // callback(err, null);
                                                                    innerCallback();
                                                                }
                                                                else{
                                                                    var ConnDisconnStatus = MeterID[0].ConnDisconnStatus;
                                                                    if (ConnDisconnStatus === "ConnectInitiated") {
                                                                        Flag = "Disconnected";
                                                                        dbCmd.MeterConnDisconnDelayedUpdate(collectionName1, collectionName, MeterID[0].MeterID, JobID, Flag, 'Connect', function(err, resCallback) { });
                                                                        innerCallback();
                                                                    } else if (ConnDisconnStatus === "DisconnectInitiated") {
                                                                        Flag = "Connected";
                                                                        dbCmd.MeterConnDisconnDelayedUpdate(collectionName1, collectionName, MeterID[0].MeterID, JobID, Flag, 'Disconnect', function(err, resCallback) { });
                                                                        innerCallback();
                                                                    }else{
                                                                        console.log('==> Nothing matched ==>');
                                                                        innerCallback();
                                                                    }
                                                                    // dbCmd.MeterConnDisconnDelayed(MeterID[0].MeterID, JobID, function (err, responses) { });
                                                                }
                                                        })
                                                    }
                        
                                                } else if((jobData.JobType[0] == "Meter Read") && (secondsDiff >= 50) && (JobArrayData[0].Status != 'Error')){
                                                    //dbCmd.MeterKwHRequestDelayed(MeterID[0].MeterID, JobID, function(err, responses) { });
                                                    var Status = JobArrayData[0].Status;
                                                    if (Status === "Pending") {
                                                        collectionName.update({ "JobID": JobID }, { "$set": { "Status": "Failed", "EndTime": new Date(), "Remark" : "Failed to Read meter" } }, function (err, delayStatusUpdate) {
                                                            if (err)
                                                                innerCallback();
                                                            else
                                                                innerCallback();
                                                                //callback(null, "Meter KwH Delayed in Response handled Successfully");
                                                        });
                                                    }else
                                                        innerCallback();
                                                    
                                                }else{
                                                    innerCallback();
                                                }
                                            }else{
                                                innerCallback();
                                            }
                                        })
                                    },function(err){
                                        jobDateArray.push({
                                            JobIds : jobIdArrays,
                                            CreatedDateTimestamp : jobData._id
                                        })
                                        chunkLambdaCallback();
                                    });
                                    
                                }, function (err) {
                                    fetchBulkJobListData(jobDateArray,jobIdArrays,collectionName, collectionName1,collectionName3, function(err, records){
                                        if(err)
                                            callback(err, null);
                                        else{
                                            callback(null, records);
                                        }
                                    });
                                });
                            }
                        });
                    }else{
                        callback(null, JobDetails[0].data);
                    }
                }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}


//Common function to fetch data from  Jobs table
function fetchBulkJobListData (jobDateArray,jobIdArrays, collectionName, collectionName1, collectionName3,callback){
    try {
        var jobLists = [];
        if(jobIdArrays.length){
            //Fetch all the data based on JobId from Jobs table
            async.eachOfLimit(jobDateArray , 1 , function(jobData , index, mainListCallback ){
                jobLists = [];
                async.eachOfLimit(jobData.JobIds , 1 , function(JobID , cnt, listCallback ){
                    
                    collectionName.find({ "JobID": JobID  }, {
                        "_id" : 0,
                        "SerialNumber": 1, "DeviceType" : 1, "JobType" : 1, "JobID" : 1, "JobName" : 1,"DeviceID" : 1,
                        "Status" : 1 , "Remark" : 1}).toArray(function (err, listOfJobs) {
                        //From Jobs table find serialNumber of meter & Status
                        if(err){
                            listCallback();
                        }else{
                            let str = listOfJobs[0].JobName;
                            let splitStr = str.split(" ");
                            filename = splitStr.length > 1 ? splitStr[1] : 'Read';
                            //Here need to send data to status
                            //jobLists.push(listOfJobs[0]);
                            let ConnDisconnStatus = 'NA';
                            let MeterStatus = 'NA';
                           
                            if(listOfJobs[0].JobType == "OnDemand Connect/Disconnect"){
                                if((listOfJobs[0].Status != "Error") && (listOfJobs[0].Status != "Failed") && (listOfJobs[0].Status != "Pending")){
                                    collectionName1.find({ MeterSerialNumber: listOfJobs[0].SerialNumber }, { "Status": 1, "ConnDisconnStatus": 1, "_id": 0 }).toArray(function (err, meterOnDemandDetails) {
                                        if(meterOnDemandDetails.length){
                                            ConnDisconnStatus = meterOnDemandDetails[0].ConnDisconnStatus;
                                            MeterStatus = meterOnDemandDetails[0].Status;
                                        }
                                        jobLists.push({
                                            ConnDisconnStatus : ConnDisconnStatus,
                                            MeterStatus : MeterStatus,
                                            JobID : listOfJobs[0].JobID,
                                            SerialNumber : listOfJobs[0].SerialNumber,
                                            DeviceType : listOfJobs[0].DeviceType,
                                            JobType : listOfJobs[0].JobType,
                                            JobStatus : listOfJobs[0].Status,
                                            Remark : (listOfJobs[0].Remark != undefined) ? listOfJobs[0].Remark : 'NA'
                                        })
                                        listCallback();
                                    })
                                }else{
                                    jobLists.push({
                                        ConnDisconnStatus : ConnDisconnStatus,
                                        MeterStatus : MeterStatus,
                                        JobID : listOfJobs[0].JobID,
                                        SerialNumber : listOfJobs[0].SerialNumber,
                                        DeviceType : listOfJobs[0].DeviceType,
                                        JobType : listOfJobs[0].JobType,
                                        JobStatus : listOfJobs[0].Status,
                                        Remark : (listOfJobs[0].Remark != undefined) ? listOfJobs[0].Remark : 'NA'
                                    })
                                    listCallback();
                                }
                            } else {
                                 //Operation in Read
                                 var meterOnDemandKwHValue = "NA";
                                 if((listOfJobs[0].Status != "Error") && (listOfJobs[0].Status != "Failed") && (listOfJobs[0].Status != "Pending")){
                                     collectionName3.find({ "result.meters.DeviceID": listOfJobs[0].DeviceID }, { "result.meters.ActiveReceivedCumulativeRate_Total": 1, "_id": 0 }).limit(1).sort({ "DBTimestamp": -1 }).toArray(function (err, meterOnDemandKwHDetails) {
                                         if (err)
                                             listCallback();
                                             //callback(err, null);
                                         else {
                                                 meterOnDemandKwHValue = "NoValueFound";
                                                 if (meterOnDemandKwHDetails != null) {
                                                     for (var i in meterOnDemandKwHDetails) {
                                                         if (meterOnDemandKwHDetails.hasOwnProperty(i))
                                                             meterOnDemandKwHValue = meterOnDemandKwHDetails[i].result.meters[i].ActiveReceivedCumulativeRate_Total;
                                                     }
                                                 }
                                             jobLists.push({
                                                 ConnDisconnStatus : meterOnDemandKwHValue,
                                                 MeterStatus : 'NA',
                                                 JobID : listOfJobs[0].JobID,
                                                 SerialNumber : listOfJobs[0].SerialNumber,
                                                 DeviceType : listOfJobs[0].DeviceType,
                                                 JobType : listOfJobs[0].JobType,
                                                 JobStatus : listOfJobs[0].Status,
                                                 Remark : (listOfJobs[0].Remark != undefined) ? listOfJobs[0].Remark : 'NA'
                                             })
                                             listCallback();
                                         }
                                     })
                                 }else{
                                     jobLists.push({
                                         ConnDisconnStatus : meterOnDemandKwHValue,
                                         MeterStatus : 'NA',
                                         JobID : listOfJobs[0].JobID,
                                         SerialNumber : listOfJobs[0].SerialNumber,
                                         DeviceType : listOfJobs[0].DeviceType,
                                         JobType : listOfJobs[0].JobType,
                                         JobStatus : listOfJobs[0].Status,
                                         Remark : (listOfJobs[0].Remark != undefined) ? listOfJobs[0].Remark : 'NA'
                                     })
                                     listCallback();
                                 }

                            }
                        }
                    });
                }, function (err) {
                    mainListCallback();
                });
            },function(err){
                callback(null, jobLists);
            });
        }
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - For the Webservice - getListOfJobs, SELECT All Job lists details FROM MONGODB whose jobType is connet/Disconnect/Read
* @param payloadData object 
* @param JobCollection collection name
* @param callback - callback function returns success or error response
* @return callback function
*/
function getJobListFromMongoDB(JobCollection , payloadData, callback) {
    try {
        let whereCondition, JobLists = [], filename = '';
        //fetch the records from Jobs table whose status need to be updated
        let skip = (payloadData.limit * payloadData.page)  - payloadData.limit;
        if(payloadData.startTime == 'null' && payloadData.endTime == 'null'){
            whereCondition = {$or: [ { JobType: 'OnDemand Connect/Disconnect' }, { JobType: 'Meter Read' } ]};
        }else{
            whereCondition = { "CreatedDateTimestamp": { $gte: new Date(payloadData.startTime), $lte: new Date(payloadData.endTime) } ,
            $or: [ { JobType: 'OnDemand Connect/Disconnect' }, { JobType: 'Meter Read' } ]};
        }
        JobCollection.aggregate([
            {
                $match:  whereCondition
            },
            {
                $group : {
                    _id : "$CreatedDateTimestamp", 
                    JobType: { $addToSet: "$JobType" },
                    JobID: { $addToSet: "$JobID" },
                    JobName : {$addToSet: "$JobName"}
                }
            },
            {
                $sort: {
                    '_id': -1
                }
            },
            { 
                $facet : {
                    metadata: [ { $count: "total" }, { $addFields: { page: Number(payloadData.page) } }, { $addFields: { limit: Number(payloadData.limit) } } ] ,
                    data:  [ { $skip: skip }, { $limit: payloadData.limit } ]
                } 
            }
            ]).toArray(function (err, JobDetails) {
                if(err)
                   callback(err, null);
                else{
                    if(JobDetails[0].data.length){
                        for(let i = 0 ; i< JobDetails[0].data.length ; i++){
                            let str =  JobDetails[0].data[i].JobName[0];
                            let splitStr = str.split(" ");
                            filename = splitStr.length > 1 ? splitStr[1] : 'Read';
                            JobLists.push({
                                filename : `Bulk_${filename}`,
                                CreatedDateTimestamp : JobDetails[0].data[i]._id
                            })
                        }
                        let page = JobDetails[0].metadata[0].page;
                        let limit = JobDetails[0].metadata[0].limit;
                        let total = JobDetails[0].metadata[0].total;
                        AddPaginationForAggregationList(page, limit, total, JobLists, function(err, results){
                            if(err)
                                callback(err, null)
                            else
                                callback(null, results);
                        })
                    }else
                       callback(null, JobLists);
                }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

function AddPaginationForAggregationList(page, limit, total, records, callback){
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    if (endIndex > 0) {
        results.next = {
            Page: page + 1,
            Limit: limit
        }
    }
    if (startIndex > 0) {
        results.previous = {
            Page: page - 1,
            Limit: limit
        }
    }
    results.totalRecords =  total
    results.results = records
    callback(null, results);
}

/**
* @description - For the Webservice - getListOfJobs, SELECT All Job lists details FROM MONGODB whose jobType is connet/Disconnect/Read
* @param ListOfMeterSerialNumbers Array
* @param MeterCollection collection name
* @param callback - callback function returns success or error response
* @return callback function
*/
function ValidateAllMeterSerialNumbers(meterSerialNumbers , callback){
    try {
        let serialNumbers = [];
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var meterCollection = db.delta_Meters;

                meterCollection.find({"MeterSerialNumber": { "$in": meterSerialNumbers } }).toArray(function (err, result) {
                    if (err)
                        return callback(err, [])
                    else if (result.length == 0){
                        return callback(new Error("Invalid SerialNumber"), []);
                    }
                    else {
                        for (var i in result) {
                            serialNumbers.push(result[i].MeterSerialNumber);
                        }
                        callback(null, serialNumbers);
                    }
                })
            }
        })
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - For the Webservice - MeterKwH ,Desc - OnDemand Meter Transaction data Response IN MONGODB 
* @param MeterID
* @param callback - callback function returns success or error response
* @return callback function
*/

function listAllJobDetailsForReadConnectDisconnect(callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                getAllJobListFromMongoDB(db.delta_Jobs, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - For the Webservice - getAllJobListFromMongoDB, SELECT All Job lists details FROM MONGODB whose jobType is connet/Disconnect/Read
* @param payloadData object 
* @param JobCollection collection name
* @param callback - callback function returns success or error response
* @return callback function
*/
function getAllJobListFromMongoDB(JobCollection , callback) {
    try {
        let whereCondition, JobLists = [], filename = '';
        whereCondition = {$or: [ { JobType: 'OnDemand Connect/Disconnect' }, { JobType: 'Meter Read' } ]};
        JobCollection.aggregate([
            {
                $match:  whereCondition
            },
            {
                $group : {
                    _id : "$CreatedDateTimestamp", 
                    JobType: { $addToSet: "$JobType" },
                    JobID: { $addToSet: "$JobID" },
                    JobName : {$addToSet: "$JobName"}
                }
            },
            {
                $sort: {
                    '_id': -1
                }
            }
            ]).toArray(function (err, JobDetails) {
                if(err)
                   callback(err, null);
                else{
                        if(JobDetails.length){
                        for(let i = 0 ; i< JobDetails.length ; i++){
                            let str =  JobDetails[i].JobName[0];
                            let splitStr = str.split(" ");
                            filename = splitStr.length > 1 ? splitStr[1] : 'Read';
                            JobLists.push({
                                filename : `Bulk_${filename}`,
                                CreatedDateTimestamp : JobDetails[i]._id
                            })
                        }
                        callback(null, JobLists);
                    }else
                       callback(null, JobLists);
                }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    listJobDetailsForReadConnectDisconnect : listJobDetailsForReadConnectDisconnect,
    getJobListFromMongoDB : getJobListFromMongoDB,
    BulkMeterConnDisconn : BulkMeterConnDisconn,
    BulkMeterConnDisconnInitiated : BulkMeterConnDisconnInitiated,
    BulkMeterKwHRequested : BulkMeterKwHRequested,
    listJobDetailsForBulkOperation : listJobDetailsForBulkOperation,
    ValidateAllMeterSerialNumbers : ValidateAllMeterSerialNumbers,
    listAllJobDetailsForReadConnectDisconnect : listAllJobDetailsForReadConnectDisconnect
};
