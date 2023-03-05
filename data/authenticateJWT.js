
const jwt = require('jsonwebtoken');
let fs = require('fs');
var dbCon = require('./dbConnection.js');
const config = require("../config/configParams.js").config;
const cofigParam = JSON.parse(JSON.stringify(config))

function authentication(req, callback) {

    const token = req.headers.authorization;
    const ConsumerID = req.headers.consumerid;
    if (req.baseUrl == '/ForgetPassword' || req.baseUrl == '/UpdatePassword' || req.baseUrl == '/ResendOTP') {
        if (token) {
            verifyJwt(token, ConsumerID, callback);
        } else {
            callback(null, "Success");
        }
    } else {

        if (token) {
            verifyJwt(token, ConsumerID, callback);
        } else {
            callback({ "message": "No token found", "responseCode": "321" }, null);
        }
    }

}

function verifyJwt(token, ConsumerID, callback) {
    var accessTokenSecret = cofigParam['JWTAccessToken']['SecretKey']
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
            callback({ "message": "Invalid token", "responseCode": "318" }, null);
        } else {
            if (user.UserID == ConsumerID) {
                if (user.exp < Date.now()) {
                    callback({ "message": "Invalid token", "responseCode": "318" }, null);
                }
                else {
                    // dbCon.getDb(function (err, db) {
                    //     if (err) {
                    //         let errordata = { message: "Database error occured", responseCode: "300" }
                    //         callback(errordata, null);
                    //     } else {
                    //         var collectionName = db.delta_User;
                    //         collectionName.findOne({ "UserID": ConsumerID, "accessToken": token }, function (error, result) {
                    //             if (error) {
                    //                 let errordata = { message: "Database error occured", responseCode: "300" }
                    //                 callback(errordata, null);
                    //             }
                    //             else {
                    //                 if (!result)
                    //                     callback({ "message": "Invalid token", "responseCode": "318" }, null);
                    //                 else
                                        callback(null, "Success");

                    //             }
                    //         });
                    //     }
                    // });
                }
            } else
                callback({ "message": "Invalid token for this Consumer", "responseCode": "319" }, null)
        }
    });
}

module.exports = {
    authentication: authentication
}