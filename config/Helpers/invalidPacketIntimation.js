const Joi = require('@hapi/joi');

const invalidPacketIntimation = Joi.object().keys({
    Rev: Joi.any().required().invalid('', 'null', 'undefined'),
    MessageID: Joi.any().required().invalid('null', 'undefined'),
    Action: Joi.any().required().invalid('null', 'undefined'),
    Attribute: Joi.any().required().invalid('null', 'undefined'),
    CountryCode: Joi.any().required().invalid('null', 'undefined'),
    RegionCode: Joi.any().required().invalid('null', 'undefined'),
    CellID: Joi.any().required().invalid('null', 'undefined'),
    MeterID: Joi.any().required().invalid('null', 'undefined')
}).required();

const smMeterNodePing = Joi.object().keys({
    meterID: Joi.any().required().invalid('null', 'undefined'),
    status: Joi.any().required().invalid('null', 'undefined'),
    messageID: Joi.any().required().invalid('null', 'undefined')
}).required();

module.exports = {
    invalidPacketIntimation : invalidPacketIntimation,
    smMeterNodePing : smMeterNodePing
}