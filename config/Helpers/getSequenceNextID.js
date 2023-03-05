var dbCon = require('../../data/dbConnection.js');

function getValueForNextSequenceItem(sequenceOfName , DeviceType, callbackEach) {
    dbCon.getDb(function (err, db) {
        if (err)
           callbackEach(err, null, null);
        else {
            var CName;
            switch (DeviceType) {
                case "Meter":
                    CName = db.delta_Meters_idCount_increment;
                    break;
                case "Transformer":
                    CName = db.delta_Transformer_HH_idCount_increment;
                    break;
                case "HyperHub":
                    CName = db.delta_Transformer_HH_idCount_increment;
                    break;
                case "Circuit":
                    CName = db.delta_Circuit_idCount_increment;
                    break;
                case "DeltaLink":
                    CName = db.delta_DeltaLink_idCount_increment;
                    break;
                case "Endpoint":
                    CName = db.delta_Endpoint_idCount_increment;
                    break;
                case "TechnicalItem":
                    CName = db.delta_Transformer_Tech_Item_idCount_increment;
                    break;
                default:
                    callbackEach('Invalid Device', null);
            }
            //Case  : With New Entries
            CName.findAndModify(
                { "_id": sequenceOfName },
                [['_id', 'asc']],
                { $inc: { "sequence_value": 1 } },
                { new: true, upsert: true },
                function (err, doc) {
                    if(err){
                        callbackEach(err, null)
                    }else{
                       callbackEach(null, doc.value.sequence_value)
                    }
                    
                }
            );
        }
    });
  
}

//getValueForNextSequenceItem("item_id")

module.exports = {
    getValueForNextSequenceItem: getValueForNextSequenceItem
}