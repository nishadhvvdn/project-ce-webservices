const Joi = require('@hapi/joi');

const getTransformerByDTCID = Joi.object().keys({
    CircuitID: Joi.string().required().trim().min(1).max(30).regex(/^[a-zA-Z0-9]+$/).invalid('null', 'undefined', true, false, "true", "false"),   
});

const getTransformerPhaseDetails = Joi.object().keys({
    transformerId : Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[0-9]+$/), 
    startDate: Joi.date(),
    endDate: Joi.date()  
});

const getMeterByTransformerID = Joi.object().keys({
    transformerID: Joi.string().required().trim().min(1).invalid('null', 'undefined', true, false, "true", "false"),   
});

const dataRate = Joi.object().keys({
    deviceType: Joi.string().required().trim().min(1).invalid('null', 'undefined', true, false, "true", "false").valid("Meter", "DeltaLink", "HyperSprout", "HyperHub"),
    deviceId: Joi.number().required().min(1).invalid('null', 'undefined', true, false, "true", "false")     
});

const dataRateResponse = Joi.object().keys({
    MeterID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Status: Joi.number().required().empty('').invalid('null', 'undefined'),
    MessageID: Joi.number().required().empty('').invalid('null', 'undefined'),
    Action: Joi.string().required().empty('').invalid('null', 'undefined'),
    Attribute: Joi.string().required().empty('').invalid('null', 'undefined'),
    CellID: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    Data: Joi.any().required()
}).required();

const dataRateReport = Joi.object().keys({
    deviceType: Joi.string().required().trim().min(1).invalid('null', 'undefined', true, false, "true", "false").valid("Meter", "DeltaLink", "HyperSprout", "HyperHub"),
    page: Joi.number().required().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().empty('').invalid('null', 'undefined'),
    startTime: Joi.date().required().empty('').invalid('null', 'undefined'),
    endTime: Joi.date().required().empty('').invalid('null', 'undefined'),
}).required();


const getDeltalinkByMeterID = Joi.object().keys({
    meterID: Joi.number().required().min(1).invalid('null', 'undefined', true, false, "true", "false"),   
});

module.exports = {
    getTransformerByDTCID: getTransformerByDTCID,
    getTransformerPhaseDetails: getTransformerPhaseDetails,
    getMeterByTransformerID:getMeterByTransformerID,
    dataRate:dataRate,
    dataRateResponse:dataRateResponse,
    dataRateReport:dataRateReport,
    getDeltalinkByMeterID:getDeltalinkByMeterID
    

}