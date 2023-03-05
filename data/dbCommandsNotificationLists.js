//REQUIRED PACKAGES AND FILES.
var dbCon = require('./dbConnection.js');
const paginatedResults = require('../config/Helpers/Pagination')



/**
* @description - For the Webservice - MobileApp - Get Notification Lists     Desc - get otification Lists by  ConsumerId IN MONGODB   
* @params consumerDetails i.e ConsumerID, Page, Limit callback
* @return callback function
*/
function getNotificationLists(consumerDetails, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            let errordata = { message: "Database error occured", responseCode: "300" }
            callback(errordata, null);
        }
        else
            getNotificationListsFromMongoDB(db.delta_Notification, consumerDetails, callback);
    });
};



/**
* @description -   For the Webservice - MobileApp - Get Notification Lists     Desc - Get Notification Lists by  ConsumerId IN MONGODB  
* @param , notificationCollection, consumerDetails(Page, Limit, ConsumerID) callback
* @return callback function
*/

function getNotificationListsFromMongoDB(notificationCollection, consumerDetails, callback) {
    try {
        notificationCollection.find({ "UserID": consumerDetails.ConsumerID }).toArray(function (err, result) {
            if (err) {
                data = { message: "Database error occured", responseCode: "300" }
                callback(data, null);
            }
            else {
                if (result.length > 0) {
                    let whereCondition = { "UserID": consumerDetails.ConsumerID };
                    paginatedResults.paginatedResultsSort(notificationCollection, whereCondition, consumerDetails, "Notification", "CreatedDateTimestamp", function (err, notificationDetails) {
                        if (err) {
                            data = { message: err, responseCode: "323" }
                            callback(data, null)
                        }
                        else {
                            data = { data: notificationDetails, message: "Sent Notifications Successfully Fetched", responseCode: "200" }
                            callback(null, data)
                        }
                    })
                } else {
                    data = { message: "Notification Details not available in the System", responseCode: "306" }
                    callback(data, null)

                }
            }
        })
    } catch (e) {
        callback({ message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" }, null)
    }
}


module.exports = {
    getNotificationLists: getNotificationLists
}