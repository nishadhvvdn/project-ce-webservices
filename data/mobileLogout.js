var dbCon = require('./dbConnection.js');

function mobileLogout(consumerID, DevicePlatform, DeviceToken, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        } else {
            var collectionName = db.delta_User;
            var tokenCollection = db.delta_token;
            collectionName.update({ "UserID": consumerID }, { "$set": { "accessToken": null } }, function (err, insertResponse) {
                if (err) {
                    let errordata = { message: "Database error occured", responseCode: "300" }
                    callback(errordata, null);
                }
                else {
                    tokenCollection.remove({ "UserID": consumerID, "DeviceType": DevicePlatform, "DeviceToken": DeviceToken }, function (err, insertResponse) {
                        if (err) {
                            let errordata = { message: "Database error occured", responseCode: "300" }
                            callback(errordata, null);
                        }
                        else {
                            let data = { message: "Successfully Logout", responseCode: "200" }
                            callback(null, data);
                        }
                    });

                }
            });
        }
    });
}

module.exports = {
    mobileLogout: mobileLogout
}