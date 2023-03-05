var express = require('express');
var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
var Registry = require('azure-iothub').Registry;
var shortid = require('shortid');
var logger = require('../config/logger')

var targetDevice;
/**
* @description - send To IOT
* @params - message1, deviceID, callback
* @return callback function
*/

function sendToIOT(message1, deviceID, callback) {
    try {
        const serviceClient = Client.fromConnectionString(process.env.CONNECTION_STRING);
        serviceClient.open(function (err) {
            if (err) {
                logger.info('inside the error in client open : ' + err + ' Message : ' + message1 + ' deviceID : ' + deviceID);
                return callback(err, null);
            } else {
                targetDevice = deviceID;
                var buff = new Buffer(message1, 'hex');
                var message = new Message(buff);
                message.ack = 'none';
                message.messageId = shortid.generate();
                serviceClient.send(targetDevice, message, function (err, res) {
                    if (err) {
                        serviceClient.close((err) => {
                            if (err) {
                                logger.info('inside the error in client sent -- client close :  ' + err + ' Message : ' + message1 + ' deviceID : ' + deviceID);
                                return callback(err, null);

                            }
                            else {
                                logger.info('inside the error in client sent  :  ' + err + ' Message : ' + message1 + ' deviceID : ' + deviceID);
                                return callback(err, null);
                            }
                        });
                    } else {
                        serviceClient.close((err) => {
                            if (err) {
                                logger.info('inside the error in client close :  ' + err + ' Message : ' + message1 + ' deviceID : ' + deviceID);
                                return callback(err, null);
                            }
                            else {
                                logger.info('IoT response :  ' + res.constructor.name + ' Message : ' + message1 + ' deviceID : ' + deviceID);
                                return callback(null, res.constructor.name);
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        logger.info('Exception : ' + error);
        return callback("Error occurred while connecting to IoT Hub", null);
    }
}

/**
* @description - check Device Connection State
* @params - deviceID, callback
* @return callback function
*/

function checkDeviceConnectionState(deviceID, callback) {
    try {
        var registry = Registry.fromConnectionString(process.env.CONNECTION_STRING);
        registry.get(deviceID, function (err, deviceState) {
            if (err) {
                return callback(err, null);
            } else if (deviceState === null) {
                return callback(null, "No DeviceID Found");
            } else if (deviceState.connectionState === "Connected") {
                return callback(null, "Connected");
            } else {
                return callback(null, "Disconnected");
            }
        });
    } catch (error) {
        return callback("Error occurred while connecting to IoT Hub", null);
    }
}

/**
* @description - fetch Device Connection SAS
* @params - deviceID, callback
* @return callback function
*/

function checkDeviceConnectionSAS(deviceID, callback) {
    try {
        var registry = Registry.fromConnectionString(process.env.CONNECTION_STRING);
        registry.get(deviceID, function (err, deviceState) {
            if (err) {
                return callback(err, null);
            } else if (deviceState === null) {
                return callback(null, "No DeviceID Found");
            } else {
                return callback(null, deviceState.authentication.symmetricKey.primaryKey);
            }
        });
    } catch (error) {
        return callback("Error occurred while connecting to IoT Hub", null);
    }
}


/**
* @description - register device on IOT
* @params - deviceID, callback
* @return callback function
*/
function registerDeviceOnIot(device, callback) {
    try {
        var registry = Registry.fromConnectionString(process.env.CONNECTION_STRING);
        registry.create(device, function (err, deviceInfo, result) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result);
            }
        });
    } catch (error) {
        return callback("Error occurred while connecting to IoT Hub", null)
    }
}

/**
* @description - register device on IOT
* @params - deviceID, callback
* @return callback function
*/
function registerBulkDeviceOnIot(device, callback) {
    try {
        var registry = Registry.fromConnectionString(process.env.CONNECTION_STRING);
        registry.addDevices(device, function (err, result) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result);
            }
        });
    } catch (error) {
        console.log("err =>", error)
        return callback("Error occurred while connecting to IoT Hub", null)
    }
}

/**
* @description - Delete register device on IOT
* @params - deviceID, callback
* @return callback function
*/
function deleteDeviceOnIot(device, callback) {
    try {
        var registry = Registry.fromConnectionString(process.env.CONNECTION_STRING);
        registry.delete(device, function (err, deviceInfo, result) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result);
            }
        });
    } catch (error) {
        return callback("Error occurred while connecting to IoT Hub", null)
    }
}

module.exports = {
    sendToIOT: sendToIOT,
    checkDeviceConnectionState: checkDeviceConnectionState,
    registerDeviceOnIot: registerDeviceOnIot,
    deleteDeviceOnIot: deleteDeviceOnIot,
    registerBulkDeviceOnIot: registerBulkDeviceOnIot,
    checkDeviceConnectionSAS : checkDeviceConnectionSAS
}