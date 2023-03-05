var mysql = require('mysql');
var dbCon = require('../../data/mySqlConnection.js');



function paginatedResults(CollectionName, WhereCondition, QueryDetails, Message, callback) {
    try {
        const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
        const endIndex = QueryDetails.page * QueryDetails.limit;
        const results = {};
        let cursor = CollectionName.find(WhereCondition).sort({_id:-1});
        cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
            .limit(QueryDetails.limit).toArray(function (err, Details) {
                if (err) {
                    callback(err, null);
                } else {
                    if (Details.length > 0) {
                        if (endIndex > 0) {
                            results.next = {
                                Page: QueryDetails.page + 1,
                                Limit: QueryDetails.limit
                            }
                        }
                        if (startIndex > 0) {
                            results.previous = {
                                Page: QueryDetails.page - 1,
                                Limit: QueryDetails.limit
                            }
                        }

                        cursor.count().then((count) => {
                            results.totalRecords = count;
                            results.results = Details
                            callback(null, results);
                        });
                    } else {
                        callback(Message + " Details not available in the System", null);
                    }
                }
            });
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null);
    }

}

function paginatedResultsJobStatus(CollectionName, appCollection, WhereCondition, QueryDetails, Message, DeviceType, callback) {
    try {
        let appGroup = [];
        let data = {};
        let groupId = [];
        const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
        const endIndex = QueryDetails.page * QueryDetails.limit;
        const results = {};
        let cursor = CollectionName.find(WhereCondition);
        cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
            .limit(QueryDetails.limit).sort({ "CreatedDateTimestamp": -1 }).toArray(function (err, Details) {
                if (err) {
                    callback(err, null);
                } else {
                    if (Details.length > 0) {
                        if (endIndex > 0) {
                            results.next = {
                                Page: QueryDetails.page + 1,
                                Limit: QueryDetails.limit
                            }
                        }
                        if (startIndex > 0) {
                            results.previous = {
                                Page: QueryDetails.page - 1,
                                Limit: QueryDetails.limit
                            }
                        }

                        cursor.count().then((count) => {
                            results.totalRecords = count;
                            for (var i in Details) {
                                if (Details.hasOwnProperty(i)) {
                                    groupId.push(Details[i].GroupID)
                                }
                            }
                            appCollection.find({ "Type": DeviceType, "GroupID": { $in: groupId } }).toArray(function (err, appResult) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (appResult.length > 0) {
                                        for (var i in appResult) {
                                            if (appResult.hasOwnProperty(i)) {
                                                let GroupID = appResult[i].GroupID;
                                                let GroupName = appResult[i].GroupName
                                                data[GroupID] = GroupName;
                                                appGroup.push(data);
                                            }
                                        }

                                    }

                                }
                                results.results = Details;
                                if (appGroup[0]) {
                                    results.AppGroup = appGroup[0];
                                } else {
                                    results.AppGroup = [];
                                }
                                callback(null, results);

                            });
                        });

                    } else {
                        callback(Message + " Details not available in the System", null);
                    }
                }
            });
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}


function paginatedResultsSort(CollectionName, WhereCondition, QueryDetails, Message, SortBy, callback) {
    try {
        const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
        const endIndex = QueryDetails.page * QueryDetails.limit;
        const results = {};
        let cursor = CollectionName.find(WhereCondition);
        if (SortBy == "DBTimestamp") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "DBTimestamp": -1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else if (SortBy == "EventDateTime") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "EventDateTime": -1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else if (SortBy == "CreatedOn") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "CreatedOn": -1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else if (SortBy == "CreatedDateTimestamp") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "CreatedDateTimestamp": -1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else if (SortBy == "CreatedDate") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "CreatedDate": -1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "EventDateTime": -1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null);
    }

}


function paginatedResultsSortASC(CollectionName, WhereCondition, QueryDetails, Message, SortBy, callback) {
    try {
        const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
        const endIndex = QueryDetails.page * QueryDetails.limit;
        const results = {};
        let cursor = CollectionName.find(WhereCondition);
        if (SortBy == "DBTimestamp") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "DBTimestamp": 1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else if (SortBy == "EventDateTime") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "EventDateTime": 1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else if (SortBy == "CreatedOn") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "CreatedOn": 1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else if (SortBy == "CreatedDateTimestamp") {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "CreatedDateTimestamp": 1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        } else {
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ "EventDateTime": 1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        }
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null);
    }

}
function paginatedResultsSortSystemLog(CollectionName, WhereCondition, QueryDetails, Message, SortBy, callback) {
    try {
        const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
        const endIndex = QueryDetails.page * QueryDetails.limit;
        const results = {};
        let cursor = CollectionName.find(WhereCondition);
            cursor.skip(QueryDetails.page > 0 ? (startIndex) : 0)
                .limit(QueryDetails.limit).sort({ DBTimestamp: -1 }).toArray(function (err, Details) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (Details.length > 0) {
                            if (endIndex > 0) {
                                results.next = {
                                    Page: QueryDetails.page + 1,
                                    Limit: QueryDetails.limit
                                }
                            }
                            if (startIndex > 0) {
                                results.previous = {
                                    Page: QueryDetails.page - 1,
                                    Limit: QueryDetails.limit
                                }
                            }

                            cursor.count().then((count) => {
                                results.totalRecords = count;
                                results.results = Details
                                callback(null, results);
                            });
                        } else {
                            callback(Message + " Details not available in the System", null);
                        }
                    }
                });
        
    } catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null);
    }

}


