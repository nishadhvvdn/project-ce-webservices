const Joi = require('@hapi/joi');

const addSecurityGroupData = Joi.object().keys({
    securityID: Joi.string().required().empty('').trim().min(1).max(20).regex(/^[a-zA-Z0-9]+$/),
    description: Joi.string().required().empty('').trim().min(1).max(250),
    functions: Joi.array().required().items(
        Joi.object().keys({ "Tools": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "PerformInteractiveRead": Joi.string().required().valid("true", "false"), "ViewJobStatus": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "HypersproutManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "ModifyHypersproutFirmware": Joi.string().required().valid("true", "false"), "HypersproutFirmwareManagement": Joi.string().required().valid("true", "false"), "HypersproutJobStatus": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "MeterManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "ModifyMeterFirmware": Joi.string().required().valid("true", "false"), "MeterFirmwareManagement": Joi.string().required().valid("true", "false"), "MeterJobStatus": Joi.string().required().valid("true", "false"), "MeterBulkOperation": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "Administration": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "ModifySecurity": Joi.string().required().valid("true", "false"), "ModifySystemSettings": Joi.string().required().valid("true", "false"), "ModifyUsers": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "Reports": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "CommunicationStatistics": Joi.string().required().valid("true", "false"), "SystemLog": Joi.string().required().valid("true", "false"), "DeviceFirmwareVersions": Joi.string().required().valid("true", "false"), "DeviceRegistrationStatus": Joi.string().required().valid("true", "false"), "NewAccountsReport": Joi.string().required().valid("true", "false"), "SystemAuditLog": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "SystemManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "DeviceManagement": Joi.string().required().valid("true", "false"), "JobStatus": Joi.string().required().valid("true", "false"), "Registration": Joi.string().required().valid("true", "false"), "Grouping": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "DeltaLinkManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "deltaLinkGroupManagement": Joi.string().required().valid("true", "false"), "DeltaLinkFirmwareManagement": Joi.string().required().valid("true", "false"), "DeltaLinkJobStatus": Joi.string().required().valid("true", "false") }) })
    )
}).required();

const editSecurityGroupData = Joi.object().keys({
    securityID: Joi.string().required().empty('').trim().min(1).max(20).regex(/^[a-zA-Z0-9]+$/),
    description: Joi.string().required().empty('').trim().min(1).max(250),
    functions: Joi.array().required().items(
        Joi.object().keys({ "Tools": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "PerformInteractiveRead": Joi.string().required().valid("true", "false"), "ViewJobStatus": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "HypersproutManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "ModifyHypersproutFirmware": Joi.string().required().valid("true", "false"), "HypersproutFirmwareManagement": Joi.string().required().valid("true", "false"), "HypersproutJobStatus": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "MeterManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "ModifyMeterFirmware": Joi.string().required().valid("true", "false"), "MeterFirmwareManagement": Joi.string().required().valid("true", "false"), "MeterJobStatus": Joi.string().required().valid("true", "false"), "MeterBulkOperation": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "Administration": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "ModifySecurity": Joi.string().required().valid("true", "false"), "ModifySystemSettings": Joi.string().required().valid("true", "false"), "ModifyUsers": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "Reports": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "CommunicationStatistics": Joi.string().required().valid("true", "false"), "SystemLog": Joi.string().required().valid("true", "false"), "DeviceFirmwareVersions": Joi.string().required().valid("true", "false"), "DeviceRegistrationStatus": Joi.string().required().valid("true", "false"), "NewAccountsReport": Joi.string().required().valid("true", "false"), "SystemAuditLog": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "SystemManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "DeviceManagement": Joi.string().required().valid("true", "false"), "JobStatus": Joi.string().required().valid("true", "false"), "Registration": Joi.string().required().valid("true", "false"), "Grouping": Joi.string().required().valid("true", "false") }) }),
        Joi.object().keys({ "DeltaLinkManagement": Joi.string().required().valid("true", "false"), "values": Joi.object().keys({ "deltaLinkGroupManagement": Joi.string().required().valid("true", "false"), "DeltaLinkFirmwareManagement": Joi.string().required().valid("true", "false"), "DeltaLinkJobStatus": Joi.string().required().valid("true", "false") }) })
    )
}).required();


const deleteSecurityGroupData = Joi.object().keys({
    securityID: Joi.string().required().empty('').trim()
}).required();

const maxPassAgePattern = '^([1-9][0-9]{1,2}|999)?$'; // 10-999
const passToStore = '^([1-9]|10)$'; // 1-10
const logonFailures = '^([0-9]|1[0-9]|20)?$'; // 0-20 
const lockoutDur = '^([1-9][0-9]{1,2}|999)?$'; //1-999
const passLength = '(^[6-9]|10)$'; //6-10
const passwordSettings = Joi.object().keys({
    EnablePasswordPolicy: Joi.boolean().required().empty(''),
    MaximumPasswordAge: Joi.number().required().empty('').min(10).max(999),
    NumberofPasswordstoStore: Joi.number().required().empty('').min(1).max(10),
    MaximumLogonFailuresbeforeLockout: Joi.number().required().empty('').min(0).max(20),
    LockoutDuration: Joi.number().required().empty('').min(1).max(999),
    MinimumPasswordLength: Joi.number().required().empty('').min(6).max(10)
}).required();

module.exports = {
    addSecurityGroupData : addSecurityGroupData,
    editSecurityGroupData : editSecurityGroupData,
    deleteSecurityGroupData : deleteSecurityGroupData,
    passwordSettings : passwordSettings
}