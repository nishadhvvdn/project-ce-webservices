module.exports = {
    config: {
        "Passwords": {
            "ConnectDisconnectPassword": process.env.ConnectDisconnectPassword
        },
        "JWTAccessToken": {
            "SecretKey": process.env.SecretKey,
            "ExpiryTime": process.env.ExpiryTime
        }
    }
}