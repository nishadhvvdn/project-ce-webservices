var binaryconvertor = require('../data/sToBParser.js');
var sToIOT = require('../data/sendToiot.js');
var onFirmwareUploadParser = require('../data/parser.js');
var dbCmdFrm = require('../data/dbCommandsFirmware.js');
var dbCmd = require('./dbCommandsOnDemand.js');
var dbCmdFirm = require('./dbCommandsFirmware');

/**
* @description - Firmware upload event
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename,MeterList,NoOfMeters,serialNumber, callback
* @return callback function
*/
function onFirmwareUpload(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename, MeterList, NoOfMeters, serialNumber, callback) {
    try {
        rev = (rev) ? rev : 0;
        countrycode = (countrycode) ? countrycode : 0;
        regioncode = (regioncode) ? regioncode : 0;

        let data = {
            "action": Action,
            "attribute": Attribute,
            "rev": rev,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": cellid,
            "meterid": meterid,
            "deviceID": DeviceID,
            "url": Filename,
            "meterList": MeterList,
            "NoOfMeters": NoOfMeters,
            "Purpose": "FirmwareUpload"
        }
        onFirmwareUploadParser.hexaCreation(data, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        dbCmd.OnDemandSystemEventInsert(rev, cellid, meterid, messageid, Action, Attribute, result, function (err, onDemandRawData) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmdFirm.addPacketToFirmwareJob(serialNumber, result, DeviceID, function (err, response) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        callback(null, "Inserted Successfully");
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


/**
* @description - Firmware upload event
* @params - Action, Attribute, rev, messageid, countrycode, regioncode, cellid, meterid, DeviceID, Filename,MeterList,NoOfMeters,serialNumber, callback
* @return callback function
*/
function onDeltalinkFirmwareUpload(Action, Attribute, rev, messageid, countrycode, regioncode, cellid, deltalinkID, DeviceID, Filename, List, NoOfDeltalinks, serialNumber, callback) {
    try {
        rev = (rev) ? rev : 0;
        countrycode = (countrycode) ? countrycode : 0;
        regioncode = (regioncode) ? regioncode : 0;

        let data = {
            "action": Action,
            "attribute": Attribute,
            "rev": rev,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": cellid,
            "meterid": deltalinkID,
            "deviceID": DeviceID,
            "url": Filename,
            "deltalinkList": List,
            "NoOfDeltalinks": NoOfDeltalinks,
            "Purpose": "DeltalinkFirmwareUpload"
        }
        onFirmwareUploadParser.hexaCreation(data, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                sToIOT.sendToIOT(result, DeviceID, function (err, out) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        dbCmd.deltalinkOnDemandSystemEventInsert(rev, cellid, deltalinkID, messageid, Action, Attribute, result, function (err, onDemandRawData) {
                            if (err) {
                                return callback(err, null);
                            } else {
                                dbCmdFirm.addPacketToFirmwareJob(serialNumber, result, DeviceID, function (err, response) {
                                    if (err) {
                                        return callback(err, null);
                                    } else {
                                        return callback(null, "Inserted Successfully");
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
    onFirmwareUpload: onFirmwareUpload,
    onDeltalinkFirmwareUpload: onDeltalinkFirmwareUpload
}