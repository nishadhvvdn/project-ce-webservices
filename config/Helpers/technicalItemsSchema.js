const Joi = require('@hapi/joi');

const insertNewTechnicalItems = Joi.object().keys({
    Type: Joi.string().required().empty('').valid('Add', 'Upload').invalid('null', 'undefined'),
    Name: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TransformerSerialNo : Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    Metered: Joi.array().required().items(Joi.string().required().empty('').valid('true', 'false','TRUE','FALSE').invalid('null', 'undefined')),
    UsagePerDay : Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false", "0", "0.00", ".0", ".00", "0.0")),
    NoOfConnectedItems : Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    UsageTime : Joi.array().required().items(Joi.string().required().empty('').valid('allDay','custom').invalid('null', 'undefined', true, false, "true", "false")),
    StartHour : Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    EndHour : Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"))
}).required();

const pattern = '^[a-zA-Z0-9]+$';
const displayAllTechnicalItems = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    transformerSN: Joi.string().required().empty('').invalid('null', 'undefined').regex(RegExp(pattern))
}).required();

const editTechnicalItems = Joi.object().keys({
    TechitemID: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    Name: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").min(1).max(30),
    TransformerSerialNo : Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(RegExp(pattern)),
    Metered: Joi.string().required().empty('').valid('true', 'false','TRUE','FALSE').invalid('null', 'undefined'),
    UsagePerDay : Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false", "0", "0.00", ".0", ".00", "0.0").min(1).max(9),
    NoOfConnectedItems : Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").min(1).max(5),
    UsageTime : Joi.string().required().empty('').valid('allDay','custom').invalid('null', 'undefined', true, false, "true", "false"),
    StartHour : Joi.string().required().empty('').valid('0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23').invalid('null', 'undefined', true, false, "true", "false"),
    EndHour : Joi.string().required().empty('').valid('0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23').invalid('null', 'undefined', true, false, "true", "false")
}).required();

const deleteTechnicalItems =  Joi.object().keys({
    TechitemID: Joi.array().required().items(Joi.number().required().positive().empty('').invalid('null', 'undefined', true, false, "true", "false")),
}).required();

module.exports = {
    insertNewTechnicalItems : insertNewTechnicalItems,
    displayAllTechnicalItems : displayAllTechnicalItems,
    editTechnicalItems : editTechnicalItems,
    deleteTechnicalItems : deleteTechnicalItems
}