// require("dotenv").config();
var argport = null;
try {
    argport = process.argv.slice(2);
    argport = argport[0];
} catch (err) {
    console.log(err);
}

require('./routes/HyperSproutManagement/HSCoilUpdate');
require("./config/Helpers/mqtt");

/* **************** SECTION-I : REQUIRED FILES AND PACKAGES ***************** */
var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cors = require('cors');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var sessioncheck = require('./routes/sessionCheck.js');
var permissioncheckMiddleware  = require('./routes/permissionChange.js')

/* **************** SECTION-II : PORT INITIALIZATION ************************* */

var port = process.env.PORT || 9999;
port = argport ? argport : port;


/* **************** SECTION-III : APP COMMUNICATION CONFIGURATION. ************** */
var app = express();
// app.options("*", function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Cache-Control, Origin, X-Requested-With, Content-Type, Accept, Authorization, Pragma, Expires');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.status(200).end();
// });
//app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '40mb' }));
app.use(bodyParser.json({ limit: '40mb' }));
// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', req.get('origin') || '*');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Length, X-Requested-With,content-type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });

app.use(cors({
    credentials: true,
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
}));

var mongoUser = process.env.mongoUser;
var mongoUserPass = process.env.mongoUserPass;
var mongoHost = process.env.mongoHost;
var mongoDB = process.env.mongoDB;
var connectTimeoutMS = process.env.connectTimeoutMS
var authSource = process.env.authSource

var sess = {
    secret: '2C44-4D44-WppQ38S',
    cookie: { httpOnly: false },
    store: new MongoStore({
        url: "mongodb://" + mongoUser + ":" + mongoUserPass + "@" + mongoHost + "/" + mongoDB + "?authSource="+authSource+"&connectTimeoutMS="+connectTimeoutMS,
        ttl: 15 * 60
    }),
    saveUninitialized: true,
    resave: true,
    maxAge: 900000 //15 Minutes
}
app.use(session(sess))


// app.use(session({
//     secret: '2C44-4D44-WppQ38S',
//     cookie: { httpOnly: false },
//     store: new MongoStore({
//         //url: "mongodb://" + mongoUser + ":" + mongoUserPass + "@" + mongoHost + "/" + mongoDB + "?authSource=admin&connectTimeoutMS=300000",
//         url:"mongodb://localhost:27017/DELTA",
//         ttl: 15 * 60
//     }),
//     saveUninitialized: true,
//     resave: true,
//     maxAge: 900000 //15 Minutes
// }));

app.use(function (req, res, next) {
    var arrSkipURLS = ['/login','/UpdatedPasswordSettings','/ChangePassword','/EndpointResponse',
        '/DownloadConfigurationResponse', '/ListDevicesOnReadTime',
        '/DeviceStatus', '/SchedulerLog', '/SchedulerLogUpdate',
        '/InvalidPacketIntimation', '/RemovingMeterFromTransformerResponse',
        '/MeterKwHResponse', '/SchedulerLogUpdate', '/SMMeterNodePingStatus',
        '/EditTransformerHypersproutWifiChangeResponse', '/EndpointRegistration',
        '/MeterKwH', '/MeterKwHDetails', '/MeterConnectDisconnect',
        '/RemovingTransformerFromCircuitResponse',
        '/MeterConnectDisconnectResponse',
        '/MeterConnectDisconnectDetails', '/MeterBillingUploadDisplay',
        '/MeterBillingUploadData', '/EditMeterWifiChangeResponse',
        '/DBStatistics', '/NetworkStatisticsMeter', '/CloudStats',
        '/DBStatistics', '/Outagereport', '/DataQualityReturns',
        '/SolarPanelReturn', '/DelayResponseReport', '/DeviceErrorReport',
        '/BatteryLifeReport', '/DeleteMeterBilling', '/UniqueFileNameandTimeStamp',
        '/ViewBillingData', '/NonTechnicalLossReport', '/FirmwareMgmtResponse',
        '/FirmwareMgmtMeshResponse', '/MacACLDV', '/MacACLHS', '/MacACLALL',
        '/ResetPassword', '/ClearLogsStatus', '/VerbosityLogsStatus', '/FetchDeviceLogStatus', '/UploadLogFile', '/LockUnlockDeviceStatus',
        '/RebootDeviceStatus', '/EditDeltalinkBandwidthChangeResponse','/BandwidthLimitationsResponse', '/FirmwareMgmtDeltalinkResponse', '/FactoryResetResponse',
        '/ConfigMgmtStatus', '/RemovingDeltalinkFromMeterResponse', '/MobileAppLogin', '/SignUp', '/VerifyOtp', '/ResendOTP', '/ForgetPassword', '/UpdatePassword', '/UpdateConsumer', '/ConsumerDetails', '/livedata', '/liveconnection', '/SMDeltalinkNodePingStatus', '/HSDetails', '/PowerUsage','/Dashboard',
        '/CarrierListRep','/MeshResp','/DataUsage','/DhcpParam','/DeltaLinkStatus','/NotificationLists','/getCircuitDetails','/getTransformersByDTCID','/getTransformerPhaseDetailsByTransformerID', '/getDeltalinkDetails', "/getMeterByTransformerID", "/DataRate", "/DataRateResponse", "/DataRateReport",
        '/MeshMacAclAddition', '/DataUsageByClients','/DataUsageByClientsv2','/GetDHCP','/TokenUpdate'];
    var arrSkipURLS2 = ['/UpdateConsumer', '/ConsumerDetails'];

    if (arrSkipURLS.includes(req.originalUrl.split("?").shift()) || req.originalUrl.split("?").shift() == '/logout' || req.originalUrl.split("?").shift() == '/MobileLogout') {
        if ((!req.session.user && (req.originalUrl.split("?").shift()) == '/MobileAppLogin') || (req.originalUrl.split("?").shift()) == '/MobileAppLogin') {
            req.sessionStore.ttl = 30 * 24 * 60 * 60;
            req.sessionStore.options.ttl = 30 * 24 * 60 * 60;
            sess.maxAge = 30 * 24 * 60 * 60 * 1000;
        }
        else if ((!req.session.user && (req.originalUrl.split("?").shift()) == '/login') || (req.originalUrl.split("?").shift()) == '/login') {
            req.sessionStore.ttl = 15 * 60;
            req.sessionStore.options.ttl = 15 * 60;
            sess.maxAge = 900000;
        }
        next();
    }
    // else if (!req.session.user && (arrSkipURLS2.includes(req.originalUrl.split("?").shift()))) {
    //     res.json({
    //         "data": {},
    //         "response": {
    //             "message": "Login First",
    //             "status": false,
    //             "responseCode": "401"
    //         }
    //     });
  //  }  
      else if (!req.session.user && (!arrSkipURLS.includes(req.originalUrl.split("?").shift()))) {
        res.json({
            "type": false,
            "Message": "Login First"
        });
    }
    else {
        if (req.session.user.UserType == "Consumer") {
            req.sessionStore.ttl = 30 * 24 * 60 * 60;
            req.sessionStore.options.ttl = 30 * 24 * 60 * 60;
            sess.maxAge = 30 * 24 * 60 * 60 * 1000;
            if (arrSkipURLS.indexOf(req.originalUrl.split("?").shift()) !== -1) {
                next();
            } else {
                if (req.sessionID) {
                    // if (!arrSkipURLS2.includes(req.originalUrl.split("?").shift())) {
                    //     res.json({                       
                    //         "type": false,
                    //         "Message": "Login First"
                    //     });
                    // } else {
                        sessioncheck.findUser(req.sessionID, function (err, session) {
                            if (err) {
                                req.session.destroy(function (err, success) {
                                    res.json({
                                        "data":{},
                                        "response": {
                                            "message": "Login First",
                                            "status": false,
                                            "responseCode": "401"
                                        }
                                    });
                                });
                            } else
                                next();
                        });
                   // }

                } else {
                    next();
                }
            }
        } else {
            if (arrSkipURLS.indexOf(req.originalUrl.split("?").shift()) !== -1) {
                next();
            } else {
                if (req.sessionID) {
                    // if (arrSkipURLS2.includes(req.originalUrl.split("?").shift())) {
                    //     res.json({
                    //         "data": {},
                    //         "response": {
                    //             "message": "Login First",
                    //             "status": false,
                    //             "responseCode": "401"
                    //         }
                    //     });
                    // } else {
                    sessioncheck.findUser(req.sessionID, function (err, session) {
                        if (err) {
                            req.session.destroy(function (err, success) {
                                res.json({
                                    "type": false,
                                    "Message": "Login First"
                                });
                            });
                        } else
                            next();
                    });
                    // }

                } else {
                    next();
                }
            }
        }
    }


    //previous implementation

    // if (arrSkipURLS.indexOf(req.originalUrl.split("?").shift()) !== -1) {
    //     next();
    // } else {
    //     if (req.sessionID) {
    //         sessioncheck.findUser(req.sessionID, function (err, session) {
    //             if (err) {
    //                 dbCon.getDb(function (err, db) {
    //                     dbase.close(function (err, result) {
    //                         //console.log('connection closed after expiry',result);
    //                     });
    //                 });
    //                 req.session.destroy(function (err, success) {
    //                     res.json({
    //                         "type": false,
    //                         "Message": "Login First"
    //                     });
    //                 });
    //             } else
    //                 next();
    //         });
    //     } else {
    //         next();
    //     }
    // }


});

