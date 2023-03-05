var express = require('express');
var router = express.Router();
var dbCmd = require('../../data/dbCommandsDataRate');

router.get('/', function (req, res) {
    try {
        //get CircuitID and CircuitNumber
        dbCmd.selectAllUniqueCircuitIDs(function (err, CircuitDetails) {
            if (err) {
                res.json({
                    "type": false,
                    "Message": err.message != undefined ? err.message : err
                });
            } else {
                res.json({
                    "type": true,
                    "CircuitDetails": CircuitDetails
                });
            }
        });

    }
    catch (error) {
        res.json({
            "type": false,
            "Message": `Something went wrong : ${error.name} ${error.message}`
        })
    }
});

module.exports = router;