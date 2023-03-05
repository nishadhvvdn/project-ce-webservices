const Joi = require('@hapi/joi');

const insertNewMeterDetails = Joi.object().keys({
    Type: Joi.string().required().empty('').valid('Add', 'Upload').invalid('null', 'undefined'),
    DeltalinkSerialNumber: Joi.array().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    DeltalinkWiFiMacID: Joi.array().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    DeltalinkVersion: Joi.array().required().items(),
    Bandwidth: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").valid('0', '1')),
    DownloadBandwidth: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    UploadBandwidth: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    GroupMeterSerialNo: Joi.array().required().items()
}).required();

const editDeltalinkDetails = Joi.object().keys({
    DeltalinkID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    DeltalinkSerialNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    DeltalinkVersion: Joi.string().required(),
    DeltalinkWiFiMacID: Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).empty('').invalid('null', 'undefined', true, false, "true", "false"),
    DeltalinkBandwidthFlag: Joi.string().required().invalid('undefined', true, false, "true", "false").valid("Y", "N"),
    Bandwidth: Joi.alternatives().try(Joi.number().integer(), Joi.string()).valid(0, 1),
    DownloadBandwidth: Joi.alternatives().try(Joi.number().integer(), Joi.string()),
    UploadBandwidth: Joi.alternatives().try(Joi.number().integer(), Joi.string())
}).required();


const displayAllDeltalinkDetails = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    deviceStatus: Joi.string().required().empty('').valid('all', 'registered', "notRegistered").invalid('null', 'undefined', true, false, "true", "false"),
    meterID: Joi.string().empty('').invalid('undefined'),

}).required();

const deleteDeltalinkValues = Joi.object().keys({
    deltalinkID: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined'))

}).required();

const nodePingDeltalinkValues = Joi.object().keys({
    DeltalinkID: Joi.number().positive().required().empty('').invalid('null', 'undefined')

}).required();

const addDeltalinkToMeterValues = Joi.object().keys({
    meterID: Joi.number().positive().required().empty('').invalid('null', 'undefined'),
    deltalinkID: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined'))
}).required();


const removeDeltalinkFromMeterValues = Joi.object().keys({
    meterID: Joi.number().positive().required().empty('').invalid('null', 'undefined'),
    deltalinkId: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined'))
}).required();


