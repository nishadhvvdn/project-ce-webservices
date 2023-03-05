var mysql = require('mysql');
var Sequelize = require("sequelize");
var objconnpool = null;

// Code for using Environment variable
var mysqlUser = process.env.mysqlUser;
var mysqlPass = process.env.mysqlPass;
var mysqlHost = process.env.mysqlHost;
var mysqlDialect = process.env.mysqlDialect;
var mysqlDatabase = process.env.mysqlDatabase;

/**
* @description - MySql connector
* @params - callback
* @return callback function
*/
function getDb(callback) {

    if (!objconnpool) {
        objconnpool = new Sequelize(mysqlDatabase, mysqlUser, mysqlPass, {
            host: mysqlHost,
            dialect: mysqlDialect,
            logging: false,
            pool: {
                max: 5,
                min: 0,
                idle: 120000,
                maxIdleTime: 120000
            },
        });


    }
    callback(null, objconnpool);
};

module.exports = {
    getDb: getDb,
};