//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var shortid = require('shortid');
var generator = require('generate-password');
var otpGenerator = require('otp-generator');
var email = require('./sendEmail');
var bcrypt = require('bcrypt');
var sms = require('./sendSms');

/**
* @description - For the Webservice - MobileApp - signUpEntry     Desc - Add User details IN MONGODB   
* @params data i.e ConsumerID, MobileNo, Email, Password, callback
* @return callback function
*/
function signUpEntry(data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            signUpEntryFromMongoDB(db.delta_Meters, db.delta_User, db.delta_OTP, data, callback);
    });
};


/**
* @description -  signup new user
* @param , meterCollection, userCollection, data i.e ConsumerID, MobileNo, Email, Password, callback
* @return callback function
*/

function signUpEntryFromMongoDB(meterCollection, userCollection, otpCollection, signupData, callback) {
    try {
        var storedPassword = [];
        let data;
        cryptPassword(signupData.Password, function (err, hashPassword) {
            if (err) {
                data = { message: err, responseCode: "314" }
                callback(data, null);
            }
            else {
                storedPassword.push(hashPassword);
                var loginID = shortid.generate();
                var user = {
                    "LoginID": loginID,
                    "EmailAddress": signupData.Email,
                    "Password": hashPassword,
                    "PasswordAssignedTimestamp": new Date(),
                    "OldPasswords": storedPassword,
                    "UserID": signupData.ConsumerID,
                    "MobileNo": signupData.MobileNo,
                    "FirstName": signupData.FirstName,
                    "LastName": signupData.LastName,
                    "UserType": "Consumer"
                };

                meterCollection.find({ $and: [{ "Meters_Billing.MeterConsumerNumber": signupData.ConsumerID }, { "Meters_Billing.MeterConsumerContactNumber": signupData.MobileNo }] }).toArray(function (err, consumer) {
                    if (err) {
                        data = { message: "Database error occured", responseCode: "300" }
                        callback(data, null);
                    }
                    else {
                        if (consumer.length > 0) {
                            userCollection.find({ $and: [{ $or: [{ EmailAddress: signupData.Email }, { UserID: signupData.ConsumerID }] }, { "UserType": "Consumer" }] }).toArray(function (err, res) {
                                if (err) {
                                    data = { message: "Database error occured", responseCode: "300" }
                                    return callback(data, null);
                                }
                                else {
                                    if (res.length > 0) {
                                        otpCollection.find({ UserID: signupData.ConsumerID, isVerified: 0 }).toArray(function (err, resOtp) {
                                            if (err) {
                                                data = { message: "Database error occured", responseCode: "300" }
                                                return callback(data, null);
                                            } else {
                                                if (resOtp.length > 0) {
                                                    userCollection.update({EmailAddress: signupData.Email},{"$set" : user}, function (err, result) {
                                                        if (err) {
                                                            data = { message: "Database error occured", responseCode: "300" }
                                                            callback(data, null);
                                                        }
                                                        else {
                                                            // var contactNo = signupData.MobileNo.replace('-','');
                                                            // var from = process.env.Twilio_ContactNo;
                                                            // var to = contactNo;
                                                            // var otp = Math.floor(1000 + Math.random() * 9000);
                                                            // var content = "OTP Verification for Delta Account " + otp;
                                                            // sms.sendSms(from, to, content, function (err, successful) {
                                                            var to_email = signupData.Email;
                                                            var email_subject = "Delta Account Details";
                                                            var otp = Math.floor(1000 + Math.random() * 9000);
                                                            var email_content = "OTP Verification for Delta Account " + otp;
                                                            email.sendNewUserPassword(to_email, email_subject, email_content, "PasswordReset", function (err, successful) {
                                                                if (err) {
                                                                    data = { message: "User registered but Email not sent. Please try again", responseCode: "310" }
                                                                    return callback(data, null);
                                                                }
                                                                else {
                                                                    var date = new Date();
                                                                    date.setTime(date.getTime() + (15 * 60 * 1000));
                                                                    var otpData = {
                                                                        "UserID": signupData.ConsumerID,
                                                                        "OTP": otp,
                                                                        "MobileNo": signupData.MobileNo,
                                                                        "CreatedOn": new Date(),
                                                                        "ExpiryOn": date,
                                                                        "isVerified": 0
                                                                    };
                                                                    otpCollection.update({"UserID": signupData.ConsumerID},{"$set":otpData}, function (err, resp) {
                                                                        if (err) {
                                                                            data = { message: "Database error occured", responseCode: "300" }
                                                                            callback(data, null);
                                                                        } else {
                                                                            data = { message: "Contact number registered but OTP not verifed", responseCode: "307" }
                                                                            return callback(null, data);
                                                                        }
                                                                    })
                                                                }
                                                            });
                                                        }
                                                    })

                                                } else {
                                                    data = { message: "Email/ConsumerID already registered", responseCode: "302" }
                                                    callback(data, null);
                                                }

                                            }
                                        });
                                    } else {
                                        userCollection.insertOne(user, function (err, resp) {
                                            if (err) {
                                                data = { message: "Database error occured", responseCode: "300" }
                                                callback(data, null);
                                            }
                                            else {
                                                // var contactNo = signupData.MobileNo.replace('-','');
                                                // var from = process.env.Twilio_ContactNo;
                                                // var to = contactNo;
                                                // var otp = Math.floor(1000 + Math.random() * 9000);
                                                // var content = "OTP Verification for Delta Account " + otp;
                                                // sms.sendSms(from, to, content, function (err, successful) {
                                                var to_email = signupData.Email;
                                                var email_subject = "Delta Account Details";
                                                var otp = Math.floor(1000 + Math.random() * 9000);
                                                var email_content = "OTP Verification for Delta Account " + otp;
                                                email.sendNewUserPassword(to_email, email_subject, email_content, "PasswordReset", function (err, successful) {
                                                    if (err) {
                                                        data = { message: "User registered but Email not sent. Please try again", responseCode: "310" }
                                                        return callback(data, null);
                                                    }
                                                    else {
                                                        var date = new Date();
                                                        date.setTime(date.getTime() + (15 * 60 * 1000));
                                                        var otpData = {
                                                            "UserID": signupData.ConsumerID,
                                                            "OTP": otp,
                                                            "MobileNo": signupData.MobileNo,
                                                            "CreatedOn": new Date(),
                                                            "ExpiryOn": date,
                                                            "isVerified": 0
                                                        };
                                                        otpCollection.insertOne(otpData, function (err, resp) {
                                                            if (err) {
                                                                data = { message: "Database error occured", responseCode: "300" }
                                                                callback(data, null);
                                                            } else {
                                                                data = { message: "Contact number registered but OTP not verifed", responseCode: "307" }
                                                                return callback(null, data);

                                                            }
                                                        })

                                                    }
                                                });
                                            }
                                        })
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
        })
    } catch (e) {
        callback({ message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" }, null)
    }
}


/**
* @description -  crypt Password
* @param password 
* @param callback - callback function returns success or error response
* @return callback function
*/
function cryptPassword(password, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err)
            return callback(err, null);

        bcrypt.hash(password, salt, function (err, hash) {
            return callback(err, hash);
        });

    });
};

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


module.exports = {
    signUpEntry: signUpEntry,
    decryptPassword: decryptPassword,
}