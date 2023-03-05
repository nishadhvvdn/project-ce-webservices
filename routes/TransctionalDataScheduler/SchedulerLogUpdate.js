var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsTransactionScheduler.js');

router.post('/', function (req, res) {
    var input = req.body.TransactionDataResponse;
    var timeres = req.body.TimeStampResponse;

    if ((input.CellID == null) || (input.MessageID == null) || (timeres == null) || (input.Transformer.NoOfConnectedMeter == null)) {
        res.json({
            "Type": false,
            "Status": "Invalid Parameters"
        });
    } else {
        dbCmd.schedulerLogUpdate(input, timeres, function (err, output) {
            if (err) {
                res.json({
                    "Type": false,
                    "Message": err.message
                });
            } else {
                res.json({
                    "Type": true,
                    "output": output
                });
            }
        });
    }
});
module.exports = router;