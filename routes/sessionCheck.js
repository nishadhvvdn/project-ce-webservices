var dbCon = require('../data/dbConnection.js');

function findUser(sessionID, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var sessionCollection = db.delta_Session;
            sessionCollection.find({ _id: sessionID }).toArray(function (err, response) {
                if (err || !response) {
                    callback(new Error("Login First"), null);
                }
                else if (response.length > 0) {
                    callback(null, response);
                } else {
                    callback(new Error("Login First"), null);
                }
            });
        }
    });
}

module.exports = {
    findUser: findUser
};