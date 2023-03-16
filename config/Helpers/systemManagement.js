const Joi = require('@hapi/joi');
const { join } = require('lodash');


const insertNewCircuitDetails = Joi.object().keys({
    type: Joi.string().required().empty('').valid('Add', 'Upload').invalid('null', 'undefined'),
    circuitID: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    kVARating: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    substationID: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    substationName: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim()),
    address: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim()),
    country: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim()),
    state: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim()),
    city: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim()),
    zipCode: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim()),
    latitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim()),
    longitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim())
}).required();

const updateCircuitDetails = Joi.object().keys({
    circuitNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    circuitID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    kVARating: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    substationID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    substationName: Joi.string().required().invalid('null', 'undefined', true, false, "true", "false").trim(),
    address: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim(),
    country: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim(),
    state: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim(),
    city: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim(),
    zipCode: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim(),
    latitude: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    longitude: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")
}).required();


//HyperHub

const hyperHubDetails = Joi.object().keys({
    type: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").valid("Hypersrout", "UnAssigned", "All"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),

}).allow(null).required();

const insertNewHyperHubDetails = Joi.object().keys({
    type: Joi.string().required().empty('').valid('Add', 'Upload').invalid('null', 'undefined'),
    hubSerialNumber: Joi.array().required().items(Joi.string().required().empty('').trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/).trim()),
    hubName: Joi.array().required().items(Joi.string().required().empty('').trim().invalid('null', 'undefined', true, false, "true", "false")),
    hardwareVersion: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    gprsMacID: Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    wifiMacID: Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    wifiIPAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    latitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    longitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    simCardNumber: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    WifiAccessPointPassword: Joi.array().required().items(),
    GroupTransformerSerialNo: Joi.array().required().items()

}).required();

const updateHyperHubDetails = Joi.object().keys({
    hyperHubID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[0-9]+$/).trim(),
    hubSerialNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/).trim(),
    hubName: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").trim(),
    hardwareVersion: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    gprsMacID: Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false"),
    wifiMacID: Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false"),
    wifiIPAddress: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    latitude: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    longitude: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    simCardNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    WifiAccessPointPassword: Joi.string().required(),
    hhWifiPassFlag: Joi.string().empty('').valid('Y', 'N')


}).required();


