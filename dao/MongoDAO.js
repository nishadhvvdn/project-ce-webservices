var dbCon = require('../data/dbConnection.js');
const paginatedResults = require('../config/Helpers/Pagination')


function findAll(collectionName, callback) {
    try {
        console.log("findAll");
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var mongoCollection = db[collectionName];
                mongoCollection.find().toArray(function (err, detailsFetched) {
                    if (err)
                        callback(err, null);
                    else if (detailsFetched.length > 0) {
                        callback(null, detailsFetched);
                    } else {
                        callback("Details not available", null)
                    }

                });
            }
        });
    } catch (e) {
        callback("Something went wrong: " + e.name, null);

    }
}

function findAllPaginationAndSearch(collectionName, data, searchCondition, message, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var mongoCollection = db[collectionName];
                if (!data.search || data.search === null || data.search === undefined) {
                    let whereCondition = {};
                    paginatedResults.paginatedResults(mongoCollection, whereCondition, data, message, function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                }
                else {
                    paginatedResults.paginatedResults(mongoCollection, searchCondition, data, message, function (err, AllDetails) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, AllDetails);
                        }
                    })
                }
            }
        });
    } catch (e) {
        callback("Something went wrong: " + e.name, null);
    }
}

function findJobAndAppGroupPaginationAndSearch(collectionName, appCollection, data, searchCondition, message, DeviceType, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                let mongoCollection = db[collectionName];
                let mongoAppCollection = db[appCollection];
                paginatedResults.paginatedResultsJobStatus(mongoCollection, mongoAppCollection, searchCondition, data, message, DeviceType, function (err, AllDetails) {
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, AllDetails);
                    }
                })
            }
        });
    } catch (e) {
        callback("Something went wrong: " + e.name, null);
    }
}

function findAllByCondition(condition, collectionName, callback) {
    try {
        dbCon.getDb(function (err, db) {
            if (err)
                callback(err, null);
            else {
                var mongoCollection = db[collectionName];
                mongoCollection.find(condition).toArray(function (err, detailsFetched) {
                    if (err)
                        callback(err, null);
                    else {
                        callback(null, detailsFetched);
                    }
                });
            }
        });
    } catch (e) {
        callback("Something went wrong: " + e.name, null);

    }
}

module.exports = {
    findAll: findAll,
    findAllByCondition: findAllByCondition,
    findAllPaginationAndSearch: findAllPaginationAndSearch,
    findJobAndAppGroupPaginationAndSearch: findJobAndAppGroupPaginationAndSearch
};