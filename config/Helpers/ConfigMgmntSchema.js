const Joi = require('@hapi/joi');

const AlarmEvents = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().required().empty('').invalid('null', 'undefined').valid("hs", "hh", "meter"),
    serialNo: Joi.string().required().empty('').invalid('null', 'undefined'),
    saveConfigDetails: Joi.object()
}).required();

const Backhaul = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().required().empty('').invalid('null', 'undefined').valid("hs", "hh", "meter"),
    ConfigType: Joi.string().required().empty('').invalid('null', 'undefined').valid("BackHaul"),
    Type: Joi.string().required().empty('').invalid('null', 'undefined').valid("Cellular", "Ethernet", "Advanced"),
    serialNo: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/).trim().min(10).max(25),
    saveConfigDetails: Joi.object()
}).required();


const Fronthaul = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    serialNo: Joi.string().required().empty('').trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/).trim().min(10).max(25),
    deviceType: Joi.string().required().trim().invalid('null', 'undefined').valid("hs", "hh", "meter"),
    ConfigType: Joi.string().required().trim().invalid('null', 'undefined', "true", "false").valid("Radio", "Mesh", "Hotspot", "DHCP"),
    Type: Joi.string().required().invalid("null", 'null', 'undefined', "true", "false").valid("", " ", "2_4", "5", "5_L", "5_H"),
    saveConfigDetails: Joi.object().required().min(1)
}).required();

const CountryDefault = Joi.object().keys({
    type: Joi.number().required().empty('').invalid('null', 'undefined').valid(0,1,2),
    Country: Joi.string().required().empty('').invalid('null', 'undefined'),
}).required();

const FetchInfo = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().required().empty('').invalid('null', 'undefined').valid("hs", "hh", "meter"),
}).required();

const MeterConfig = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().required().empty('').invalid('null', 'undefined').valid("hs", "hh", "meter"),
    serialNo: Joi.string().required().empty('').invalid('null', 'undefined'),
    ConfigType: Joi.string().required().empty('').invalid('null', 'undefined'),
    saveConfigDetails: Joi.object(),
    utilityId: Joi.number().min(0).max(255).invalid('null', 'undefined').required(),
    CircuitId: Joi.number().min(0).max(255).invalid('null', 'undefined').required(),
    CertificationNumber: Joi.number().min(0).max(255).invalid('null', 'undefined').required(),
    MeterEsn: Joi.number().min(0).max(255).invalid('null', 'undefined').required()
}).required();

const SysSetting = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined'),
    deviceType: Joi.string().required().empty('').invalid('null', 'undefined').valid("hs", "hh", "meter"),
   // serialNo: Joi.string().required().empty('').invalid('null', 'undefined'),
    saveConfigDetails: Joi.object()
}).required();

const carrierListDevice = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined')
}).required();

const MeshscanDevice = Joi.object().keys({
    deviceId: Joi.number().required().empty('').invalid('null', 'undefined')
}).required();

module.exports = {
    AlarmEvents: AlarmEvents,
    Backhaul: Backhaul,
    CountryDefault: CountryDefault,
    FetchInfo: FetchInfo,
    Fronthaul: Fronthaul,
    MeterConfig: MeterConfig,
    SysSetting: SysSetting,
    carrierListDevice : carrierListDevice,
    MeshscanDevice : MeshscanDevice

}