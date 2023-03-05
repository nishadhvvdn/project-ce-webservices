var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDeviceRegistration.js');
var binaryconvertor = require('../../data/sToBParser.js');
var deviceReg = require('../../data/deviceRegistration.js');
var errorReg = require('../../data/errorRegistration.js');
var _ = require('lodash');
let schemaValidation = require('../../config/Helpers/payloadValidation');
let schema = require('../../config/Helpers/EndpointSchema');
var logger = require('../../config/logger.js');

router.post('/', function (req, res) {
    try {
        if (_.isEmpty(req.body)) {
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": "Empty payload"
            });
        } else {
            var rev = Rev = req.body.Rev;
            var count = Count = req.body.Count;
            var messageid = MessageID = req.body.MessageID;
            var Action = req.body.Action;
            var Attribute = req.body.Attribute;
            var Data = req.body.Data;
            var countryCode = CountryCode = req.body.CountryCode;
            var regionCode = RegionCode = req.body.RegionCode;
            var cellID = CellID = req.body.CellID;
            var meterID = MeterID = req.body.MeterID;
            var Data = req.body.Data;
            var Type = req.body.Type;
            logger.info('Endpoint API Called : ' + meterID + ' meterID : ' + messageid + ' cellID : ' + cellID);
            const EndpointRegistrationSchema = schema.EndpointRegistrationDetails;
            const data = { Rev, Count, MessageID, Action, Attribute, Data, CountryCode, RegionCode, CellID, MeterID, Data, Type }
            schemaValidation.validateSchema(data, EndpointRegistrationSchema, function (err, result) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": "Invalid Request, Please try again after some time !!",
                        "PayloadErrors": err
                    });
                } else {
                    if ((rev == null) || (count == null) || (messageid == null) || (Action == null) || (Attribute == null) || (countryCode == null) ||
                        (regionCode == null) || (cellID == null) || (meterID == null)) {
                        res.json({
                            "Type": false,
                            "Status": "Invalid Parameter"
                        });
                    } else if ((rev == 'null') || (count == 'null') || (messageid == 'null') || (Action == 'null') || (Attribute == 'null') || (countryCode == 'null') ||
                        (regionCode == 'null') || (cellID == 'null') || (meterID == 'null')) {
                        res.json({
                            "Type": false,
                            "Status": "Invalid Parameter"
                        });
                    } else {
                        switch (Action) {
                            case "COLLECTOR_REGISTERATION": switch (Attribute) {
                                case "REGISTRATION_PARA":
                                    var HSID = 0;
                                    dbCmd.checkHSInSystem(Data[0], rev, function (err, result) {
                                        if (err) {
                                            if ((result !== null) && (result[0].HypersproutID !== null)) {
                                                HSID = result[0].HypersproutID;;
                                            }
                                            errorMessages(Action, Attribute, Data[0].SERIAL_NO, err.message, rev, messageid, countryCode, regionCode, HSID, meterID, Data[0].DEVICEID, result, Data[0], function (err, responses) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": responses
                                                    });
                                                }
                                            });
                                        } else {
                                            HSID = result[0].HypersproutID;
                                            deviceReg.deviceReg(Action, Attribute, result[0].HypersproutSerialNumber, rev, messageid, countryCode, regionCode, HSID, meterID, Data[0].DEVICEID, null, result, function (err, result) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": result
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    break;
                                case "SET_DEVICE_CONFIG":
                                    var HSID = 0;
                                    dbCmd.checkHSInDb(Data[0], rev, function (err, result) {
                                        if (err) {
                                            if ((result !== null) && (result[0].HypersproutID !== null)) {
                                                HSID = result[0].HypersproutID;;
                                            }
                                            errorMessages(Action, Attribute, Data[0].SERIAL_NO, err.message, rev, messageid, countryCode, regionCode, HSID, meterID, result[0].DeviceID, result, Data[0], function (err, responses) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": responses
                                                    });
                                                }
                                            });
                                        } else {
                                            Attribute = "DEVICE_DETAILS1";
                                            HSID = result[0].HypersproutID;
                                            deviceReg.deviceReg(Action, Attribute, result[0].HypersproutSerialNumber, rev, messageid, countryCode, regionCode, HSID, meterID, result[0].DeviceID, null, result, function (err, result) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": result
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    break;
                                case "GET_DEVICE_CONFIG":
                                    dbCmd.checkHSInDb(Data[0], rev, function (err, result) {
                                        if (err) {
                                            if ((result !== null) && (result[0].HypersproutID !== null)) {
                                                HSID = result[0].HypersproutID;;
                                            }
                                            errorMessages(Action, Attribute, Data[0].SERIAL_NO, err.message, rev, messageid, countryCode, regionCode, HSID, meterID, result[0].DeviceID, result, Data[0], function (err, responses) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": responses
                                                    });
                                                }
                                            });
                                        } else {
                                            Attribute = "DEVICE_DETAILS1";
                                            HSID = result[0].HypersproutID;
                                            deviceReg.deviceReg(Action, Attribute, result[0].HypersproutSerialNumber, rev, messageid, countryCode, regionCode, HSID, meterID, result[0].DeviceID, null, result, function (err, result) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": result
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    break;
                                case "DEVICE_DETAILS": dbCmd.updateDeviceDetails(cellID, Data[0], function (err, data) {
                                    if (err) {
                                        if ((data == null) || ((data[0].DeviceID) == null)) {
                                            res.send({
                                                "Type": false,
                                                "Error": err
                                            });
                                        } else {
                                            errorMessages(Action, Attribute, 0, err.message, rev, messageid, countryCode, regionCode, cellID, meterID, data[0].DeviceID, null, null, function (err, responses) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": responses
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        deviceReg.deviceReg(Action, Attribute, data[0].HypersproutSerialNumber, rev, messageid, countryCode, regionCode, cellID, meterID, data[0].DeviceID, null, null, function (err, resp) {
                                            if (err) {
                                                res.send({
                                                    "Type": false,
                                                });
                                            } else {
                                                res.send({
                                                    "Type": true,
                                                    "Result": resp
                                                });
                                            }
                                        });
                                    };
                                });
                                    break;
                                case "HS_CONFIGURATION": dbCmd.updateGetDeviceData(cellID, Data[0], function (err, data) {
                                    if (err) {
                                        if ((data.length == 0) || (data == null) || ((data[0].DeviceID) == null)) {
                                            res.send({
                                                "Type": false,
                                                "Error": err
                                            });
                                        } else {
                                            if (((err.message === "Device Already Registered")
                                                || (err.message === "CellID already registered")) && (data[0].IsHyperHub))
                                                Attribute = "HH_Success";
                                            errorMessages(Action, Attribute, 0, err.message, rev, messageid, countryCode, regionCode, cellID, meterID, data[0].DeviceID, null, null, function (err, responses) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": responses
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        if (data[0].IsHyperHub)
                                            Attribute = "HH_Success";
                                        deviceReg.deviceReg(Action, Attribute, data[0].HypersproutSerialNumber, rev, messageid, countryCode, regionCode, cellID, meterID, data[0].DeviceID, data[0].RegistrationJobID, null, function (err, resp) {
                                            if (err) {
                                                res.send({
                                                    "Type": false,
                                                    "Error": err
                                                });
                                            } else {
                                                res.send({
                                                    "Type": true,
                                                    "Result": resp
                                                });
                                            }
                                        });
                                    }
                                });
                                    break;
                                default:
                                    res.send({
                                        "Type": false,
                                        "Error": "Wrong Attribute"
                                    });
                                    break;
                            }
                                break;

                            case "METER_REGISTERATION": switch (Attribute) {
                                case "REGISTRATION_PARA":
                                    var metID = 0;
                                    dbCmd.findMeterInSystem(Data[0], cellID, function (err, result, deviceID, ConfigData) {
                                        if (err) {
                                            if ((result !== null) && (result[0].MeterID != null) && (result[0].MeterID != undefined)) {
                                                metID = result[0].MeterID;
                                            }
                                            if (deviceID == null) {
                                                res.send({
                                                    "Type": false,
                                                    "Error": err,
                                                    "Reason": "DeviceID not available"
                                                });
                                            } else {
                                                errorMessages(Action, Attribute, Data[0].SERIAL_NO, err.message, rev, messageid, countryCode, regionCode, cellID, metID, deviceID,ConfigData, Data[0],  function (err, responses) {
                                                    if (err) {
                                                        res.send({
                                                            "Type": false,
                                                            "Error": err
                                                        });
                                                    } else {
                                                        res.send({
                                                            "Type": true,
                                                            "Result": responses
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            metID = result[0].MeterID;
                                            deviceReg.deviceReg(Action, Attribute, result[0].MeterSerialNumber, rev, messageid, countryCode, regionCode, cellID, metID, deviceID, null, ConfigData, function (err, result) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": result
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    break;
                                case "SET_DEVICE_CONFIG":
                                    var metID = 0;
                                    dbCmd.findMeterInDb(Data[0], cellID, function (err, result, deviceID) {
                                        if (err) {
                                            if ((result !== null) && (result[0].MeterID != null) && (result[0].MeterID != undefined)) {
                                                metID = result[0].MeterID;
                                            }
                                            if (deviceID == null) {
                                                res.send({
                                                    "Type": false,
                                                    "Error": err,
                                                    "Reason": "DeviceID not available"
                                                });
                                            } else {
                                                errorMessages(Action, Attribute, Data[0].SERIAL_NO, err.message, rev, messageid, countryCode, regionCode, cellID, metID, deviceID, null, null, function (err, responses) {
                                                    if (err) {
                                                        res.send({
                                                            "Type": false,
                                                            "Error": err
                                                        });
                                                    } else {
                                                        res.send({
                                                            "Type": true,
                                                            "Result": responses
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            Attribute = "DEVICE_DETAILS1";
                                            metID = result[0].MeterID;
                                            deviceReg.deviceReg(Action, Attribute, result[0].MeterSerialNumber, rev, messageid, countryCode, regionCode, cellID, metID, deviceID, null, null, function (err, result) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": result
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    break;
                                case "GET_DEVICE_CONFIG":
                                    var metID = 0;
                                    dbCmd.findMeterInDb(Data[0], cellID, function (err, result, deviceID) {
                                        if (err) {
                                            if ((result !== null) && (result[0].MeterID != null) && (result[0].MeterID != undefined)) {
                                                metID = result[0].MeterID;
                                            }
                                            if (deviceID == null) {
                                                res.send({
                                                    "Type": false,
                                                    "Error": err,
                                                    "Reason": "DeviceID not available"
                                                });
                                            } else {
                                                errorMessages(Action, Attribute, Data[0].SERIAL_NO, err.message, rev, messageid, countryCode, regionCode, cellID, metID, deviceID, null, null, function (err, responses) {
                                                    if (err) {
                                                        res.send({
                                                            "Type": false,
                                                            "Error": err
                                                        });
                                                    } else {
                                                        res.send({
                                                            "Type": true,
                                                            "Result": responses
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            Attribute = "DEVICE_DETAILS1";
                                            metID = result[0].MeterID;
                                            deviceReg.deviceReg(Action, Attribute, result[0].MeterSerialNumber, rev, messageid, countryCode, regionCode, cellID, metID, deviceID, null, null, function (err, result) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": result
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    break;
                                case "DEVICE_DETAILS": dbCmd.updateMeterDetails(cellID, meterID, Data[0], function (err, result, deviceID) {
                                    if (err) {
                                        if (deviceID == null) {
                                            res.send({
                                                "Type": false,
                                                "Error": err,
                                                "Reason": "DeviceID not available"
                                            });
                                        } else {
                                            errorMessages(Action, Attribute, 0, err.message, rev, messageid, countryCode, regionCode, cellID, meterID, deviceID, null, null, function (err, responses) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": responses
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        deviceReg.deviceReg(Action, Attribute, result[0].MeterSerialNumber, rev, messageid, countryCode, regionCode, cellID, meterID, deviceID, null, null, function (err, response) {
                                            if (err) {
                                                res.send({
                                                    "Type": false,
                                                    "Error": err
                                                });
                                            } else {
                                                res.send({
                                                    "Type": true,
                                                    "Result": response
                                                });
                                            }
                                        });
                                    }
                                });
                                    break;
                                case "METER_CONFIGURATION": dbCmd.updateGetMeterDeviceData(cellID, meterID, Data[0], function (err, data, deviceID) {
                                    if (err) {
                                        if (deviceID == null) {
                                            res.send({
                                                "Type": false,
                                                "Error": err,
                                                "Reason": "DeviceID not available"
                                            });
                                        } else {
                                            errorMessages(Action, Attribute, 0, err.message, rev, messageid, countryCode, regionCode, cellID, meterID, deviceID, null, null, function (err, responses) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": responses
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        deviceReg.deviceReg(Action, Attribute, data[0].MeterSerialNumber, rev, messageid, countryCode, regionCode, cellID, meterID, deviceID, data[0].RegistrationJobID, null, function (err, resp) {
                                            if (err) {
                                                res.send({
                                                    "Type": false,
                                                    "Error": err
                                                });
                                            } else {
                                                res.send({
                                                    "Type": true,
                                                    "Result": resp
                                                });
                                            }
                                        });
                                    }
                                });
                                    break;
                                default:
                                    res.send({
                                        "Type": false,
                                        "Error": "Wrong Attribute"
                                    });
                                    break;
                            }
                                break; case "DELTALINK_REGISTER": switch (Attribute) {
                                    case "REGISTRATION_PARA":
                                        var DlID = 0;
                                        dbCmd.findDLInSystem(Data[0], cellID, function (err, result, deviceID) {
                                            
                                            if (err) {
                                                if ((result !== null) && (result[0].DeltalinkID != null) && (result[0].DeltalinkID != undefined)) {
                                                    DlID = result[0].DeltalinkID;
                                                }
                                                if (deviceID == null) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err,
                                                        "Reason": "DeviceID not available"
                                                    });
                                                } else {
                                                    errorMessages(Action, Attribute, Data[0].SERIAL_NO, err.message, rev, messageid, countryCode, regionCode, cellID, DlID, deviceID, null, null, function (err, responses) {
                                                        if (err) {
                                                            res.send({
                                                                "Type": false,
                                                                "Error": err
                                                            });
                                                        } else {
                                                            res.send({
                                                                "Type": true,
                                                                "Result": responses
                                                            });
                                                        }
                                                    });
                                                }
                                            } else {
                                                DlID = result[0].DeltalinkID;
                                                deviceReg.deviceDLReg(Action, Attribute, result[0], rev, messageid, countryCode, regionCode, cellID, DlID, deviceID, null, function (err, result) {
                                                    if (err) {
                                                        res.send({
                                                            "Type": false,
                                                            "Error": err
                                                        });
                                                    } else {
                                                        res.send({
                                                            "Type": true,
                                                            "Result": result
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                        break;
                                    case "DL_CONFIG": dbCmd.updateGetDLDeviceData(cellID, meterID, function (err, data, deviceID) {
                                        if (err) {
                                            if (deviceID == null) {
                                                res.send({
                                                    "Type": false,
                                                    "Error": err,
                                                    "Reason": "DeviceID not available"
                                                });
                                            } else {
                                                errorMessages(Action, Attribute, 0, err.message, rev, messageid, countryCode, regionCode, cellID, meterID, deviceID, null, null, function (err, responses) {
                                                    if (err) {
                                                        res.send({
                                                            "Type": false,
                                                            "Error": err
                                                        });
                                                    } else {
                                                        res.send({
                                                            "Type": true,
                                                            "Result": responses
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            deviceReg.deviceReg(Action, Attribute, data[0].DeltalinkSerialNumber, rev, messageid, countryCode, regionCode, cellID, meterID, deviceID, data[0].RegistrationJobID, null, function (err, resp) {
                                                if (err) {
                                                    res.send({
                                                        "Type": false,
                                                        "Error": err
                                                    });
                                                } else {
                                                    res.send({
                                                        "Type": true,
                                                        "Result": resp
                                                    });
                                                }
                                            });
                                        }
                                    });
                                        break;
                                    default:
                                        res.send({
                                            "Type": false,
                                            "Error": "Wrong Attribute"
                                        });
                                        break;
                                }
                                break;

                            default:
                                res.send({
                                    "Type": false,
                                    "Error": "Wrong Action"
                                });
                                break;
                        }
                    }
                }
            })
        }

    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

function errorMessages(Action, Attribute, serialNumber, errormessage, rev, messageid, countrycode, regioncode, cellid, meterid, deviceID, ConfigData, DeviceData, callback) {
    try {
        rev = (rev) ? rev : 0;
        countrycode = (countrycode) ? countrycode : 0;
        regioncode = (regioncode) ? regioncode : 0;
        var input = {
            "action": Action,
            "attribute": Attribute,
            "serialNumber": serialNumber,
            "rev": rev,
            "messageid": messageid,
            "countrycode": countrycode,
            "regioncode": regioncode,
            "cellid": cellid,
            "meterid": meterid,
            "deviceID": deviceID
        }
        switch (errormessage) {
            case 'Serial Number not added into the System':
                input.parameter = "SerialNumber";
                input.Purpose = "RegistrationError";
                break;

            case 'MACID not available in the system':
                input.parameter = "MACID";
                input.Purpose = "RegistrationError";
                break;

            case 'Device Already Registered':
            case 'CellID already registered':
            case 'Meter Already Registered':
                input.parameter = "AlreadyRegistered";
                input.Purpose = "RegistrationSuccess";
                break;

            case 'HH Already Registered':
                input.attribute = "HH_Success";
                input.parameter = "AlreadyRegistered";
                input.Purpose = "HHRegistrationSuccess";
                break;

            case 'CellID not Avaliable':
                input.parameter = "CellID";
                input.Purpose = "RegistrationError";
                break;

            case 'MeterID not Avaliable':
                input.parameter = "MeterID";
                input.Purpose = "RegistrationError";
                break;

            case 'Device Not Registered':
                input.parameter = "NotRegistered";
                input.Purpose = "RegistrationError";
                break;

            case 'Wrong Mapping':
                input.parameter = "WrongMapping";
                input.Purpose = "RegistrationError";
                break;

            case 'Meter Not Registered':
                input.parameter = "MeterNotRegistered";
                input.Purpose = "RegistrationError";
                break;
            case 'DeltalinkID not Avaliable':
                input.parameter = "DeltalinkID";
                input.Purpose = "RegistrationError";
                break;

            default:
                input.parameter = "ERROR";
                input.Purpose = "RegistrationError";
                break;
        }
        if ((ConfigData != null) && (Attribute == "REGISTRATION_PARA") && ( (input.Purpose == "HHRegistrationSuccess") || (input.Purpose == "RegistrationSuccess") )) {
            var cloud_time = parseInt(ConfigData[0].config_UpdateTime );
            DeviceData.config_time = parseInt(DeviceData.config_time);
            if (cloud_time < DeviceData.config_time) {
                input.attribute = 'GET_DEVICE_CONFIG';
                input.Purpose = "Register_GetConfig";
                input.parameter = "getConfig";
            } else if (cloud_time > DeviceData.config_time) {
                input.attribute = 'SET_DEVICE_CONFIG';
                SetConfigData = deviceReg.setConfig(Action, ConfigData,input.Purpose)
                input.configData = SetConfigData;
                input.Purpose = "Register_SetConfig";
                input.parameter = "setConfig";
            }
            }
        errorReg.errorReg(input, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

module.exports = router;