
//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
var generator = require('generate-password');
var bcrypt = require('bcrypt');




/**
* @description - For the Webservice - MobileApp - Update New Password     Desc - update New Password verified by  ConsumerId details getting IN MONGODB   
* @params updatePasswordData i.e ConsumerID, NewPassword, Otp, callback
* @return callback function
*/
function UpdatePassword(updatePasswordData, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            UpdatePasswordFromMongoDB(db.delta_User, db.delta_OTP, updatePasswordData, db.delta_Meters, callback);
    });
};


/**
* @description -  Update New Password from MONGODB
* @param , userCollection, otpCollection, updatePasswordData i.e ConsumerID, Otp, NewPassword, callback
* @return callback function
*/

function UpdatePasswordFromMongoDB(userCollection, otpCollection, updatePasswordData, meterCollection, callback) {
    try {
        let data;
        meterCollection.find({ "Meters_Billing.MeterConsumerNumber": updatePasswordData.ConsumerID }).toArray(function (err, consumer) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                callback(data, null);
            } else {
                if (consumer.length) {
                    otpCollection.find({ $and: [{ "UserID": updatePasswordData.ConsumerID }, { "OTP": parseInt(updatePasswordData.Otp) }] }).toArray(function (err, res) {
                        if (err) {
                            data = { message: "Database error occured", responseCode: "300" }
                            callback(data, null);
                        }
                        else {
                            if (res.length > 0) {
                                let date = new Date();
                                if (date < res[0].ExpiryOn) {
                                    var storedPassword = [];
                                    cryptPassword(updatePasswordData.NewPassword, function (err, hashPassword) {
                                        if (err) {
                                            data = { message: err, responseCode: "314" }
                                            callback(data, null);
                                        }
                                        else {
                                            userCollection.find({ "UserID": updatePasswordData.ConsumerID }, { "UserID": 1, "Password": 1 }).toArray(function (err, user) {
                                                bcrypt.compare(updatePasswordData.NewPassword, user[0].Password, function (err, res) {
                                                    if (res) {
                                                        data = { message: "New password can not be same as current password", responseCode: "324" }
                                                        return callback(data,null);
                                                    } else {
                                                        storedPassword.push(hashPassword);
                                                        var setData = {
                                                            "PasswordAssignedTimestamp": new Date(),
                                                            "Password": hashPassword,
                                                            "OldPasswords": storedPassword
                                                        };
                                                        let condition = { "UserID": updatePasswordData.ConsumerID, "UserType": "Consumer" }
                                                        updateData(userCollection, condition, setData, function (err, resp) {
                                                            if (err) {
                                                                data = { message: "Database error occured", responseCode: "300" }
                                                                callback(data, null);
                                                            } else {

                                                                data = { message: "Password Successfully Updated", responseCode: "200" }
                                                                return callback(null, data);

                                                            }
                                                        })
                                                    }
                                                })
                                            });

                                        }
                                    })
                                } else {
                                    data = { message: "OTP expired", responseCode: "311" }
                                    callback(data, null)

                                }
                            } else {
                                data = { message: "ConsumerID/Otp not available", responseCode: "303" }
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


/**
* @description -  crypt Password
* @param password 
* @param callback - callback function returns success or error response
* @return callback function
*/
function cryptPassword(password, callback) {
    try {
        bcrypt.genSalt(10, function (err, salt) {
            if (err)
                return callback(err, null);

            bcrypt.hash(password, salt, function (err, hash) {
                return callback(err, hash);
            });

        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
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
    UpdatePassword: UpdatePassword,
    decryptPassword:decryptPassword
}
