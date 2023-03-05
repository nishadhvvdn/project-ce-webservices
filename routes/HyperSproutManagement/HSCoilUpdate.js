const redis = require('redis');
const dbCon = require('../../data/dbConnection.js');
const sToIOT = require('../../data/sendToiot.js');
const parser = require('../../data/parser.js');

//redis connection creation
const subscriber  = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST,
    { auth_pass: process.env.REDIS_PASS, tls: { servername: process.env.REDIS_HOST } });

//on subscription error
subscriber.on('error', (err) => console.log('Redis Client Error', err));

//on subscription recives message
subscriber.on("message", (channel, message) => {
    let coilDetails = JSON.parse(message);
    dbCon.getDb(async function (err, db) {
        if (err)
            console.log(err);
        else {
          //fetch all HS which has the coil linked
          let HSList = await db.delta_Hypersprouts.find({"Hypersprout_DeviceDetails.Coils._id":coilDetails["_id"]});
          HSList.forEach(HS => {
            // loop of HS fetched and payload creation
            let rev = 0;
            let countrycode = (HS.Hypersprout_DeviceDetails.CountryCode) ? HS.Hypersprout_DeviceDetails.CountryCode : 0;
            let regioncode = (HS.Hypersprout_DeviceDetails.RegionCode) ? HS.Hypersprout_DeviceDetails.RegionCode : 0;
            let messageid = 0;
            let cellid = (HS.HypersproutID) ? HS.HypersproutID : 0;
            // data set assignment for parsing
            let inputData = {
              "action": "COIL_UPDATE",
              "attribute": "COIL_DATA",
              "serialNumber": HS.HypersproutSerialNumber,
              "rev": rev,
              "messageid": messageid,
              "countrycode": countrycode,
              "regioncode": regioncode,
              "cellid": cellid,
              "deviceID": HS.DeviceID,
              "Purpose": "COIL_DATA",
              "parameter": "updateCoil",
              "coilData": {
                "multiplier" :  coilDetails.multiplier,
                "coilId": coilDetails["_id"]
              },
              "meterid" : 0
            }
            //convert the payload to hex
            parser.hexaCreation(inputData,function (err,response){
              if (err)
                console.log("hex error:: ",err);
              else {
                console.log(response);
                //push the hex to IoT
                sToIOT.sendToIOT(response, HS.DeviceID, function (err, resp) {
                    if (err) {
                        console.log('IoT error:: ',err)
                    } else {
                        console.log(resp);
                        console.log("Success");
                    }
                });
              }
            })
          }); 
        }
    });
  })

// subscription initiated 
subscriber.subscribe('coil-update-notification');