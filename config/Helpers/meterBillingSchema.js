
const Joi = require('@hapi/joi');

//Add meter scheme billing upload
const meterBillUploadData = Joi.object().keys({
    OldDate: Joi.string().required().regex(/^\d{4}[./-]\d{2}[./-]\d{2}$/).invalid('null', 'undefined'),
}).required();

module.exports = {
    meterBillUploadData : meterBillUploadData,
}