var mysql = require('mysql');
var connection = null;
/**
* @description - mySQL connection
* @params - callback
* @return callback function
*/
function getDb(callback) {
        connection = mysql.createConnection({
            host: process.env.mysqlHost,
            user: process.env.mysqlUser,
            password: process.env.mysqlPass,
            database: process.env.mysqlDatabase,
            multipleStatements: true
        });
        callback(null, connection);
};

module.exports = {
    getDb: getDb,
};