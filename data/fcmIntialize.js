
// push notification
var azure = require('azure-sb');

/**
* @description - /firebase communication messaging for android
* @params message, Tokens in array, callback 
* @return callback function
*/


function sendNotification(message, AndroidToken, callback) {
    //google communication messaging for android
    var hubname = process.env.pushHubname;
    var connectionstring = process.env.pushConnectionString;
    let project_id = process.env.project_id;
    try {
        var notificationHubService = azure.createNotificationHubService(hubname, connectionstring);
        var payload = {
            data: message.data
            //  notification: message.notification

        };
        //random tag just like userid
        let tag = "AndroidTag" + new Date().toISOString()+Math.floor(Math.random()*(new Date().getTime() / 1000));
        notificationHubService.gcm.createNativeRegistration(AndroidToken, tag, null, function (err, response) {
            if (err) {
                callback("error in push notification " + err, null)
            } else {
                notificationHubService.gcm.send(response.Tags, payload, function (error, res) {
                    if (error) {
                        console.log("Notification not sent !!" + error)
                        callback("Notification not sent !!" + error, null)
                    } else {
                        console.log(" Android Notification sent successfully!!")
                        callback(null, "Notification sent successfully!!")
                    }
                });
            }
        })
    } catch (e) {
        console.log("Error occured in Android Notification");
        console.log(e);
    }
}


/**
* @description - Apple Push Notification service for iOS
* @params notificationMessage, Token, callback 
* @return callback function
*/

function sendNotificationAPN(notificationMessage, Token, callback) {
    var hubname = process.env.pushHubname;
    var connectionstring = process.env.pushConnectionString;
    let BundleID = process.env.BundleID;
    try {
        var notificationHubService = azure.createNotificationHubService(hubname, connectionstring);

        //random tag just like userid
        let tag = "APNTag" + new Date().toISOString()+Math.floor(Math.random()*(new Date().getTime() / 1000));
        notificationHubService.apns.createNativeRegistration(Token, tag, null, function (err, response) {
            if (err) {
                callback("error in push notification " + err, null)
            } else {
                var payload = {
                    "aps": {
                        "alert": notificationMessage.alert,
                        "payload": notificationMessage.payload,
                        "sound": notificationMessage.sound,
                        "vibrate": "true",
                        "apns-priority": 5,
                        "badge": 0,
                        "content-available": 1
                    }
                };
                notificationHubService.apns.send(response.Tags, payload, function (error, result) {
                    if (!error) {
                        console.log(" APN Notification sent successfully!!", JSON.stringify(result))
                        callback(null, "Notification sent successfully!!")
                    } else {
                        console.log("Notification not sent !!" + error)
                        callback("Notification not sent !!" + error, null)
                    }
                });
            }
        });
    } catch (e) {
        console.log("Error occured in Notification");
        console.log(e)
    }

}

module.exports = {
    sendNotification: sendNotification,
    sendNotificationAPN: sendNotificationAPN
}
