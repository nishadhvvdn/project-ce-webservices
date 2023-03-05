var dbCon = require('./mysqlconnector.js');
/**
* @description - find all records
* @params - collectionName, objAttributes, objOptions, arrColumnNamesToBeFetched, objWhereCond, callback
* @return callback function
*/
function findAll(collectionName, objAttributes, objOptions, arrColumnNamesToBeFetched, objWhereCond, callback) {
    dbCon.getDb(function (err, conn) {
        try {
            if (err) {
                callback(err, null);
            } else {
                var objModel = conn.define(collectionName, objAttributes, objOptions);
                var objParam = { attributes: arrColumnNamesToBeFetched, where: objWhereCond, raw: true };
                objModel.findAll(objParam).then(function name(params) {
                    callback(null, params);
                }, function (err) {
                    callback(err, null);
                });
            }
        } catch (err) {
            callback(err, null);
        }
    });
};
/**
* @description -sync table
* @params - collectionName, objAttributes, objOptions, callback
* @return callback function
*/
function synctable(collectionName, objAttributes, objOptions, callback) {
    dbCon.getDb(function (err, conn) {
        try {
            if (err) {
                callback(err, null);
            } else {
                var objSummaryMap = conn.define(collectionName, objAttributes,
                    objOptions);

                objSummaryMap.sync({ force: false }).then(function () {
                    callback(null, true);
                }, function (err) {
                    callback(err, null);
                });
            }
        } catch (err) {
            callback(err, null);
        }
    });
};

module.exports = {
    synctable: synctable,
    findAll: findAll
}