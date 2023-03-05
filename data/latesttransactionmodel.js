var Sequelize = require("sequelize");

var objLatestTrans = {
    MeterID: { type: Sequelize.STRING(100), unique: 'uniqueSelectedItem' },
    //Meter_DeviceID: { type: Sequelize.STRING(100), unique: 'uniqueSelectedItem' },
    MeterLatitude: { type: Sequelize.DECIMAL(20, 7) },
    MeterLongitude: { type: Sequelize.DECIMAL(20, 7) },
    Meter_ReadTimestamp: { type: Sequelize.DATE, unique: 'uniqueSelectedItem' },
    Meter_ActiveReceivedCumulativeRate_Total: { type: Sequelize.DECIMAL(20) },
}

var objTableProps = {
    timestamps: true,
    freezeTableName: true,
    tableName: 'latesttransactions'
}

module.exports = {
    objLatestTrans: objLatestTrans,
    objTableProps: objTableProps
}