/* ***************** SECTION-IV : ROUTE REQUIRES ************************** */

/*  ***********  Start : DataVINE Webservices  ************  */

// User Authentication
var Login = require('./routes/login.js');
var Logout = require('./routes/logout.js');
var UserDetails = require('./routes/UserDetails.js');

//New Account Report
var NewAccountReport = require('./routes/Reports/NewAccountReport.js');

//Solar Panel
var SolarPanelReturn = require('./routes/SolarPanel/SolarPanelReturn.js');

//Data Quality Report
var DataQualityReturns = require('./routes/DataQualityReport/DataQualityReturns.js');

//Outage Map
var Outagereport = require('./routes/OutageMap/Outagereport.js');

//Delay Response Report
var DelayResponseReport = require('./routes/DelayResponseReport/DelayResponseReport.js');

//Device Error Report
var DeviceErrorReport = require('./routes/DeviceErrorReport/DeviceErrorReport.js');

//Battery Life Cycle
var BatteryLifeReport = require('./routes/BatteryLife/BatteryLifeReport.js');

//non Technical Loss
var NonTechnicalLossReport = require('./routes/NonTechnicalLossReport/NonTechnicalLossReport.js');

//Network Statistics Meter
var NetworkStatisticsMeter = require('./routes/NetworkStatisticsMeter/NetworkStatisticsMeter.js');

//HyperSprout Management
var AppGroupDownload = require('./routes/HyperSproutManagement/AppGroupDownload.js');
var ConfigPrograms = require('./routes/HyperSproutManagement/ConfigPrograms.js');
var ConfigProgramsEdit = require('./routes/HyperSproutManagement/ConfigProgramsEdit.js');
var ConfUploadConfigProgram = require('./routes/HyperSproutManagement/ConfUploadConfigProgram.js');
var ConfigProgramsDelete = require('./routes/HyperSproutManagement/ConfigProgramsDelete.js');
var HSMConf = require('./routes/HyperSproutManagement/HSMConf.js');
var HSGroupDelete = require('./routes/HyperSproutManagement/HSGroupDelete.js');
var ConfNewConfSave = require('./routes/HyperSproutManagement/ConfNewConfSave.js');
var HSMConfImportConfSave = require('./routes/HyperSproutManagement/HSMConfImportConfSave.js');
var HSMConfEdit = require('./routes/HyperSproutManagement/HSMConfEdit.js');
var HSMConfEditSave = require('./routes/HyperSproutManagement/HSMConfEditSave.js');
var HSMDownDownloadConfSave = require('./routes/HyperSproutManagement/HSMDownDownloadConfSave.js');
var DownloadConfigurationResponse = require('./routes/HyperSproutManagement/DownloadConfigurationResponse.js');
var HSMTagDiscrepancies = require('./routes/HyperSproutManagement/HSMTagDiscrepancies.js');
var HSMGrpMgmt = require('./routes/HyperSproutManagement/HSMGrpMgmt.js');
var HSMGrpMgmtAssignGrpMembershipCreateAppGrp = require('./routes/HyperSproutManagement/HSMGrpMgmtAssignGrpMembershipCreateAppGrp.js');
var HSMGrpMgmtAssignGrpMembershipAssignEndpoint = require('./routes/HyperSproutManagement/HSMGrpMgmtAssignGrpMembershipAssignEndpoint.js');
var HSMSecurityCodeMgmt = require('./routes/HyperSproutManagement/HSMSecurityCodeMgmt.js');
var HSMSecurityAssignDeviceSecCodeSave = require('./routes/HyperSproutManagement/HSMSecurityAssignDeviceSecCodeSave.js');
var HSMSecuritySave = require('./routes/HyperSproutManagement/HSMSecuritySave.js');
var JobsList = require('./routes/HyperSproutManagement/JobsList.js');
var ListCoils = require('./routes/HyperSproutManagement/ListCoils.js');
var ListDownloadJobs = require('./routes/HyperSproutManagement/ListDownloadJobs.js');
var ListDevicesAttached = require('./routes/HyperSproutManagement/ListDevicesAttached.js');
var HsmGroupDownload = require('./routes/HyperSproutManagement/HsmGroupDownload.js');


