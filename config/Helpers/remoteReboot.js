const Joi = require('@hapi/joi');

const remoteRebootDeviceStatus = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    DeviceType: Joi.string().required().empty('').invalid('null', 'undefined').valid("hs", "hh", "meter", "DeltaLink", "deltalink"),
    Action: Joi.string().required().empty('').invalid('null', 'undefined'),
    serialNumber: Joi.string().required().empty('').invalid('null', 'undefined'),
}).required();

const remoteRebootDevice = Joi.object().keys({
    MeterID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Status: Joi.string().required().empty('').invalid('null', 'undefined'),
    MessageID: Joi.number().required().empty('').invalid('null', 'undefined'),
    CellID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Action: Joi.string().required().empty('').invalid('null', 'undefined'),
    Attribute: Joi.string().required().empty('').invalid('null', 'undefined'),
    DeviceType: Joi.string().empty('').valid("hs", "hh", "meter", "DeltaLink", "deltaLink"),
}).required();



module.exports = {
    remoteRebootDeviceStatus: remoteRebootDeviceStatus,
    remoteRebootDevice: remoteRebootDevice

}