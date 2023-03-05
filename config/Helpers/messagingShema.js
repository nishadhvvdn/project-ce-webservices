const Joi = require('@hapi/joi');


const addMessage = Joi.object().keys({
    message_id: Joi.number().integer().required(),
    recipient: Joi.string(),
    message: Joi.string(),
    is_read: Joi.boolean().default(false).invalid("false","False","True","true"),
    date: Joi.date(),
    sender: Joi.string(),
    severity: Joi.string().valid("Minor", "Warning", "Critical").invalid('','null','undefined')
});

const editMessage = Joi.object().keys({
    is_read: Joi.boolean(),
    date: Joi.date(),
});

const getMessageById = Joi.object().keys({
    message_id: Joi.number().required()
})
module.exports ={
    addMessage: addMessage,
    editMessage: editMessage,
    getMessageById:getMessageById
}