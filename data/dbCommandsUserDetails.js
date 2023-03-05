//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');

/* *************** DB Commands (User Details) SECTION 1 - EXPOSED METHODS ************************ */

/* ====================== Start : Added by Dhruv  ========================= */

/**
* @description - UserDetails Web Service
* @params - sessionDetails, callback
* @return callback function
*/
function getUserDetails(sessionDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            return callback(err, null);
        } else {
            var userCollection = db.delta_User;
            var securityGroupCollection = db.delta_SecurityGroups;
            var systemSettingsCollection = db.delta_SystemSettings;
            if ((JSON.parse(sessionDetails[0].session).user !== undefined) && (JSON.parse(sessionDetails[0].session).user.UserID !== undefined)) {
                userDetails(userCollection, securityGroupCollection, systemSettingsCollection, JSON.parse(sessionDetails[0].session).user.UserID, function (err, usrDetails, securityGrpDetails, sysSettings) {
                    if (err) {
                        callback(err, null, null, null);
                    } else {
                        callback(null, usrDetails, securityGrpDetails, sysSettings);
                    }
                });
            } else
                callback(new Error("Login Again"), null, null, null);
        }
    });
}

/* =========================== End : Added by Dhruv  ========================= */


/* ********** DB Commands (User Details) SECTION 2 - NON-EXPOSED METHODS************************ */

/* ======================= Start : Added by Dhruv  ======================= */
/**
* @description - UserDetails Web Service
* @params -userCollection, securityGroupCollection, systemSettingsCollection, userID, callback
* @return callback function
*/
function userDetails(userCollection, securityGroupCollection, systemSettingsCollection, userID, callback) {
    userCollection.find({ UserID: userID }, { Password: 0, OldPasswords: 0, PasswordAssignedTimestamp: 0, AccountLockedTimestamp: 0, AttemptsToLogin: 0, _id: 0 }).toArray(function (err, result) {
        if (err) {
            callback(err, null, null, null);
        } else {
            securityGroupCollection.find({ SecurityID: result[0].SecurityGroup }).toArray(function (err, resp) {
                if (err) {
                    callback(err, null, null, null);
                } else {
                    systemSettingsCollection.find({ Settings: { $in: ["Communications", "Miscellaneous", "Reporting"] }, "Type.Status": "Updated" }).toArray(function (err, sysSettings) {
                        if (err)
                            callback(err, null, null, null, null);
                        else
                            callback(null, result[0], resp[0], sysSettings);
                    });
                }
            });
        }
    });
}
/* ========================= End : Added by Dhruv  ========================== */


/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by Dhruv  ============== */
    //User Details Web Service
    getUserDetails: getUserDetails
    /* ================ End : Added by Dhruv  =================== */
};
