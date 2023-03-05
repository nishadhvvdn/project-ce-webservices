//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var async = require('async');
var insertError = require('./insertErrorLogsToDB.js');
var moment = require('moment');


/* *************** DB Commands SECTION 2 - EXPOSED METHODS ************************ */
/**
* @description - check HS In System
* @param data
* @param rev
* 
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkHSInSystem(data, rev, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var collectionName = db.delta_Hypersprouts;
                var schedulerFlagsCollection = db.delta_SchedulerFlags;
                var transformerCollection = db.delta_Transformer;
                var configCollection = db.delta_Config;
                collectionName.find({ HypersproutSerialNumber: data.SERIAL_NO }).toArray(function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else if (result.length === 0) {
                        callback(new Error("Serial Number not added into the System"), null);
                    } else {
                        transformerCollection.find({ TransformerID: result[0].TransformerID }).toArray(function (err, transforDetails) {
                            if (err)
                                callback(err, result);
                            else if ((transforDetails === undefined) ||
                                (transforDetails === null) ||
                                (transforDetails[0].CircuitID === null) ||
                                (transforDetails[0].CircuitID === "null"))
                                callback(new Error("Wrong Mapping"), result);
                            else
                                collectionName.find({ HypersproutSerialNumber: data.SERIAL_NO, 'Hypersprout_Communications.MAC_ID_WiFi': data.MACID }).toArray(function (err, res) {
                                    if (err) {
                                        callback(err, result);
                                    } else if (res.length === 0) {
                                        callback(new Error("MACID not available in the system"), result);
                                    } else {
                                        collectionName.update({
                                            HypersproutSerialNumber: data.SERIAL_NO,
                                            'Hypersprout_Communications.MAC_ID_WiFi': data.MACID
                                        },
                                            {
                                                $set: {
                                                    /*'Hypersprout_Communications.IP_address_WiFi': data.AccessPointIP,
                                                    'Hypersprout_Communications.AccessPointPassword': data.AccessPointPassword,*/
                                                    'Hypersprout_FirmwareDetails.iTMHardwareVersion': data.iTMHardwareVersion,
                                                    'Hypersprout_FirmwareDetails.iTMFirmwareVersion': data.iTMFirmwareVersion,
                                                    'Hypersprout_FirmwareDetails.iNCHardwareVersion': data.iNCHardwareVersion,
                                                    'Hypersprout_FirmwareDetails.iNCFirmwareVersion': data.iNCFirmwareVersion,
                                                    'Hypersprout_Communications.MAC_ID_MESH02': data.MAC_ID_MESH02,
                                                    'Hypersprout_Communications.MAC_ID_MESH12': data.MAC_ID_MESH12
                                                }
                                            }, function (err, _updatedDet) {
                                                collectionName.find({ HypersproutSerialNumber: data.SERIAL_NO, 'Hypersprout_Communications.MAC_ID_WiFi': data.MACID }).toArray(function (err, out) {
                                                    if (err) {
                                                        callback(err, result);
                                                    } else if (out.length > 0) {
                                                        if ((out[0].IsHyperHub === true) || (out[0].IsHyperHub === "TRUE") || (out[0].IsHyperHub === "true")) {
                                                            if(data.DEVICEID)
                                                                data.DEVICEID = data.DEVICEID.replace('HS-', 'HH-');
                                                        }
                                                        configCollection.find({ HypersproutSerialNumber: data.SERIAL_NO }).sort({ "_id": -1 }).limit(1).toArray(function (err, output) {
                                                            if (err) {
                                                                insertError.putErrorDetails(err, callback);
                                                            } else {
                                                                if (out[0].Status == "Registered") {
                                                                    configCollection.updateMany({ HypersproutSerialNumber: data.SERIAL_NO }, { $set: { "System_Info.current_fw": data.iNCFirmwareVersion } }, function (err, resp1) {
                                                                        if (err) {
                                                                            insertError.putErrorDetails(err, callback);
                                                                        } else {
                                                                            schedulerFlagsCollection.update({ DeviceID: data.DEVICEID }, { $set: { Flag: 0 } }, function (err, output1) {
                                                                                if (err) {
                                                                                    insertError.putErrorDetails(err, callback);
                                                                                } else if ((out[0].IsHyperHub === true) ||
                                                                                    (out[0].IsHyperHub === "true") ||
                                                                                    (out[0].IsHyperHub === "TRUE")) {
                                                                                    callback(new Error("HH Already Registered"), output);
                                                                                } else {
                                                                                    callback(new Error("Device Already Registered"), output);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                } else {
                                                                    collectionName.update({ HypersproutSerialNumber: data.SERIAL_NO, 'Hypersprout_Communications.MAC_ID_WiFi': data.MACID }, { $set: { DeviceID: data.DEVICEID, ProtocolVersion: rev } }, function (err, resp) {
                                                                        if (err) {
                                                                            insertError.putErrorDetails(err, callback);
                                                                        } else {
                                                                            configCollection.updateMany({ HypersproutSerialNumber: data.SERIAL_NO }, { $set: { "System_Info.current_fw": data.iNCFirmwareVersion } }, function (err, resp1) {
                                                                                if (err) {
                                                                                    insertError.putErrorDetails(err, callback);
                                                                                } else {
                                                                                    callback(null, output);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        });

                                                    }
                                                });
                                            });
                                    }
                                });
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
* @description - check HS In System
* @param data
* @param rev
* 
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkHSInDb(data, rev, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var collectionName = db.delta_Hypersprouts;
                var schedulerFlagsCollection = db.delta_SchedulerFlags;
                var transformerCollection = db.delta_Transformer;
                collectionName.find({ HypersproutSerialNumber: data.SERIAL_NO }).toArray(function (err, out) {
                    if (err) {
                        callback(err, null);
                    } else if (out.length === 0) {
                        callback(new Error("Serial Number not added into the System"), null);
                    } else {
                        transformerCollection.find({ TransformerID: out[0].TransformerID }).toArray(function (err, transforDetails) {
                            if (err)
                                callback(err, out);
                            else if ((transforDetails === undefined) ||
                                (transforDetails === null) ||
                                (transforDetails[0].CircuitID === null) ||
                                (transforDetails[0].CircuitID === "null"))
                                callback(new Error("Wrong Mapping"), out);
                            else {
                                if ((out[0].IsHyperHub === true) || (out[0].IsHyperHub === "TRUE") || (out[0].IsHyperHub === "true")) {
                                    if(data.DEVICEID)
                                        data.DEVICEID = data.DEVICEID.replace('HS-', 'HH-');
                                }
                                if (out[0].Status == "Registered") {
                                    schedulerFlagsCollection.update({ DeviceID: data.DEVICEID }, { $set: { Flag: 0 } }, function (err, output1) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else if ((out[0].IsHyperHub === true) ||
                                            (out[0].IsHyperHub === "true") ||
                                            (out[0].IsHyperHub === "TRUE")) {
                                            callback(new Error("HH Already Registered"), out);
                                        } else {
                                            callback(new Error("Device Already Registered"), out);
                                        }
                                    });
                                } else {
                                    callback(null, out);
                                }
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
* @description - update Device Details
* @param cellID
* @param deviceDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateDeviceDetails(cellID, deviceDetails, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var collectionName = db.delta_Hypersprouts;
                var configCollection = db.delta_Config;
                updateHSFields(collectionName,configCollection, cellID, deviceDetails, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - update get device data
* @param SerialNumber
* @param configValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateGetDeviceData(SerialNumber, configValues, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var collectionName = db.delta_Hypersprouts;
                var systemSettingsCollection = db.delta_SystemSettings
                updateHSConfInfo(collectionName, systemSettingsCollection, SerialNumber, configValues, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - find meter in System
* @param data
* @param cellID
* @param callback - callback function returns success or error response
* @return callback function
*/
function findMeterInSystem(data, cellID, callback) {
    try {
        async.waterfall(
            [
                async.apply(findHS, data, cellID),
                findMeter,
            ],
            function (err, response, DeviceID, ConfigData) {
                if (err) {
                    callback(err, response, DeviceID, ConfigData);
                } else {
                    //hold things here and do manipulations.
                    callback(null, response, DeviceID, ConfigData);
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}


/**
* @description - find meter in System
* @param data
* @param cellID
* @param callback - callback function returns success or error response
* @return callback function
*/
function findMeterInDb(data, cellID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null, null);
            } else {
                var collectionName = db.delta_Meters;
                var collection = db.delta_Hypersprouts;
                collection.find({ HypersproutID: cellID }).toArray(function (err, hsData) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        if (hsData.length === 0) {
                            callback(new Error("Serial Number not added into the System"), null, null);
                        } else {
                            collectionName.find({ MeterSerialNumber: data.SERIAL_NO }).toArray(function (err, result) {
                                if (err) {
                                    callback(err, null, hsData[0].DeviceID);
                                } else {
                                    if (result.length === 0) {
                                        return callback(new Error("Serial Number not added into the System"), null, hsData[0].DeviceID)
                                    } else {
                                        collectionName.find({ MeterSerialNumber: data.SERIAL_NO, Status: "NotRegistered" }).toArray(function (err, response) {
                                            if (err) {
                                                callback(err, result, hsData[0].DeviceID);
                                            } else {
                                                if (response.length === 0) {
                                                    callback(new Error("Device Already Registered"), result, hsData[0].DeviceID);
                                                } else {
                                                    callback(null, result, hsData[0].DeviceID);
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }

                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - find meter in System
* @param data
* @param cellID
* @param callback - callback function returns success or error response
* @return callback function
*/
function findDLInSystem(data, cellID, callback) {
    try {
        async.waterfall(
            [
                async.apply(findDLHS, data, cellID),
                findDL,
            ],
            function (err, response, DeviceID) {
                if (err) {
                    callback(err, response, DeviceID);
                } else {
                    //hold things here and do manipulations.
                    callback(null, response, DeviceID);
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - update meter details
* @param cellID
* @param meterID
* @param deviceDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateMeterDetails(cellID, meterID, deviceDetails, callback) {
    try {
        async.waterfall(
            [
                async.apply(findHSDeviceID, cellID, meterID, deviceDetails),
                updateMeterFields,
            ],
            function (err, response, DeviceID) {
                if (err) {
                    callback(err, null, DeviceID);
                } else {
                    //hold things here and do manipulations.
                    callback(null, response, DeviceID);
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
};
/**
* @description - update Meter Device Data
* @param cellID
* @param meterID
* @param configValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateGetMeterDeviceData(cellID, meterID, configValues, callback) {
    try {
        async.waterfall(
            [
                async.apply(findHSDeviceID, cellID, meterID, configValues),
                updateMeterConfInfo,
            ],
            function (err, response, DeviceID) {
                if (err) {
                    callback(err, null, DeviceID);
                } else {
                    //hold things here and do manipulations.
                    callback(null, response, DeviceID);
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
};

/**
* @description - update Meter Device Data
* @param cellID
* @param meterID
* @param configValues
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateGetDLDeviceData(cellID, dlID, callback) {
    try {
        async.waterfall(
            [
                async.apply(findDLHSDeviceID, cellID, dlID),
                updateDlFields,
            ],
            function (err, response, DeviceID) {
                if (err) {
                    callback(err, null, DeviceID);
                } else {
                    //hold things here and do manipulations.
                    callback(null, response, DeviceID);
                }
            });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
};
/* *************** DB Commands SECTION 2 - NON-EXPOSED METHODS ********************* */

/**
* @description - update HS fields
* @param collectionName
* @param cellID
* @param deviceDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function updateHSFields(collectionName,configCollection, cellID, deviceDetails, callback) {
    try {
        checkAndFindHS(collectionName, cellID, function (err, res) {
            if (err) {
                callback(err, res);
            } else {
                var updateData = { 'Hypersprout_Communications.MAC_ID_WiFi': deviceDetails.MAC_ID_WiFi, 'device_lock': 0,'Hypersprout_Communications.IP_address_WiFi': deviceDetails.IP_address_WiFi, /*'Hypersprout_Communications.AccessPointPassword': deviceDetails.AccessPointPassword,*/ 'Hypersprout_Communications.MAC_ID_GPRS': deviceDetails.MAC_ID_GPRS, 'Hypersprout_Communications.MAC_ID_ETH': deviceDetails.MAC_ID_ETH,'Hypersprout_Communications.MAC_ID_WiFi_5G': deviceDetails.MAC_ID_WiFi_5G,/*'Hypersprout_Communications.SimCardNumber': deviceDetails.SimCardNumber,*/ 'Hypersprout_DeviceDetails.Circuit_ID': deviceDetails.Circuit_ID, 'Hypersprout_DeviceDetails.CertificationNumber': deviceDetails.CertificationNumber, 'Hypersprout_DeviceDetails.UtilityID': deviceDetails.UtilityID, 'Hypersprout_DeviceDetails.ApplicableStandard': deviceDetails.ApplicableStandard, 'Hypersprout_DeviceDetails.ESN': deviceDetails.ESN, 'Hypersprout_DeviceDetails.CountryCode': deviceDetails.CountryCode, 'Hypersprout_DeviceDetails.RegionCode': deviceDetails.RegionCode, 'Hypersprout_DeviceDetails.SSID_Name': deviceDetails.SSID_Name }
                if (deviceDetails.CT_Ratio)
                    updateData['Hypersprout_DeviceDetails.CT_Ratio'] = deviceDetails.CT_Ratio;
                if (deviceDetails.PT_Ratio)
                    updateData['Hypersprout_DeviceDetails.PT_Ratio'] = deviceDetails.PT_Ratio;
                if (deviceDetails.RatedVoltage)
                    updateData['Hypersprout_DeviceDetails.RatedVoltage'] = deviceDetails.RatedVoltage;
                if (deviceDetails.Phase)
                    updateData['Hypersprout_DeviceDetails.Phase'] = deviceDetails.Phase;
                if (deviceDetails.Frequency)
                    updateData['Hypersprout_DeviceDetails.Frequency'] = deviceDetails.Frequency;
                if (deviceDetails.CT_CalibrationData)
                    updateData['Hypersprout_DeviceDetails.CT_CalibrationData'] = deviceDetails.CT_CalibrationData;
                if (deviceDetails.PT_CalibrationData)
                    updateData['Hypersprout_DeviceDetails.PT_CalibrationData'] = deviceDetails.PT_CalibrationData;
                if (deviceDetails.TransformerRating)
                    updateData['Hypersprout_DeviceDetails.TransformerRating'] = deviceDetails.TransformerRating;
                if (deviceDetails.TransformerClass)
                    updateData['Hypersprout_DeviceDetails.TransformerClass'] = deviceDetails.TransformerClass;
                collectionName.update({ HypersproutID: cellID, Status: "NotRegistered" }, { $set: updateData }, function (err, result) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName.find({ HypersproutID: cellID }).toArray(function (err, response) {
                            if (err) {
                                callback(err, result);
                            } else {
                                configCollection.update({ HypersproutID: cellID }, { $set: {"System_Info.eth_mac":deviceDetails.MAC_ID_ETH,"System_Info.cellular_mac":deviceDetails.MAC_ID_GPRS,"System_Info.wifi_mac_2":deviceDetails.MAC_ID_WiFi,"System_Info.wifi_mac_5":deviceDetails.MAC_ID_WiFi_5G} }, function (err1, result1) {
                                    if (err) {
                                        callback(err, result);
                                    } else { callback(null, response);
                                    }
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
};
/**
* @description - update HS Config Information
* @param collectionName
* @param systemSettingsCollection
* @param cellID
* @param configValues
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateHSConfInfo(collectionName, systemSettingsCollection, cellID, configValues, callback) {
    try {
        checkAndFindHS(collectionName, cellID, function (err, res) {
            if (err) {
                callback(err, res);
            } else {
                collectionName.update({ HypersproutID: cellID, Status: "NotRegistered" }, { $set: { "Hypersprout_Info": configValues, Status: "Registered", RegisteredTime: new Date() } }, function (err, result) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName.find({ HypersproutID: cellID }).toArray(function (err, response) {
                            if (err) {
                                callback(err, response);
                            } else {
                                callback(null, response);
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
* @description - check And Find HS
* @param deviceCollection
* @param cellID
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkAndFindHS(deviceCollection, cellID, callback) {
    try {
        deviceCollection.find({ HypersproutID: cellID }).toArray(function (err, res) {
            if (err) {
                callback(err, null);
            } else if (res.length === 0) {
                callback(new Error("CellID not Avaliable"), null);
            } else {
                deviceCollection.find({ HypersproutID: cellID, Status: "Registered" }).toArray(function (err, resp) {
                    if (err) {
                        callback(err, res);
                    } else if (resp.length > 0) {
                        callback(new Error("CellID already registered"), resp);
                    } else {
                        callback(null, resp);
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - find Hyper Sprout
* @param data
* @param cellID
* @param callback - callback function returns success or error response
* @return callback function
*/
function findHS(data, cellID, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null, null);
        } else {
            var collection = db.delta_Hypersprouts;
            var meterscollection = db.delta_Meters;
            var schedulerFlagsCollection = db.delta_SchedulerFlags;
            collection.find({ HypersproutID: cellID }).toArray(function (err, output) {
                if (err) {
                    callback(err, null, null);
                } else {
                    if (output.length === 0) {
                        callback(new Error("Serial Number not added into the System"), null, null);
                    } else {
                        collection.find({ HypersproutID: cellID, Status: "Registered" }).toArray(function (err, out) {
                            if (err) {
                                callback(err, null, null);
                            } else {
                                if (out.length === 0) {
                                    callback(new Error("Device Not Registered"), null, null);
                                } else {
                                    schedulerFlagsCollection.update({ DeviceID: out[0].DeviceID }, { $set: { Flag: 0 } }, function (err, output) {
                                        if (err) {
                                            insertError.putErrorDetails(err, callback);
                                        } else {
                                            //if (data.self_heal == 1) {
                                            meterscollection.find({ MeterSerialNumber: data.SERIAL_NO, $and: [{ TransformerID: { $ne: null } },{ TransformerID: { $ne: "null" } }, { TransformerID: { $type: 'number' } }] }).toArray(function (err, success) {
                                                if (err) {
                                                    callback(err, data.SERIAL_NO, out[0].DeviceID)
                                                } else if (success.length === 0) {
                                                    callback(new Error("Wrong Mapping"), data.SERIAL_NO, out[0].DeviceID);
                                                } else {
                                                    callback(null, data, cellID, out[0].DeviceID);
                                                }
                                            });
                                            // } else {
                                            //     meterscollection.find({ MeterSerialNumber: data.SERIAL_NO, TransformerID: out[0].TransformerID }).toArray(function (err, success) {
                                            //         if (err) {
                                            //             callback(err, data.SERIAL_NO, out[0].DeviceID)
                                            //         } else if (success.length === 0) {
                                            //             callback(new Error("Wrong Mapping"), data.SERIAL_NO, out[0].DeviceID);
                                            //         } else {
                                            //             callback(null, data, cellID, out[0].DeviceID);
                                            //         }
                                            //     });
                                            // }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    });
}
/**
* @description - find Hyper Sprout
* @param data
* @param cellID
* @param callback - callback function returns success or error response
* @return callback function
*/
function findDLHS(data, cellID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null, null);
            } else {
                var collection = db.delta_Hypersprouts;
                var meterscollection = db.delta_Meters;
                var dlcollection = db.delta_DeltaLink;
                collection.find({ HypersproutID: cellID }).toArray(function (err, output) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        if (output.length === 0) {
                            callback(new Error("Serial Number not added into the System"), null, null);
                        } else {
                            collection.find({ HypersproutID: cellID, Status: "Registered" }).toArray(function (err, out) {
                                if (err) {
                                    callback(err, null, null);
                                } else {
                                    if (out.length === 0) {
                                        callback(new Error("Device Not Registered"), null, null);
                                    } else {
                                        DeltalinkSerialNumber = data.SERIAL_NO.replace(/\0/g, '');
                                        dlcollection.find({ DeltalinkSerialNumber: DeltalinkSerialNumber }).toArray(function (err, success) {
                                            if (err) {
                                                callback(err, data.SERIAL_NO, out[0].DeviceID)
                                            } else if (success.length === 0) {
                                                callback(new Error("Serial Number not added into the System"), data.SERIAL_NO, out[0].DeviceID);
                                            } else if (success[0].MeterID === null || success[0].MeterID === undefined || success[0].MeterID === "null") {
                                                callback(new Error("Wrong Mapping"), data.SERIAL_NO, out[0].DeviceID);
                                            } else {
                                                meterscollection.find({ MeterID: success[0].MeterID, Status: "Registered" }).toArray(function (err, msuccess) {
                                                    if (err) {
                                                        callback(err, data.SERIAL_NO, out[0].DeviceID)
                                                    } else if (msuccess.length === 0) {
                                                        callback(new Error("Meter Not Registered"), data.SERIAL_NO, out[0].DeviceID);
                                                    } else if (cellID !== msuccess[0].HypersproutID) {
                                                        callback(new Error("Wrong Mapping"), data.SERIAL_NO, out[0].DeviceID);
                                                    } else {
                                                        callback(null, data, cellID, out[0].DeviceID);
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
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - find Meterby serial number
* @param data
* @param cellID
* @param DeviceID
* @param callback - callback function returns success or error response
* @return callback function
*/
function findMeter(data, cellID, DeviceID, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null, DeviceID, null);
        } else {
            var collectionName = db.delta_Meters;
            var configCollection = db.delta_Config;
            collectionName.find({ MeterSerialNumber: data.SERIAL_NO }).toArray(function (err, result) {
                if (err) {
                    callback(err, null, DeviceID, null);
                } else {
                    if (result.length === 0) {
                        return callback(new Error("Serial Number not added into the System"), null, DeviceID, null)
                    } else {
                        collectionName.find({ MeterSerialNumber: data.SERIAL_NO, 'Meters_Communications.MAC_ID_WiFi': data.MACID }).toArray(function (err, res) {
                            if (err) {
                                callback(err, result, DeviceID, null);
                            } else {
                                if (res.length === 0) {
                                    callback(new Error("MACID not available in the system"), result, DeviceID), null;
                                } else {
                                    collectionName.update({
                                        MeterSerialNumber: data.SERIAL_NO,
                                        'Meters_Communications.MAC_ID_WiFi': data.MACID
                                    },
                                        {
                                            $set: {
                                                /*'Meters_Communications.IP_address_WiFi': data.AccessPointIP,
                                                'Meters_Communications.AccessPointPassword': data.AccessPointPassword,*/
                                                'Meters_FirmwareDetails.MeshCardHardwareVersion': data.MeshCardHardwareVersion,
                                                'Meters_FirmwareDetails.MeshCardFirmwareVersion': data.MeshCardFirmwareVersion,
                                                'Meters_FirmwareDetails.MeterCardHardwareVersion': data.MeterHardwareVersion.replace(/\0/g, ''),
                                                'Meters_FirmwareDetails.MeterCardFirmwareVersion': data.MeterFirmwareVersion.replace(/\0/g, '')
                                            }
                                        }, function (err, _updatedDet) {
                                            configCollection.updateMany({
                                                MeterSerialNumber: data.SERIAL_NO
                                            },
                                                {
                                                    $set: {
                                                        'System_Info.current_fw':data.MeshCardFirmwareVersion.replace(/\0/g, ''),
                                                        'System_Info.Firmware_version':data.MeterFirmwareVersion.replace(/\0/g, ''),
                                                        'System_Info.Hardware_version':data.MeterHardwareVersion.replace(/\0/g, ''),
                                                        'System_Info.Manufacturer_model' :data.ManufacturerModel.replace(/\0/g, ''),
                                                        'System_Info.Standard_type': data.StandardType.replace(/\0/g, '')
                                                    }
                                                }, function (err, _updated) {

                                            // collectionName.find({ MeterSerialNumber: data.SERIAL_NO, 'Meters_Communications.MAC_ID_WiFi': data.MACID, Status: "NotRegistered" }).toArray(function (err, response) {
                                            configCollection.find({ MeterSerialNumber: data.SERIAL_NO }).sort({ "_id": -1 }).limit(1).toArray(function (err, output) {
                                                if (err) {
                                                    insertError.putErrorDetails(err, callback);
                                                } else {
                                                    collectionName.find({ MeterSerialNumber: data.SERIAL_NO, 'Meters_Communications.MAC_ID_WiFi': data.MACID }).toArray(function (err, response) {
                                                        if (err) {
                                                            callback(err, result, DeviceID, output);
                                                        } else {
                                                            if (data.self_heal == 1 && response[0].self_heal == 0) {
                                                                collectionName.update({ MeterSerialNumber: data.SERIAL_NO }, { $set: { HypersproutID: cellID, self_heal: 1, ParentHS: response[0].HypersproutID } }, function (err, _updated) {
                                                                    if (response[0].Status === "Registered") {
                                                                        callback(new Error("Device Already Registered"), result, DeviceID, output);
                                                                    } else {
                                                                        callback(null, response, DeviceID, output);
                                                                    }
                                                                });
                                                            } else if (data.self_heal == 1 && response[0].self_heal == 1) {
                                                                collectionName.update({ MeterSerialNumber: data.SERIAL_NO }, { $set: { HypersproutID: cellID, self_heal: 1 } }, function (err, _updated) {
                                                                    if (response[0].Status === "Registered") {
                                                                        callback(new Error("Device Already Registered"), result, DeviceID, output);
                                                                    } else {
                                                                        callback(null, response, DeviceID, output);
                                                                    }
                                                                });
                                                            } else {
                                                                if (response[0].self_heal == 1) {
                                                                    collectionName.update({ MeterSerialNumber: data.SERIAL_NO }, { $set: { HypersproutID: cellID, self_heal: 0, ParentHS: null } }, function (err, _updated) {
                                                                        if (response[0].Status === "Registered") {
                                                                            callback(new Error("Device Already Registered"), result, DeviceID, output);
                                                                        } else {
                                                                            callback(null, response, DeviceID, output);
                                                                        }
                                                                    });
                                                                } else {
                                                                    collectionName.update({ MeterSerialNumber: data.SERIAL_NO }, { $set: { HypersproutID: cellID, self_heal: 0 } }, function (err, _updated) {
                                                                        if (response[0].Status === "Registered") {
                                                                            callback(new Error("Device Already Registered"), result, DeviceID, output);
                                                                        } else {
                                                                            callback(null, response, DeviceID, output);
                                                                        }
                                                                    });
                                                                }

                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    });
}

/**
* @description - find Meterby serial number
* @param data
* @param cellID
* @param DeviceID
* @param callback - callback function returns success or error response
* @return callback function
*/
function findDL(data, cellID, DeviceID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null, DeviceID);
            } else {
                var collectionName = db.delta_DeltaLink;
                DeltalinkSerialNumber = data.SERIAL_NO.replace(/\0/g, '');
                collectionName.find({ DeltalinkSerialNumber: DeltalinkSerialNumber }).toArray(function (err, result) {
                    if (err) {
                        callback(err, null, DeviceID);
                    } else {
                        if (result.length === 0) {
                            return callback(new Error("Serial Number not added into the System"), null, DeviceID)
                        } else {
                            if (result[0].DeltaLinks_Communications.MAC_ID_WiFi != data.MACID) {
                                callback(new Error("MACID not available in the system"), result, DeviceID);
                            } else {
                                collectionName.update({
                                    MeterSerialNumber: data.SERIAL_NO,
                                    'DeltaLinks_Communications.MAC_ID_WiFi': data.MACID
                                },
                                    {
                                        $set: {
                                            'DeltaLinks_Communications.IP_address_WiFi': data.AccessPointIP,
                                            'DeltaLinks_DeviceDetails.HardwareVersion': data.HardwareVersion,
                                            'DeltaLinks_DeviceDetails.DeltalinkVersion': data.FirmwareVersion,
                                            'HypersproutID': cellID
                                        }
                                    }, function (err, _updatedDet) {
                                        if (result[0].Status == "NotRegistered") {
                                            callback(null, result, DeviceID);
                                        } else {
                                            callback(new Error("Device Already Registered"), result, DeviceID);
                                        }
                                    });
                            }
                        }
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}
/**
* @description - find HS Device ID
* @param cellID
* @param meterID
* @param deviceDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function findHSDeviceID(cellID, meterID, deviceDetails, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null, null);
            } else {
                var collection = db.delta_Hypersprouts;
                collection.find({ HypersproutID: cellID }).toArray(function (err, output) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        if (output.length === 0) {
                            callback(new Error("Serial Number not added into the System"), null, null)
                        } else {
                            collection.find({ HypersproutID: cellID, Status: "NotRegistered" }).toArray(function (err, out) {
                                if (err) {
                                    callback(err, output, out[0].DeviceID);
                                } else {
                                    if (out.length > 0) {
                                        callback(new Error("Device Not Registered"), output, out[0].DeviceID);
                                    } else {
                                        collection.find({ HypersproutID: cellID, Status: "Registered" }).toArray(function (err, resp) {
                                            if (err) {
                                                callback(err, out, out[0].DeviceID);
                                            } else {
                                                callback(null, meterID, deviceDetails, resp[0].DeviceID);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
}
/**
* @description - find HS Device ID
* @param cellID
* @param DLID
* @param deviceDetails
* @param callback - callback function returns success or error response
* @return callback function
*/
function findDLHSDeviceID(cellID, DLID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null, null,cellID);
            } else {
                var collection = db.delta_Hypersprouts;
                collection.find({ HypersproutID: cellID }).toArray(function (err, output) {
                    if (err) {
                        callback(err, null, null,cellID);
                    } else {
                        if (output.length === 0) {
                            callback(new Error("Serial Number not added into the System"), null, null)
                        } else {
                            collection.find({ HypersproutID: cellID, Status: "NotRegistered" }).toArray(function (err, out) {
                                if (err) {
                                    callback(err, output, out[0].DeviceID,cellID);
                                } else {
                                    if (out.length > 0) {
                                        callback(new Error("Device Not Registered"), output, out[0].DeviceID);
                                    } else {
                                        collection.find({ HypersproutID: cellID, Status: "Registered" }).toArray(function (err, resp) {
                                            if (err) {
                                                callback(err, out, out[0].DeviceID,cellID);
                                            } else {
                                                callback(null, DLID, resp[0].DeviceID,cellID);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
}
/**
* @description - update meter fields
* @param meterID
* @param deviceDetails
* @param DeviceID
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateMeterFields(meterID, deviceDetails, DeviceID, callback) {
    try {
        checkAndFindMeter(meterID, function (err, metdetails, collectionName) {
            if (err) {
                callback(err, null, DeviceID);
            } else {
                var updateData = { 'Meters_Communications.MAC_ID_WiFi': deviceDetails.MAC_ID_WiFi, 'device_lock': 0, /*'Meters_Communications.IP_address_WiFi': deviceDetails.IP_address_WiFi, 'Meters_Communications.AccessPointPassword': deviceDetails.AccessPointPassword,*/  'Meters_DeviceDetails.Circuit_ID': deviceDetails.Circuit_ID, 'Meters_DeviceDetails.CertificationNumber': deviceDetails.CertificationNumber, 'Meters_DeviceDetails.UtilityID': deviceDetails.UtilityID, 'Meters_DeviceDetails.ApplicableStandard': deviceDetails.ApplicableStandard, 'Meters_DeviceDetails.ESN': deviceDetails.ESN, 'Meters_DeviceDetails.CountryCode': deviceDetails.CountryCode, 'Meters_DeviceDetails.RegionCode': deviceDetails.RegionCode, 'Meters_DeviceDetails.SSID_Name': deviceDetails.SSID_Name };
                if (deviceDetails.CT_Ratio && deviceDetails.CT_Ratio > 0)
                    updateData['Meters_DeviceDetails.CT_Ratio'] = deviceDetails.CT_Ratio;
                if (deviceDetails.PT_Ratio && deviceDetails.PT_Ratio > 0)
                    updateData['Meters_DeviceDetails.PT_Ratio'] = deviceDetails.PT_Ratio;
                if (deviceDetails.RatedVoltage)
                    updateData['Meters_DeviceDetails.RatedVoltage'] = deviceDetails.RatedVoltage;
                if (deviceDetails.Phase)
                    updateData['Meters_DeviceDetails.Phase'] = deviceDetails.Phase;
                if (deviceDetails.CT_CalibrationData)
                    updateData['Meters_DeviceDetails.CT_CalibrationData'] = deviceDetails.CT_CalibrationData;
                if (deviceDetails.PT_CalibrationData)
                    updateData['Meters_DeviceDetails.PT_CalibrationData'] = deviceDetails.PT_CalibrationData;
                if (deviceDetails.MeterType)
                    updateData['Meters_DeviceDetails.MeterType'] = deviceDetails.MeterType;
                if (deviceDetails.MeterClass)
                    updateData['Meters_DeviceDetails.MeterClass'] = deviceDetails.MeterClass;

                collectionName.update({ MeterID: meterID, Status: "NotRegistered" }, { $set: updateData }, function (err, result) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName.find({ MeterID: meterID }).toArray(function (err, response) {
                            if (err) {
                                callback(err, null, DeviceID);
                            } else {
                                callback(null, response, DeviceID);
                            }
                        });
                    }
                });
            }

        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
}

/**
* @description - update meter fields
* @param meterID
* @param deviceDetails
* @param DeviceID
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateDlFields(DlID, DeviceID, cellID,callback) {
    try {
        checkAndFindDL(DlID, function (err, dlData, collectionName) {
            if (err) {
                callback(err, null, DeviceID);
            } else {
                collectionName.update({ DeltalinkID: DlID, Status: "NotRegistered" }, { $set: { HypersproutID: cellID,Status: "Registered", 'device_lock': 0, IsMaster: true, RegisteredTime: new Date() } }, function (err, result) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName.find({ DeltalinkID: DlID }).toArray(function (err, response) {
                            if (err) {
                                callback(err, null, DeviceID);
                            } else {
                                callback(null, response, DeviceID);
                            }
                        });
                    }
                });
            }

        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
}
/**
* @description - update meter configuration
* @param meterID
* @param configValues
* @param DeviceID
* @param callback - callback function returns success or error response
* @return callback function
*/
function updateMeterConfInfo(meterID, configValues, DeviceID, callback) {
    try {
        checkAndFindMeter(meterID, function (err, metdetails, collectionName) {
            if (err) {
                callback(err, null, DeviceID);
            } else {
                collectionName.update({ MeterID: meterID, Status: "NotRegistered" }, { $set: { "Meters_Info": configValues, Status: "Registered", RegisteredTime: new Date() } }, function (err, result) {
                    if (err) {
                        insertError.putErrorDetails(err, callback);
                    } else {
                        collectionName.find({ MeterID: meterID }).toArray(function (err, response) {
                            if (err) {
                                callback(err, null, DeviceID);
                            } else {
                                callback(null, response, DeviceID);
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
}
/**
* @description - check and find meter
* @param meterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkAndFindMeter(meterID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null, null);
            } else {
                var meterCollection = db.delta_Meters;
                meterCollection.find({ MeterID: meterID }).toArray(function (err, res) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        if (res.length === 0) {
                            callback(new Error("MeterID not Avaliable"), null, null);
                        } else {
                            meterCollection.find({ MeterID: meterID, Status: "Registered" }).toArray(function (err, resp) {
                                if (err) {
                                    callback(err, null, null);
                                } else {
                                    if (resp.length > 0) {
                                        callback(new Error("Meter already registered"), null, null);
                                    } else {
                                        callback(null, resp, meterCollection);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
}

/**
* @description - check and find meter
* @param meterID
* @param callback - callback function returns success or error response
* @return callback function
*/
function checkAndFindDL(DlID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null, null);
            } else {
                var dlCollection = db.delta_DeltaLink;
                dlCollection.find({ DeltalinkID: DlID }).toArray(function (err, res) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        if (res.length === 0) {
                            callback(new Error("DeltalinkID not Avaliable"), null, null);
                        } else {
                            dlCollection.find({ DeltalinkID: DlID, Status: "Registered" }).toArray(function (err, resp) {
                                if (err) {
                                    callback(err, null, null);
                                } else {
                                    if (resp.length > 0) {
                                        callback(new Error("Device already registered"), null, null);
                                    } else {
                                        callback(null, resp, dlCollection);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null, null);
    }
}

/* *************** DB Commands SECTION 3 - MODULE EXPORTS *************************** */

module.exports = {
    checkHSInSystem: checkHSInSystem,
    updateDeviceDetails: updateDeviceDetails,
    updateGetDeviceData: updateGetDeviceData,
    findMeterInSystem: findMeterInSystem,
    updateMeterDetails: updateMeterDetails,
    updateGetMeterDeviceData: updateGetMeterDeviceData,
    findDLInSystem: findDLInSystem,
    updateGetDLDeviceData: updateGetDLDeviceData,
    checkHSInDb: checkHSInDb,
    findMeterInDb: findMeterInDb
};