// Meter Management
var MMConf = require('./routes/MeterManagement/MMConf.js');
var MMConfImportConfSave = require('./routes/MeterManagement/MMConfImportConfSave.js');
var MMDownDownloadConfSave = require('./routes/MeterManagement/MMDownDownloadConfSave.js');
var MMTagDiscrepancies = require('./routes/MeterManagement/MMTagDiscrepancies.js');
var MMGrpMgmt = require('./routes/MeterManagement/MMGrpMgmt.js');
var MMGrpMgmtAssignGrpMembershipAssignEndpoint = require('./routes/MeterManagement/MMGrpMgmtAssignGrpMembershipAssignEndpoint.js');
var MMSecurityCodeMgmt = require('./routes/MeterManagement/MMSecurityCodeMgmt.js');
var MMSecurityAssignDeviceSecCodeSave = require('./routes/MeterManagement/MMSecurityAssignDeviceSecCodeSave.js');
var MMSecuritySave = require('./routes/MeterManagement/MMSecuritySave.js');
var MMGroupDownload = require('./routes/MeterManagement/MMGroupDownload.js');

//System Management
var SMHyperSprout = require('./routes/SystemManagement/SMHyperSprout.js');
var SMMeters = require('./routes/SystemManagement/SMMeters.js');
var SMNodePing = require('./routes/SystemManagement/SMNodePing.js');
var SMMeterNodePing = require('./routes/SystemManagement/SMMeterNodePing.js');
var SMMeterNodePingStatus = require('./routes/SystemManagement/SMMeterNodePingStatus.js');
//var SMEndpointCleanup = require('./routes/SystemManagement/SMEndpointCleanup.js');
//var SMEndpointCleanupDeregisterSave = require('./routes/SystemManagement/SMEndpointCleanupDeregisterSave.js');
var NetworkStatisticsHS = require('./routes/SystemManagement/NetworkStatisticsHS.js');
var LockUnlockDevice = require('./routes/SystemManagement/LockUnlockDevice.js');
var LockUnlockDeviceStatus = require('./routes/SystemManagement/LockUnlockDeviceStatus.js');
var remoteRebootDevice = require('./routes/SystemManagement/remoteRebootDevice.js');
var RebootDeviceStatus = require('./routes/SystemManagement/RebootDeviceStatus.js');
var DeviceFactoryReset = require('./routes/SystemManagement/DeviceFactoryReset.js');
var FactoryResetResponse = require('./routes/SystemManagement/FactoryResetResponse.js');
var ConfigMgmtStatus = require('./routes/SystemManagement/ConfigMgmtStatus.js');
var fetchSystemInformation = require('./routes/SystemManagement/fetchSystemInformation.js');
var BackHaulConfigurations = require('./routes/SystemManagement/BackHaulConfigurations.js');
var FrontHaulConfigurations = require('./routes/SystemManagement/FrontHaulConfigurations.js');
var MeterConfigurations = require('./routes/SystemManagement/MeterConfigurations.js');
var SystemSettingsConfigurations = require('./routes/SystemManagement/SystemSettingsConfigurations.js');
var CloudConnectivity = require('./routes/SystemManagement/CloudConnectivity.js');
var fetchCountryDefaults = require('./routes/SystemManagement/fetchCountryDefaults.js');
var ScanAvailableMeshProfiles = require('./routes/SystemManagement/ScanAvailableMeshProfiles.js');
var AlarmsEvents = require('./routes/SystemManagement/AlarmsEvents.js');
var carrierList = require('./routes/SystemManagement/carrierList.js');
var CarrierListRep = require('./routes/SystemManagement/CarrierListRep.js');
var MeshResp = require('./routes/SystemManagement/MeshResp.js');
var ConfigUploadMeters = require('./routes/SystemManagement/ConfigUploadMeters.js');
var ConfigUploadHyperSprout = require('./routes/SystemManagement/ConfigUploadHyperSprout.js');

//Tools
var UserSettings = require('./routes/Tools/UserSettings.js');
var UpdateUserSettings = require('./routes/Tools/UpdateUserSettings.js');
var ChangePassword = require('./routes/Tools/ChangePassword.js');

//Administration

//Administration -> Security
var AddSecurityGroups = require('./routes/Administration/Security/AddSecurityGroups.js');
var DeleteSecurityGroups = require('./routes/Administration/Security/DeleteSecurityGroups.js');
var EditSecurityGroups = require('./routes/Administration/Security/EditSecurityGroups.js');
var GetSecurityGroups = require('./routes/Administration/Security/GetSecurityGroups.js');
var ReturnSecurityGroups = require('./routes/Administration/Security/ReturnSecurityGroups.js');
var ListSecurityID = require('./routes/Administration/Security/ListSecurityID.js');
var RestoreDefaultPasswordSettings = require('./routes/Administration/Security/RestoreDefaultPasswordSettings.js');
var UpdatedPasswordSettings = require('./routes/Administration/Security/UpdatedPasswordSettings.js');
var SavePasswordSettings = require('./routes/Administration/Security/SavePasswordSettings.js');
//Administration -> SystemSettings
var RestoreDefaultSettings = require('./routes/Administration/SystemSettings/RestoreDefaultSettings.js');
var UpdatedSystemSettings = require('./routes/Administration/SystemSettings/UpdatedSystemSettings.js');
var SaveSystemSettings = require('./routes/Administration/SystemSettings/SaveSystemSettings.js');
//Administration -> Users
var ListUserID = require('./routes/Administration/Users/ListUserID.js');
var AddUser = require('./routes/Administration/Users/AddUser.js');
var GetUsers = require('./routes/Administration/Users/GetUsers.js');
var EditUser = require('./routes/Administration/Users/EditUser.js');
var ResetPassword = require('./routes/Administration/Users/ResetPassword.js');
var DeleteUser = require('./routes/Administration/Users/DeleteUser.js');

//Messaging CRUD
var AddMessage =  require('./routes/messageCRUD/AddMessage.js');
var GetMessages = require('./routes/messageCRUD/GetMessages.js');
var EditMessageStatus = require('./routes/messageCRUD/EditMessageStatus.js');
var DeleteMessage = require('./routes/messageCRUD/DeleteMessage.js');
var GetMessageById = require('./routes/messageCRUD/GetMessageDetailsById.js');
var GetMessageCount = require('./routes/messageCRUD/GetMessagesCount.js');
//Reports
var DeviceFirmwareVersionReport = require('./routes/Reports/DeviceFirmwareVersionReport.js');
var CommunicationsStatisticsReport = require('./routes/Reports/CommunicationsStatisticsReport.js');
var MeterCommunicationsStatisticsReport = require('./routes/Reports/MeterCommunicationsStatisticsReport.js');
var SystemAuditLogReport = require('./routes/Reports/SystemAuditLogReport.js');
var SystemLogReport = require('./routes/Reports/SystemLogReport.js');

//TransctionalDataScheduler
var ListDevicesOnReadTime = require('./routes/TransctionalDataScheduler/ListDevicesOnReadTime.js');
var DeviceStatus = require('./routes/TransctionalDataScheduler/DeviceStatus.js');
var SchedulerLog = require('./routes/TransctionalDataScheduler/SchedulerLog.js');
var SchedulerLogUpdate = require('./routes/TransctionalDataScheduler/SchedulerLogUpdate.js');

//Invalid Packet Intimation Functionality- CRC not matching
var InvalidPacketIntimation = require('./routes/InvalidPacketIntimation.js');

/*  ***********  End : DataVINE Webservices  ************  */

