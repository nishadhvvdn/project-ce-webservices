const Joi = require('@hapi/joi');

function validateSchema(data, schema, callback) {
    let options = { abortEarly: false };
    Joi.validate(data, schema, options, (err, value) => {
        if (err) {
            callback(err.details, null)
        } else {
            callback(null, value)
        }
    });
}

module.exports = {
    validateSchema: validateSchema,
}