var dbCon = require('./dbConnection.js');

function updateDhcp(deltaLinkId, ip, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        } else {
            var collectionName = db.delta_DeltaLink;
            collectionName.update({ "DeltalinkID": deltaLinkId }, { "$set": { "DhcpIp": ip } }, function (err, insertResponse) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, insertResponse);
                }
            });
        }
    });
}

module.exports = {
    updateDhcp: updateDhcp
}