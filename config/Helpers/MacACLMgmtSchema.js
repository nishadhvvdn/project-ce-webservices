const Joi = require('@hapi/joi');

const MacACLDVDetails = Joi.object().keys({
    Rev: Joi.any().required().invalid('', 'null', 'undefined'),
    Count: Joi.any().required().invalid('null', 'undefined'),
    MessageID: Joi.any().required().invalid('null', 'undefined'),
    Action: Joi.any().required().invalid('null', 'undefined'),
    Attribute: Joi.any().required().invalid('null', 'undefined'),
    CountryCode: Joi.any().required().invalid('null', 'undefined'),
    RegionCode: Joi.any().required().invalid('null', 'undefined'),
    CellID: Joi.any().required().invalid('null', 'undefined'),
}).required();

const MeterBillingDetails = Joi.object().keys({
    FileName: Joi.string().required().invalid('', 'null', 'undefined', true, false, 'true', 'false', null),
    DateTime: Joi.any().required().invalid('', 'null', 'undefined', true, false, 'true', 'false', null),
}).required();

module.exports = {
    MacACLDVDetails: MacACLDVDetails,
    MeterBillingDetails : MeterBillingDetails
}