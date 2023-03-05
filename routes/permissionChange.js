var dbCon = require('../data/dbConnection.js');

/* middleware for user permission changes Added by Bala*/ 

module.exports = (req, res, next) => {

    dbCon.getDb(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            var userCollection = db.delta_User;

            userCollection.find({ UserID: req.session.user.UserID }).toArray( function (err, response) {

            if (err || !response) {
                callback(new Error("Login First"), null);
            } else{

                if(response[0].permissionChange){

                    userCollection.update({ UserID: response[0].UserID }, { $set: {permissionChange: false} }, function (err, results) {

                        console.log('update done')
            
                            if (err || !results) {
                                callback(new Error("Login First"), null);
                            }
                            else{
                                res.clearCookie('connect.sid', { expires: new Date(), path: '/' });
                                res.json({
                                     "type": false,
                                    "Message": "Login First"
                                 });
                            }
                        })   
                }
                else{
                    return next()
                }
            }
            })

        }
    });

}


