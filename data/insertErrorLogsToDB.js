var dbCon = require('./dbConnection.js');
/**
* @description - put Error Details
* @params - error, callback
* @return callback function
*/
function putErrorDetails(error, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var collection = db.delta_Errorlogs;
            var errorlog = error;
            errorlog.errorTimestamp = new Date();
            collection.insert(errorlog, function (err, records) {
                if (err) {
                    return callback(err, null);
                } else {
                    return callback(null, records);
                }
            });
        }
    });

};

module.exports = {
    putErrorDetails: putErrorDetails
};
