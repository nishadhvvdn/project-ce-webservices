var dbCon = require('./dbConnection.js');
var dbSqlCon = require('./mySqlConnection.js');

function FetchTokenDetails(consumerId,DevicePlatform,DeviceAppId,DeviceToken,DeviceLang, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let data = { message: "Database error occured", responseCode: "300" };
            callback(data, null);
        }
        else {
            let meterCollection = db.delta_Meters;
            let tokenCollection = db.delta_token;

            meterCollection.find({ "Meters_Billing.MeterConsumerNumber": consumerId }, { MeterSerialNumber: 1, MeterID: 1 }).toArray(function (err, consumer) {
                if (err) {
                    let data = { message: "Database error occured", responseCode: "300" }
                    callback(data, null);
                } else {
                    if (consumer.length) {
                        let meterSerialNumber = consumer.map(function (val) {
                            return val.MeterSerialNumber;
                        });

                        let meterId = consumer.map(function (val) {
                            return val.MeterID;
                        });
                        if(DevicePlatform == "Android"){
                            var condition = {"UserID": consumerId,"DeviceType":"Android","DeviceAppId":DeviceAppId};
                            tokenCollection.updateOne(condition,{ $set:{"DeviceToken":DeviceToken,"DeviceLang":DeviceLang}},{ upsert : true },function (err, res) {
                                if (err) {
                                        console.log(err);
                                    data = { message: "Database error occured111", responseCode: "300" }
                                    callback(data, null);
                                }else{
                                    data = { message: "Token Updated", responseCode: "200" }
                                    return callback(null, data);
                                }
                            });
                        }else{
                            var conditioniOS = {"UserID": consumerId,"DeviceType":"iOS","DeviceAppId":DeviceAppId}
                            tokenCollection.updateOne(conditioniOS,{ $set:{"DeviceToken":DeviceToken,"DeviceLang":DeviceLang}},{ upsert : true },function (err, res) {
                                if (err) {
                                    console.log(err);
                                    data = { message: "Database error occured22", responseCode: "300" }
                                    callback(data, null);
                                }else{
                                    data = { message: "Token Updated", responseCode: "200" }
                                    return callback(null, data);
                                }
                            });
                        }                        
                    } else {
                        let data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                        callback(data, null)
                    }
                }
            });
        }
    });
};



module.exports = {

    FetchTokenDetails: FetchTokenDetails
}

