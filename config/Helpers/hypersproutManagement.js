const Joi = require('@hapi/joi');

//Create App Group - HS
//regex to not allow space and spcecial characters

const HSMGrpMgmtAssignGrpMembershipCreateAppGrp = {
    Type: Joi.string().required().valid('HyperSprout', 'Meter', "DeltaLink", "HyperHub").invalid('null', 'undefined', true, false, "true", "false").trim(),
    Description: Joi.string().required().min(1).max(250).regex(/^[A-Za-z0-9^`~!@#$%\^&*()_+={}|[\]\\:';"<>?,./]+(?:\s?[A-Za-z0-9^`~!@#$%\^&*()_+={}|[\]\\:';"<>?,./]+)*$/).invalid('null', 'undefined', true, false, "true", "false"),
    GroupName: Joi.string().required().min(1).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).invalid('null', 'undefined', true, false, "true", "false"),
}

const AppGroupDownload = {
    Type: Joi.string().required().empty('').valid('HyperSprout', 'Meter', "DeltaLink", "HyperHub").invalid('null', 'undefined', true, false, "true", "false"),
    GroupID: Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
}

//regex to not allow space and spcecial characters
const HSMGrpMgmtAssignGrpMembershipAssignEndpoint = {
    Type: Joi.string().required().empty('').valid('HyperSprout', 'Meter', "DeltaLink", "HyperHub").invalid('null', 'undefined', true, false, "true", "false"),
    Action: Joi.string().required().empty('').valid("Add", "Remove").invalid('null', 'undefined', true, false, "true", "false"),
    GroupName: Joi.string().required().min(1).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).empty('').invalid('null', 'undefined', true, false, "true", "false"),
    listHS: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"))
}


const FirmwareGroupLists = Joi.object().keys({
    DeviceType: Joi.string().required().valid("HyperSprout", "HyperHub", "Meter", "DeltaLink").invalid('null', 'undefined', 'true', 'false', true, false),
})
module.exports = {
    HSMGrpMgmtAssignGrpMembershipCreateAppGrp: HSMGrpMgmtAssignGrpMembershipCreateAppGrp,
    AppGroupDownload: AppGroupDownload,
    HSMGrpMgmtAssignGrpMembershipAssignEndpoint: HSMGrpMgmtAssignGrpMembershipAssignEndpoint,
    FirmwareGroupLists:FirmwareGroupLists
}