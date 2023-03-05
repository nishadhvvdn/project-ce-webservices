const Joi = require('@hapi/joi');

//Add New EndPoint
const addNewEndpointDetails = Joi.object().keys({
        Type : Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").valid('Add', 'Upload'),
        Owner : Joi.array().required().items(Joi.string().required().min(1).max(15).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).invalid('null', 'undefined')),
        MacID : Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined')),
        Description : Joi.array().required().items(Joi.string().replace(/^\s+|\s+$/gm,'').required().min(1).max(250).regex(/^[a-zA-Z0-9\\s]/).invalid('null', 'undefined')),
        CircuitID : Joi.string().required().invalid('null', 'undefined', true, false, "true", "false"),
        DeviceType : Joi.array().required().items(Joi.string().required().valid("Secondary Network", "Roaming Devices").invalid('null', 'undefined'))

}).required();

//Delete EndPoint
const deleteEndpointDetails = Joi.object().keys({
    EndpointIDs: Joi.array().items(Joi.number().required().empty('').invalid('null', 'undefined'))
}).required();

//Update EndPoint
const editEndpointDetails = Joi.object().keys({
    updateEndpointValues: Joi.object().keys({
        EndpointID : Joi.number().required().invalid('null', 'undefined', true, false, "true", "false"),
        Owner : Joi.string().required().min(1).max(15).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).invalid('null', 'undefined', true, false, "true", "false"),
        MacID : Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false"),
        Description : Joi.string().replace(/^\s+|\s+$/gm,'').required().min(1).max(250).regex(/^[a-zA-Z0-9\\s]/).invalid('null', 'undefined', true, false, "true", "false"),
        CircuitID : Joi.string().required().invalid('null', 'undefined', true, false, "true", "false"),
        DeviceType : Joi.string().required().valid("Secondary Network", "Roaming Devices").invalid('null', 'undefined', true, false, "true", "false")
    }).required()
}).required();

const responseEndpointDetails = Joi.object().keys({
    cellID: Joi.any().required().invalid('null', 'undefined', true, false, "true", "false"),
    messageID: Joi.any().required().invalid('null', 'undefined', true, false, "true", "false"),
    meterID: Joi.any().required().invalid('null', 'undefined', true, false, "true", "false"),
    action: Joi.any().required().invalid('null', 'undefined', true, false, "true", "false")
}).required();

const EndpointRegistrationDetails = Joi.object().keys({
    Rev: Joi.number().required().invalid('','null', 'undefined', true, false, "true", "false", ''),
    Count: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    MessageID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false",''),
    CountryCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    RegionCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    CellID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    MeterID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    Type: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("Request", "Response",'Request', 'Response'),
    Action: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("COLLECTOR_REGISTERATION", "METER_REGISTERATION", "DELTALINK_REGISTER"),
    Attribute: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("REGISTRATION_PARA", "DEVICE_DETAILS", "HS_CONFIGURATION", "METER_CONFIGURATION", "DL_CONFIG","SET_DEVICE_CONFIG","GET_DEVICE_CONFIG"),
    Data: Joi.any()
}).required();

module.exports = {
    addNewEndpointDetails : addNewEndpointDetails,
    deleteEndpointDetails: deleteEndpointDetails,
    editEndpointDetails : editEndpointDetails,
    responseEndpointDetails : responseEndpointDetails,
    EndpointRegistrationDetails : EndpointRegistrationDetails
}