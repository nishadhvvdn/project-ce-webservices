const Joi = require('@hapi/joi');

const lockUnlockDeviceStatus = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    DeviceType: Joi.string().required().empty('').invalid('null', 'undefined'),
    Action: Joi.string().required().empty('').invalid('null', 'undefined').valid("Lock", "Unlock"),
    serialNumber: Joi.string().required().empty('').invalid('null', 'undefined'),
}).required();


const lockUnlockDevice = Joi.object().keys({
    MeterID: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Status: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MessageID: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Action: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").valid("LOCK", "UNLOCK"),
    Attribute: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    CellID: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
}).required();

module.exports = {
    lockUnlockDeviceStatus: lockUnlockDeviceStatus,
    lockUnlockDevice: lockUnlockDevice

}