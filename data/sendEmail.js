var helper = require('sendgrid').mail;
var EmailFrom = process.env.EmailFrom;

/**
* @description - send New User Password By mail
* @params - emaiFrom, emailTo, emailSubject, emailContent, emailInitiator, callback
* @return callback function
*/
function sendNewUserPassword(emailTo, emailSubject, emailContent, emailInitiator, callback) {
    var from_email = new helper.Email(EmailFrom);
    var to_email = new helper.Email(emailTo);
    var subject = emailSubject;
    var content = new helper.Content("text/plain", emailContent);
    var mail = new helper.Mail(from_email, subject, to_email, content);

    if ((process.env.SENDGRID_API_KEY === undefined)) {
        callback(new Error("User Added, but Email couldn't be sent"), null);
    }

    var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function (error, response) {
        if ((response.statusCode === 421) || (response.statusCode === 450) || (response.statusCode === 451) ||
            (response.statusCode === 452)) {
            if (emailInitiator === "NewUser")
                return callback(null, "User Added, SendGrid will Retry sending mail upto 72 Hours");
            else if (emailInitiator === "Login")
                return callback(null, "User Login, SendGrid will Retry sending mail upto 72 Hours");
            else
                return callback(null, "Password Reseted, SendGrid will Retry sending mail upto 72 Hours");
        } else if ((response.statusCode === 200) || (response.statusCode === 202) || (response.statusCode === 250)) {
            return callback(null, "Success");
        } else {
            if (emailInitiator === "NewUser")
                return callback(new Error("User Added, but Email couldn't be sent"), null);
            else if (emailInitiator === "Login")
                return callback(null, "User Login, SendGrid will Retry sending mail upto 72 Hours");
            else
                return callback(new Error("Password Reseted, but Email couldn't be sent"), null);
        }
    });
}


/**
* @description - send New User OTP By mail
* @params - emaiFrom, emailTo, emailSubject, emailContent, emailInitiator, callback
* @return callback function
*/
function sendNewUserOTP(emaiFrom, emailTo, emailSubject, emailContent, emailInitiator, callback) {
    try {
        var from_email = new helper.Email(emaiFrom);
        var to_email = new helper.Email(emailTo);
        var subject = emailSubject;
        var content = new helper.Content("text/plain", emailContent);
        var mail = new helper.Mail(from_email, subject, to_email, content);
        let data;
        if ((process.env.SENDGRID_API_KEY === undefined)) {
            data = { message: "User Registered, but Email not sent. Please try again", responseCode: "310" }
            callback(data, null);
        }
        else {
            var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
            });

            sg.API(request, function (error, response) {
                if ((response.statusCode === 421) || (response.statusCode === 450) || (response.statusCode === 451) ||
                    (response.statusCode === 452)) {
                    if (emailInitiator === "NewUser") {
                        data = { message: "User Registered, SendGrid will Retry sending mail upto 72 Hours", responseCode: "311" }
                        return callback(null, data);
                    }
                    else {
                        data = { message: "OTP Reseted, SendGrid will Retry sending mail upto 72 Hours", responseCode: "311" }
                        return callback(null, data);
                    }
                } else if ((response.statusCode === 200) || (response.statusCode === 202) || (response.statusCode === 250)) {
                    data = { message: "Success", responseCode: "311" }
                    return callback(null, data);
                } else {
                    if (emailInitiator === "NewUser") {
                        data = { message: "User Registered, but Email not sent. Please try again", responseCode: "310" }
                        return callback(data, null);
                    }
                    else {
                        data = { message: "OTP Reseted, but Email not sent. Please try again", responseCode: "310" }
                        return callback(data, null);

                    }
                }
            });
        }
    } catch (e) {
        callback({ message: "Something went wrong : " + e.name + " " + e.message, responseCode: "315" }, null)
    }

}

module.exports = {
    sendNewUserPassword: sendNewUserPassword,
    sendNewUserOTP: sendNewUserOTP
};