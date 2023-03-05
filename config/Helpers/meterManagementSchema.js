const Joi = require('@hapi/joi');

//regex to not allow space and spcecial characters
const MMGrpMgmtAssignGrpMembershipAssignEndpoint = {
    Type: Joi.string().required().empty('').valid('HyperSprout', 'Meter', "DeltaLink", "HyperHub").invalid('null', 'undefined', true, false, "true", "false"),
    Action: Joi.string().required().empty('').valid("Add", "Remove").invalid('null', 'undefined', true, false, "true", "false"),
    GroupName: Joi.string().required().min(1).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).empty('').invalid('null', 'undefined', true, false, "true", "false"),
    listMeters: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"))
}

module.exports = {
    MMGrpMgmtAssignGrpMembershipAssignEndpoint:MMGrpMgmtAssignGrpMembershipAssignEndpoint
}