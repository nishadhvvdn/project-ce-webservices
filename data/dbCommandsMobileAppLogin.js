//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
const bcrypt = require("bcrypt");
var email = require('./sendEmail');
let fs = require('fs');
const jwt = require('jsonwebtoken');
var sms = require('./sendSms');
const config = require("../config/configParams.js").config;
const cofigParam = JSON.parse(JSON.stringify(config))

/**
* @description - For the Webservice - MobileApp - login entry     Desc - login consumer details IN MONGODB   
* @params data i.e ConsumerID,  Password, callback
* @return callback function
*/
function loginEntry(data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            loginEntryFromMongoDB(db.delta_User, db.delta_OTP, data, db.delta_Meters, callback);
    });
};


/**
* @description -  login consumer
* @param , userCollection, data i.e ConsumerID, Password, callback
* @return callback function
*/

function loginEntryFromMongoDB(userCollection, otpCollection, loginData, meterCollection, callback) {
    try {
        let data;
        // check whether UserID/ Password is correct or not
        userCollection.findOne({ UserID: loginData.ConsumerID, "UserType": "Consumer" }, { Password: 0, OldPasswords: 0, PasswordAssignedTimestamp: 0 }, function (err, result) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                return callback(data, null);
            }
            else if (!result) {
                data = { message: "Wrong Username/Password", responseCode: "320" }
                return callback(data, null);
            } else {

                comparePassword(loginData.Password, result.Password, function (err, isPasswordMatch) {
                    if (err) {
                        data = { message: "Database error occured", responseCode: "300" }
                        return callback(data, null);
                    }
                    else if (!isPasswordMatch) {
                        data = { message: "Wrong Username/Password", responseCode: "320" }
                        return callback(data, null);
                    } else {
                        // check whether UserID(Consumer Number) is associated with any meter or not
                        meterCollection.find({ "Meters_Billing.MeterConsumerNumber": loginData.ConsumerID }).toArray(function (err, res) {
                            if (err) {
                                data = { message: "Database error occured", responseCode: "300" }
                                return callback(data, null);
                            } else {
                                 // if UserID(Consumer Number) is associated with any meter
                                if (res.length) {
                                    otpCollection.find({ "UserID": loginData.ConsumerID }).toArray(function (err, otpData) {
                                        if (err) {
                                            data = { message: "Database error occured", responseCode: "300" }
                                            callback(data, null);
                                        } else {
                                            if (otpData.length) {
                                                if (!otpData[0].isVerified) {
                                                    // var contactNo = result.MobileNo.replace('-','');
                                                    // var from = process.env.Twilio_ContactNo;
                                                    // var to = contactNo;
                                                    // var otp = Math.floor(1000 + Math.random() * 9000);
                                                    // var content = "OTP Verification for Delta Account " + otp;
                                                    // sms.sendSms(from, to, content, function (err, successful) {
                                                    var to_email = result.EmailAddress;
                                                    var email_subject = "Delta Account Details";
                                                    var otp = Math.floor(1000 + Math.random() * 9000);
                                                    var email_content = "OTP Verification for Delta Account " + otp;
                                                    email.sendNewUserPassword(to_email, email_subject, email_content, "Login", function (err, successful) {
                                                        if (err)
                                                            return callback(err, null);
                                                        else {
                                                            var date = new Date();
                                                            date.setTime(date.getTime() + (15 * 60 * 1000));
                                                            var setData = {
                                                                "OTP": otp,
                                                                "ExpiryOn": date,

                                                            };
                                                            let condition = { "UserID": loginData.ConsumerID }
                                                            updateData(otpCollection, condition, setData, function (err, resp) {
                                                                if (err) {
                                                                    data = { message: "Database error occured", responseCode: "300" }
                                                                    callback(data, null);
                                                                } else {
                                                                    var tokenExpiryTime = parseInt(cofigParam['JWTAccessToken']['ExpiryTime']);
                                                                    var accessToken = jwt.sign({ "UserID": loginData.ConsumerID, "exp": Math.floor(Date.now()) + tokenExpiryTime }, cofigParam['JWTAccessToken']['SecretKey']);
                                                                    delete result.Password;
                                                                    delete result.PasswordAssignedTimestamp;
                                                                    delete result.OldPasswords;
                                                                    result.accessToken = accessToken;
                                                                    userCollection.update({ "UserID": loginData.ConsumerID, "UserType": "Consumer" }, { "$set": { "accessToken": accessToken, "DeviceToken": loginData.DeviceToken, "DevicePlatform": loginData.DevicePlatform } }, function (err, insertResponse) {
                                                                        if (err) {
                                                                            let errordata = { message: "Database error occured", responseCode: "300" }
                                                                            callback(errordata, null);
                                                                        }
                                                                        else {
                                                                            userCollection.findOne({ UserID: loginData.ConsumerID, "UserType": "Consumer" }, { Password: 0, OldPasswords: 0, PasswordAssignedTimestamp: 0 }, function (err, result) {
                                                                                if (err) {
                                                                                    data = { message: "Database error occured", responseCode: "300" }
                                                                                    return callback(data, null);
                                                                                }
                                                                                else if (!result) {
                                                                                    data = { message: "Wrong Username/Password", responseCode: "320" }
                                                                                    return callback(data, null);
                                                                                } else {
                                                                                    delete result.Password;
                                                                                    delete result.PasswordAssignedTimestamp;
                                                                                    delete result.OldPasswords;
                                                                                    data = { data: result, message: "Contact number registered but OTP not verifed", responseCode: "307" }
                                                                                    callback(null, data);
                                                                                }
                                                                            })

                                                                        }
                                                                    });
                                                                }
                                                            })
                                                        }
                                                    });
                                                } else {
                                                    var tokenExpiryTime = parseInt(cofigParam['JWTAccessToken']['ExpiryTime']);
                                                    var accessToken = jwt.sign({ "UserID": loginData.ConsumerID, "exp": Math.floor(Date.now()) + tokenExpiryTime }, cofigParam['JWTAccessToken']['SecretKey']);
                                                    delete result.Password;
                                                    delete result.PasswordAssignedTimestamp;
                                                    delete result.OldPasswords;
                                                    result.accessToken = accessToken;
                                                    userCollection.update({ "UserID": loginData.ConsumerID, "UserType": "Consumer" }, { "$set": { "accessToken": accessToken, "DeviceToken": loginData.DeviceToken, "DevicePlatform": loginData.DevicePlatform } }, function (err, insertResponse) {
                                                        if (err) {
                                                            let errordata = { message: "Database error occured", responseCode: "300" }
                                                            callback(errordata, null);
                                                        }
                                                        else {
                                                            userCollection.findOne({ UserID: loginData.ConsumerID, "UserType": "Consumer" }, { Password: 0, OldPasswords: 0, PasswordAssignedTimestamp: 0 }, function (err, result) {
                                                                if (err) {
                                                                    data = { message: "Database error occured", responseCode: "300" }
                                                                    return callback(data, null);
                                                                }
                                                                else if (!result) {
                                                                    data = { message: "Wrong Username/Password", responseCode: "320" }
                                                                    return callback(data, null);
                                                                } else {
                                                                    delete result.Password;
                                                                    delete result.PasswordAssignedTimestamp;
                                                                    delete result.OldPasswords;
                                                                    data = { data: result, message: "Successfully login", responseCode: "200" }
                                                                    callback(null, data);

                                                                }
                                                            })
                                                        }
                                                    });
                                                }
                                            } else {
                                                data = { message: "ConsumerID not available", responseCode: "303" }
                                                callback(data, null)
                                            }
                                        }
                                    })
                                } else {
                                    data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                                    callback(data, null);
                                }
                            }
                        })
                    }
                });

            }
        })




    } catch (e) {
        callback({ message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" }, null)
    }
}






/**
* @description - decrypt encrypted text
*
* @param encryptedString  - encryptedtext
*
* @return callback function.
*/
function decryptPassword(encryptedString, callback) {
    var buff = Buffer.from(encryptedString, 'base64');
    var decryptedString = buff.toString('ascii');
    callback(decryptedString);
};


/**
* @description - compare Password 
* @param password
* @param hashPassword
* @param callback - callback function returns success or error response
* @return callback function
*/
function comparePassword(password, hashPassword, callback) {
    bcrypt.compare(password, hashPassword, function (err, isPasswordMatch) {
        if (err)
            return callback(err, null);
        return callback(null, isPasswordMatch);
    });
};

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
    loginEntry: loginEntry,
    decryptPassword: decryptPassword,
}