
//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
let fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require("../config/configParams.js").config;
const cofigParam = JSON.parse(JSON.stringify(config))
/**
* @description - For the Webservice - MobileApp - otpVerification     Desc - verify ConsumerId by otp sent to email , details getting IN MONGODB   
* @params data i.e ConsumerID, Otp, callback
* @return callback function
*/
function otpVerification(data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            otpVerificationFromMongoDB(db.delta_OTP, data, db.delta_Meters, db.delta_User, callback);
    });
};


/**
* @description -  otp verification
* @param ,otpCollection, otpDta, callback
* @return callback function
*/

function otpVerificationFromMongoDB(otpCollection, otpData, meterCollection,userCollection, callback) {
    try {
        meterCollection.find({ "Meters_Billing.MeterConsumerNumber": otpData.ConsumerID }).toArray(function (err, consumer) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                callback(data, null);
            } else {
                if (consumer.length) {
                    otpCollection.find({ $and: [{ "UserID": otpData.ConsumerID }, { "OTP": parseInt(otpData.Otp) }] }).toArray(function (err, res) {
                        if (err) {
                            data = { message: "Database error occured", responseCode: "300" }
                            callback(data, null);
                        }
                        else {
                            if (res.length > 1) {
                                data = { message: "duplicate ConsumerID", responseCode: "317" }
                                return callback(data, null);
                            }
                            else if (res.length > 0) {
                                let date = new Date();
                                if (date < res[0].ExpiryOn) {
                                    var setData = {
                                        "UserID": otpData.ConsumerID,
                                        "isVerified": 1,
                                        "isUsed": 1
                                    };
                                    let condition = { "UserID": otpData.ConsumerID }
                                    updateData(otpCollection, condition, setData, function (err, resp) {
                                        if (err) {
                                            data = { message: "Database error occured", responseCode: "300" }
                                            callback(data, null);
                                        } else {
                                            var tokenExpiryTime = parseInt(cofigParam['JWTAccessToken']['ExpiryTime']);
                                            var accessToken = jwt.sign({ "UserID": otpData.ConsumerID, "exp": Math.floor(Date.now()) + tokenExpiryTime }, cofigParam['JWTAccessToken']['SecretKey']);                                          
                                            userCollection.update({ "UserID": otpData.ConsumerID, "UserType": "Consumer" }, { "$set": { "accessToken": accessToken,  "DeviceToken": otpData.DeviceToken , "DevicePlatform":otpData.DevicePlatform } }, function (err, insertResponse) {
                                                if (err) {
                                                    let errordata = { message: "Database error occured", responseCode: "300" }
                                                    callback(errordata, null);
                                                }
                                                else {
                                                    data = { data: { accessToken: accessToken }, message: "Consumer Verified", responseCode: "200" }
                                                    callback(null, data);
                                                }
                                            });
                                        }
                                    })
                                } else {
                                    data = { message: "OTP expired", responseCode: "311" }
                                    callback(data, null)

                                }
                            } else {
                                data = { message: "ConsumerID/Otp not available", responseCode: "322" }
                                callback(data, null)
                            }
                        }
                    })
                } else {
                    data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                    callback(data, null);
                }
            }
        });
    } catch (e) {
        callback({ message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" }, null)

    }

}

function updateData(collectionName, condition, setCondition, callback) {
    try {
        collectionName.update(condition, { "$set": setCondition }, function (err, insertResponse) {
            if (err)
                callback(err, null);
            else
                callback(null, insertResponse)
        });

    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

module.exports = {
    otpVerification: otpVerification,
}