/*  ***********  Start : DataSCAPE Webservices  ************  */

//Endpoint Registration - IOT Communication
var EndpointRegistration = require('./routes/Registration/EndpointRegistration.js');

//Endpoints Web Services
var DeleteEndpointDetails = require('./routes/Registration/Endpoint/DeleteEndpointDetails.js');
var DisplayAllEndpointDetails = require('./routes/Registration/Endpoint/DisplayAllEndpointDetails.js');
var EditEndpointDetails = require('./routes/Registration/Endpoint/EditEndpointDetails.js');
var NewEndpointEntry = require('./routes/Registration/Endpoint/NewEndpointEntry.js');
var EndpointResponse = require('./routes/Registration/Endpoint/EndpointResponse.js');
var MeshMacAclAddition = require('./routes/Registration/Endpoint/MeshMacAclAddition');

//Device Registration - NewCircuitEntry Webservice,created on 1st Sep 2016
var NewCircuitEntry = require('./routes/Registration/NewCircuitEntry.js');
//Device Registration - DisplayAllCircuitDetails Webservice, created on 6th Sep 2016
var DisplayAllCircuitDetails = require('./routes/Registration/DisplayAllCircuitDetails.js');
//Device Registration - NewMeterEntry Webservice, created on 7th Sep 2016
var NewMeterEntry = require('./routes/Registration/NewMeterEntry.js');
//Device Registration - EditMeterDetails Webservice, created on 7th Sep 2016
var EditMeterDetails = require('./routes/Registration/EditMeterDetails.js');
var EditMeterWifiChangeResponse = require('./routes/Registration/EditMeterWifiChangeResponse.js');
//Device Registration - NewMeterEntry Webservice, created on 8th Sep 2016
var NewTransformerHypersproutEntry = require('./routes/Registration/NewTransformerHypersproutEntry.js');
//Device Registration - DisplayAllTransformerDetails Webservice, created on 8th Sep 2016
var DisplayAllTransformerDetails = require('./routes/Registration/DisplayAllTransformerDetails.js');
//Device Registration - EditCircuitDetails Webservice, created on 8th Sep 2016
var EditCircuitDetails = require('./routes/Registration/EditCircuitDetails.js');
//Device Registration - EditTransformerHypersproutDetails Webservice, created on 10th Sep 2016
var EditTransformerHypersproutDetails = require('./routes/Registration/EditTransformerHypersproutDetails.js');
var EditTransformerHypersproutWifiChangeResponse = require('./routes/Registration/EditTransformerHypersproutWifiChangeResponse.js');
//Device Registration - DeleteCircuitDetails Webservice, created on 10th Sep 2016
var DeleteCircuitDetails = require('./routes/Registration/DeleteCircuitDetails.js');
//Device Registration - DeleteMeterDetails Webservice, created on 10th Sep 2016
var DeleteMeterDetails = require('./routes/Registration/DeleteMeterDetails.js');
//Device Registration - DeleteTransformerHypersproutDetails Webservice, created on 10th Sep 2016
var DeleteTransformerHypersproutDetails = require('./routes/Registration/DeleteTransformerHypersproutDetails.js');
//Device Registration - AddingTransformerToCircuit Webservice, created on 14th Sep 2016
var AddingTransformerToCircuit = require('./routes/Registration/AddingTransformerToCircuit.js');
//Device Registration - AddingMeterToTransformer Webservice, created on 14th Sep 2016
var AddingMeterToTransformer = require('./routes/Registration/AddingMeterToTransformer.js');
//Device Registration - RemovingTransformerFromCircuit Webservice, created on 14th Sep 2016
var RemovingTransformerFromCircuit = require('./routes/Registration/RemovingTransformerFromCircuit.js');
var RemovingTransformerFromCircuitResponse = require('./routes/Registration/RemovingTransformerFromCircuitResponse.js');
//Device Registration - RemovingMeterFromTransformer Webservice, created on 14th Sep 2016
var RemovingMeterFromTransformer = require('./routes/Registration/RemovingMeterFromTransformer.js');
var RemovingMeterFromTransformerResponse = require('./routes/Registration/RemovingMeterFromTransformerResponse.js');
//On Demand - MeterConnectDisconnect Webservice, created on 27th Sep 2016
var MeterConnectDisconnect = require('./routes/OnDemand/MeterConnectDisconnect.js');
//On Demand - MeterConnectDisconnectResponse Webservice, created on 27th Sep 2016
var MeterConnectDisconnectResponse = require('./routes/OnDemand/MeterConnectDisconnectResponse.js');
//On Demand - MeterConnectDisconnectDetails Webservice, created on 27th Sep 2016
var MeterConnectDisconnectDetails = require('./routes/OnDemand/MeterConnectDisconnectDetails.js');
//On Demand - MeterKwH Webservice, created on 5th Nov 2016
var MeterKwH = require('./routes/OnDemand/MeterKwH.js');
//On Demand - MeterKwHDetails Webservice, created on 5th Nov 2016
var MeterKwHDetails = require('./routes/OnDemand/MeterKwHDetails.js');
//On Demand - OnDemandLogUpdate Webservice, created on 30th Dec 2016
//var OnDemandLogUpdate = require('./routes/OnDemand/OnDemandLogUpdate.js');
//MeterBilling - MeterBillingUploadDisplay Webservice, created on 15th Nov 2016
var MeterBillingUploadData = require('./routes/MeterBilling/MeterBillingUploadData.js');
//MeterBilling - MeterBillingUploadDisplay Webservice, created on 15th Nov 2016
var MeterBillingUploadDisplay = require('./routes/MeterBilling/MeterBillingUploadDisplay.js');
//Meter Billing get unique Names webservice, created 19th May 2017
var UniqueFileNameandTimeStamp = require('./routes/MeterBilling/UniqueFileNameandTimeStamp.js');
var DeleteMeterBilling = require('./routes/MeterBilling/DeleteMeterBilling.js');
var ViewBillingData = require('./routes/MeterBilling/ViewBillingData.js');
var MeterKwHResponse = require('./routes/OnDemand/MeterKwHResponse');
// Hyper Hub Implementation 
var NewHyperHubEntry = require('./routes/Registration/NewHyperHubEntry');
var EditHyperHubDetails = require('./routes/Registration/EditHyperHubDetails');
var DeleteHyperHubDetails = require('./routes/Registration/DeleteHyperHubDetails');
var DisplayAllHyperHubDetails = require('./routes/Registration/DisplayAllHyperHubDetails');
var GetAllHyperHubAttachedToTransformer = require('./routes/Registration/GetAllHyperHubAttachedToTransformer');
var AddingHyperHubToTransformer = require('./routes/Registration/AddingHyperHubToTransformer');
var RemovingHyperHubFromTransformer = require('./routes/Registration/RemovingHyperHubFromTransformer');
/*  ***********  End : DataSCAPE Webservices  ************  */

/*  ***********  Start : Cloud & Database Statistics Webservices  ************  */
var CloudStats = require('./routes/CloudStatistics/CloudStats.js');
var DBStatistics = require('./routes/DatabaseStatistics/DBStatistics')
/*  ***********  End : CloudStatistics Webservices  ************  */

