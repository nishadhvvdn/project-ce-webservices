const Joi = require('@hapi/joi');

const saveSystemSettings = Joi.object().keys({
    tabValue: Joi.string().required().empty('').valid('Communications','Miscellaneous','Reporting'),
    saveSettings : Joi.object().keys({"RetryAttemtCEtoHS": Joi.number().min(1).max(10),"ConfigurationDescrepancyHandling": Joi.string(),"HypersproutTransactionPoolingInterval":Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),"LineLossFactor":Joi.number(),"HyperSproutLoss":Joi.number(),"HyperHubLoss":Joi.number(),"NumberofRowstoDisplayPerPage":Joi.number().valid(15,30,45,60,75,90,100),"DefaultDataDisplayPeriod":Joi.number().min(1).max(100),"newAccountReportTimePeriod":Joi.number().min(1).max(100)})
}).required();

const restoreDefaultSettings = Joi.object().keys({
    tabValue: Joi.string().required().empty('').valid('Communications','Miscellaneous','Reporting'),
}).required();


const addUser = Joi.object().keys({
    userID: Joi.string().required().empty('').min(8).max(20).trim().regex(/^[a-zA-Z0-9]+$/),
    firstName: Joi.string().required().empty('').min(4).max(16).trim().regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/),
    lastName: Joi.string().required().empty('').min(1).max(16).trim().regex(/^[a-zA-Z]+$/),
    emailAdd: Joi.string().required().empty('').regex(/^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/),
    securityGroup: Joi.string().required().max(20).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).invalid('null', 'undefined', true, false, "true", "false"),
    homePage: Joi.string().required().trim().max(50).trim().valid("Home Page", "Reports", "Hypersprout Management", "Meter Management", "System Management", "Administration", "Delta Link Management").invalid('null', 'undefined', true, false, "true", "false"),
    timeZone: Joi.string().required().trim().regex(/^[0-9a-zA-Z/ _]+$/).invalid('null', 'undefined', true, false, "true", "false").max(50),
    accountLocked: Joi.boolean().required(),
    temprature: Joi.string().required().empty('').max(30).trim().valid("Celsius", "Fahrenheit").invalid('null', 'undefined', true, false, "true", "false"),  
    mobileNumber: Joi.string().required(),
}).required();

const editUser = Joi.object().keys({
    userID: Joi.string().required().empty('').min(8).max(20).regex(/^[a-zA-Z0-9]+$/),
    loginId: Joi.string().required().trim(),
    firstName: Joi.string().required().empty('').min(4).max(16).trim().regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/),
    lastName: Joi.string().required().empty('').min(1).max(16).trim().regex(/^[a-zA-Z]+$/),
    emailAdd: Joi.string().required().empty('').regex(/^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/),
    securityGroup: Joi.string().required().max(20).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).invalid('null', 'undefined', true, false, "true", "false"),
    homePage: Joi.string().required().trim().max(50).trim().valid("Home Page", "Reports", "Hypersprout Management", "Meter Management", "System Management", "Administration", "Delta Link Management").invalid('null', 'undefined', true, false, "true", "false"),
    timeZone: Joi.string().required().trim().regex(/^[0-9a-zA-Z/ _]+$/).invalid('null', 'undefined', true, false, "true", "false").max(50),
    accountLocked: Joi.boolean().required(),
    temprature: Joi.string().required().empty('').max(30).trim().valid("Celsius", "Fahrenheit").invalid('null', 'undefined', true, false, "true", "false"),  
    mobileNumber: Joi.string().required(),
}).required();

const resetPassword = Joi.object().keys({
    userID: Joi.string().required().empty('').min(8)
}).required();

const login = Joi.object().keys({
    email: Joi.string().required().empty('').min(8),
    password: Joi.string().required().empty('')
}).required();

const changePassword = Joi.object().keys({
    loginId: Joi.string().required().empty(''),
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().empty(''),
    isPasswordExpired: Joi.boolean().required().empty('')  
}).required();

module.exports = {
    saveSystemSettings : saveSystemSettings,
    addUser : addUser,
    editUser : editUser,
    resetPassword : resetPassword,
    restoreDefaultSettings : restoreDefaultSettings,
    login : login,
    changePassword : changePassword
}