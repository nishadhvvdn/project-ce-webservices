//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');


/**
* @description - For the Webservice - MobileApp - Get Consumer Details     Desc - get details by  ConsumerId IN MONGODB   
* @params data i.e ConsumerID, Email, callback
* @return callback function
*/
function getConsumerDetails(ConsumerID, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            getConsumerDetailsFromMongoDB(db.delta_Meters,db.delta_OTP, db.delta_User, ConsumerID, callback);
    });
};



/**
* @description -   For the Webservice - MobileApp - Get Consumer Details     Desc - get details by  ConsumerId IN MONGODB  
* @param , meterCollection, userCollection, ConsumerID callback
* @return callback function
*/

function getConsumerDetailsFromMongoDB(meterCollection, otpCollection, userCollection, ConsumerID, callback) {
    try {
        userCollection.find({ "UserID": ConsumerID, "UserType": "Consumer" }).toArray(function (err, result) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                callback(data, null);
            }
            else {
                if (result.length) {
                    otpCollection.find({ "isVerified": 1, "UserID": ConsumerID }).toArray(function (err, otpresult) {
                        if (err) {
                            data = { message: "Database error occured", responseCode: "300" }
                            callback(data, null);
                        } else if (otpresult.length > 0) {
                            let getDetails =
                            {
                                "ConsumerID": ConsumerID,
                                "Email": result[0].EmailAddress,
                                "FirstName": result[0].FirstName,
                                "LastName": result[0].LastName,
                                "MobileNo": result[0].MobileNo,
                            }
                            meterCollection.find({ "Meters_Billing.MeterConsumerNumber": ConsumerID }).toArray(function (err, res) {
                                if (err) {
                                    data = { message: "Database error occured", responseCode: "300" }
                                    callback(data, null);
                                }
                                else {
                                    if (res.length > 0) {
                                        getDetails.Country = res[0].Meters_Billing.MeterConsumerCountry,
                                            getDetails.Address = res[0].Meters_Billing.MeterConsumerAddress,
                                            getDetails.State = res[0].Meters_Billing.MeterConsumerState,
                                            getDetails.City = res[0].Meters_Billing.MeterConsumerCity,
                                            getDetails.ZipCode = res[0].Meters_Billing.MeterConsumerZipCode,
                                            data = { "getDetails": getDetails, "message": "Consumer Details Successfully Fetched", "status": true, "responseCode": "200" }
                                        callback(null, data)
                                    }
                                    else {
                                        data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                                        callback(data, null)

                                    }
                                }
                            })
                        } else {
                            data = { message: "Contact number registered but OTP not verifed", responseCode: "307" }
                            callback(data, null);

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


module.exports = {
    getConsumerDetails: getConsumerDetails
}