var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommands');

router.post('/', function (req, res) {
    var name = req.body.configProgramName;
    var type = req.body.Type;

    if ((name == null) || (type == null)) {
        res.json({
            "type": false,
            "Status": "Invalid Parameters"
        });
    } else {
        dbCmd.configProgramEdit(name, type, function (err, docs) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message,
                });
            } else {
                res.json({
                    "type": true,
                    "Docs": docs,
                });
            }
        });
    }
});

module.exports = router;