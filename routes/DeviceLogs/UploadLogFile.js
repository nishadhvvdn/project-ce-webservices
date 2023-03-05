var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var multerAzure = require('multer-azure');
var path = require('path');
const dbCmd = require('../../data/dbCommandsDeviceLogs.js');
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/deviceLogSchema')
var connectionString = process.env.BlobConnectionString;
var account = process.env.Account;
var key = process.env.BlobKey;
var container = process.env.DeviceLogContainer;
var filename;
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var upload = multer({
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.zip' || ext == '') {
            var err = {};
            err.message = "Only zip is allowed";
            return callback(err, null)
        } else if (/\s/.test(file.originalname)) {
            var err = {};
            err.message = "file name having space is not allowed, Try to rename the fileName !!";
            return callback(err, null)

        } else {
            //some condition
            callback(null, true)
        }
        callback(null, true)
    },
    storage: multerAzure({
        connectionString: connectionString,
        account: account,
        key: key,
        container: container,
        blobPathResolver: function (req, file, callback) {
            var deviceType = req.query.DeviceType;
            var deviceId = req.query.DeviceId;
            var logID = req.query.LogID
            var blobPath = generateFileName(req, file);//Calculate blobPath in your own way.
            blobPath = "deviceLogs" + '/' + deviceType + '/' + deviceId + '/' + logID + '/' + blobPath;
            callback(null, blobPath);
        }
    })
}).single('DeviceLogBinary');

function generateFileName(req, file) {
    filename = file.originalname;
    return filename;
}
router.post('/', function (req, res) {
    try {
        var DeviceType = req.query.DeviceType;
        var DeviceId = parseInt(req.query.DeviceId);
        var data = { DeviceType, DeviceId }
        const DeviceLogUploadFileSchema = schema.DeviceLogUploadFile;

        schemaValidation.validateSchema(data, DeviceLogUploadFileSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors":err
                });
            } else {
                dbCmd.fetchLogID(function (err, logID) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message
                        });
                    } else {
                        req.query.LogID = logID;
                        upload(req, res, function (err, result) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err.message
                                });
                            } else {
                                if (filename != null) {
                                    var fileName = encodeURIComponent(filename.trim());
                                    var deviceType = req.query.DeviceType;
                                    var deviceId = parseInt(req.query.DeviceId);
                                    var blobPath = "deviceLogs" + '/' + deviceType + '/' + deviceId + '/' + logID + '/' + fileName;
                                    var url = "https://" + account + ".blob.core.windows.net/" + container + "/" + blobPath;
                                    dbCmd.createDeviceLogs(deviceId, deviceType, fileName, url, function (err, data) {
                                        if (err) {
                                            res.json({
                                                "type": false,
                                                "Message": err.message,
                                            });
                                        } else {
                                            res.json({
                                                "type": true,
                                                "Message": data,
                                            });
                                        }
                                    });

                                } else {
                                    res.json({
                                        "type": false,
                                        "Message": "Please add .zip file"
                                    });
                                }

                            }

                        });
                    }
                });
            }
        })

    } catch (e) {
        res.json({
            "type": false,
            "Message": "Something went wrong : " + e.name + " " + e.message
        });
    }
});

module.exports = router;