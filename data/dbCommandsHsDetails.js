var dbCon = require('./dbConnection.js');
var crypto = require('crypto');
var algorithm = 'aes256';


function fetchHsDetails(ConsumerID, callback) {

    try {
        dbCon.getDb(function (err, db) {
            if (err) {
                let errordata = { message: "Database error occured", responseCode: "300" }
                callback(errordata, null);
            }
            else {
                let hsCollection = db.delta_Hypersprouts;
                let configCollection = db.delta_Config;
                let meterCollection = db.delta_Meters
                meterCollection.find({ "Meters_Billing.MeterConsumerNumber": ConsumerID }).toArray(function (err, meterDetails) {
                    if (err) {
                        let data = { message: "Database error occured", responseCode: "300" }
                        callback(data, null);
                    } else {
                        if (meterDetails.length) {
                            let hypersproutId = meterDetails[0].TransformerID;
                            hsCollection.find({ "HypersproutID": hypersproutId, "IsHyperHub": false }).toArray(function (err, res) {
                                if (err) {
                                    let data = { message: "Database error occured", responseCode: "300" }
                                    callback(data, null);
                                } else {
                                    if (res.length) {
                                        let mac = res[0].Hypersprout_Communications.MAC_ID_MESH02 ? res[0].Hypersprout_Communications.MAC_ID_MESH02 : "";
                                        configCollection.find({ "HypersproutID": hypersproutId }).toArray(function (err, configDetails) {
                                            if (err) {
                                                let data = { message: "Database error occured", responseCode: "300" }
                                                callback(data, null);
                                            }
                                            else if (configDetails.length) {
                                                let channel = configDetails[0]['FrontHaul']['Radio_Configuration']['five_high']['channel'] ? configDetails[0]['FrontHaul']['Radio_Configuration']['five_high']['channel'] : "";
                                                let meshid = configDetails[0]['FrontHaul']['Mesh_Configuration']['five_high']['meshID'] ? configDetails[0]['FrontHaul']['Mesh_Configuration']['five_high']['meshID'] : "";
                                                let security = configDetails[0]['FrontHaul']['Mesh_Configuration']['five_high']['securityType'] ? configDetails[0]['FrontHaul']['Mesh_Configuration']['five_high']['securityType'] : "";

                                                if (security.toUpperCase() == 'OPEN')
                                                    security = 'none';
                                                else if (security.toUpperCase() == 'SAE')
                                                    security = 'sae';

                                                let psk = configDetails[0]['FrontHaul']['Mesh_Configuration']['five_high']['PSK'] ? configDetails[0]['FrontHaul']['Mesh_Configuration']['five_high']['PSK'] : "";
                                                let encryptDataArr = { meshid: meshid, mac: mac, security: security, channel: channel.toString(), psk: psk };
                                                encryptHsDetails(encryptDataArr, function (err, result) {
                                                    callback(null, result);
                                                });
                                            } else {
                                                let data = { message: "Configurations not available for HS and Meter", responseCode: "317" };
                                                callback(data, null);
                                            }
                                        });
                                    } else {
                                        let data = { message: "Hypersprout not available", responseCode: "316" };
                                        callback(data, null);
                                    }
                                }
                            });
                        } else {
                            let data = { message: "Meter attached to the consumer not found", responseCode: "314" }
                            callback(data, null);
                        }
                    }
                });
            }
        });
    } catch (e) {
        let data = { message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" };
        callback(data, null);
    }

}

function encryptData(text) {
    var key = "FiugQTgPNwCWUYIVhfmM4cKXTLVFvHFe";
    var cipher = crypto.createCipheriv(algorithm, key, 'RandomInitVector');
    return cipher.update(text, 'utf8', 'Base64') + cipher.final('Base64');
}

function encryptHsDetails(encryptDataArr, callback) {
    var encryptedText;
    var count = 1;
    for (var i in encryptDataArr) {
        if (encryptDataArr[i] && encryptDataArr[i] != "" && encryptDataArr[i] != undefined && encryptDataArr[i] != null && encryptDataArr[i] != 'null') {
            encryptedText = encryptData(encryptDataArr[i]);
            encryptDataArr[i] = encryptedText;
        } else {
            encryptDataArr[i] = encryptDataArr[i];
        }

        if (count == 5) {
            encryptDataArr['key'] = "FiugQTgPNwCWUYIVhfmM4cKXTLVFvHFe";
            encryptDataArr['iv'] = "RandomInitVector";
            let result = { data: encryptDataArr, message: "HS details successfully fetched", responseCode: "200" };
            callback(null, result);
        }
        count++;
    }
}

module.exports = {
    encryptData: encryptData,
    fetchHsDetails: fetchHsDetails
}