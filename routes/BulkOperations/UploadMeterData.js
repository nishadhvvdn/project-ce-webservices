var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsBulkOperation.js');
var onDemDisConn = require('../../data/onDemandDisconnect.js');
var sendtoiot = require('../../data/sendToiot.js');
var onDemandKwh = require('../../data/onDemandMeterKwH.js');
const async = require('async');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/MeterBulkOperationSchema')
var shortid = require('shortid');
var dbCon = require('../../data/dbConnection.js');

router.post('/', function (req, res) {
    try {
        var Type = req.body.Type;
        var List = req.body.List;
        let createdTime = new Date();
        const uploadBulkDataDetailsSchema = schema.uploadBulkDataDetails;
        const data = { Type, List }
        //Validate payload before uploading data
        schemaValidation.validateSchema(data, uploadBulkDataDetailsSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                var rev = 0, pushErrorInSerailNumber = [], Action, Attribute, STATUS_CODE, MeterDisconnector;
                console.log('For Bulk Operation OnDemanType is : ', Type);
                //Find unique list of Meter serial Numbers
                let meterSerialNoList = [... new Set(List)];
                let meterSerialNoListLength = meterSerialNoList.length;
                if (meterSerialNoListLength <= 500) {
                    //Need to check All Meter Serial numbers are valid or not
                    dbCmd.ValidateAllMeterSerialNumbers(meterSerialNoList, function (err, isValidMeteres) {
                        if (err || (isValidMeteres.length == 0))
                            res.json({ "type": false, "Message": "Invalid Meter Serial Number" });
                        else {
                            let index = 0;
                            async.eachLimit(meterSerialNoList, 1, function (meterSerialNoList, chunkLambdaCallback) {
                                dbCmd.BulkMeterConnDisconn(meterSerialNoList, function (err, meterConnDisconnDetails) {
                                    index++;
                                    if (err) {
                                        pushErrorInSerailNumber.push(`${meterSerialNoList} : ${err}`);
                                        insertErrorInJobs(0, meterSerialNoList, createdTime, err, Type, function (err, responses) { });
                                        chunkLambdaCallback();
                                        //res.json({ "type": false, "Message": err });
                                    } else {
                                        var ConnDisconnStatus = meterConnDisconnDetails[0].ConnDisconnStatus;
                                        var TransformerID = meterConnDisconnDetails[0].TransformerID;
                                        var DeviceID = meterConnDisconnDetails[1];
                                        var CountryCode = meterConnDisconnDetails[0].Meters_DeviceDetails.CountryCode != undefined ? meterConnDisconnDetails[0].Meters_DeviceDetails.CountryCode : 0;
                                        var RegionCode = meterConnDisconnDetails[0].Meters_DeviceDetails.RegionCode != undefined ? meterConnDisconnDetails[0].Meters_DeviceDetails.RegionCode : 0;
                                        var MeterMeterAdminPassword = meterConnDisconnDetails[0].Meters_Communications.MeterAdminPassword;
                                        var MessageID = meterConnDisconnDetails[2];
                                        var MeterSerialNumber = meterConnDisconnDetails[0].MeterSerialNumber;
                                        var HypersproutID = meterConnDisconnDetails[0].HypersproutID;
                                        var MeterID = meterConnDisconnDetails[0].MeterID;
                                        if (MessageID === 255) {
                                            MessageID = 0;
                                        } else {
                                            MessageID++;
                                        }

                                        if (Type == "Disconnect") {
                                            MeterDisconnector = meterConnDisconnDetails[0].Meters_DeviceDetails.MeterDisconnector;
                                            if (MeterDisconnector === "No") {
                                                // Case I: "Meter not eligible for Online Disconnect!!"  //res.json({ "type": true, "Message": 0 });
                                                pushErrorInSerailNumber.push(`${meterSerialNoList} : Meter not eligible for Online Disconnect!!`);
                                                insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Meter not eligible for Online Disconnect!!', Type, function (err, responses) { });
                                                chunkLambdaCallback();
                                            } else {
                                                Action = "ACTION_FOR_DEVICE";
                                                Attribute = "METER_DISCONNECT";
                                                STATUS_CODE = "2"; // "AA4"

                                                if (ConnDisconnStatus === "Disconnected") {
                                                    // Case II: "Meter already Disconnect!!"  //res.json({ "type": true, "Message": 1 });
                                                    pushErrorInSerailNumber.push(`${meterSerialNoList} : Meter already Disconnected!!`);
                                                    insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Meter already Disconnected!!', Type, function (err, responses) { });
                                                    chunkLambdaCallback();
                                                } else {
                                                    sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                                                        if (err) {
                                                            //res.json({ "type": false, "Message": err });
                                                            pushErrorInSerailNumber.push(`${meterSerialNoList} : ${err.name != undefined ? err.name : err}`);
                                                            insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, err, Type, function (err, responses) { });
                                                            chunkLambdaCallback();
                                                        } else {
                                                            if (status == 'Connected') {
                                                                dbCmd.BulkMeterConnDisconnInitiated(MeterID, Type, DeviceID, MessageID, MeterSerialNumber, createdTime, function (err, meterConnDisconnInitiated) {
                                                                    if (err) {
                                                                        pushErrorInSerailNumber.push(`${meterSerialNoList} : ${err}`);
                                                                        insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, err, Type, function (err, responses) { });
                                                                        chunkLambdaCallback();
                                                                    } else {
                                                                        onDemDisConn.onDemDisConn(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID,
                                                                            MeterID, STATUS_CODE, MeterMeterAdminPassword, DeviceID, function (err, resp) {
                                                                                if (err) {
                                                                                    //Case II: "Connect to IoT failed !!" //res.json({ "Type": false, "Message": 2 });
                                                                                    pushErrorInSerailNumber.push(`${meterSerialNoList} : Connect to IoT failed !!`);
                                                                                    insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Connect to IoT failed !!', Type, function (err, responses) { });
                                                                                    chunkLambdaCallback();
                                                                                }
                                                                                else {
                                                                                    //Case III: "Disconnect Request successsfully sent to IoT" //res.json({ "type": true, "Message": 3 });
                                                                                    /*NOTE : Below code need to run separately*/
                                                                                    //var JobID = meterConnDisconnInitiated;
                                                                                    /*setTimeout(function () {
                                                                                        dbCmd.MeterConnDisconnDelayed(MeterID, JobID, function (err, responses) { });
                                                                                    }, 30000);*/
                                                                                    chunkLambdaCallback();
                                                                                }
                                                                            });
                                                                    }
                                                                });
                                                            } else {
                                                                //Case III: "Meter Not Accessible !!" //res.json({ "type": true, "Message": 4 });
                                                                pushErrorInSerailNumber.push(`${meterSerialNoList} : Meter Not Accessible !!`);
                                                                insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Meter Not Accessible !!', Type, function (err, responses) { });
                                                                chunkLambdaCallback();
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        } else if (Type == 'Connect') {
                                            MeterDisconnector = meterConnDisconnDetails[0].Meters_DeviceDetails.MeterDisconnector;
                                            if (MeterDisconnector === "No") {
                                                // Case I: "Meter not eligible for Online Disconnect!!" res.json({ "type": true, "Message": 0 });
                                                pushErrorInSerailNumber.push(`${meterSerialNoList} : Meter not eligible for Online Connect!!`);
                                                insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Meter not eligible for Online Connect!!', Type, function (err, responses) { });
                                                chunkLambdaCallback();
                                            } else {
                                                Action = "ACTION_FOR_DEVICE";
                                                Attribute = "METER_CONNECT";
                                                STATUS_CODE = "1"; //"AA3"

                                                if (MessageID === 255) {
                                                    MessageID = 0;
                                                } else {
                                                    MessageID++;
                                                }
                                                if (ConnDisconnStatus === "Connected") {
                                                    // Case II: "Meter already Disconnect!!" res.json({"type": true, "Message": 1});
                                                    pushErrorInSerailNumber.push(`${meterSerialNoList} : Meter already Connected!!`);
                                                    insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Meter already Connected!!', Type, function (err, responses) { });
                                                    chunkLambdaCallback();
                                                } else {
                                                    sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                                                        //    err = 0;
                                                        //    status = "Connected";
                                                        if (err) {
                                                            //res.json({ "type": false, "Message": err });
                                                            pushErrorInSerailNumber.push(`${meterSerialNoList} : ${err.name != undefined ? err.name : err}`);
                                                            insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, err, Type, function (err, responses) { });
                                                            chunkLambdaCallback();
                                                        } else {
                                                            if (status === "Connected") {
                                                                dbCmd.BulkMeterConnDisconnInitiated(MeterID, Type, DeviceID, MessageID, MeterSerialNumber, createdTime, function (err, meterConnDisconnInitiated) {
                                                                    if (err) {
                                                                        //res.json({ "type": false, "Message": err });
                                                                        pushErrorInSerailNumber.push(`${meterSerialNoList} : ${err}`);
                                                                        insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, err, Type, function (err, responses) { });
                                                                        chunkLambdaCallback();
                                                                    }
                                                                    else {
                                                                        onDemDisConn.onDemDisConn(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID,
                                                                            MeterID, STATUS_CODE, MeterMeterAdminPassword, DeviceID, function (err, resp) {
                                                                                if (err) {
                                                                                    //Case II: "Failed to Connect to IoT !!" res.json({ "Type": false, "Message": 2 });
                                                                                    pushErrorInSerailNumber.push(`${meterSerialNoList} : Failed to Connect to IoT !!`);
                                                                                    insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Failed to Connect to IoT !!', Type, function (err, responses) { });
                                                                                    chunkLambdaCallback();
                                                                                }
                                                                                else {
                                                                                    //Case III: "Connect Request successsfully sent to IoT"
                                                                                    //res.json({ "type": true, "Message": 3 });
                                                                                    /*NOTE : Below code need to run separately
                                                                                    var JobID = meterConnDisconnInitiated;
                                                                                    setTimeout(function () {
                                                                                        dbCmd.MeterConnDisconnDelayed(MeterID, JobID, function (err, responses) { });
                                                                                    }, 30000);*/
                                                                                    chunkLambdaCallback();
                                                                                }
                                                                            });
                                                                    }
                                                                });
                                                            } else {
                                                                //Case III: "Meter Not Accessible !!" res.json({ "type": true, "Message": 4 });
                                                                pushErrorInSerailNumber.push(`${meterSerialNoList} : Meter Not Accessible !!`);
                                                                chunkLambdaCallback();
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        } else {
                                            //demand Type is Read
                                            Action = "COLLECTOR_DATA_UPLOAD";
                                            Attribute = "ON_DEMAND_METER_DATA";
                                            var Status = meterConnDisconnDetails[0].Status;

                                            if (MessageID === 255) {
                                                MessageID = 0;
                                            } else {
                                                MessageID++;
                                            }

                                            if (Status === "NotRegistered") {
                                                // Case II: "Meter Not Registered!!" res.json({ "type": true, "Message": 3 });
                                                pushErrorInSerailNumber.push(`${meterSerialNoList} : Meter Not Registered!!`);
                                                insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Meter Not Registered!!', Type, function (err, responses) { });
                                                chunkLambdaCallback();
                                            } else {
                                                sendtoiot.checkDeviceConnectionState(DeviceID, function (err, status) {
                                                    if (err) {
                                                        //res.json({ "type": false, "Message": err});
                                                        pushErrorInSerailNumber.push(`${meterSerialNoList} : ${err.name != undefined ? err.name : err}`);
                                                        insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, err, Type, function (err, responses) { });
                                                        chunkLambdaCallback();
                                                    } else {
                                                        if (status === "Connected") {
                                                            dbCmd.BulkMeterKwHRequested(DeviceID, MessageID, MeterID, MeterSerialNumber, createdTime, function (err, MeterKwHRequested) {
                                                                if (err) {
                                                                    //res.json({ "type": false, "Message": err });
                                                                    pushErrorInSerailNumber.push(`${meterSerialNoList} : ${err}`);
                                                                    insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, err, Type, function (err, responses) { });
                                                                    chunkLambdaCallback();
                                                                } else {
                                                                    onDemandKwh.onDemandKwH(Action, Attribute, rev, MessageID, CountryCode, RegionCode, HypersproutID,
                                                                        MeterID, DeviceID, function (err, resp) {
                                                                            if (err) {
                                                                                //"Message": "Connect to IoT failed !!" res.json({ "Type": false, "Message": 0 });
                                                                                pushErrorInSerailNumber.push(`${meterSerialNoList} : Connect to IoT failed !!`);
                                                                                insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, 'Connect to IoT failed !!', Type, function (err, responses) { });
                                                                                chunkLambdaCallback();
                                                                            }
                                                                            else {
                                                                                //"Message": Request Sent to IoT
                                                                                //res.json({ "type": true, "Message": 1 });
                                                                                /*NOTE : Below code need to run separately
                                                                                var JobID = MeterKwHRequested;
                                                                                setTimeout(function () {
                                                                                    dbCmd.MeterKwHRequestDelayed(MeterID, JobID, function (err, responses) { });
                                                                                }, 120000);*/
                                                                                chunkLambdaCallback();
                                                                            }
                                                                        });
                                                                }
                                                            });
                                                        } else {
                                                            //Case III: "Meter Not Accessible !!" res.json({ "type": true, "Message": 2 });
                                                            pushErrorInSerailNumber.push(`${meterSerialNoList} : "Meter Not Accessible !!"`);
                                                            insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, "Meter Not Accessible !!", Type, function (err, responses) { });
                                                            chunkLambdaCallback();
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                    //To come Outside the loop
                                    if (index == meterSerialNoListLength + 1)
                                        chunkLambdaCallback();
                                });
                            }, function (err) {
                                //console.log('==> In Last got array ===>', pushErrorInSerailNumber);
                                if (err) {
                                    res.json({ "type": false, "Message": err });
                                } else {
                                    // if(pushErrorInSerailNumber.length == meterSerialNoListLength)
                                    //     res.json({"type": false, Errors : pushErrorInSerailNumber, "Message":'Failed to upload bulk operation' });
                                    // else
                                    res.json({ "type": true, Errors: pushErrorInSerailNumber, "Message": 'File uploaded successfully' });
                                }
                            });
                        }
                    })
                } else {
                    res.json({ "type": false, "Message": "Bulk Meter Operation length must not be greater than 500" });
                }
            }
        });
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }

});

//insertErrorInJobs(DeviceID, MessageID, MeterID, MeterSerialNumber, createdTime, 'Meter not eligible for Online Disconnect!!', Type, function(err, responses) { });
function insertErrorInJobs(MeterID, MeterSerialNumber, createdTime, errorMsg, OnDemandType, callback) {
    try {
        if (OnDemandType == 'Read') {
            var jobInsert = {
                "JobID": shortid.generate(),
                "DeviceID": MeterID,
                "SerialNumber": MeterSerialNumber,
                "DeviceType": "Meter",
                "JobName": "OnDemand",
                "JobType": "Meter Read",
                "Status": "Error",
                "Group": "None",
                "CreatedDateTimestamp": createdTime,
                "Remark": errorMsg
            };
        } else if (OnDemandType === "Connect") {
            var jobInsert = {
                "JobID": shortid.generate(), "DeviceID": MeterID, "SerialNumber": MeterSerialNumber, "DeviceType": "Meter", "JobName": "Remote Connect Jobs", "JobType": "OnDemand Connect/Disconnect", "Status": "Error", "Group": "None", "CreatedDateTimestamp": createdTime, "Remark": errorMsg, EndTime: new Date()
            };
        } else {
            var jobInsert = {
                "JobID": shortid.generate(), "DeviceID": MeterID, "SerialNumber": MeterSerialNumber, "DeviceType": "Meter", "JobName": "Remote Disconnect Jobs", "JobType": "OnDemand Connect/Disconnect", "Status": "Error", "Group": "None", "CreatedDateTimestamp": createdTime, "Remark": errorMsg, EndTime: new Date()
            };
        }

        dbCon.getDb(function (err, db) {
            let collectionName = db.delta_Jobs;
            collectionName.insertOne(jobInsert, function (err, jobsInserted) {
                if (err)
                    callback(err, null);
                else
                    callback(null, 'Job Inserted successfully !!');
            });
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

module.exports = router;