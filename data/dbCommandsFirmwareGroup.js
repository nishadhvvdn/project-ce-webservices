var dbCon = require('./dbConnection.js');

/**
* @description - get Collection from MONGODB on the  delta_AppGroups collection
* @param type - data
* @param DeviceType  - DeviceType
* @param callback - callback function returns success or error response
* @return callback function
*/

function FirmwareGroupListsDetails(data, callback) {
    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null)
        }
        else {
            let appGroupCollection = db.delta_AppGroups;
            getFirmwareGroupListsFromMongoDB(appGroupCollection, data, callback)
        }
    })
}



/**
* @description For the Webservice - DisplayFirmwareGroupLists
* @param type - data
* @param DeviceType  - DeviceType
* @param appGroupCollection,
* Finding FirmwareGroupLists via a "HyperSprout", "HyperHub", "Meter", "DeltaLink"
* @return callback function
*/


function getFirmwareGroupListsFromMongoDB(appGroupCollection, data, callback) {
    try {
        appGroupCollection.find({ Type: data.DeviceType }).project({ _id: 0, GroupID: 1, GroupName: 1, Type: 1 }).toArray((err, FirmwareGroupLists) => {
            if (err) {
                callback(err, null)
            }
            else {
                if (FirmwareGroupLists.length > 0) {
                    callback(null, FirmwareGroupLists)

                } else {
                    callback("Firmware Group Name not available in the system", null)
                }
            }
        })
    }
    catch (e) {
        callback("Something went wrong : " + e.name + " " + e.message, null)
    }
}

module.exports = {
    FirmwareGroupListsDetails: FirmwareGroupListsDetails
}
