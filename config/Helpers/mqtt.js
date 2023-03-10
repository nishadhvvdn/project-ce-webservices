const mqtt = require('mqtt');
const { DATE } = require('sequelize');
const https = require('https');
var dbCon = require('../../data/dbConnection.js');

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

const topicToSubscribe= [`alarms/transformer/${process.env.TENANT_NAME}`,`alarms/meter/${process.env.TENANT_NAME}`]
client.on('connect', () => {
    console.log(`Mqtt server Connected`)
})

client.on('error', (error) => {
    console.log(`Mqtt Cannot connect:`, error)
})
// client.on('reconnect', (error) => {
//     console.log("Mqtt Reconnecting..")
// })


//Subscribe a Topic and Message from the IOT Receiver
client.subscribe(topicToSubscribe, () => {
    console.log("Topic subscribed");
})

// Message Lisetener
client.on('message', async (topicToSubscribe, payload) => {
    let messageData=JSON.parse(payload)
    messageData.recipient='Ce-Webservice'
    await saveMessage(messageData)
    if(messageData.severity=='Critical')
    {
        await sendSmsHighAlert(messageData);
    }
})

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




