//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var otpGenerator = require('otp-generator');
var email = require('./sendEmail');
var sms = require('./sendSms');
var moment = require('moment');
var OtpExpiry = process.env.OtpExpiry;

/**
* @description - For the Webservice - MobileApp - otpVerification     Desc - send otp to  ConsumerId by otp sent to email , details getting IN MONGODB   
* @params data i.e ConsumerID, MobileNo, callback
* @return callback function
*/
function ForgetPasswordOTP(ConsumerID, MobileNo, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            ForgetPasswordOTPFromMongoDB(db.delta_OTP, db.delta_User, ConsumerID, MobileNo, db.delta_Meters, callback);
    });
};



/**
* @description -   otp for verification for forget password user 
* @param , otpCollection ConsumerID callback
* @return callback function
*/

function ForgetPasswordOTPFromMongoDB(otpCollection, userCollection, ConsumerID, MobileNo,meterCollection, callback) {
    try {
        meterCollection.find({ "Meters_Billing.MeterConsumerNumber": ConsumerID }).toArray(function (err, consumer) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                callback(data, null);
            } else {
                if (consumer.length) {
                    userCollection.find({ "UserID": ConsumerID, "UserType": "Consumer" }).toArray(function (err, userResult) {
                        if (err) {
                            data = { message: "Database error occured", responseCode: "300" }
                            return callback(data, null);
                        }
                        else {
                            if (userResult.length > 0) {
                                otpCollection.find({ "UserID": ConsumerID, "MobileNo": MobileNo }).toArray(function (err, res) {
                                    if (err) {
                                        data = { message: "Database error occured", responseCode: "300" }
                                        callback(data, null);
                                    }
                                    else {
                                        if (res.length > 1) {
                                            data = { message: "duplicate ConsumerID/MobileNo", responseCode: "317" }
                                            return callback(data, null);
                                        }
                                        else if (res.length > 0) {
                                            // var contactNo = MobileNo.replace('-','');
                                            // var from = process.env.Twilio_ContactNo;
                                            // var to = contactNo;
                                            // var otp = Math.floor(1000 + Math.random() * 9000);
                                            // var content = "OTP Verification for Delta Account " + otp;
                                            // sms.sendSms(from, to, content, function (err, successful) {
                                            var d1 = new Date();
                                            var d2 = new Date(res[0].ExpiryOn);
                                            var ExpDate = moment.utc(d2);
                                            var endDate = moment.utc(d1);
                                            minsDiff = endDate.diff(ExpDate, 'seconds');
                                            if(minsDiff > 0 || (res[0].isUsed == 1)){
                                                var to_email = userResult[0].EmailAddress;
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
                                                        date.setTime(date.getTime() + (OtpExpiry * 60 * 1000));
                                                        var setData = {
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
                                                                if (res[0].isVerified == 1) {
                                                                    data = { message: "OTP sent", responseCode: "200" }
                                                                    return callback(null, data);
                                                                } else {
                                                                    data = { message: "Contact number registered but OTP not verifed", responseCode: "307" }
                                                                    return callback(null, data);
                                                                }

                                                            }
                                                        })

                                                    }
                                                });
                                            } else {
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
                                            data = { message: "ConsumerID/MobileNo not available", responseCode: "303" }
                                            callback(data, null)
                                        }
                                    }
                                })
                            } else {
                                data = { message: "ConsumerID not available", responseCode: "303" }
                                callback(data, null)
                            }
                        }
                    });
                } else {
                    data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                    callback(data, null)
                }
            }
        });
    } catch (e) {
        callback({ message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" }, null)

    }

}

//update data

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
    ForgetPasswordOTP: ForgetPasswordOTP,
}
