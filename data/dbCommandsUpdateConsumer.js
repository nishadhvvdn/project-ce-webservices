
//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');


/**
* @description - For the Webservice - MobileApp - Update Consumer Details     Desc - update Consumer Details verified by  ConsumerId details getting IN MONGODB   
* @params updateConsumerData i.e ConsumerID, FirstName, LastName, MobileNo, Email, callback
* @return callback function
*/
function UpdateConsumer(updateConsumerData, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            UpdateConsumerFromMongoDB(db.delta_User, db.delta_OTP, updateConsumerData, db.delta_Meters, callback);
    });
};



/**
* @description -  Update consumer details from MONGODB
* @param , userCollection, updateConsumerData i.e i.e ConsumerID, FirstName, LastName, MobileNo, Email, callback
* @return callback function
*/

function UpdateConsumerFromMongoDB(userCollection, otpCollection, updateConsumerData,meterCollection, callback) {
    try {
        let data;
        meterCollection.find({ "Meters_Billing.MeterConsumerNumber": updateConsumerData.ConsumerID }).toArray(function (err, consumer) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                callback(data, null);
            } else {
                if (consumer.length) {
                    userCollection.find({ "UserID": updateConsumerData.ConsumerID, "UserType": "Consumer" }).toArray(function (err, res) {
                        if (err) {
                            data = { message: "Database error occured", responseCode: "300" }
                            callback(data, null);
                        }
                        else {
                            if (res.length > 0) {
                                userCollection.find({"EmailAddress": updateConsumerData.Email}).toArray(function (err, records) {
                                    if(err) {
                                        data = { message: "Database error occured", responseCode: "300" }
                                        callback(data, null);
                                    } else {
                                        if((records.length == 0) || (records.length == 1 && records[0].UserID === updateConsumerData.ConsumerID)) {
                                            otpCollection.find({ "isVerified": 1, "UserID": updateConsumerData.ConsumerID }).toArray(function (err, result) {
                                                if (err) {
                                                    data = { message: "Database error occured", responseCode: "300" }
                                                    callback(data, null);
                                                } else if (result.length > 0) {
                                                    var setData = {
                                                        "EmailAddress": updateConsumerData.Email,
                                                        "FirstName": updateConsumerData.FirstName,
                                                        "LastName": updateConsumerData.LastName
                                                    };
                                                    let condition = { "UserID": updateConsumerData.ConsumerID, "UserType": "Consumer" }
                                                    updateData(userCollection, condition, setData, function (err, resp) {
                                                        if (err) {
                                                            data = { message: "Database error occured", responseCode: "300" }
                                                            callback(data, null);
                                                        } else {
                                                            data = { message: "Consumer Details Successfully Updated", responseCode: "200" }
                                                            return callback(null, data);
                                                        }
                                                    })
                                                } else {
                                                    data = { message: "Contact number registered but OTP not verifed", responseCode: "307" }
                                                    callback(data, null);
                                                }
                                            });
                                        } else {
                                            data = { message: "Email already associated with another User", responseCode: "327" }
                                            callback(data, null);
                                        }
                                    }
                                })
                            } else {
                                data = { message: "ConsumerID not available", responseCode: "303" }
                                callback(data, null)
                            }
                        }
                    })
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
    UpdateConsumer: UpdateConsumer
}
