const Joi = require('@hapi/joi');

const deleteMeterDetails = Joi.object().keys({
    meterID: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined'))
}).required();

const EditMeterWifiDetails = Joi.object().keys({
    MeterID: Joi.number().positive().required().invalid('null', 'undefined', true, false ,'true','false'),
    Data : Joi.array().items(Joi.object().keys({
        STATUSCODE : Joi.any().required().invalid('null', 'undefined', true, false ,'true','false')
    })).required()
}).required();

const RemovingMeterFromTransformerWifiDetails = Joi.object().keys({
    CellID: Joi.number().positive().required().invalid('null', 'undefined', true, false ,'true','false'),
    NoOfMeter : Joi.number().positive().required().invalid('null', 'undefined', true, false ,'true','false'),
    meters : Joi.array().items(Joi.object().keys({
        Status : Joi.any().required().invalid('null', 'undefined', true, false ,'true','false'),
        DeviceID : Joi.any().required().invalid('null', 'undefined', true, false ,'true','false')
    })).required()
}).required();

const RemovingDLFromMeterformerWifiDetails = Joi.object().keys({
    CellID: Joi.number().positive().required().invalid('null', 'undefined', true, false, 'true', 'false'),
    NoOfDL: Joi.number().positive().required().invalid('null', 'undefined', true, false, 'true', 'false'),
    Dls: Joi.array().items(Joi.object().keys({
        Status: Joi.any().required().invalid('null', 'undefined', true, false, 'true', 'false'),
        DeviceID: Joi.any().required().invalid('null', 'undefined', true, false, 'true', 'false')
    })).required()
}).required();

module.exports = {
    deleteMeterDetails: deleteMeterDetails,
    EditMeterWifiDetails : EditMeterWifiDetails,
    RemovingMeterFromTransformerWifiDetails : RemovingMeterFromTransformerWifiDetails,
    RemovingDLFromMeterformerWifiDetails :RemovingDLFromMeterformerWifiDetails
}