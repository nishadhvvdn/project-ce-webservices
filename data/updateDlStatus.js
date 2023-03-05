var dbCon = require('./dbConnection.js');
var FCM = require('./fcmIntialize');



function updateDlStatus(MeterID, MACID, ReadTimestamp, Status, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        } else {
            let deltalinkCollection = db.delta_DeltaLink;
            let meterCollection = db.delta_Meters;
            let notificationCollection = db.delta_Notification;
            let userCollection = db.delta_User;
            let tokenCollection = db.delta_token;
            deltalinkCollection.find({ "DeltaLinks_Communications.MAC_ID_WiFi": MACID }).toArray(function (err, deltalinkDetails) {
                if (err) {
                    callback(err, null);
                } else {
                    if (deltalinkDetails.length > 0) {
                        deltalinkCollection.update({ "DeltaLinks_Communications.MAC_ID_WiFi": MACID }, { "$set": { "ConnectionStatus": Status, "ConnectionStatusTimestamp": ReadTimestamp } }, function (err, insertResponse) {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                if (deltalinkDetails[0].MeterID == null || deltalinkDetails[0].MeterID == "null") {
                                    console.log("Notification not sent !!")
                                } else {
                                    let condition = { "MeterID": deltalinkDetails[0].MeterID }
                                    meterCollection.find(condition).toArray(function (err, meterDetails) {
                                        if (err) {
                                            console.log("Notification not sent !!", err)
                                        } else {
                                            if (meterDetails.length > 0) {
                                                let condition = { "UserID": meterDetails[0].Meters_Billing["MeterConsumerNumber"] }
                                                userCollection.find(condition).toArray(function (err, userDetails) {
                                                    if (err) {
                                                        console.log("Notification not sent !!", err)
                                                    } else {
                                                        if (userDetails.length > 0) {
                                                            tokenCollection.find(condition).toArray(function (err, tokenDetails) {
                                                                if (tokenDetails.length > 0) {
                                                                    let count = 0;
                                                                    tokenDetails.forEach(function (tokenDetail) {
                                                                        if (tokenDetail.DeviceType == "iOS") {
                                                                            let bodyMessage;
                                                                            let title;
                                                                            let ID;
                                                                            let notification = {};
                                                                            notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                                                                            notification.badge = 3;
                                                                            notification.sound = "ping.aiff";
                                                                            if (tokenDetail.DeviceLang == "SPA") {
                                                                                if (Status == 0 || Status == "0") {
                                                                                    title = "¡Dispositivo fuera de línea!";
                                                                                    bodyMessage = "El dispositivo está fuera de línea";
                                                                                    notification.alert = {
                                                                                        title: '¡Dispositivo fuera de línea!',
                                                                                        body: "El dispositivo está fuera de línea"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'El dispositivo está fuera de línea' };
                                                                                    ID = 3;
                                                                                } else if (Status == 1 || Status == "1") {
                                                                                    title = "¡Dispositivo en línea!";
                                                                                    bodyMessage = "El dispositivo está en línea";
                                                                                    notification.alert = {
                                                                                        title: '¡Dispositivo en línea!',
                                                                                        body: "El dispositivo está en línea"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'El dispositivo está en línea' };
                                                                                    ID = 2;
                                                                                } else {
                                                                                    title = "¡Dispositivo fuera de línea!"
                                                                                    bodyMessage = "El dispositivo está fuera de línea"
                                                                                    notification.alert = {
                                                                                        title: '¡Dispositivo fuera de línea!',
                                                                                        body: "El dispositivo está fuera de línea"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'El dispositivo está fuera de línea' };
                                                                                    ID = 3;
                                                                                }
                                                                            } else {
                                                                                if (Status == 0 || Status == "0") {
                                                                                    title = "Device Offline!";
                                                                                    bodyMessage = "Device is offline";
                                                                                    notification.alert = {
                                                                                        title: 'Device Offline!',
                                                                                        body: "Device is offline"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'Device is offline' };
                                                                                    ID = 3;
                                                                                } else if (Status == 1 || Status == "1") {
                                                                                    title = "Device Online!";
                                                                                    bodyMessage = "Device is online";
                                                                                    notification.alert = {
                                                                                        title: 'Device Online!',
                                                                                        body: "Device is online"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'Device is online' };
                                                                                    ID = 2;
                                                                                } else {
                                                                                    title = "Device Offline!"
                                                                                    bodyMessage = "Device is offline"
                                                                                    notification.alert = {
                                                                                        title: 'Device Offline!',
                                                                                        body: "Device is offline"
                                                                                    }
                                                                                    notification.payload = { 'Message': 'Device is offline' };
                                                                                    ID = 3;
                                                                                }
                                                                            }
                                                                            var Tokens = tokenDetail.DeviceToken;

                                                                            FCM.sendNotificationAPN(notification, Tokens, function (err, response) {
                                                                                if (err) {
                                                                                    console.log("error in push notification ", err)
                                                                                } else {
                                                                                    count = count + 1;
                                                                                    if (count == 1) {
                                                                                        let insertData = {
                                                                                            "UserID": tokenDetail.UserID,
                                                                                            "CreatedDateTimestamp": new Date(),
                                                                                            "ID": ID,
                                                                                            "title": title,
                                                                                            "body": bodyMessage,

                                                                                        }
                                                                                        notificationCollection.insert(insertData, function (err, result) {
                                                                                            if (err) {
                                                                                                console.log("Notification sent successfully but error in saving the notification!! ", err)
                                                                                            }
                                                                                            else {
                                                                                                console.log("Notification sent successfully!!")
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }
                                                                            });
                                                                        } else {
                                                                            let bodyMessage;
                                                                            let title;
                                                                            let ID;
                                                                            if (Status == 0 || Status == "0") {
                                                                                title = "Device Offline!";
                                                                                bodyMessage = "Device is offline";
                                                                                ID = 3;
                                                                            } else if (Status == 1 || Status == "1") {
                                                                                title = "Device Online!";
                                                                                bodyMessage = "Device is online";
                                                                                ID = 2;
                                                                            } else {
                                                                                title = "Device Offline!"
                                                                                bodyMessage = "Device is offline"
                                                                                ID = 3;
                                                                            }
                                                                            var Tokens = tokenDetail.DeviceToken;
                                                                            let tagrandom = "AndroidTag" + new Date().toISOString();
                                                                            var message = {
                                                                                data: {
                                                                                    title: title,
                                                                                    message: bodyMessage,
                                                                                    tag: tagrandom

                                                                                },
                                                                                notification: {
                                                                                    title: title,
                                                                                    body: bodyMessage
                                                                                }
                                                                            };
                                                                            FCM.sendNotification(message, Tokens, function (err, response) {
                                                                                if (err) {
                                                                                    console.log("error in push notification ", err)
                                                                                } else {
                                                                                    count = count + 1;
                                                                                    if (count == 1) {
                                                                                        let insertData = {
                                                                                            "UserID": tokenDetail.UserID,
                                                                                            "CreatedDateTimestamp": new Date(),
                                                                                            "ID": ID,
                                                                                            "title": title,
                                                                                            "body": bodyMessage,

                                                                                        }
                                                                                        notificationCollection.insert(insertData, function (err, result) {
                                                                                            if (err) {
                                                                                                console.log("Notification sent successfully but error in saving the notification!! ", err)
                                                                                            }
                                                                                            else {
                                                                                                console.log("Notification sent successfully!!")
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    });

                                                                } else {
                                                                    console.log("Notification not sent !!")
                                                                }
                                                            });
                                                        } else {
                                                            console.log("Notification not sent !!")
                                                        }
                                                    }
                                                })
                                            } else {
                                                console.log("Notification not sent !!")

                                            }
                                        }
                                    })
                                }
                                callback(null, insertResponse);
                            }
                        });
                    } else {
                        callback("Deltalink Details not available in the system", null)
                    }
                }
            })

        }
    });
}

module.exports = {
    updateDlStatus: updateDlStatus
}