const deleteHyperHubDetails = Joi.object().keys({
    HyperHubID: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false"))
}).required();
const uploadMeterConfig = Joi.object().keys({
    Type: Joi.string().required().trim().valid('Upload').invalid('null', 'undefined'),
    DeviceType: Joi.string().required().trim().valid('Meter').invalid('null', 'undefined'),
    SerialNumber: Joi.array().required().items(Joi.string().required().empty('').trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/)),
    RadioMode: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    ChannelWidth: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    Channel: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TransmitPower: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    RadioBand: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    StreamSelection: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    PrimaryMeshID: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[A-Za-z0-9]+[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*(?:\s?[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*[A-Za-z0-9]+)?$/)),
    PrimarySecurityType: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    PrimaryPreSharedKey: Joi.array().required().items(Joi.string().allow('').allow(null)),
    PrimaryMacAddress: Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    PrimarySerialNumber: Joi.array().required().items(Joi.string().required().empty('').trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/)),
    PrimaryDeviceType: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    SecondaryMacAddress: Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    SecondarySerialNumber: Joi.array().required().items(Joi.string().required().empty('').trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/)),
    SecondaryDeviceType: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    SecondaryMeshID: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    SecondarySecurityType: Joi.array().required().items(Joi.string().required()),
    SecondaryPreSharedKey: Joi.array().required().items(Joi.string().allow('').allow(null)),
    SSID: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined').regex(/^[A-Za-z0-9]+[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*(?:\s?[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*[A-Za-z0-9]+)?$/)),
    WirelessSecurity: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    Password: Joi.array().required().items(Joi.string().allow('').allow(null)),
    ESN: Joi.array().required().items(Joi.string().allow('').allow(null)),
    DHCPStatus: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    StartAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    EndAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    PrimaryDNS: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    SecondaryDNS: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    DefaultGateway: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    SubnetMask: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    BandwidthStatus: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    DownloadBandwidth: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[0-9]+$/)),
    UploadBandwidth: Joi.array().required().items(Joi.string().allow('').allow(null).regex(/^[0-9]+$/)),
    UtilityID: Joi.array().required().items(Joi.string().required()),
    CircuitID: Joi.array().required().items(Joi.string().required()),
    CircuitID: Joi.array().required().items(Joi.string().required()),
    CertificateNumber: Joi.array().required().items(Joi.string().required()),
    SystemName: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    Country: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TimeZone: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
}).required();
const uploadHyperSproutConfig = Joi.object().keys({
    Type: Joi.string().required().empty('').valid('Upload').invalid('null', 'undefined'),
    DeviceType: Joi.string().required().trim().valid('HyperSprout', 'HyperHub').invalid('null', 'undefined'),
    SerialNumber: Joi.array().required().items(Joi.string().required().empty('').trim().invalid('null', 'undefined', true, false, "true", "false").regex(/^[a-zA-Z0-9]+$/)),
    RadioMode2_4: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    ChannelWidth2_4: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    Channel2_4: Joi.array().required().items(Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)),
    TransmitPower2_4: Joi.array().required().items(Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)),
    GuardInterval2_4: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    StreamSelection2_4: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    RadioMode5_L: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    ChannelWidth5_L: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    Channel5_L: Joi.array().required().items(Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)),
    TransmitPower5_L: Joi.array().required().items(Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)),
    GuardInterval5_L: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    StreamSelection5_L: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    RadioMode5_H: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    ChannelWidth5_H: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    Channel5_H: Joi.array().required().items(Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)),
    TransmitPower5_H: Joi.array().required().items(Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)),
    GuardInterval5_H: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    StreamSelection5_H: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeshID2_4: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[A-Za-z0-9]+[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*(?:\s?[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*[A-Za-z0-9]+)?$/)),
    SecurityType2_4: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    PreSharedKey2_4: Joi.array().required().items(Joi.string().allow('').allow(null)),
    MeshID5_H: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").regex(/^[A-Za-z0-9]+[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*(?:\s?[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*[A-Za-z0-9]+)?$/)),
    SecurityType5_H: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    PreSharedKey5_H: Joi.array().required().items(Joi.string().allow('').allow(null)),
    HotspotStatus2_4_1: Joi.array().required().items(Joi.string().allow('').allow(null)),
    SSID2_4_1: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined').regex(/^[A-Za-z0-9]+[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*(?:\s?[A-Za-z0-9^!@#$%\^&*()_+={}|[\]\\;:?./]*[A-Za-z0-9]+)?$/)),
    WirelessSecurity2_4_1: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    Password2_4_1: Joi.array().required().items(Joi.string().allow('').allow(null)),
    HotspotStatus2_4_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    SSID2_4_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    WirelessSecurity2_4_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    Password2_4_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    HotspotStatus5_H_1: Joi.array().required().items(Joi.string().allow('').allow(null)),
    SSID5_H_1: Joi.array().required().items(Joi.string().allow('').allow(null)),
    WirelessSecurity5_H_1: Joi.array().required().items(Joi.string().allow('').allow(null)),
    Password5_H_1: Joi.array().required().items(Joi.string().allow('').allow(null)),
    HotspotStatus5_H_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    SSID5_H_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    Password5_H_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    DHCPStatus: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    StartAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    EndAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    PrimaryDNS: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    SecondaryDNS: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    DefaultGateway: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    SubnetMask: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    WirelessSecurity5_H_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    Password5_H_2: Joi.array().required().items(Joi.string().allow('').allow(null)),
    DHCPStatus: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    StartAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    CarrierName: Joi.array().required().items(Joi.string().allow('').allow(null)),
    EthernetStatus: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    EthernetIPAddress: Joi.array().required().items(Joi.string().allow('').allow(null)),
    EthernetPrimaryDNS: Joi.array().required().items(Joi.string().allow('').allow(null)),
    EthernetSecondaryDNS: Joi.array().required().items(Joi.string().allow('').allow(null)),
    EthernetDefaultGateway: Joi.array().required().items(Joi.string().allow('').allow(null)),
    EthernetSubnetMask: Joi.array().required().items(Joi.string().allow('').allow(null)),
    BandwidthStatus: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    DownloadBandwidth: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    UploadBandwidth: Joi.array().required().items(Joi.string().allow('').allow(null).regex(/^[0-9]+$/)),
    UserName: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    SystemName: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    Password: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    NetworkSelection: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    SimPin: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    PrimaryBackhaul: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    AutoSwitchOver: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    Country: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    TimeZone: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined'))

}).required();

//Transformer