function paginatedResultsMySQL(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, QueryDetails, Message, callback) {
    try {
        dbCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                let totalcount;
                let query;
                let pagination
                let OFFSET = (QueryDetails.page - 1) * QueryDetails.limit;
                OFFSET = QueryDetails.page > 0 ? (OFFSET) : 0;
                const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
                const endIndex = QueryDetails.page * QueryDetails.limit;
                const results = {};
                if (WhereCondition == "") {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} `;
                    query = `SELECT ${ColumnName} FROM ${TableName}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;
                } else {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} where ${CountWhereCondition}`;
                    query = `SELECT ${ColumnName} FROM ${TableName} where ${WhereCondition}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;

                }
                console.log("countquery", totalcount)
                console.log("query", pagination)
                connection.query(totalcount, function (err, rows1, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(pagination, function (err, rows, fields) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (rows.length > 0) {
                                    if (endIndex > 0) {
                                        results.next = {
                                            Page: QueryDetails.page + 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    if (startIndex > 0) {
                                        results.previous = {
                                            Page: QueryDetails.page - 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    results.totalRecords = rows1[0][`COUNT(${Count})`];
                                    results.results = rows;
                                    connection.end();
                                    callback(null, results);
                                } else {
                                    callback(Message + " Details not available in the System", null);

                                }

                            }
                        })
                    }
                })
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}

