const Joi = require('@hapi/joi');

const ResetFirmwareDetails = {
    JobID : Joi.string().required().invalid('','null', 'undefined', true, false, "true", "false"),
    CardType: Joi.string().required().valid("iTM", "iNC", "MeshCard", "MeterCard", "DeltaLink", "Cellular", "Bluetooth").invalid('','null', 'undefined', true, false, "true", "false")
}

const firmwareMgmtFirmwareGroupSubmit = {
    DeviceType: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").valid('HyperSprout', 'Meter', 'DeltaLink'),
    Firmware: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Group: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    CardType : Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").valid("iTM", "iNC", "MeshCard", "MeterCard", "DeltaLink", "Cellular", "Bluetooth"),
    Url : Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")
};

const firmwareMgmtFirmGroup = Joi.object().keys({
    DeviceType: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").valid('HyperSprout', 'Meter', 'DeltaLink')
}).required();

const firmwareMgmtResponse = Joi.object().keys({
    Action: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    CellID: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterID: Joi.number().empty('').invalid('null','undefined', true, false, "true", "false"),
    Data: Joi.any()
}).required();

module.exports = {
    ResetFirmwareDetails: ResetFirmwareDetails,
    firmwareMgmtFirmwareGroupSubmit : firmwareMgmtFirmwareGroupSubmit,
    firmwareMgmtFirmGroup : firmwareMgmtFirmGroup,
    firmwareMgmtResponse : firmwareMgmtResponse
}