const insertNewTransformerHypersproutDetails = Joi.object().keys({
    Type: Joi.string().required().empty('').valid('Add', 'Upload').invalid('null', 'undefined'),
    TFMRSerialNumber: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRName: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRMake: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRRatingCapacity: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRHighLineVoltage: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRLowLineVoltage: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRHighLineCurrent: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRLowLineCurrent: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    TFMRType: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HypersproutSerialNumber: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HypersproutVersion: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HypersproutMake: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSCTRatio: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSPTRatio: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSRatedVoltage: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    HSNumberOfPhases: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSRatedFrequency: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSAccuracy: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSDemandResetDate: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSCompliantToStandards: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSMaxDemandWindow: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSMaxDemandSlidingWindowInterval: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSSensorDetails: Joi.array().required().items(),
    HSGPRSMacID: Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    HSWiFiMacID: Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    HSWiFiIpAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSWiFiAccessPointPassword: Joi.array().required().items(),
    HSSimCardNumber: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HSLatitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    HSLongitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MaxOilTemp: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MinOilTemp: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    WireSize: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    CameraConnect: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    GroupCircuitID: Joi.array().required().items(),
    HSCoils: Joi.array().items(
        Joi.object().required().keys({
            _id: Joi.string().required(),
            coil_name: Joi.string().required(),
            manufacturer: Joi.string().required(),
            rating: Joi.string().required(),
            multiplier: Joi.number().required()
        }),
    ),
    otp: Joi.string().allow('',null)
}).required();

const updateTransformerHypersproutValues = Joi.object().keys({
    HypersproutID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TransformerID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRSerialNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRName: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRMake: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRRatingCapacity: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRHighLineVoltage: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRLowLineVoltage: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRHighLineCurrent: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRLowLineCurrent: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TFMRType: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HypersproutSerialNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HypersproutVersion: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HypersproutMake: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSCTRatio: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSPTRatio: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSRatedVoltage: Joi.string().required().empty('').invalid('null', 'undefined'),
    HSNumberOfPhases: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSRatedFrequency: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSAccuracy: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSDemandResetDate: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSCompliantToStandards: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSMaxDemandWindow: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSMaxDemandSlidingWindowInterval: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSSensorDetails: Joi.string().required(),
    HSGPRSMacID: Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false"),
    HSWiFiMacID: Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false"),
    HSWiFiIpAddress: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSWiFiAccessPointPassword: Joi.string().required(),
    HSSimCardNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HSLatitude: Joi.string().required().empty('').invalid('null', 'undefined'),
    HSLongitude: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MaxOilTemp: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MinOilTemp: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    WireSize: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    CameraConnect: Joi.string().required().empty('').invalid('null', 'undefined'),
    HSWifiPassFlag: Joi.string().empty('').valid('Y', 'N'),
    HSCoils: Joi.array().items(
        Joi.object().required().keys({
            _id: Joi.string().required(),
            coil_name: Joi.string().required(),
            manufacturer: Joi.string().required(),
            rating: Joi.string().required(),
            multiplier: Joi.number().required()
        }),
    ),
    otp: Joi.number().allow('',null)
}).required();

const deleteTransformerHypersproutValues = Joi.object().keys({
    TransformerID: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    HypersproutID: Joi.array().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false"))

}).required();

//Meter

const insertNewMeterDetails = Joi.object().keys({
    Type: Joi.string().required().empty('').valid('Add', 'Upload').invalid('null', 'undefined'),
    MeterSerialNumber: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterApptype: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterVersion: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterInstallationLocation: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterCTRatio: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterPTRatio: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterNumberOfPhases: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterRatedFrequency: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterRatedVoltage: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterNominalCurrent: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterMaximumCurrent: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterAccuracy: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterCompliantToStandards: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterWiFiIpAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    MeterAdminPassword: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterLatitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterLongitude: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterConsumerNumber: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterConsumerName: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterConsumerAddress: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterConsumerContactNumber: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterBillingCycleDate: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterBillingTime: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterDemandResetDate: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterMake: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterWiFiAccessPointPassword: Joi.array().required().items(),
    MeterDisconnector: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterConsumerCountry: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    MeterConsumerState: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    MeterConsumerCity: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    MeterConsumerZipCode: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    MeterWiFiMacID: Joi.array().required().items(Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false")),
    ImpulseCountKWh: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    ImpulseCountKVARh: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    SealID: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    BiDirectional: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    EVMeter: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    SolarPanel: Joi.array().required().items(Joi.string().required().empty('').invalid('null', 'undefined')),
    GroupTransformerSerialNo: Joi.array().required().items()
}).required();

const updateMeterValues = Joi.object().keys({
    MeterID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterSerialNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterApptype: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterVersion: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterInstallationLocation: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterCTRatio: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterPTRatio: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterNumberOfPhases: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterRatedFrequency: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterRatedVoltage: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterNominalCurrent: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterMaximumCurrent: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterAccuracy: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterCompliantToStandards: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterWiFiIpAddress: Joi.string().required().empty('').invalid('null', 'undefined'),
    MeterAdminPassword: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterLatitude: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterLongitude: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterConsumerNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterConsumerName: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterConsumerAddress: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterConsumerContactNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterBillingCycleDate: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterBillingTime: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterDemandResetDate: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterMake: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterWiFiAccessPointPassword: Joi.string().required(),
    MeterDisconnector: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterConsumerCountry: Joi.string().required().empty('').invalid('null', 'undefined'),
    MeterConsumerState: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterConsumerCity: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterConsumerZipCode: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterWiFiMacID: Joi.string().required().empty('').regex(/^(?!01|FF:FF:FF:FF:FF:FF)([0-9a-fA-F]{2}[:]){5}[0-9a-fA-F]{2}/i).invalid('null', 'undefined', true, false, "true", "false"),
    ImpulseCountKWh: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    ImpulseCountKVARh: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    SealID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    BiDirectional: Joi.string().required().empty('').invalid('null', 'undefined'),
    EVMeter: Joi.string().required().empty('').invalid('null', 'undefined'),
    SolarPanel: Joi.string().required().empty('').invalid('null', 'undefined'),
    MeterWiFiPassFlag: Joi.string().empty('').valid('Y', 'N')

}).required();

const SMMeters = Joi.object().keys({
    PartSerialNo: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)
}).required();

