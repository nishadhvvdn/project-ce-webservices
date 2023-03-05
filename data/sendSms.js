
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

function sendSms(from, to, content, callback) {
    client.messages
        .create({
            body: content,
            from: from,
            to: to
        })
        .then(message => callback(null,"Success")).catch((error) => {callback(error.message, null) });

}

module.exports = {
    sendSms: sendSms,
};