//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');

/* *************** DB Commands (System Management) SECTION 1 - EXPOSED METHODS ************************ */

/**
* @description - Save Audit Logs Function
* @params - sessionID, operationPerformed, callback
* @return callback function
*/
function saveAuditLogs(sessionID, operationPerformed, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                return callback(err, null);
            } else {
                var auditlogsCollection = db.delta_AuditLogs;
                var sessionCollection = db.delta_Session;
                getUserDetails(sessionCollection, sessionID, function (err, response) {
                    if (err) {
                        callback(err, null);
                    } else {
                        saveUserOperations(auditlogsCollection, response, operationPerformed, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result);
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/* ********** DB Commands (System Management) SECTION 2 - NON-EXPOSED METHODS************************ */
/**
* @description - get User details
* @params - sessionID, operationPerformed, callback
* @return callback function
*/
function getUserDetails(sessionCollection, sessionID, callback) {
    try {
        sessionCollection.find({ _id: sessionID }).toArray(function (err, response) {
            if (err) {
                callback(err, null);
            } else if (response.length === 0) {
                callback(new Error("Session Expired, Login Again"), null);
            } else {
                callback(null, response);
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}
/**
* @description -save User Operations
* @params - auditlogsCollection, response, operationPerformed, callback
* @return callback function
*/
function saveUserOperations(auditlogsCollection, response, operationPerformed, callback) {
    try {
        var doc = {
            UserID: JSON.parse(response[0].session).user.UserID,
            EventDateTime: new Date(),
            EventDescription: operationPerformed,
            SuperUser: JSON.parse(response[0].session).user.SuperUser
        }
        auditlogsCollection.insertOne(doc, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result)
            }
        });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)

    }
}

/* DB Commands SECTION 3 - MODULE EXPORTS*/

module.exports = {
    /* ============== Start : Added by Dhruv  ============== */
    //System Management -> Meter Node Ping Web Service
    saveAuditLogs: saveAuditLogs
    /* ================ End : Added by Dhruv  =================== */
};
