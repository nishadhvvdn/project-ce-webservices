const Joi = require('@hapi/joi');

const uploadBulkDataDetails = Joi.object().keys({
    Type: Joi.string().required().valid("Read", "Connect", "Disconnect").invalid('', 'null', 'undefined'),
    List: Joi.array().items(Joi.string()).required().invalid('null', 'undefined'),
}).required();


const getListOfBulkData = Joi.object().keys({
    startTime: Joi.string().required().invalid('', 'undefined', true, false, "true", "false"),
    endTime: Joi.string().required().invalid('', 'undefined', true, false, "true", "false"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();

const getListOfBulkDataByDate = Joi.object().keys({
    startTime: Joi.date().required()
}).required();


function checkIfDateIsValidOrNot(startTime) {
    let isValid = false; //2020-06-09T18::00.000Z DATE_FORMAT
    let splitDate = startTime.split(':');
    if (startTime.includes('T') && (startTime.includes('Z') && (splitDate.length == 3))) {
        if (splitDate[2].includes('.'))
            isValid = true;
    }
    return isValid;
}

const connectDisconnectDetails = Joi.object().keys({
    OnDemandType: Joi.string().required().valid("Connect", "Disconnect").invalid('', 'null', 'undefined'),
    MeterID: Joi.number().required().invalid('null', 'undefined', '', true, false, 'true', 'false'),
    Password: Joi.string().required().invalid('', 'null', 'undefined').trim()
}).required();

const getMeterKwH = Joi.object().keys({
    MeterID: Joi.number().required().invalid('null', 'undefined', '', true, false, 'true', 'false')
}).required();


const responseConnectDisconnectDetails = Joi.object().keys({
    Action: Joi.any().required().invalid('null', 'undefined', true, false, "true", "false"),
    Attribute: Joi.any().required().invalid('null', 'undefined', true, false, "true", "false"),
    MeterID: Joi.any().required().invalid('null', 0, 'undefined', true, false, "true", "false"),
    cellID: Joi.any().required().invalid('null', 'undefined', true, false, "true", "false")
}).required();

module.exports = {
    uploadBulkDataDetails: uploadBulkDataDetails,
    getListOfBulkData: getListOfBulkData,
    getListOfBulkDataByDate: getListOfBulkDataByDate,
    checkIfDateIsValidOrNot: checkIfDateIsValidOrNot,
    connectDisconnectDetails: connectDisconnectDetails,
    getMeterKwH : getMeterKwH,
    responseConnectDisconnectDetails : responseConnectDisconnectDetails
}