//Grouping - HyperHub
const TransformerDetails = Joi.object().keys({
    TransformerID: Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)

}).required();

const addHyperHubToTransformerValues = Joi.object().keys({
    TransformerID: Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HyperHubID: Joi.array().required().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
}).required();

const removeHyperHubFromTransformerValues = Joi.object().keys({
    TransformerID: Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    HyperHubID: Joi.array().required().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
}).required();

// Grouping - Meter
const addMeterToTransformerValues = Joi.object().keys({
    TransformerID: Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterID: Joi.array().required().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
}).required();

const removeMeterFromTransformerValues = Joi.object().keys({
    TransformerID: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    MeterID: Joi.array().required().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
    isForceGrouping: Joi.boolean().required().invalid('null', 'undefined', "true", "false")

}).required();

// Grouping - Transformer
const addTransformerToCircuitValues = Joi.object().keys({
    CircuitID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TransformerID: Joi.array().required().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
}).required();


const removeTransformerFromCircuitValues = Joi.object().keys({
    CircuitID: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    TransformerID: Joi.array().required().items(Joi.number().positive().required().empty('').invalid('null', 'undefined', true, false, "true", "false")),
}).required();

const SMHyperSprout = Joi.object().keys({
    PartSerialNo: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Type: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    page: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false),
    limit: Joi.number().required().positive().empty('').invalid('null', 'undefined', 'true', 'false', true, false)

}).required();

const SMNodePing = Joi.object().keys({
    SerialNumber: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Type: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false")

}).required();

const jobList = Joi.object().keys({
    StartTime: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    EndTime: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
    Type: Joi.string().required().empty('').invalid('null', 'undefined', true, false, "true", "false").valid("HyperSprout", "Meter", "All")

}).required();

const SMMeterNodePing = Joi.object().keys({
    meterID: Joi.number().required().empty('').invalid('null', 'undefined', true, false, "true", "false"),
}).required();

module.exports = {
    insertNewCircuitDetails: insertNewCircuitDetails,
    updateCircuitDetails: updateCircuitDetails,
    hyperHubDetails: hyperHubDetails,
    insertNewHyperHubDetails: insertNewHyperHubDetails,
    updateHyperHubDetails: updateHyperHubDetails,
    deleteHyperHubDetails: deleteHyperHubDetails,
    insertNewTransformerHypersproutDetails: insertNewTransformerHypersproutDetails,
    updateTransformerHypersproutValues: updateTransformerHypersproutValues,
    deleteTransformerHypersproutValues: deleteTransformerHypersproutValues,
    insertNewMeterDetails: insertNewMeterDetails,
    updateMeterValues: updateMeterValues,
    SMMeters: SMMeters,
    TransformerDetails: TransformerDetails,
    addHyperHubToTransformerValues: addHyperHubToTransformerValues,
    removeHyperHubFromTransformerValues: removeHyperHubFromTransformerValues,
    addMeterToTransformerValues: addMeterToTransformerValues,
    removeMeterFromTransformerValues: removeMeterFromTransformerValues,
    addTransformerToCircuitValues: addTransformerToCircuitValues,
    removeTransformerFromCircuitValues: removeTransformerFromCircuitValues,
    SMHyperSprout: SMHyperSprout,
    SMNodePing: SMNodePing,
    jobList: jobList,
    SMMeterNodePing: SMMeterNodePing,
    uploadHyperSproutConfig: uploadHyperSproutConfig,
    uploadMeterConfig: uploadMeterConfig

}