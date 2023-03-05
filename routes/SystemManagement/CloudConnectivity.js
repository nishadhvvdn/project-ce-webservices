var express = require('express');
var router = express.Router();
var multer = require('multer');
var app = express();
var multerAzure = require('multer-azure');
var bodyParser = require('body-parser');
var path = require('path');
var dbCmdConfig = require('../../data/dbCommandsConfig.js');
var dbCmd = require('../../data/dbConfig.js');
var sendtoiot = require('../../data/sendToiot.js');
var filename = null;
var connectionString = process.env.BlobConnectionString;
var account = process.env.Account;
var key = process.env.BlobKey;
var container = process.env.FwContainer;
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var upload = multer({
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.pem') {
            var err = {};
            err.message = "Only .pem is allowed";
            return callback(err, null)
        }
        callback(null, true)
    },

    storage: multerAzure({
        connectionString: connectionString,
        account: account,
        key: key,
        container: container,
        blobPathResolver: function (req, file, callback) {
            var blobPath = generateFileName(req, file);//Calculate blobPath in your own way.
            callback(null, blobPath);
        }
    })
}).single('FileBinary');

function generateFileName(req, file) {
    filename = file.originalname;
    return filename;
}

router.post('/', function (req, res) {
    var deviceId = req.query.DeviceId;
    deviceId = parseInt(deviceId);
    var Hostname = req.query.Hostname;
    var SAK = req.query.SAK;
    upload(req, res, function (err, result) {
        if (err) {
            res.json({
                "type": false,
                "Message": err.message
            });
        } else if (req.fileValidationError) {
            res.json({
                "type": false,
                "Message": req.fileValidationError
            });
        }
        else if (!req.file) {
            res.json({
                "type": false,
                "Message": "Please add .pem file"
            });
        }
        else if (err instanceof multer.MulterError) {
            res.json({
                "type": false,
                "Message": err
            });
        } else {
            if (filename) {
                var cerName = encodeURIComponent(filename.trim());

                var url = "https://" + account + ".blob.core.windows.net/" + container + "/" + cerName;
                dbCmdConfig.createCloudConnectivityJobs(deviceId, function (err, result) {
                    result = result[0];
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message,
                        });
                    } else {
                        if (result) {
                            if (!result.MessageID) {
                                result.MessageID = 0;
                            } else if (result.MessageID === 255) {
                                result.MessageID = 0;
                            } else {
                                result.MessageID++;
                            }
                            var rev = 0;
                            result["rev"] = rev;

                            var Action = "Cloud_Connectivity";
                            var Attribute = 'HS_Connectivity';
                            var purpose = "Cloud_Connectivity";
                            var data = {
                                "action": Action,
                                "attribute": Attribute,
                                "rev": result.rev,
                                "messageid": result.MessageID,
                                "countrycode": result.CountryCode,
                                "regioncode": result.RegionCode,
                                "cellid": result.CELLID,
                                "meterid": 0,
                                "deviceID": result.DeviceID,
                                "url": url,
                                "hostname": Hostname,
                                "SAK": SAK,
                                "Purpose": purpose
                            }
                            data.config_time = parseInt(Date.now() / 1000);

                            sendtoiot.checkDeviceConnectionState(result.DeviceID, function (err, status) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": "Someting went wrong"
                                    });
                                } else {
                                    console.log("status", status)
                                    if (status == 'Connected') {
                                        dbCmd.onConnectivityConfig(data, result.JobID, function (err, resp) {
                                            if (err) {
                                                res.json({
                                                    "type": false,
                                                    "Message": "Someting went wrong"
                                                });
                                            } else {
                                                if (resp == "Success") {
                                                    dbCmdConfig.updateCloudConnectivity(deviceId, url, data.config_time, function (err, result) {
                                                        if (err) {
                                                            res.json({
                                                                "type": false,
                                                                "Message": "Someting went wrong"
                                                            });
                                                        } else {
                                                            res.json({
                                                                "type": true,
                                                                "Message": "Updated Cloud Connectivity Settings"
                                                            });
                                                        }
                                                    });
                                                } else if (resp == "Failure") {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "Failure Response from Device"
                                                    });
                                                } else {
                                                    res.json({
                                                        "type": true,
                                                        "Message": "No Response From Device"
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        // res.json({
                                        //     "type": false,
                                        //     "Message": "Device Not Connected"
                                        // });
                                        let config_time = parseInt(Date.now() / 1000);
                                        dbCmdConfig.updateCloudConnectivity(deviceId, url, config_time, function (err, result) {
                                            if (err) {
                                                res.json({
                                                    "type": false,
                                                    "Message": "Someting went wrong"
                                                });
                                            } else {
                                                res.json({
                                                    "type": true,
                                                    "Message": "Updated Cloud Connectivity Settings But Device Not Connected!!"
                                                });
                                            }
                                        });
                                    }
                                }
                            });

                        } else {
                            let config_time = parseInt(Date.now() / 1000);
                            dbCmdConfig.updateCloudConnectivity(deviceId, url, config_time, function (err, result) {
                                if (err) {
                                    res.json({
                                        "type": false,
                                        "Message": "Someting went wrong"
                                    });
                                } else {
                                    res.json({
                                        "type": true,
                                        "Message": "Updated Cloud Connectivity Settings"
                                    });
                                }
                            });
                        }
                    }

                });
            } else {
                res.json({
                    "type": false,
                    "Message": "Please add .pem file"
                });
            }
        }
    });


});

module.exports = router;