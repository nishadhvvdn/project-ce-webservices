const Joi = require('@hapi/joi');

const meterBandwidthLimitations = Joi.object().keys({
    deviceId: Joi.number().positive().required().invalid('null', 'undefined', true, false ,'true','false'),
    serialNumber: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false'),
    ConfigType: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("BandwidthLimitations"),
    Type: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid(""),
    DeviceType: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("HyperHub", "HyperSprout", "Meter"),
    Status: Joi.number().positive().required().invalid('null', 'undefined', true, false ,'true','false').valid(0, 1),
    DownloadBandwidth: Joi.string().required().invalid('null', 'undefined', true, false ,'true','false').min(1).regex(/\b([1-9]|[1-8][0-9]|9[0-9]|[12][0-9]{2}|300)\b/),
    UploadBandwidth: Joi.string().required().invalid('null', 'undefined', true, false ,'true','false').min(1).regex(/\b([1-9]|[1-8][0-9]|9[0-9]|[12][0-9]{2}|300)\b/),
    BandwidthFlag: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("Y", "N")
}).required();

const hsBandwidthLimitations = Joi.object().keys({
    deviceId: Joi.number().positive().required().invalid('null', 'undefined', true, false ,'true','false'),
    serialNumber: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false'),
    ConfigType: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("BandwidthLimitations"),
    Type: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid(""),
    DeviceType: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("HyperHub", "HyperSprout", "Meter"),
    Status: Joi.number().positive().required().invalid('null', 'undefined', true, false ,'true','false').valid(0, 1),
    DownloadBandwidth: Joi.string().required().invalid('null', 'undefined', true, false ,'true','false').min(1).regex(/\b([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|1[0-9]{3}|2[0-3][0-9]{2}|240[01]|2401|2402)\b/),
    UploadBandwidth: Joi.string().required().invalid('null', 'undefined', true, false ,'true','false').min(1).regex(/\b([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|1[0-9]{3}|2[0-3][0-9]{2}|240[01]|2401|2402)\b/),
    BandwidthFlag: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("Y", "N")

}).required();


const BandwidthLimitationsResponse =Joi.object().keys({
    Attribute: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("METER_BANDWIDTH", "HH_BANDWIDTH", "HS_BANDWIDTH"),
    Rev: Joi.number().required().invalid('','null', 'undefined', true, false, "true", "false", ''),
    Count: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    MessageID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false",''),
    CountryCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    RegionCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    CellID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    MeterID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    Type: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("Request", "Response",'Request', 'Response'),
    Action: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("CONFIGURATION")
    
})

module.exports = {
    meterBandwidthLimitations : meterBandwidthLimitations,
    hsBandwidthLimitations:hsBandwidthLimitations,
    BandwidthLimitationsResponse:BandwidthLimitationsResponse
    
}

//regex: \b([1-9]|[1-8][0-9]|9[0-9]|[12][0-9]{2}|300)\b

//regex: \b([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|1[0-9]{3}|2[0-3][0-9]{2}|240[01]|2401|2402)\b