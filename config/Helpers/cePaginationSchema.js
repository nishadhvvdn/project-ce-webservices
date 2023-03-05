
const Joi = require('@hapi/joi');

const DisplayAllEndpointDetails = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
}


const DisplayAllCircuitDetails = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
}

const DisplayAllMeterManagementDetails = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
}

const DisplayAllHSManagementDetails = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
}

const GetUsersDetails = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
}

const GetSecurityGroupsDetails = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
}

const DisplayAllTransformerDetails = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
}

const GetMessageDetails = {
    // page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    // limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    page: Joi.number(),
    limit: Joi.number()
}
module.exports = {
    DisplayAllEndpointDetails: DisplayAllEndpointDetails,
    DisplayAllCircuitDetails: DisplayAllCircuitDetails,
    DisplayAllMeterManagementDetails: DisplayAllMeterManagementDetails,
    DisplayAllHSManagementDetails: DisplayAllHSManagementDetails,
    GetUsersDetails: GetUsersDetails,
    GetSecurityGroupsDetails: GetSecurityGroupsDetails,
    DisplayAllTransformerDetails:DisplayAllTransformerDetails,
    GetMessageDetails:GetMessageDetails
}