const createAppGroup = Joi.object().keys({
    groupName: Joi.string().required().min(1).regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).invalid('null', 'undefined', true, false, "true", "false"),
    description: Joi.string().required().min(1).max(250).regex(/^[A-Za-z0-9^`~!@#$%\^&*()_+={}|[\]\\:';"<>?,./]+(?:\s?[A-Za-z0-9^`~!@#$%\^&*()_+={}|[\]\\:';"<>?,./]+)*$/).invalid('null', 'undefined', true, false, "true", "false"),
    type: Joi.string().required().valid("Meter", "HyperSprout", "DeltaLink").invalid('null', 'undefined', true, false, "true", "false").trim(),
}).required();

const displayAllDeltlinkAppGroupDetails = Joi.object().keys({
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();

const appGroupDelete = {
    ID: Joi.number().required().positive().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Type: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    DeviceType: Joi.string().required().empty('').valid("Meter", "HyperSprout", "DeltaLink").invalid('null', 'undefined', true, false, "true", "false")
}

const assignGroupMember = Joi.object().keys({
    groupName: Joi.string().required().empty('').invalid('null', 'undefined'),
    listDeltalinks: Joi.array().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    action: Joi.string().required().empty('').valid("Add", "Remove").invalid('null', 'undefined'),
    type: Joi.string().required().empty('').valid("DeltaLink").invalid('null', 'undefined', true, false, "true", "false")
}).required();

const deltalinkFirmwareMgmtJobStatus = Joi.object().keys({
    deviceType: Joi.string().required().empty('').valid('HyperSprout', 'Meter', "DeltaLink").invalid('null', 'undefined', true, false, "true", "false"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    filter:  Joi.boolean().required().valid(true, false).invalid('null', 'undefined')
}).required();

const firmwareMgmtJobStatus ={
    DeviceType: Joi.string().required().empty('').valid('HyperSprout', 'Meter', "DeltaLink").invalid('null', 'undefined', true, false, "true", "false"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)
}

const deltalinkJobList = Joi.object().keys({
    deviceType: Joi.string().required().empty('').valid('HyperSprout', 'Meter', 'DeltaLink', 'All').invalid('null', 'undefined', true, false, "true", "false"),
    startTime: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    endTime: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
    filter:Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")
}).required();


const firmwareMgmtFirmGroupSubmit = Joi.object().keys({
    DeviceType: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Firmware: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Group: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();

const listDeviceAttached = Joi.object().keys({
    groupType: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    type: Joi.string().required().empty('').valid("Meter", "HyperSprout", "DeltaLink", "HyperHub").invalid('null', 'undefined', true, false, "true", "false"),
    groupID: Joi.number().required().positive().empty('').invalid('null', 'undefined'),
}).required();


const firmwareMgmtDeltalinkResponse = Joi.object().keys({
    action: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    cellId: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    //deltalinkId: Joi.number().required().invalid('null', 'undefined'),
   // status: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
}).required();

const nodePingDeltalinkStatus = Joi.object().keys({
    SlaveDetails: Joi.array().items(Joi.object().keys({
        SerialNo: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
        Status: Joi.string().empty('').invalid('null', 'undefined'),
    })),
    DLid :Joi.number().required().empty('').invalid('null', 'undefined'),
    Mstatus:Joi.number().required().empty('').invalid('null', 'undefined').valid(1,0),
    noofSlave : Joi.number().required().empty('').invalid('null', 'undefined'),
    messageID: Joi.number().required().empty('').invalid('null', 'undefined'),

}).required();


const ExportAllDeltalinkDetails = Joi.object().keys({
    DeviceType: Joi.string().required().trim().valid('Meter', 'HyperSprout', "HyperHub", "DeltaLink").invalid('null', 'undefined', true, false, "true", "false"),
    JobType: Joi.string().valid('', "null" , 'undefined','Meter', 'HyperSprout', "HyperHub", "DeltaLink", "All"),

}).required();

const BandwidthLimitationsResponse =Joi.object().keys({
    Attribute: Joi.string().required().trim().invalid('null', 'undefined', true, false ,'true','false').valid("DELTALINK_BANDWIDTH"),
    Rev: Joi.number().required().invalid('','null', 'undefined', true, false, "true", "false", ''),
    Count: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    MessageID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false",''),
    CountryCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    RegionCode: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    CellID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    MeterID: Joi.number().required().invalid('null', 'undefined', true, false, "true", "false", ''),
    Type: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("Request", "Response",'Request', 'Response'),
    Action: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false", '').valid("CONFIGURATION"),
    Data: Joi.array().required().items(Joi.object().keys({
        "Status":Joi.any()
    }))
})

module.exports = {
    insertNewMeterDetails: insertNewMeterDetails,
    editDeltalinkDetails: editDeltalinkDetails,
    displayAllDeltalinkDetails: displayAllDeltalinkDetails,
    deleteDeltalinkValues: deleteDeltalinkValues,
    nodePingDeltalinkValues: nodePingDeltalinkValues,
    addDeltalinkToMeterValues: addDeltalinkToMeterValues,
    removeDeltalinkFromMeterValues: removeDeltalinkFromMeterValues,
    createAppGroup: createAppGroup,
    displayAllDeltlinkAppGroupDetails: displayAllDeltlinkAppGroupDetails,
    appGroupDelete: appGroupDelete,
    assignGroupMember: assignGroupMember,
    firmwareMgmtJobStatus: firmwareMgmtJobStatus,
    deltalinkJobList: deltalinkJobList,
    deltalinkFirmwareMgmtJobStatus: deltalinkFirmwareMgmtJobStatus,
    firmwareMgmtFirmGroupSubmit: firmwareMgmtFirmGroupSubmit,
    listDeviceAttached: listDeviceAttached,
    firmwareMgmtDeltalinkResponse:firmwareMgmtDeltalinkResponse,
    nodePingDeltalinkStatus:nodePingDeltalinkStatus,
    ExportAllDeltalinkDetails:ExportAllDeltalinkDetails,
    BandwidthLimitationsResponse:BandwidthLimitationsResponse
}