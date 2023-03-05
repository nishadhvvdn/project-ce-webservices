const Joi = require('@hapi/joi');

const FactoryResetDetails = Joi.object().keys({
    deviceId : Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    serialNumber : Joi.string().required().invalid('','null', 'undefined'),
    DeviceType: Joi.string().required().valid("HyperSprout", "HyperHub", "Meter", "DeltaLink").invalid('','null', 'undefined'),
    factoryResetType: Joi.string().required().valid("full", "shallow").invalid('null', 'undefined'),
}).required();

const FactoryResetResponseSchema = Joi.object().keys({
    MeterID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Status: Joi.string().required().empty('').invalid('null', 'undefined'),
    MessageID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Action: Joi.string().required().empty('').invalid('null', 'undefined'),
    Attribute: Joi.string().required().empty('').invalid('null', 'undefined'),
    CellID: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();


module.exports = {
    FactoryResetDetails: FactoryResetDetails,
    FactoryResetResponseSchema : FactoryResetResponseSchema
}