/*  ***********  Start : Firmware Management, created on 21st Dec 2016  ************  */
var FirmwareMgmtFirmGroup = require('./routes/FirmwareManagement/FirmwareMgmtFirmGroup.js');
var FirmwareMgmtFirmGroupSubmit = require('./routes/FirmwareManagement/FirmwareMgmtFirmGroupSubmit.js');
var FirmwareMgmtJobStatus = require('./routes/FirmwareManagement/FirmwareMgmtJobStatus.js');
var FirmwareMgmtUpload = require('./routes/FirmwareManagement/FirmwareMgmtUpload.js');
var FirmwareMgmtResponse = require('./routes/FirmwareManagement/FirmwareMgmtResponse');
var FirmwareMgmtMeshResponse = require('./routes/FirmwareManagement/FirmwareMgmtMeshResponse');
var ResendFirmwareMgmntJob = require('./routes/FirmwareManagement/ResendFirmwareMgmntJob');
var FirmwareGroupLists = require('./routes/FirmwareManagement/FirmwareGroupLists');

var dbCon = require('./data/dbConnection.js');

/*  ***********  End : Firmware Management  ************  */

/*  ***********  Start : MacACL Management ************  */
var MacACLDV = require('./routes/MacACLManagement/MacACLDV.js');
var MacACLHS = require('./routes/MacACLManagement/MacACLHS.js');
var MacACLALL = require('./routes/MacACLManagement/MacACLALL.js');
/*  ***********  End : MacACL Management  ************  */

/*  ***********  Start : Device Logs ************  */
var DeviceLogsList = require('./routes/DeviceLogs/DeviceLogsList.js');
var ClearLogs = require('./routes/DeviceLogs/ClearLogs.js');
var VerbosityDetails = require('./routes/DeviceLogs/VerbosityDetails.js')
var VerbosityLogs = require('./routes/DeviceLogs/VerbosityLogs.js');
var DeleteDeviceLogsDetails = require('./routes/DeviceLogs/DeleteDeviceLogsDetails.js');
var FetchDeviceLog = require('./routes/DeviceLogs/FetchDeviceLog.js')
var UploadLogFile = require('./routes/DeviceLogs/UploadLogFile.js')
var ClearLogsStatus = require('./routes/DeviceLogs/ClearLogsStatus.js')
var VerbosityLogsStatus = require('./routes/DeviceLogs/VerbosityLogsStatus.js')
var FetchDeviceLogStatus = require('./routes/DeviceLogs/FetchDeviceLogStatus.js')

//Bulk Read/Connection/Disconnection operations
var ListOfJobBulkOperations = require('./routes/BulkOperations/ListOfJobBulkOperations');
var UploadMeterData = require('./routes/BulkOperations/UploadMeterData');
var ListOfBulkOperationsByDate = require('./routes/BulkOperations/ListOfBulkOperationsByDate');
var ListAllBulkOperations = require('./routes/BulkOperations/ListAllBulkOperations'); //CEG20-2765


/*  **********    End: Device Logs ************* */

/*  ***********  Start : Deltalink ************  */
var NewDeltalinkEntry = require('./routes/Registration/NewDeltalinkEntry.js');
var EditDeltalinkDetails = require('./routes/Registration/EditDeltalinkDetails.js');
var EditDeltalinkBandwidthChangeResponse = require('./routes/Registration/EditDeltalinkBandwidthChangeResponse.js');
var DisplayAllDeltalinkDetails = require('./routes/Registration/DisplayAllDeltalinkDetails.js');
var ExportAllDeviceDetails = require('./routes/Registration/ExportAllDeviceDetails.js');
var DeleteDeltalinkDetails = require('./routes/Registration/DeleteDeltalinkDetails.js');
var SMDeltalinkNodePing = require('./routes/SystemManagement/SMDeltalinkNodePing.js');
var AddingDeltalinkToMeter = require('./routes/Registration/AddingDeltalinkToMeter.js');
var RemovingDeltalinkFromMeter = require('./routes/Registration/RemovingDeltalinkFromMeter.js');
var SMDeltalinkNodePingStatus = require('./routes/SystemManagement/SMDeltalinkNodePingStatus.js');
var RemovingDeltalinkFromMeterResponse = require('./routes/Registration/RemovingDeltalinkFromMeterResponse.js');

// DeltalinkManagement

var DLMGrpMgmtAssignGrpMembershipCreateAppGrp = require('./routes/DeltalinkManagement/DLMGrpMgmtAssignGrpMembershipCreateAppGrp.js');
var DLMGrpMgmt = require('./routes/DeltalinkManagement/DLMGrpMgmt.js');
var DLMGrpMgmtAssignGrpMembershipAssignEndpoint = require('./routes/DeltalinkManagement/DLMGrpMgmtAssignGrpMembershipAssignEndpoint.js');
var DeltalinkFirmwareMgmtJobStatus = require('./routes/FirmwareManagement/DeltalinkFirmwareMgmtJobStatus.js');
var DeltalinkJobList = require('./routes/DeltalinkManagement/DeltalinkJobList.js');
var FirmwareMgmtDeltalinkResponse = require('./routes/FirmwareManagement/FirmwareMgmtDeltalinkResponse.js');


/*  ***********  Start : TechnicalItemsOfTransformer ************  */
var NewTransformerTechItemsEntry = require('./routes/TransaformerTechnicalItems/NewTechnicalItemEntry.js');
var DisplayAllTechnicalItems = require('./routes/TransaformerTechnicalItems/DisplayAllTechnicalItem.js');
var EditTransformerTechItemsEntry = require('./routes/TransaformerTechnicalItems/EditTechnicalItemsEntry.js');
var DeleteTransformerTechItems = require('./routes/TransaformerTechnicalItems/DeleteTechnicalItems.js');


/* ***************  Start: Delta Consumer Application - Mobile App *************** */

var SignUp = require('./routes/MobileApp/SignUp.js');
var VerifyOtp = require('./routes/MobileApp/VerifyOtp.js');
var ResendOtp = require('./routes/MobileApp/ResendOtp.js');
var ForgetPassword = require('./routes/MobileApp/ForgetPassword.js');
var UpdatePassword = require('./routes/MobileApp/UpdatePassword.js');
var UpdateConsumer = require('./routes/MobileApp/UpdateConsumer.js');
var ConsumerDetails = require('./routes/MobileApp/ConsumerDetails.js');
var MobileAppLogin = require('./routes/MobileApp/MobileAppLogin.js');
var MobileLogout = require('./routes/MobileApp/MobileLogout.js');
var HSDetails = require('./routes/MobileApp/HSDetails.js');
var PowerUsage = require('./routes/MobileApp/PowerUsage.js');
var Dashboard = require('./routes/MobileApp/Dashboard.js');
var GetDHCP = require('./routes/MobileApp/GetDHCP.js');
var DataUsage = require('./routes/MobileApp/DataUsage.js');
var DhcpParam = require('./routes/MobileApp/DhcpParam.js');
var DeltaLinkStatus = require('./routes/MobileApp/DeltaLinkStatus.js');
var NotificationLists = require('./routes/MobileApp/NotificationLists.js');
var DataUsageByClients = require('./routes/MobileApp/DataUsageByClients.js');
var DataUsageByClientsv2 = require('./routes/MobileApp/DataUsageByClientsv2.js');
var TokenUpdate = require('./routes/MobileApp/TokenUpdate.js');


