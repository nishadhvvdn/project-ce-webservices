const Joi = require('@hapi/joi');

const liveconnection = Joi.object().keys({
    CellID: Joi.string().required().trim().invalid('null', true, false , "true", "false", 'undefined'),
}).required();

const livedata = Joi.object().keys({
    CellID: Joi.string().required().trim().invalid('null',true, false , "true", "false", 'undefined'),
    time: Joi.string().required().trim().invalid('null', true, false , "true", "false",'undefined'),

}).required();


module.exports = {
    liveconnection : liveconnection,
    livedata : livedata
}