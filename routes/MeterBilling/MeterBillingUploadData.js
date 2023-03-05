var express = require('express');
var router = express.Router();
var multer = require('multer');
var csvParser = require('./CSVParser.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var multerAzure = require('multer-azure');
var fileName;
var connectionString = process.env.BlobConnectionString;
var account = process.env.Account;
var key = process.env.BlobKey;
var container = process.env.BillContainer;
var path = require('path');

var upload = multer({
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.csv' || ext == '') {
            var err = {};
            err.message = "Only csv is allowed";
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
            var blobPath = generateFileName(req, file);//Calculate blobPath in your own way.
            callback(null, blobPath);
        }
    })
}).single('file');

function generateFileName(req, file) {
    filename = 'BillingReport' + (new Date).getTime() + '.csv';
    return filename;
}

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());

router.post('/', function (req, res) {
    try {
        upload(req, res, function (err, result) {
            if (err) {
                res.json({ "Message": 0, err_desc: err });
            } else {
                if (res.req.file != null || res.req.file != undefined) {
                    fileName = res.req.file.url;
                    csvParser.csvParser(fileName, function (err, result) {
                        if (err) {
                            res.json({
                                "type": false,
                                "errorCode": parseInt(err),
                                "Message": 1
                            });
                        } else {
                            res.json({
                                "type": true,
                                "errorCode": null,
                                "Message": 2
                            });
                        }
                    });
                } else {
                    res.json({
                        "type": false,
                        "Message": "Please add .csv file"
                    });
                }
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