// var AESEncryption = require('./routes/MobileApp/Encryption.js');
// var AESDycryption = require('./routes/MobileApp/Dycryption.js');

/* ************************LiveData***************************** */

var livedata = require('./routes/livedata.js');
var liveconnection = require('./routes/liveconnection.js');

/* ************************Bandwidth limitation***************************** */
var BandwidthLimitations = require('./routes/BandwidthLimitations.js');
var BandwidthLimitationsResponse = require('./routes/BandwidthLimitationsResponse.js');
/* *************************************************************************** */

var GetCircuitIDLists = require('./routes/Registration/Endpoint/GetCircuitIDLists.js');


/* ************************SummaryMap APIs***************************** */
var getCircuitDetails = require('./routes/DataRate/getCircuitDetails.js');
var getTransformersByDTCID = require('./routes/DataRate/getTransformersByDTCID.js');
var getTransformerPhaseDetailsByTransformerID = require('./routes/DataRate/getTransformerPhaseDetailsByTransformerID.js');
var getDeltalinkDetails = require('./routes/DataRate/getDeltalinkDetails.js');
var getMeterByTransformerID = require('./routes/DataRate/getMeterByTransformerID.js');
var DataRate = require('./routes/DataRate/DataRate.js');
var DataRateResponse = require('./routes/DataRate/DataRateResponse.js');
var DataRateReport = require('./routes/DataRate/DataRateReport.js');

















/* ***************** SECTION-V : ROUTES BINDING ************************** */

/*  ***********  Start : DataVINE Webservices  ************  */

app.use('/login', Login);
app.use('/Logout', Logout);
app.use('/UserDetails', UserDetails);

//New Account Report
app.use('/NewAccountReport',permissioncheckMiddleware, NewAccountReport);

//Solar Panel
app.use('/SolarPanelReturn', SolarPanelReturn);

//Data Quality Report
app.use('/DataQualityReturns', DataQualityReturns);

//Outage Report
app.use('/Outagereport', Outagereport);

//Delay Response Report
app.use('/DelayResponseReport', DelayResponseReport);

//Device Error Report
app.use('/DeviceErrorReport', DeviceErrorReport);

//Battery Life Report
app.use('/BatteryLifeReport', BatteryLifeReport);

//Non Technical Loss
app.use('/NonTechnicalLossReport', NonTechnicalLossReport);

//Network Statistics Meter
app.use('/NetworkStatisticsMeter', NetworkStatisticsMeter);

//HyperSprout Management
app.use('/AppGroupDownload', AppGroupDownload);
app.use('/ConfigPrograms', ConfigPrograms);
app.use('/ConfigProgramsEdit', ConfigProgramsEdit);
app.use('/ConfUploadConfigProgram', ConfUploadConfigProgram);
app.use('/ConfigProgramsDelete', ConfigProgramsDelete);
app.use('/HSMConf', HSMConf);
app.use('/HSGroupDelete', HSGroupDelete);
app.use('/ConfNewConfSave', ConfNewConfSave);
app.use('/HSMConfImportConfSave', HSMConfImportConfSave);
app.use('/HSMConfEdit', HSMConfEdit);
app.use('/HSMConfEditSave', HSMConfEditSave);
app.use('/HSMDownDownloadConfSave', HSMDownDownloadConfSave);
app.use('/DownloadConfigurationResponse', DownloadConfigurationResponse);
app.use('/HSMTagDiscrepancies', HSMTagDiscrepancies);
app.use('/HSMGrpMgmt',permissioncheckMiddleware, HSMGrpMgmt);
app.use('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint', HSMGrpMgmtAssignGrpMembershipAssignEndpoint);
app.use('/HSMGrpMgmtAssignGrpMembershipCreateAppGrp', HSMGrpMgmtAssignGrpMembershipCreateAppGrp);
app.use('/HSMSecurityCodeMgmt', HSMSecurityCodeMgmt);
app.use('/HSMSecurityAssignDeviceSecCodeSave', HSMSecurityAssignDeviceSecCodeSave);
app.use('/HSMSecuritySave', HSMSecuritySave);
app.use('/JobsList', JobsList);
app.use('/ListCoils',ListCoils);
app.use('/ListDownloadJobs', ListDownloadJobs);
app.use('/ListDevicesAttached', ListDevicesAttached);
app.use('/HsmGroupDownload', HsmGroupDownload);

//Meter Management
app.use('/MMConf', MMConf);
app.use('/MMConfImportConfSave', MMConfImportConfSave);
app.use('/MMDownDownloadConfSave', MMDownDownloadConfSave);
app.use('/MMTagDiscrepancies', MMTagDiscrepancies);
app.use('/MMGrpMgmt', permissioncheckMiddleware,MMGrpMgmt);
app.use('/MMGrpMgmtAssignGrpMembershipAssignEndpoint', MMGrpMgmtAssignGrpMembershipAssignEndpoint);
app.use('/MMSecurityCodeMgmt', MMSecurityCodeMgmt);
app.use('/MMSecurityAssignDeviceSecCodeSave', MMSecurityAssignDeviceSecCodeSave);
app.use('/MMSecuritySave', MMSecuritySave);
app.use('/MMGroupDownload', MMGroupDownload);

//System Management
app.use('/SMHyperSprout',permissioncheckMiddleware, SMHyperSprout);
app.use('/SMMeters', SMMeters);
app.use('/SMNodePing', SMNodePing);
app.use('/SMMeterNodePing', SMMeterNodePing);
app.use('/SMMeterNodePingStatus', SMMeterNodePingStatus);
app.use('/ConfigUploadMeters', ConfigUploadMeters);
app.use('/ConfigUploadHyperSprout', ConfigUploadHyperSprout);

//app.use('/SMEndpointCleanup', SMEndpointCleanup);
//app.use('/SMEndpointCleanupDeregisterSave', SMEndpointCleanupDeregisterSave);
app.use('/NetworkStatisticsHS', NetworkStatisticsHS);
app.use('/LockUnlockDevice', LockUnlockDevice);
app.use('/LockUnlockDeviceStatus', LockUnlockDeviceStatus);
app.use('/remoteRebootDevice', remoteRebootDevice);
app.use('/RebootDeviceStatus', RebootDeviceStatus);
app.use('/FactoryReset', DeviceFactoryReset);
app.use('/FactoryResetResponse', FactoryResetResponse);
app.use('/ConfigMgmtStatus', ConfigMgmtStatus);
app.use('/fetchSystemInformation', fetchSystemInformation);
app.use('/BackHaulConfigurations', BackHaulConfigurations);
app.use('/FrontHaulConfigurations', FrontHaulConfigurations);
app.use('/MeterConfigurations', MeterConfigurations);
app.use('/SystemSettingsConfigurations', SystemSettingsConfigurations);
app.use('/CloudConnectivity', CloudConnectivity);
app.use('/fetchCountryDefaults', fetchCountryDefaults);
app.use('/ScanAvailableMeshProfiles', ScanAvailableMeshProfiles);
app.use('/AlarmsEvents', AlarmsEvents);
app.use('/carrierList',carrierList);
app.use('/CarrierListRep',CarrierListRep);
app.use('/MeshResp',MeshResp);

