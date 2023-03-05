const Joi = require('@hapi/joi');

const getLogs = Joi.object().keys({
    deviceId: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().valid("Meter", "HyperHub", "HyperSprout", "DeltaLink").required().empty('').invalid('null', 'undefined'),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();

const clearLogs = Joi.object().keys({
    deviceId: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().valid("Meter", "HyperHub", "HyperSprout", "DeltaLink").required().empty('').invalid('null', 'undefined'),
}).required();

const verbosityDetails = Joi.object().keys({
    deviceId: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().valid("Meter", "HyperHub", "HyperSprout", "DeltaLink").required().empty('').invalid('null', 'undefined'),
}).required();

const verbosityLogsValues = Joi.object().keys({
    deviceId: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().valid("Meter", "HyperHub", "HyperSprout", "DeltaLink").required().empty('').invalid('null', 'undefined'),
    logType: Joi.number().required().positive().empty('').invalid('null', 'undefined')
});

const deleteDeviceLogValues = Joi.object().keys({
    deviceId: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().valid("Meter", "HyperHub", "HyperSprout", "DeltaLink").required().empty('').invalid('null', 'undefined'),
    logID: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined'))

}).required();

const deviceLogUpload = Joi.object().keys({
    deviceId: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().valid("Meter", "HyperHub", "HyperSprout", "DeltaLink").required().empty('').invalid('null', 'undefined'),
}).required();


const clearLogsStatusSchema = Joi.object().keys({
    MeterID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Status: Joi.string().required().empty('').invalid('null', 'undefined'),
    MessageID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Action: Joi.string().required().empty('').invalid('null', 'undefined'),
    Attribute: Joi.string().required().empty('').invalid('null', 'undefined'),
    CellID: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();


const verbosityLogsStatusSchema = Joi.object().keys({
    MeterID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Status: Joi.string().required().empty('').invalid('null', 'undefined'),
    MessageID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Action: Joi.string().required().empty('').invalid('null', 'undefined'),
    Attribute: Joi.string().required().empty('').invalid('null', 'undefined'),
    CellID: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();

const fetchLogsStatusSchema = Joi.object().keys({
    MeterID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Status: Joi.string().required().empty('').invalid('null', 'undefined'),
    MessageID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Action: Joi.string().required().empty('').invalid('null', 'undefined'),
    Attribute: Joi.string().required().empty('').invalid('null', 'undefined'),
    CellID: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();


const DeviceLogUploadFile = Joi.object().keys({
    DeviceId: Joi.number().required().positive().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    DeviceType: Joi.string().valid("Meter", "HyperHub", "HyperSprout", "DeltaLink").required().empty('').invalid('null', 'undefined', true, false, "true", "false")
});
module.exports = {
    getLogs: getLogs,
    clearLogs: clearLogs,
    verbosityDetails: verbosityDetails,
    verbosityLogsValues: verbosityLogsValues,
    deleteDeviceLogValues: deleteDeviceLogValues,
    deviceLogUpload: deviceLogUpload,
    clearLogsStatusSchema: clearLogsStatusSchema,
    verbosityLogsStatusSchema: verbosityLogsStatusSchema,
    fetchLogsStatusSchema: fetchLogsStatusSchema,
    DeviceLogUploadFile: DeviceLogUploadFile
}