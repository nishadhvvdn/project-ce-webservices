const { SmsClient } = require('@azure/communication-sms');

const connectionString = process.env.AzureConnectionString;
// Instantiate the SMS client.
const smsClient = new SmsClient(connectionString);

async function sendSms(data, callback) {
  const sendResults = await smsClient.send({
    from: data.from,
    to: [data.to],
    message: data.message
  });
  for (const sendResult of sendResults) {
    if (sendResult.successful) {
      console.log("Success: ", sendResult);
      callback(null, "Success")
    } else {
      console.error("Something went wrong when trying to send this message: ", sendResult);
      callback("Something went wrong when trying to send this message",null)
    }
  }
}

module.exports = {
  sendSms: sendSms,
};