function paginatedResultsMySQLToManageCount(TableName, ColumnName, CountQuery, WhereCondition, QueryDetails, Message, callback) {

    try {
        dbCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                let totalcount;
                let query;
                let pagination
                let OFFSET = (QueryDetails.page - 1) * QueryDetails.limit;
                OFFSET = QueryDetails.page > 0 ? (OFFSET) : 0;
                const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
                const endIndex = QueryDetails.page * QueryDetails.limit;
                const results = {};
                if (WhereCondition == "") {
                    totalcount = CountQuery;
                    query = `SELECT ${ColumnName} FROM ${TableName}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;
                } else {
                    totalcount = CountQuery;
                    query = `SELECT ${ColumnName} FROM ${TableName} where ${WhereCondition}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;

                }
                connection.query(totalcount, function (err, rows1, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(pagination, function (err, rows, fields) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (rows.length > 0) {
                                    if (endIndex > 0) {
                                        results.next = {
                                            Page: QueryDetails.page + 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    if (startIndex > 0) {
                                        results.previous = {
                                            Page: QueryDetails.page - 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    results.totalRecords = rows1[0]['T_count'];
                                    results.results = rows;
                                    connection.end();
                                    callback(null, results);
                                } else {
                                    callback(Message + " Details not available in the System", null);

                                }

                            }
                        })
                    }
                })
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}


function paginatedResultsMySQLSortBY(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, QueryDetails, Message, SortBY, callback) {
    try {
        dbCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                let totalcount;
                let query;
                let pagination
                let OFFSET = (QueryDetails.page - 1) * QueryDetails.limit;
                OFFSET = QueryDetails.page > 0 ? (OFFSET) : 0;
                const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
                const endIndex = QueryDetails.page * QueryDetails.limit;
                const results = {};
                if (WhereCondition == "") {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} `;
                    query = `SELECT ${ColumnName} FROM ${TableName} ORDER BY ${SortBY}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;
                } else {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} where ${CountWhereCondition}`;
                    query = `SELECT ${ColumnName} FROM ${TableName} where ${WhereCondition} ORDER BY ${SortBY}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;

                }
                connection.query(totalcount, function (err, rows1, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(pagination, function (err, rows, fields) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (rows.length > 0) {
                                    if (endIndex > 0) {
                                        results.next = {
                                            Page: QueryDetails.page + 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    if (startIndex > 0) {
                                        results.previous = {
                                            Page: QueryDetails.page - 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    results.totalRecords = rows1[0][`COUNT(${Count})`];
                                    results.results = rows;
                                    connection.end();
                                    callback(null, results);
                                } else {
                                    callback(Message + " Details not available in the System", null);

                                }

                            }
                        })
                    }
                })
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}

function paginatedResultsMySQLSortBYDesc(TableName, ColumnName, Count, WhereCondition, CountWhereCondition, QueryDetails, Message, SortBY, callback) {
    try {
        dbCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                let totalcount;
                let query;
                let pagination
                let OFFSET = (QueryDetails.page - 1) * QueryDetails.limit;
                OFFSET = QueryDetails.page > 0 ? (OFFSET) : 0;
                const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
                const endIndex = QueryDetails.page * QueryDetails.limit;
                const results = {};
                if (WhereCondition == "") {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} `;
                    query = `SELECT ${ColumnName} FROM ${TableName} ORDER BY ${SortBY} desc`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;
                } else {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} where ${CountWhereCondition}`;
                    query = `SELECT ${ColumnName} FROM ${TableName} where ${WhereCondition} ORDER BY ${SortBY} desc`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;

                }
                connection.query(totalcount, function (err, rows1, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(pagination, function (err, rows, fields) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (rows.length > 0) {
                                    if (endIndex > 0) {
                                        results.next = {
                                            Page: QueryDetails.page + 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    if (startIndex > 0) {
                                        results.previous = {
                                            Page: QueryDetails.page - 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    results.totalRecords = rows1[0][`COUNT(${Count})`];
                                    results.results = rows;
                                    connection.end();
                                    callback(null, results);
                                } else {
                                    callback(Message + " Details not available in the System", null);

                                }

                            }
                        })
                    }
                })
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}


function paginatedResultsMySQLJoin(TableName, ColumnName, JoinColumnName, joinType, variable1, variable2, JoinTableName, JoinCountColumnName, Count, WhereCondition, CountWhereCondition, QueryDetails, Message, callback) {
    try {
        dbCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                let totalcount;
                let query;
                let pagination
                let OFFSET = (QueryDetails.page - 1) * QueryDetails.limit;
                OFFSET = QueryDetails.page > 0 ? (OFFSET) : 0;
                const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
                const endIndex = QueryDetails.page * QueryDetails.limit;
                const results = {};
                if (WhereCondition == "") {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} `;
                    query = `SELECT ${ColumnName} FROM ${TableName}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;
                } else {
                    totalcount = `SELECT COUNT(${Count}) FROM ${TableName} ${variable1} ${joinType} (SELECT ${JoinCountColumnName} FROM ${JoinTableName} ${variable2} where ${CountWhereCondition}`;
                    query = `SELECT ${ColumnName} FROM ${TableName} ${variable1} ${joinType} (SELECT ${JoinColumnName} FROM ${JoinTableName} ${variable2} where ${WhereCondition}`;
                    pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;

                }
                connection.query(totalcount, function (err, rows1, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(pagination, function (err, rows, fields) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (rows.length > 0) {
                                    if (endIndex > 0) {
                                        results.next = {
                                            Page: QueryDetails.page + 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    if (startIndex > 0) {
                                        results.previous = {
                                            Page: QueryDetails.page - 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    results.totalRecords = rows1[0][`COUNT(${Count})`];
                                    results.results = rows;
                                    connection.end();
                                    callback(null, results);
                                } else {
                                    callback(Message + " Details not available in the System", null);

                                }

                            }
                        })
                    }
                })
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}



function paginatedResultsMySQLDataUsage(query, countQuery, Message, QueryDetails, callback) {
    try {
        dbCon.getDb(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                connection.connect();
                let pagination
                let OFFSET = (QueryDetails.page - 1) * QueryDetails.limit;
                OFFSET = QueryDetails.page > 0 ? (OFFSET) : 0;
                const startIndex = (QueryDetails.page - 1) * QueryDetails.limit;
                const endIndex = QueryDetails.page * QueryDetails.limit;
                const results = {};
                pagination = `${query} LIMIT ${QueryDetails.limit} OFFSET ${OFFSET}`;
                connection.query(countQuery, function (err, rows1, fields) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(pagination, function (err, rows, fields) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (rows.length > 0) {
                                    if (endIndex > 0) {
                                        results.next = {
                                            Page: QueryDetails.page + 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    if (startIndex > 0) {
                                        results.previous = {
                                            Page: QueryDetails.page - 1,
                                            Limit: QueryDetails.limit
                                        }
                                    }
                                    let results1 = JSON.parse(JSON.stringify(rows1))
                                    results.totalRecords = results1[2][0]['count(*)'];
                                    results.results = rows;
                                    connection.end();
                                    callback(null, results);
                                } else {
                                    callback(Message + " Details not available in the System", null);

                                }

                            }
                        })
                    }
                })
            }
        })
    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }

}


module.exports = {
    paginatedResults: paginatedResults,
    paginatedResultsJobStatus: paginatedResultsJobStatus,
    paginatedResultsSort: paginatedResultsSort,
    paginatedResultsSortASC:paginatedResultsSortASC,
    paginatedResultsMySQL: paginatedResultsMySQL,
    paginatedResultsMySQLToManageCount: paginatedResultsMySQLToManageCount,
    paginatedResultsMySQLSortBY: paginatedResultsMySQLSortBY,
    paginatedResultsMySQLJoin: paginatedResultsMySQLJoin,
    paginatedResultsSortSystemLog:paginatedResultsSortSystemLog,
    paginatedResultsMySQLSortBYDesc:paginatedResultsMySQLSortBYDesc,
    paginatedResultsMySQLDataUsage:paginatedResultsMySQLDataUsage
};