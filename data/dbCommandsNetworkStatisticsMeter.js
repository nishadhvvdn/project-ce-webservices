var async = require('async');
var dbCon = require('./dbConnection.js');
var fs = require('fs');

/**
* @description - get Meter Network Statitics
* @param callback - callback function returns success or error response
* @return callback function
*/

function getMeterNetworkStatitics(callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var collectionMeter = db.delta_Meters;
            var collectionTransformer = db.delta_Transformer;
            var collectionHyperSprout = db.delta_Hypersprouts;
            var collectionTransaction = db.delta_Transaction_Data;
            findMetersFromDB(collectionMeter, collectionTransformer, collectionHyperSprout, function (err, meterResult) {
                if (err) {
                    callback(err);
                } else {
                    getTransactionDataStatus(collectionTransaction, meterResult, callback);
                }
            });
        }
    });
};

/**
* @description - find Meters From DB
* @param collectionMeter
* @param collectionTransformer
* @param collectionHyperSprout
* @param callback - callback function returns success or error response
* @return callback function
*/

function findMetersFromDB(collectionMeter, collectionTransformer, collectionHyperSprout, callback) {
    collectionHyperSprout.find({ "Status": "Registered" }, { "HypersproutSerialNumber": 1, "HypersproutID": 1, "TransformerID": 1 }).toArray(function (err, result) {
        if (err) {
            callback(err);
        } else if (result.length === 0) {
            callback(null, 'No Data Found');
        }
        else {
            getTransformerSLNumberFormTransformer(collectionTransformer, collectionMeter, result, callback);
        }

    });
};
/**
* @description - get Transformer SL Number Form Transformer
* @param collectionTransformer
* @param collectionMeter
* @param results
* @param callback - callback function returns success or error response
* @return callback function
*/
function getTransformerSLNumberFormTransformer(collectionTransformer, collectionMeter, results, callback) {
    var meterDetails = [];
    var objData = [];
    var totalData = {};
    var totalobj = {};
    async.each(results,
        function (meterRes, callback) {
            collectionTransformer.find({ "TransformerID": meterRes.TransformerID }, { "TransformerSerialNumber": 1, "TransformerID": 1 }).toArray(function (err, data) {
                if (err) {
                    callback(err);
                } else if (data.length === 0) {
                    callback(null, 'No Data Found');
                }
                else {
                    collectionMeter.find({ "Status": "Registered", "TransformerID": meterRes.TransformerID }, { "MeterSerialNumber": 1, "MeterID": 1 }).toArray(function (err, doc) {
                        totalData["TransformerSerialNumber"] = data[0].TransformerSerialNumber;
                        totalData["TransformerID"] = data[0].TransformerID;
                        totalData["HypersproutID"] = meterRes.HypersproutID;
                        totalData["HypersproutSerialNumber"] = meterRes.HypersproutSerialNumber;
                        totalData["NoOfMetersGrouped"] = doc.length;
                        for (var k = 0; k < doc.length; k++) {
                            totalobj["MeterSerialNumber"] = doc[k].MeterSerialNumber;
                            totalobj["MeterID"] = doc[k].MeterID;
                            objData.push(totalobj);
                            totalobj = {};
                        }
                        totalData["MeterSerialID"] = objData;
                        meterDetails.push(totalData);
                        totalData = {};
                        objData = [];
                        callback(null, meterDetails);
                    });
                }
            });
        }, function (err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, meterDetails);
            }
        });
};
/**
* @description - get Transaction Data Status
* @param collectionTransaction
* @param meterResult
* @param callback - callback function returns success or error response
* @return callback function
*/
function getTransactionDataStatus(collectionTransaction, meterResult, callback) {
    var data = [];
    var arrMeterData = [];
    var transandMeter = {}
    var meterObj = {};
    async.each(meterResult,
        function (meterRes, callback) {
            collectionTransaction.find({ "result.CellID": meterRes.HypersproutID }).sort({ "_id": -1 }).limit(1).toArray(function (err, datas) {
                if (err) {
                    callback(err);
                } else if (datas.length === 0) {
                    callback(null, 'Data Not Found');
                } else {
                    if (datas[0].result.meters !== undefined) {
                        transandMeter["TransformerID"] = meterRes.TransformerID;
                        transandMeter["TransformerSerialNumber"] = meterRes.TransformerSerialNumber;
                        transandMeter["HypersproutSerialNumber"] = meterRes.HypersproutSerialNumber;
                        transandMeter["CellID"] = datas[0].result.CellID;
                        transandMeter["NoOfMeter"] = datas[0].result.Transformer.NoOfMeter;
                        transandMeter["NoOfConnectedMeter"] = datas[0].result.Transformer.NoOfConnectedMeter;
                        transandMeter["TransformerStatus"] = datas[0].result.Transformer.StatusTransformer;
                        transandMeter["TransformerPhase"] = datas[0].result.Transformer.Phase;
                        transandMeter["NoOfMetersGrouped"] = meterRes.NoOfMetersGrouped;
                        for (var j = 0; j < meterRes.MeterSerialID.length; j++) {
                            for (var i = 0; i < datas[0].result.meters.length; i++) {
                                if (meterRes.MeterSerialID[j].MeterID === datas[0].result.meters[i].DeviceID) {
                                    meterObj["MeterDeviceID"] = datas[0].result.meters[i].DeviceID;
                                    meterObj["MeterStatus"] = datas[0].result.meters[i].Status;
                                    meterObj["MeterPhase"] = datas[0].result.meters[i].Phase;
                                    meterObj["MeterID"] = meterRes.MeterSerialID[j].MeterID;
                                    meterObj["MeterSerialNumber"] = meterRes.MeterSerialID[j].MeterSerialNumber;
                                    arrMeterData.push(meterObj);
                                    meterObj = {};
                                }
                            }
                        }
                        transandMeter['MeterDetail'] = arrMeterData;
                        data.push(transandMeter);
                    }
                    arrMeterData = [];
                    transandMeter = {};
                    callback(null, data);
                }
            });
        }, function (err) {
            if (err) {
                callback(err, null);
            } else {
                networkStatisticsLoad(data, callback);
            }
        });
};
/**
* @description - network Statistics Load
* @param data
* @param callback - callback function returns success or error response
* @return callback function
*/
function networkStatisticsLoad(data, callback) {
    var phaseDetail = JSON.parse(fs.readFileSync('./config/NetworkStatisticsDetail.json', 'utf8'));
    var loadDetail = {};
    var transLoad = [];
    var metersLoad = {};
    var meterLoadDet = [];
    var totalMeterLoad = 0;
    var totalHSLoad = 0;
    for (var s = 0; s < data.length; s++) {
        loadDetail['TransformerID'] = data[s].TransformerID;
        loadDetail['TransformerSerialNumber'] = data[s].TransformerSerialNumber;
        loadDetail['HypersproutSerialNumber'] = data[s].HypersproutSerialNumber;
        loadDetail['CellID'] = data[s].CellID;
        loadDetail['TransformerStatus'] = data[s].TransformerStatus;
        loadDetail['TransformerPhase'] = data[s].TransformerPhase;
        loadDetail['NoOfMeter'] = data[s].NoOfMeter;
        loadDetail['NoOfConnectedMeter'] = data[s].NoOfConnectedMeter;
        loadDetail['NoOfMetersGrouped'] = data[s].NoOfMetersGrouped;
        //For transformerload
        if (data[s].TransformerPhase === 3) {
            if (data[s].TransformerStatus === 'Connected') {
                loadDetail['TransformerLoad'] = phaseDetail.Transformer_3Phase.Connected;
            } else {
                loadDetail['TransformerLoad'] = phaseDetail.Transformer_3Phase.CommunicationFault;
            }
        } else {
            if (data[s].TransformerStatus === 'Connected') {
                loadDetail['TransformerLoad'] = phaseDetail.Transformer_1Phase.Connected;
            } else {
                loadDetail['TransformerLoad'] = phaseDetail.Transformer_1Phase.CommunicationFault;
            }
        }
        //For Meter Load
        for (var n = 0; n < data[s].MeterDetail.length; n++) {
            metersLoad['MeterDeviceID'] = data[s].MeterDetail[n].MeterDeviceID;
            metersLoad['MeterStatus'] = data[s].MeterDetail[n].MeterStatus;
            metersLoad['MeterPhase'] = data[s].MeterDetail[n].MeterPhase;
            metersLoad['MeterSerialNumber'] = data[s].MeterDetail[n].MeterSerialNumber;
            if (data[s].MeterDetail[n].MeterPhase === 3) {
                if (data[s].MeterDetail[n].MeterStatus === 'Connected') {
                    metersLoad['MeterLoad'] = phaseDetail.Meter_3Phase.Connected;
                } else {
                    metersLoad['MeterLoad'] = phaseDetail.Meter_3Phase.CommunicationFault;
                }
            } else {
                if (data[s].MeterDetail[n].MeterStatus === 'Connected') {
                    metersLoad['MeterLoad'] = phaseDetail.Meter_1Phase.Connected;
                } else {
                    metersLoad['MeterLoad'] = phaseDetail.Meter_1Phase.CommunicationFault;
                }
            }
            totalMeterLoad += metersLoad['MeterLoad'];
            meterLoadDet.push(metersLoad);
            metersLoad = {};
        }
        totalHSLoad += totalMeterLoad + loadDetail['TransformerLoad'] + phaseDetail.HeaderCount;
        loadDetail['MeterLoadDetail'] = meterLoadDet;
        loadDetail['HyperSproutLoad'] = totalHSLoad;
        transLoad.push(loadDetail);
        loadDetail = {};
        meterLoadDet = [];
        totalMeterLoad = 0;
        totalHSLoad = 0;
    }
    callback(null, transLoad);
};



module.exports = {
    getMeterNetworkStatitics: getMeterNetworkStatitics
};