var express = require('express');
const https = require('https');
const qs = require('querystring');
var router = express.Router();
var dbCmd = require('../data/dbCommands.js');
var dbCmdAuditLogs = require('../data/dbCommandsSystemAuditLogReport.js');
const schemaValidation = require('../config/Helpers/payloadValidation');
const schema = require('../config/Helpers/administratorSchema');
var logger = require('../config/logger.js');
router.post('/', function (req, res) {
    var userID = req.body.email;
    var encryptedPass = req.body.password;
    var loginData = { "email": userID, "password": encryptedPass };
    var loginSchema = schema.login;
    let trustedTicketRequest = req.body.trustedTicketRequest;
    let clientIP = process.env.TT_CLIENT_IP;
    let ds_username = process.env.TT_DS_USERNAME;
    let ds_server = process.env.TT_DS_SERVER;
    schemaValidation.validateSchema(loginData, loginSchema, function (err, result) {
        if (err) {
            logger.error("Login error. Invalid Schema.");
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!",
                "PayloadErrors": err
            });
        }
        else {
            dbCmd.decryptPassword(encryptedPass, function (password) {
                dbCmd.getUserDetails(userID, password, function (err, user, securitygrp, systemSettings) {
                    if (err) {
                        if (err.message === "Change Password") {
                            res.json({
                                "type": false,
                                "Message": err.status,
                                "LoginID": user
                            })
                        } else {
                            req.session.destroy(function (err1, resp) {
                                res.clearCookie('connect.sid', { expires: new Date(), path: '/' });
                                if (err1) {
                                    res.json({
                                        type: false
                                    });
                                } else {
                                    logger.info("Login API. Error case: ", err.message);
                                    res.json({
                                        "type": false,
                                        "Message": err.message,
                                    });

                                }
                            });

                        }
                    } else {
                        logger.info("Login API. Inside success case.");
                        req.user = user;
                        delete req.user.Password;
                        delete req.user.OldPasswords;
                        req.session.user = user;
                        res.locals.user = user;
                        if(trustedTicketRequest) {
                            console.log(ds_username,ds_server,clientIP);
                            getTrustedTicket(ds_username,ds_server,clientIP).then(function(ticket){
                                req.session.save(function (err, result) {
                                    if (err) {
                                        res.json({
                                            "type": false,
                                            "Message": "Login Again"
                                        });
                                    } else {
                                        dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Login", function (err, resp) {
                                            res.json({
                                                "type": true, 
                                                "User Details": user,
                                                "Security Group Details": securitygrp,
                                                "System Settings": systemSettings,
                                                "trustedTicket": ticket
                                            });
                                        });
                                    }
                                });
                            }).catch(function(err) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            });
                        } else {
                            req.session.save(function (err, result) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": "Login Again"
                                    });
                                } else {
                                    dbCmdAuditLogs.saveAuditLogs(req.sessionID, "Login", function (err, resp) {
                                        res.json({
                                            "type": true, 
                                            "User Details": user,
                                            "Security Group Details": securitygrp,
                                            "System Settings": systemSettings
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            });
        }
    });
});

function getTrustedTicket(username,target_site,client_ip){
    let postBody = {
        "username": username,
        "target_site": target_site,
        "client_ip": client_ip
    }
    const options = {
        hostname: 'datascape-qa.deltaglobalnetwork.com',
        path: '/trusted',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        timeout: 1000, // in ms
    }
    return new Promise((resolve, reject) => {
        const req = https.request(options, (apires) => {
            let chunks = [];
            console.log(apires.statusCode);
            apires.on("data", function (chunk) {
                chunks.push(chunk);
              });
            
            apires.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                resolve(body.toString());
            });
        })
        req.on('error', (err) => {
            reject(err)
        })
        req.on('timeout', () => {
            req.destroy()
            reject(new Error('Request time out'))
        })
        req.write(qs.stringify(postBody));
        req.end()
    })
}

module.exports = router;