//Tools
app.use('/UserSettings', UserSettings);
app.use('/UpdateUserSettings', UpdateUserSettings);
app.use('/ChangePassword', ChangePassword);

//Administration
//Administration -> Security
app.use('/AddSecurityGroups', AddSecurityGroups);
app.use('/DeleteSecurityGroups', DeleteSecurityGroups);
app.use('/EditSecurityGroups', EditSecurityGroups);
app.use('/GetSecurityGroups',permissioncheckMiddleware, GetSecurityGroups);
app.use('/ReturnSecurityGroups', ReturnSecurityGroups);
app.use('/ListSecurityID', ListSecurityID);
app.use('/RestoreDefaultPasswordSettings', RestoreDefaultPasswordSettings);
app.use('/UpdatedPasswordSettings', UpdatedPasswordSettings);
app.use('/SavePasswordSettings', SavePasswordSettings);
//Administration -> SystemSettings
app.use('/RestoreDefaultSettings', RestoreDefaultSettings);
app.use('/UpdatedSystemSettings', permissioncheckMiddleware,UpdatedSystemSettings);
app.use('/SaveSystemSettings', SaveSystemSettings);
//Administration -> Users
app.use('/ListUserID', ListUserID);
app.use('/AddUser', AddUser);
app.use('/GetUsers',permissioncheckMiddleware, GetUsers);
app.use('/EditUser', EditUser);
app.use('/ResetPassword', ResetPassword);
app.use('/DeleteUser', DeleteUser);

//Messaging CRUD
app.use('/AddMessage', AddMessage);
app.use('/GetMessages',GetMessages);
app.use('/EditMessageStatus', EditMessageStatus);
app.use('/DeleteMessage',DeleteMessage);
app.use('/GetMessageById',GetMessageById);
app.use('/GetMessageCount',GetMessageCount);
//Reports
app.use('/DeviceFirmwareVersionReport',permissioncheckMiddleware, DeviceFirmwareVersionReport);
app.use('/CommunicationsStatisticsReport',permissioncheckMiddleware, CommunicationsStatisticsReport);
app.use('/MeterCommunicationsStatisticsReport',permissioncheckMiddleware, MeterCommunicationsStatisticsReport);
app.use('/SystemAuditLogReport',permissioncheckMiddleware, SystemAuditLogReport);
app.use('/SystemLogReport',permissioncheckMiddleware, SystemLogReport);

//TransctionalDataScheduler
app.use('/ListDevicesOnReadTime', ListDevicesOnReadTime);
app.use('/DeviceStatus', DeviceStatus);
app.use('/SchedulerLog', SchedulerLog);
app.use('/SchedulerLogUpdate', SchedulerLogUpdate);

//MAC ACL
app.use('/MacACLDV', MacACLDV);
app.use('/MacACLHS', MacACLHS);
app.use('/MacACLALL', MacACLALL);

//Invalid Packet- CRC not matching
app.use('/InvalidPacketIntimation', InvalidPacketIntimation);

//Device logs
app.use('/DeviceLogsList', DeviceLogsList);
app.use('/ClearLogs', ClearLogs);
app.use('/VerbosityDetails', VerbosityDetails)
app.use('/VerbosityLogs', VerbosityLogs);
app.use('/DeleteDeviceLogsDetails', DeleteDeviceLogsDetails)
app.use('/FetchDeviceLog', FetchDeviceLog)
app.use('/UploadLogFile', UploadLogFile)
app.use('/ClearLogsStatus', ClearLogsStatus)
app.use('/VerbosityLogsStatus', VerbosityLogsStatus)
app.use('/FetchDeviceLogStatus', FetchDeviceLogStatus)

/*  ***********  Start : Deltalink  ************  */
app.use('/NewDeltalinkEntry', NewDeltalinkEntry)
app.use('/EditDeltalinkDetails', EditDeltalinkDetails)
app.use('/EditDeltalinkBandwidthChangeResponse', EditDeltalinkBandwidthChangeResponse)
app.use('/DisplayAllDeltalinkDetails', DisplayAllDeltalinkDetails)
app.use('/ExportAllDeviceDetails', ExportAllDeviceDetails)
app.use('/DeleteDeltalinkDetails', DeleteDeltalinkDetails)
app.use('/SMDeltalinkNodePing', SMDeltalinkNodePing)
app.use('/AddingDeltalinkToMeter', AddingDeltalinkToMeter)
app.use('/RemovingDeltalinkFromMeter', RemovingDeltalinkFromMeter)
app.use('/RemovingDeltalinkFromMeterResponse', RemovingDeltalinkFromMeterResponse)
app.use('/SMDeltalinkNodePingStatus', SMDeltalinkNodePingStatus)

// Deltalink Management
app.use('/DLMGrpMgmtAssignGrpMembershipCreateAppGrp', DLMGrpMgmtAssignGrpMembershipCreateAppGrp)
app.use('/DLMGrpMgmt',permissioncheckMiddleware, DLMGrpMgmt)
app.use('/DLMGrpMgmtAssignGrpMembershipAssignEndpoint', DLMGrpMgmtAssignGrpMembershipAssignEndpoint)
app.use('/DeltalinkFirmwareMgmtJobStatus',permissioncheckMiddleware, DeltalinkFirmwareMgmtJobStatus)
app.use('/DeltalinkJobList',permissioncheckMiddleware, DeltalinkJobList)
app.use('/FirmwareMgmtDeltalinkResponse', FirmwareMgmtDeltalinkResponse)













/*  ***********  End : DataVINE Webservices  ************  */

/*  ***********  Start : DataSCAPE Webservices  ************  */

//Endpoint Web Services
app.use('/DeleteEndpointDetails', DeleteEndpointDetails);
app.use('/DisplayAllEndpointDetails', DisplayAllEndpointDetails);
app.use('/EditEndpointDetails', EditEndpointDetails);
app.use('/NewEndpointEntry', NewEndpointEntry);
app.use('/EndpointResponse', EndpointResponse);
app.use('/MeshMacAclAddition',MeshMacAclAddition);

