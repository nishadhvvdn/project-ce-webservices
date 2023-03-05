var Converter = require("csvtojson");
var dbCmd = require('../../data/dbCommandsMeterBilling.js');
var csvToJson = require("csv-to-json");
const request=require('request');
var csvjson = require('csvjson');

function csvParser(fileName, callback) {
    try {
        request.get(fileName, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var csv = body;
                const jsonObj = csvjson.toObject(csv);
                dbCmd.MeterBillingInsert(fileName, jsonObj, function (err, meterBillingInsert) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, meterBillingInsert);
                    }
                });
            }else if(error){
                return callback(err, null);
            }
        });
    } catch (error) {
        callback(`Something went wrong : ${error.name} ${error.message}`, null);
    }
}

module.exports = {
    csvParser: csvParser
}