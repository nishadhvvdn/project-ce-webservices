const Joi = require('@hapi/joi');

const deleteCircuitDetails = Joi.object().keys({
    circuitID: Joi.array().items(Joi.string().required().empty('').invalid('null', 'undefined'))
}).required();

module.exports = {
    deleteCircuitDetails: deleteCircuitDetails
}