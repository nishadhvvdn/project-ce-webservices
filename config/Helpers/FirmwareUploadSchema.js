const Joi = require('@hapi/joi');

const FirmwareUploadSchema = {
    DeviceType: Joi.string().required().valid("iTM", "iNC", "MeshCard", "MeterCard", "DeltaLink", "Cellular", "Bluetooth").invalid('','null', 'undefined')
}


module.exports = {
    FirmwareUploadSchema: FirmwareUploadSchema
}