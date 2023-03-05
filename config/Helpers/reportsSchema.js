const Joi = require('@hapi/joi');

const CommunicationsStatisticsReport = Joi.object().keys({
    IfHyperhub: Joi.boolean().required().valid(true, false).invalid('null', 'undefined')
  //  page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    //limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

})
const SystemLogReport = {
    StartTime: Joi.date().required(),
    EndTime: Joi.date().required(),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}

const NewAccountReport = {
    StartTime: Joi.date().required(),
    EndTime: Joi.date().required(),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}


const SystemAuditLogReport = {
    StartTime: Joi.date().required(),
    EndTime: Joi.date().required(),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}

const Outagereport = {
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}

const dataQualityReturns = {
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}


const DeviceErrorReport = {
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}

const NonTechnicalLossReport = {
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}

const DbStatistics = {
    StartTime: Joi.date().required(),
    EndTime: Joi.date().required()
}

const DeviceFirmwareVersionReport = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    DeviceType: Joi.string().required().valid("HyperSprout", "HyperHub", "Meter", "DeltaLink").invalid('null', 'undefined', 'true', 'false', true, false),
})

const MeterCommunicationsStatisticsReport = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

})


const SolarPanelReturn = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

})

const DelayResponseReport = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

})


const BatteryLifeReport = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

})

const NetworkStatisticsMeter = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

})

const MeterBillingUploadDisplay = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

})
module.exports = {
    CommunicationsStatisticsReport: CommunicationsStatisticsReport,
    SystemLogReport: SystemLogReport,
    NewAccountReport: NewAccountReport,
    SystemAuditLogReport: SystemAuditLogReport,
    Outagereport: Outagereport,
    dataQualityReturns: dataQualityReturns,
    DeviceErrorReport: DeviceErrorReport,
    NonTechnicalLossReport: NonTechnicalLossReport,
    DbStatistics: DbStatistics,
    DeviceFirmwareVersionReport: DeviceFirmwareVersionReport,
    MeterCommunicationsStatisticsReport:MeterCommunicationsStatisticsReport,
    SolarPanelReturn:SolarPanelReturn,
    DelayResponseReport:DelayResponseReport,
    BatteryLifeReport:BatteryLifeReport,
    NetworkStatisticsMeter:NetworkStatisticsMeter,
    MeterBillingUploadDisplay:MeterBillingUploadDisplay

}