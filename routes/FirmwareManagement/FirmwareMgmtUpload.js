var express = require('express');
var router = express.Router();
var multer = require('multer');
var app = express();
var multerAzure = require('multer-azure');
var bodyParser = require('body-parser');
var path = require('path');
var dbCmdFrm = require('../../data/dbCommandsFirmware');
var filename = null;
var connectionString = process.env.BlobConnectionString;
var account = process.env.Account;
var key = process.env.BlobKey;
var container = process.env.FwContainer;
const schemaValidation = require('../../config/Helpers/payloadValidation')
const schema = require('../../config/Helpers/FirmwareUploadSchema.js')

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var upload = multer({
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.zip') {
            var err = {};
            err.message = "Only zip is allowed";
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
            var DeviceType = req.query.DeviceType;
            var Fid = req.query.FId
            var blobPath = generateFileName(req, file);//Calculate blobPath in your own way.
            blobPath = DeviceType + '/' + Fid + '/' + blobPath;
            callback(null, blobPath);
        }
    })
}).single('FirmwareBinary');

function generateFileName(req, file) {
    filename = file.originalname;
    return filename;
}


router.post('/', function (req, res) {
    try {
        var DeviceType = req.query.DeviceType;
        var data = { DeviceType }
        const FirmwareUploadSchema = schema.FirmwareUploadSchema;

        schemaValidation.validateSchema(data, FirmwareUploadSchema, function (err, result) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": "Invalid Request, Please try again after some time !!",
                    "PayloadErrors": err
                });
            } else {
                dbCmdFrm.fetchFirmwareID(function (err, FId) {
                    if (err) {
                        res.json({
                            "type": false,
                            "Message": err.message != undefined ? err.message : err,
                        });
                    } else {
                        req.query.FId = FId;
                        upload(req, res, function (err, result) {
                            if (err) {
                                res.json({
                                    "type": false,
                                    "Message": err
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
                                    "Message": "Please add .zip file"
                                });
                            }
                            else if (err instanceof multer.MulterError) {
                                res.json({
                                    "type": false,
                                    "Message": err
                                });
                            }else {
                                if (filename != null) {
                                    var FirmwareName = encodeURIComponent(filename.trim());
                                    var url = "https://" + account + ".blob.core.windows.net/" + container + "/" + DeviceType + "/" + FId + "/" + FirmwareName;
                                    dbCmdFrm.createFirmwareManagement(DeviceType, FirmwareName, url, function (err, data) {
                                        if (err) {
                                            res.json({
                                                "type": false,
                                                "Message": err.message != undefined ? err.message : err,
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
        });
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;