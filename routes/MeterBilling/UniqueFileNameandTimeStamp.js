var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsMeterBilling.js');

router.post('/', function (req, res) {
    try {
        var startDate = req.body.StartDate;
        if(startDate == null || startDate == 'null'){
            res.json({
                "type": false,
                "Message": "Invalid Request, Please try again after some time !!"
            });
        }else{
            dbCmd.getFileNameandTimeStamp(startDate, function (err, meterBillingDetails) {
                if (err) {
                    res.json({
                        "type": false,
                        "Message": err
                    });
                } else {
                    res.json({
                        "type": true,
                        "Details": meterBillingDetails
                    });
                }
            });
        }
    } catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;