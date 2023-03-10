var mongodb = require("mongodb");
global.dbase = {};
// Code for using Environment variable

var mongoUser = process.env.mongoUser;
var mongoUserPass = process.env.mongoUserPass;
var mongoHost = process.env.mongoHost;
var mongoDB = process.env.mongoDB;
var socketTimeoutMS =  process.env.socketTimeoutMS;
var maxPoolSize = process.env.maxPoolSize;
var connectTimeoutMS = process.env.connectTimeoutMS
var authSource = process.env.authSource

// var mongoUrl = "mongodb://" + "vvdn-dev-mongodb" + ":" + "AT4nMuVFtr7PDkGRxR9Yyn" + "@" + "40.83.161.123:27017" + "/" + "DELTA" + "?authSource=admin&connectTimeoutMS=300000";
var mongoUrl = "mongodb://" + mongoUser + ":" + mongoUserPass + "@" + mongoHost + "/" + mongoDB + "?authSource="+authSource+"&connectTimeoutMS="+connectTimeoutMS;

// var mongoUrl = "mongodb://deltaLtts:Delta123@40.117.175.1:27017/DELTA?authSource=admin&connectTimeoutMS=300000";
// var mongoUrl = "mongodb://webservicerw:webservice#987@collectionengine.eastus.cloudapp.azure.com/DELTA?authSource=DELTA&connectTimeoutMS=300000";

// var mongoUrl = "mongodb://localhost:27017/DELTA"
/**
* @description - connection to mongodb and initialize collections
* @params - Nil
* @return callback function
*/
var theDb = null;
function getDb(callback) {
    if (!theDb || (theDb && !theDb.db.serverConfig.isConnected())) {
        mongodb.MongoClient.connect(mongoUrl,{poolSize: maxPoolSize,socketTimeoutMS:socketTimeoutMS,useUnifiedTopology: true },function (err, databaseClient) {
            if (err) {
                console.log("Mongo connection error",JSON.stringify(err));
                callback({"message":"Database Connection refused"}, null);
            } else {
                dbase = databaseClient;
                let db = databaseClient.db(mongoDB);
                theDb = {
                    db: db,
                    // login: db.collection("Login"),
                    delta_User: db.collection("DELTA_User"),
                    delta_AppGroups: db.collection("DELTA_AppGroups"),
                    delta_ConfigGroups: db.collection("DELTA_ConfigGroups"),
                    delta_DeviceClass: db.collection("DELTA_DeviceClass"),
                    delta_TagDiscripancies: db.collection("DELTA_TagDiscripancies"),
                    delta_Jobs: db.collection("DELTA_Jobs"),
                    delta_Circuit: db.collection("DELTA_Circuit"),
                    delta_Hypersprouts: db.collection("DELTA_Hypersprouts"),
                    delta_Meters: db.collection("DELTA_Meters"),
                    delta_Server: db.collection("DELTA_Server"),
                    delta_Transformer: db.collection("DELTA_Transformer"),
                    delta_SecurityGroups: db.collection("DELTA_SecurityGroups"),
                    delta_SystemSettings: db.collection("DELTA_SystemSettings"),
                    delta_PasswordSettings: db.collection("DELTA_PasswordSettings"),
                    delta_ConfigPrograms: db.collection("DELTA_ConfigPrograms"),
                    delta_Meters_OnDemand_Transactions: db.collection("DELTA_Meters_OnDemand_Transactions"),
                    delta_RawData: db.collection("DELTA_RawData"),
                    delta_MeterBilling: db.collection("DELTA_MeterBilling"),
                    delta_SchedulerLogs: db.collection("DELTA_SchedulerLogs"),
                    delta_SchedulerFlags: db.collection("DELTA_SchedulerFlags"),
                    delta_Transaction_Data: db.collection("DELTA_Transaction_Data"),
                    delta_FirmwareManagement: db.collection("DELTA_FirmwareManagement"),
                    delta_AuditLogs: db.collection("DELTA_AuditLogs"),
                    delta_SystemEvents: db.collection("DELTA_SystemEvents"),
                    delta_DBStatistics: db.collection("DELTA_DBStatistics"),
                    delta_Errorlogs: db.collection("DELTA_Errorlogs"),
                    delta_AlarmsAndEvents: db.collection("DELTA_AlarmsAndEvents"),
                    delta_MeterNodePing: db.collection("DELTA_MeterNodePing"),
                    delta_Session: db.collection("sessions"),
                    delta_Endpoint: db.collection("DELTA_Endpoint"),
                    delta_DeviceLogs: db.collection("DELTA_DeviceLogs"),
                    delta_DeltaLink: db.collection("DELTA_DeltaLink"),
                    delta_Meters_idCount_increment: db.collection("DELTA_Meters_idCount_increment"),
                    delta_Transformer_HH_idCount_increment: db.collection("DELTA_Transformer_HH_idCount_increment"),
                    delta_Circuit_idCount_increment: db.collection("DELTA_Circuit_idCount_increment"),
                    delta_DeltaLink_idCount_increment: db.collection("DELTA_DeltaLink_idCount_increment"),
                    delta_Endpoint_idCount_increment: db.collection("DELTA_Endpoint_idCount_increment"),
                    delta_Transformer_Tech_Item: db.collection("DELTA_Transformer_Tech_Item"),
                    delta_Transformer_Tech_Item_idCount_increment: db.collection("DELTA_Transformer_Tech_Item_idCount_increment"),
                    delta_Config :  db.collection("DELTA_Config"),
                    delta_Default : db.collection("DELTA_CountryConfigs"),
                    delta_OTP : db.collection("DELTA_OTP"),
                    delta_Notification : db.collection("DELTA_DeltaLink_Notification"),
                    delta_token : db.collection("DELTA_PushNotification"),
                    delta_messages: db.collection("DELTA_Messages")

              };
                callback(null, theDb);
            }
        });

    } else {
        callback(null, theDb);
    }
};

module.exports = {
    getDb: getDb
};