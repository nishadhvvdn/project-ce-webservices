const Joi = require('@hapi/joi');

const SignUp = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  FirstName: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(30).regex(/^[a-zA-Z0-9\-\s]+$/),
  LastName: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(30).regex(/^[a-zA-Z0-9\-\s]+$/),
  MobileNo: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").regex(/^[-+]?[0-9]+[-+]?[0-9]+$/).min(10).max(19),
  Email: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/),
  Password: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false"),
}).required();

const verifyOtp = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  Otp: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").min(4).max(4),
  DeviceToken: Joi.any(),
  DevicePlatform: Joi.string().required().trim().valid('iOS', 'Android').invalid('null', 'undefined', true, false, "true", "false")
}).required();

const resendData = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),

}).required();

const forgetPassword = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  MobileNo: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").regex(/^[-+]?[0-9]+[-+]?[0-9]+$/).min(10).max(19)

})

const updatePassword = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  NewPassword: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false"),
  Otp: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").min(4).max(4),
})

const updateConsumer = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  FirstName: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(30).regex(/^[a-zA-Z0-9\-\s]+$/),
  LastName: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(30).regex(/^[a-zA-Z0-9\-\s]+$/),
  Email: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/)
})

const consumerDetails = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
}).required();

const login = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  Password: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false"),
  DeviceToken: Joi.any(),
  DevicePlatform: Joi.string().required().trim().valid('iOS', 'Android').invalid('null', 'undefined', true, false, "true", "false")


}).required();

const powerUsageSchema = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  EndDate: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").regex(/\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))/),
  EndTime: Joi.string().invalid('null', 'undefined', true, false, "true", "false").regex(/^((?:[01]\d|2[0-3]):[0-5]\d$)/),
  Filter: Joi.string().required().trim().valid('Years', 'Months','Weeks','Hours','Daily'),
  StartDate: Joi.string().invalid('null', 'undefined', true, false, "true", "false").regex(/\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))/),
  StartTime: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").regex(/^((?:[01]\d|2[0-3]):[0-5]\d$)/),
}).required();

const dataUsageSchema = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  EndDate: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").regex(/\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))/),
  EndTime: Joi.string().invalid('null', 'undefined', true, false, "true", "false").regex(/^((?:[01]\d|2[0-3]):[0-5]\d$)/),
  Filter: Joi.string().required().trim().valid('Years', 'Months','Weeks','Hours','Daily'),
  StartDate: Joi.string().invalid('null', 'undefined', true, false, "true", "false").regex(/\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))/),
  StartTime: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").regex(/^((?:[01]\d|2[0-3]):[0-5]\d$)/)
}).required();

const dashboard = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
}).required();

const tokenUpdate = Joi.object().keys({
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  DeviceToken: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false"),
  DeviceAppId: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false"),
  DevicePlatform: Joi.string().required().trim().valid('iOS', 'Android').invalid('null', 'undefined', true, false, "true", "false"),
  DeviceLang: Joi.string().trim().invalid('null', 'undefined', true, false, "true", "false")
}).required();

const dhcpSchema = Joi.object().keys({
  Attribute: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("DHCP_CONFIG"),
  Rev: Joi.number().required().invalid('','null', 'undefined', true, false, "true", "false", ''),
  Count: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  MessageID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false",''),
  CountryCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  RegionCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  CellID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  MeterID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  Type: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  Action: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("DHCP_CONFIG"),
  Ip: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '')
}).required();

const dlStatusSchema = Joi.object().keys({
  Attribute: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("DELTALINK_STATUS"),
  Rev: Joi.number().required().invalid('','null', 'undefined', true, false, "true", "false", ''),
  Count: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  MessageID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false",''),
  CountryCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  RegionCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  CellID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  MeterID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  Type: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  Action: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("DELTALINK_STATUS"),
  Status: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  MACID: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", ''),
  ReadTimestamp: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '')
}).required();

const NotificationLists = {
  page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
  limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
  ConsumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/)
}

const dataUsageByClientsSchema = Joi.object().keys({
  consumerID: Joi.string().required().trim().invalid('null', 'undefined', true, false, "true", "false").min(1).max(20).regex(/^[a-zA-Z0-9\\s]+$/),
  page: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false"),
  limit: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false"),
  startTime: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false"),
  endTime: Joi.string().invalid('null', 'undefined', true, false, "true", "false"),

}).required();

module.exports = {
  SignUp: SignUp,
  verifyOtp: verifyOtp,
  resendData: resendData,
  forgetPassword: forgetPassword,
  updatePassword: updatePassword,
  updateConsumer: updateConsumer,
  consumerDetails:consumerDetails,
  login:login,
  powerUsageSchema: powerUsageSchema,
  dashboard: dashboard,
  tokenUpdate : tokenUpdate,
  dataUsageSchema: dataUsageSchema,
  dhcpSchema: dhcpSchema,
  dlStatusSchema: dlStatusSchema,
  NotificationLists:NotificationLists,
  dataUsageByClientsSchema:dataUsageByClientsSchema
}
