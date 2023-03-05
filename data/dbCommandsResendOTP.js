//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var otpGenerator = require('otp-generator');
var email = require('./sendEmail');
var sms = require('./sendSms');
var moment = require('moment');
var OtpExpiry = process.env.OtpExpiry;


/**
* @description - For the Webservice - MobileApp - otpVerification     Desc - Resend otp to  ConsumerId by otp sent to email , details getting IN MONGODB   
* @params data i.e ConsumerID, Email, callback
* @return callback function
*/
function ResendOTP(ConsumerID, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            ResendOTPFromMongoDB(db.delta_OTP, db.delta_User, ConsumerID, callback);
    });
};


/**
* @description -  resend otp for verification of  new user
* @param , otpCollection ConsumerID callback
* @return callback function
*/

function ResendOTPFromMongoDB(otpCollection, userCollection, ConsumerID, callback) {
    try {
        userCollection.find({ "UserID": ConsumerID,  "UserType" : "Consumer" }).toArray(function (err, userResult) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                return callback(data, null);
            }
            else {
                if (userResult.length > 0) {
                    otpCollection.find({ "UserID": ConsumerID }).toArray(function (err, res) {
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
                                var d1 = new Date();
                                var d2 = new Date(res[0].ExpiryOn);
                                var ExpDate = moment.utc(d2);
                                var endDate = moment.utc(d1);
                                minsDiff = endDate.diff(ExpDate, 'seconds');
                                if(minsDiff > 0 || (res[0].isUsed == 1)){
                                // var contactNo = userResult[0].MobileNo.replace('-','');
                                // var from = process.env.Twilio_ContactNo;
                                // var to = contactNo;
                                // var otp = Math.floor(1000 + Math.random() * 9000);
                                // var content = "OTP Verification for Delta Account " + otp;
                                // sms.sendSms(from, to, content, function (err, successful) {
                                var to_email = userResult[0].EmailAddress;
                                var email_subject = "Delta Account Details";
                                var otp = Math.floor(1000 + Math.random() * 9000);
                                var email_content = "OTP Verification for Delta Account " + otp;
                                email.sendNewUserPassword(to_email, email_subject, email_content, "PasswordReset", function (err, successful) {
                                    if (err) {
                                        data = { message: "User registered but Email not sent. Please try again.", responseCode: "310" }
                                        return callback(data, null);
                                    }
                                    else {
                                        var date = new Date();
                                        date.setTime(date.getTime() + (OtpExpiry * 60 * 1000));
                                        var setData = {
                                            "UserID": ConsumerID,
                                            "OTP": otp,
                                            "CreatedOn": new Date(),
                                            "ExpiryOn": date,
                                            "isUsed": 0
                                        };
                                        let condition = { "UserID": ConsumerID }
                                        updateData(otpCollection, condition, setData, function (err, resp) {
                                            if (err) {
                                                data = { message: "Database error occured", responseCode: "300" }
                                                callback(data, null);
                                            } else {
                                                data = { message: "OTP sent", responseCode: "200" }
                                                return callback(null, data);

                                            }
                                        })

                                    }
                                });
                            }else{
                                var to_email = userResult[0].EmailAddress;
                                var email_subject = "Delta Account Details";
                                var email_content = "OTP Verification for Delta Account " + res[0].OTP;
                                email.sendNewUserPassword(to_email, email_subject, email_content, "PasswordReset", function (err, successful) {
                                    if (err) {
                                        data = { message: "User registered but Email not sent. Please try again.", responseCode: "310" }
                                        return callback(data, null);
                                    }
                                    else {
                                        data = { message: "OTP sent", responseCode: "200" }
                                        return callback(null, data);
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
                    data = { message: "ConsumerID not available", responseCode: "303" }
                    callback(data, null)
                }
            }
        })
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
    ResendOTP: ResendOTP
}
