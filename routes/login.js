var express = require('express');
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
                });
            });
        }
    });
});

module.exports = router;