// Device registration Webservice
app.use('/EndpointRegistration', EndpointRegistration);
app.use('/NewCircuitEntry', NewCircuitEntry);
app.use('/DisplayAllCircuitDetails',permissioncheckMiddleware, DisplayAllCircuitDetails);
app.use('/NewMeterEntry', NewMeterEntry);
app.use('/EditMeterDetails', EditMeterDetails);
app.use('/NewTransformerHypersproutEntry', NewTransformerHypersproutEntry);
app.use('/DisplayAllTransformerDetails', DisplayAllTransformerDetails);
app.use('/EditCircuitDetails', EditCircuitDetails);
app.use('/EditMeterWifiChangeResponse', EditMeterWifiChangeResponse);
app.use('/EditTransformerHypersproutDetails', EditTransformerHypersproutDetails);
app.use('/EditTransformerHypersproutWifiChangeResponse', EditTransformerHypersproutWifiChangeResponse);
app.use('/DeleteCircuitDetails', DeleteCircuitDetails);
app.use('/DeleteMeterDetails', DeleteMeterDetails);
app.use('/DeleteTransformerHypersproutDetails', DeleteTransformerHypersproutDetails);
app.use('/AddingTransformerToCircuit', AddingTransformerToCircuit);
app.use('/AddingMeterToTransformer', AddingMeterToTransformer);
app.use('/RemovingTransformerFromCircuit', RemovingTransformerFromCircuit);
app.use('/RemovingMeterFromTransformer', RemovingMeterFromTransformer);
app.use('/RemovingMeterFromTransformerResponse', RemovingMeterFromTransformerResponse);
app.use('/RemovingTransformerFromCircuitResponse', RemovingTransformerFromCircuitResponse);
app.use('/MeterConnectDisconnect', MeterConnectDisconnect);
app.use('/MeterConnectDisconnectResponse', MeterConnectDisconnectResponse);
app.use('/MeterConnectDisconnectDetails', MeterConnectDisconnectDetails);
app.use('/MeterKwH', MeterKwH);
app.use('/MeterKwHDetails', MeterKwHDetails);
//app.use('/OnDemandLogUpdate', OnDemandLogUpdate);
app.use('/MeterBillingUploadData', MeterBillingUploadData);
app.use('/MeterBillingUploadDisplay', MeterBillingUploadDisplay);
app.use('/MeterKwHResponse', MeterKwHResponse);
app.use('/UniqueFileNameandTimeStamp', UniqueFileNameandTimeStamp);
app.use('/DeleteMeterBilling', DeleteMeterBilling);
app.use('/ViewBillingData', ViewBillingData);
// Hyper Hub Webservice
app.use('/NewHyperHubEntry', NewHyperHubEntry);
app.use('/DeleteHyperHubDetails', DeleteHyperHubDetails);
app.use('/EditHyperHubDetails', EditHyperHubDetails);
app.use('/DisplayAllHyperHubDetails', DisplayAllHyperHubDetails);
app.use('/AddingHyperHubToTransformer', AddingHyperHubToTransformer);
app.use('/RemovingHyperHubFromTransformer', RemovingHyperHubFromTransformer);
app.use('/GetAllHyperHubAttachedToTransformer', GetAllHyperHubAttachedToTransformer);


/*  ***********  End : DataSCAPE Webservices  ************  */

// Cloud & Database Statistics
app.use('/CloudStats', CloudStats);
app.use('/DBStatistics', DBStatistics);

// Firmware Management
app.use('/FirmwareMgmtFirmGroup', FirmwareMgmtFirmGroup);
app.use('/FirmwareMgmtFirmGroupSubmit', FirmwareMgmtFirmGroupSubmit);
app.use('/FirmwareMgmtJobStatus',permissioncheckMiddleware, FirmwareMgmtJobStatus);
app.use('/FirmwareMgmtUpload', FirmwareMgmtUpload);
app.use('/FirmwareMgmtResponse', FirmwareMgmtResponse);
app.use('/FirmwareMgmtMeshResponse', FirmwareMgmtMeshResponse);
app.use('/ResendFirmwareMgmntJob', ResendFirmwareMgmntJob);
app.use('/FirmwareGroupLists', FirmwareGroupLists);


//Bulk Read/Connection/Disconnection operations : 12 May 2020
app.use('/ListOfJobBulkOperations', ListOfJobBulkOperations);
app.use('/UploadMeterData', UploadMeterData);
app.use('/ListOfBulkOperationsByDate', ListOfBulkOperationsByDate);
app.use('/ListAllBulkOperations', ListAllBulkOperations);


//Technical Items of transformer
app.use('/NewTransformerTechItemsEntry', NewTransformerTechItemsEntry);
app.use('/DisplayAllTechnicalLossItems', DisplayAllTechnicalItems);
app.use('/EditTransformerTechItemsEntry', EditTransformerTechItemsEntry);
app.use('/DeleteTransformerTechItems', DeleteTransformerTechItems);

/* ***************  Start: Delta Consumer Application - Mobile App *************** */

app.use('/SignUp', SignUp);
app.use('/VerifyOtp', VerifyOtp);
app.use('/ResendOtp', ResendOtp);
app.use('/ForgetPassword', ForgetPassword);
app.use('/UpdatePassword', UpdatePassword);
app.use('/UpdateConsumer', UpdateConsumer);
app.use('/ConsumerDetails', ConsumerDetails);
app.use('/MobileAppLogin', MobileAppLogin);
app.use('/MobileLogout', MobileLogout);
app.use('/HSDetails', HSDetails);
app.use('/PowerUsage', PowerUsage);
app.use('/Dashboard', Dashboard);
app.use('/GetDHCP', GetDHCP);
app.use('/DataUsage', DataUsage);
app.use('/DhcpParam', DhcpParam);
app.use('/DeltaLinkStatus', DeltaLinkStatus);
app.use('/NotificationLists', NotificationLists);
app.use('/DataUsageByClients', DataUsageByClients);
app.use('/DataUsageByClientsv2', DataUsageByClientsv2);
app.use('/TokenUpdate',TokenUpdate);


// app.use('/AESEncryption', AESEncryption);
// app.use('/AESDycryption',AESDycryption);

/* ************************LiveData***************************** */
app.use('/livedata', livedata);
app.use('/liveconnection', liveconnection);

/* ************************Bandwidth limitation***************************** */
app.use('/BandwidthLimitations', BandwidthLimitations);
app.use('/BandwidthLimitationsResponse', BandwidthLimitationsResponse);

/* ************************************************************************ */
app.use('/GetCircuitIDLists', GetCircuitIDLists);

/* ************************SummaryMap APIs***************************** */
app.use('/getCircuitDetails', getCircuitDetails);
app.use('/getTransformersByDTCID', getTransformersByDTCID);
app.use('/getTransformerPhaseDetailsByTransformerID', getTransformerPhaseDetailsByTransformerID);
app.use('/getDeltalinkDetails', getDeltalinkDetails);
app.use('/getMeterByTransformerID', getMeterByTransformerID);
app.use('/DataRate', DataRate);
app.use('/DataRateResponse', DataRateResponse);
app.use('/DataRateReport', DataRateReport)










app.listen(port, function () {
    console.log('DataVine Collection Engine webservices are up and running on port %d', this.address().port);
});

// process.on('uncaughtException', function (err) {   
//    console.log("Error123: " + err);
// });
module.exports = app;
