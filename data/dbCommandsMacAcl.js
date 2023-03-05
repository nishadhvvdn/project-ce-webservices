//REQUIRED PACKAGES AND FILES.
var async = require('async');
var dbCon = require('./dbConnection.js');
var parser = require('./parser.js');
var sToIOT = require('./sendToiot.js');
/* *************** DB Commands (System Management) SECTION 1 - EXPOSED METHODS ************************ */

/**
* @description - Listing the list of Devices on the basis of DailySelfReadTime
* @param packetData
* @param callback - callback function returns success or error response
* @return callback function
*/
function intimateHS(packetData, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                var hyperSproutCollection = db.delta_Hypersprouts;
                intimateHSACL(hyperSproutCollection, packetData, callback);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

/**
* @description - Get all Endpoint Entries in MONGODB ,WebService - DisplayAllEndpointDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectAllEndpointDetails(cellID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                getAllEndpointEntryFromMongoDB(cellID, db.delta_Endpoint, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};
/**
* @description - Get all Mesh Entries in MONGODB ,WebService - DisplayAllMeshDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectMeshDetails(CellID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                getAllMeshEntryFromMongoDB(db.delta_Transformer, db.delta_Hypersprouts, db.delta_Meters, db.delta_DeltaLink, db.delta_Config, CellID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/**
* @description - Get all Mesh Entries in MONGODB ,WebService - DisplayAllMeshDetails
* @param callback - callback function returns success or error response
* @return callback function
*/

function selectCircuitDetails(CellID, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else
                getCircuitDetailsFromMongoDB(db.delta_Transformer, db.delta_Hypersprouts, CellID, callback);
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
};

/* ********** DB Commands (System Management) SECTION 2 - NON-EXPOSED METHODS************************ */

/**
* @description - intimate for Mac ACL DV
* @param hyperSproutCollection
* @param packetData
* @param callback - callback function returns success or error response
* @return callback function
*/
function intimateHSACL(hyperSproutCollection, packetData, callback) {
    try {
        hyperSproutCollection.find({ HypersproutID: packetData.cellid }).toArray(function (err, HSDetails) {
            if (err) {
                callback(err, null);
            } else if ((HSDetails.length == 0) || !(HSDetails[0].DeviceID)) {
                var err = [];
                err.message = "DeviceID not available in the system";
                callback(err, null);
            } else {
                parser.hexaCreation(packetData, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sToIOT.sendToIOT(result, HSDetails[0].DeviceID, function (err, output) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                return callback(null, output);
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
* @description - get circuit details From MongoDB
* @param endpointCollection
* @param callback - callback function returns success or error response
* @return callback function
*/
function getCircuitDetailsFromMongoDB(transformerCollection, hyperSproutCollection, cellID, callback) {
    try {
        hyperSproutCollection.find({ HypersproutID: cellID }, { TransformerID: 1 }).toArray(function (err, HSDetails) {
            if (err)
                callback(err, null);
            else if (HSDetails.length === 0)
                callback(null, HSDetails);
            else {
                transformerCollection.find({ TransformerID: HSDetails[0].TransformerID }, { CircuitID: 1 }).toArray(function (err, CircuitDetails) {
                    if (err)
                        callback(err, null);
                    else if (CircuitDetails.length === 0)
                        callback(null, CircuitDetails);
                    else {
                        callback(null, CircuitDetails[0].CircuitID);
                    }
                });
            }
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
function getAllEndpointEntryFromMongoDB(cellID, endpointCollection, callback) {
    try {
        endpointCollection.find({ CircuitID: cellID }, { MacID: 1, Owner: 1, DeviceType:1 }).toArray(function (err, endpointDetails) {
            var HsArray = [];
            var SelfHealArray = [];
            if (err)
                callback(err, null,null);
            else if (endpointDetails.length === 0)
                callback(null, HsArray,SelfHealArray);
            else {
                async.each(endpointDetails,
                    function (endpointDetail, callback) {
                        if(endpointDetail.DeviceType == 'Roaming Devices')
                        HsArray[endpointDetail.MacID] = endpointDetail.Owner;
                        else
                        SelfHealArray[endpointDetail.MacID] = "meshcard";
                        return callback(null, HsArray, SelfHealArray);
                    }, function (err) {
                        if (err) {
                            return callback(err, null,null);
                        } else {
                            return callback(null, HsArray,SelfHealArray);
                        }
                    }
                );
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null,null);
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
function getAllMeshEntryFromMongoDB(transformerCollection, hypersproutCollection, meterCollection, DlCollection,ConfigCollection, CellID, callback) {
    try {
        var meshArray = [];
        hypersproutCollection.find({ HypersproutID: CellID }, { TransformerID: 1, _id: 0 }).toArray(function (err, HSData) {
            if (err)
                return callback(err, null, null);
            else if (HSData.length === 0)
                return callback(null, meshArray, null);
            else {
                transformerCollection.find({ TransformerID: HSData[0].TransformerID }, { TransformerID: 1, CircuitID: 1, _id: 0 }).toArray(function (err, transformerDetails) {
                    if (err)
                        return callback(err, null, null);
                    else if (transformerDetails.length === 0) {
                        return callback(null, meshArray, null);
                    }
                    else {
                        async.each(transformerDetails,
                            function (transformerDetail, callback) {
                                hypersproutCollection.find({ TransformerID: transformerDetail.TransformerID }).toArray(function (err, HSDetails) {
                                    if (err)
                                        return callback(err, null, transformerDetail.CircuitID);
                                    else if (HSDetails.length === 0)
                                        return callback(null, meshArray, transformerDetail.CircuitID);
                                    else {
                                        async.each(HSDetails,
                                            function (HSDetail, callback) {
                                                if (HSDetail.IsHyperHub == false) {
                                                    meshArray[HSDetail.Hypersprout_Communications.MAC_ID_MESH02] = "hypersprout";
                                                    meshArray[HSDetail.Hypersprout_Communications.MAC_ID_MESH12] = "hypersprout";
                                                } else {
                                                    meshArray[HSDetail.Hypersprout_Communications.MAC_ID_MESH02] = "hyperhub";
                                                    meshArray[HSDetail.Hypersprout_Communications.MAC_ID_MESH12] = "hyperhub";
                                                }
                                                meterCollection.find({ TransformerID: HSDetail.HypersproutID }).toArray(function (err, MeterDetails) {
                                                    if (err)
                                                        callback(err, null, null);
                                                    else if (MeterDetails.length === 0)
                                                        callback(null, meshArray, transformerDetail.CircuitID);
                                                    else {
                                                        async.each(MeterDetails,
                                                            function (MeterDetail, callback) {
                                                                meshArray[MeterDetail.Meters_Communications.MAC_ID_WiFi] = "meshcard";
                                                                DlCollection.find({ MeterID: MeterDetail.MeterID }).toArray(function (err, DlDetails) {
                                                                    if (err)
                                                                        callback(err, null, transformerDetail.CircuitID);
                                                                    else if (DlDetails.length === 0)
                                                                        callback(null, meshArray, transformerDetail.CircuitID);
                                                                    else {
                                                                        async.each(DlDetails,
                                                                            function (DlDetail, callback) {
                                                                                meshArray[DlDetail.DeltaLinks_Communications.MAC_ID_WiFi] = "deltalink";
                                                                                return callback(null, meshArray, transformerDetail.CircuitID);
                                                                            }, function (err) {
                                                                                if (err) {
                                                                                    return callback(err, null, transformerDetail.CircuitID);
                                                                                } else {
                                                                                    return callback(null, meshArray, transformerDetail.CircuitID);
                                                                                }
                                                                            }
                                                                        );
                                                                    }
                                                                });
                                                            }, function (err) {
                                                                if (err) {
                                                                    return callback(err, null, transformerDetail.CircuitID);
                                                                } else {
                                                                    return callback(null, meshArray, transformerDetail.CircuitID);
                                                                }
                                                            }
                                                        );
                                                    }
                                                });

                                            }, function (err) {
                                                if (err) {
                                                    return callback(err, null, transformerDetail.CircuitID);
                                                } else {
                                                    return callback(null, meshArray, transformerDetails[0].CircuitID);
                                                }
                                            }
                                        );
                                    }
                                });
                            }, function (err) {
                                if (err) {
                                    return callback(err, null, transformerDetails[0].CircuitID);
                                } else {
                                    var meshmac = Object.keys(meshArray);
                                    ConfigCollection.find({ DeviceType: "meter", $or: [{ "FrontHaul.Mesh_Configuration.Primary.Mac": { $in: meshmac } }, { "FrontHaul.Mesh_Configuration.Secondary.Mac": { $in: meshmac } }] }).project({ "System_Info.wifi_mac_2":1,_id:0 }).toArray(function (err, SecondaryDetails) {
                                        if (err)
                                            callback(null, meshArray, transformerDetails[0].CircuitID);
                                        else if (SecondaryDetails.length === 0)
                                            return callback(null, meshArray, transformerDetails[0].CircuitID);
                                        else {
                                            async.each(SecondaryDetails,
                                                function (SecondaryDetail, callback) {
                                                    meshArray[SecondaryDetail.System_Info.wifi_mac_2] = "meshcard";
                                                    return callback(null, meshArray, transformerDetails[0].CircuitID);
                                                },function (err) {
                                                    if (err) {
                                                        return callback(null, meshArray, transformerDetails[0].CircuitID);
                                                    } else {
                                                        return callback(null, meshArray, transformerDetails[0].CircuitID);
                                                    }
                                                });

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
}
module.exports = {
    selectAllEndpointDetails: selectAllEndpointDetails,
    selectMeshDetails: selectMeshDetails,
    intimateHS: intimateHS,
    selectCircuitDetails: selectCircuitDetails
};
/* ====================== End : Added by Dhruv Daga  ========================= */