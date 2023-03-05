const mqtt = require('mqtt');
const { DATE } = require('sequelize');
const https = require('https');
const publishTopic = process.env.PUBLISH_TOPIC;
var dbCon = require('../../data/dbConnection.js');
//  After Discussion need to  update below array
const high = ['HighOilTemperature', 'MeterDisconnected', 'LongOutagedetection', 'VoltageSagLine1','TamperLid']
let severity_level;

const url = process.env.MQTT_URL;
const client = mqtt.connect(url, {
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 1000,
    protocolId: 'MQTT',
    clientId: process.env.MQTT_CLIENTID,
    keepalive: 60
});

const topic = process.env.RECEVING_TOPIC;
// client.on('connect', () => {
//     console.log(`Mqtt server Connected`)
// })
client.on('error', (error) => {
    console.log(`Mqtt Cannot connect:`, error)
})
// client.on('reconnect', (error) => {
//     console.log("Mqtt Reconnecting..")
// })

//Subscribe a Topic and Message from the IOT Receiver
client.subscribe(topic, () => {
    console.log("Topic subscribed");
})

// Message Lisetener
client.on('message', async (topic, payload) => {
    if(topic == 'iotalarms') {
        iotAlarmMessageHandler(payload);
    }
})

// Handle the response from iotalarms topic
async function iotAlarmMessageHandler(payload) {
    var obj = JSON.parse(payload.toString()); 
    // For Meter data
    if (obj.result.hasOwnProperty('meters')) {
        if (obj.result.meters.length > 0) {
            for (var i = 0; i < obj.result.meters.length; i++) {
                let meter = obj.result.meters[i]
                delete meter.DeviceID
                delete meter.Phase
                for (let key in meter) {
                    if (meter[key] == 1) {
                        let data = await formatIotAlertMessae(key);
                        publishMessage(publishTopic, data)
                    }
                }
            }
        }
    }
    // For Transformer Data
    if (obj.result.hasOwnProperty('Transformer')) {
        if (obj.result.Transformer.length > 0) {
            let Translen = obj.result.Transformer.length;
            for (var i = 0; i < Translen; i++) {
                let TransformerData = obj.result.Transformer[i]
                delete TransformerData.NoOfMeter
                delete TransformerData.Phase
                for (let key in TransformerData) {
                    if (TransformerData[key] == 1) {
                        let data = await formatIotAlertMessae(key);
                        publishMessage(publishTopic, data)
                    }
                }
            }
        }
    }
}

// Format the message to adapt schema and FE specs
function formatIotAlertMessae(message) {
    let is_high = false;
    if (high.includes(message)) {
        severity_level = "High";
        is_high = true;
    } else {
        severity_level = "Minor";
    }
    let messageType = message + " Alert";
    let data = {
        "reeipient": "Web Alerts",
        "message": messageType,
        "is_read": false,
        "sender": "IOT Receiver",
        "severity": severity_level,
        "date": new Date()
    }
    if(is_high) {
        sendSmsHighAlert(data);
    }
    return data;
}

//API call to send SMS for High alert messages
async function sendSmsHighAlert(data) {
    var postData = JSON.stringify({
        "sendMobile": "+918967452309",
        "message": data
    });
    const options = {
        hostname: 'admin-api.deltaglobalnetwork.com',
        path: '/sendSms',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 1000, // in ms
    }
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            return res.statusCode
        })
        req.on('error', (err) => {
            reject(err)
        })
        req.on('timeout', () => {
            req.destroy()
            reject(new Error('Request time out'))
        })
        req.write(postData);
        req.end()
    })
}

//Publish the topic and Alert Message to FE & store in DB
async function publishMessage(publishTopic, message) {
    await saveMessage(message);
    client.publish(publishTopic,JSON.stringify(message));
}

//Store it in DB
function saveMessage(data) {
    dbCon.getDb(function (err, db) {
        if (err)
            console.log(err)
        else {
            db.delta_messages.insertOne(data, function (err, res) {
                if (res !== null) {
                    console.log("Message Details Successfully Inserted!");
                    return true;
                }
            });
        }
    });
}




