var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/ConfigProgramsEdit', function () {
    this.timeout(15000);
    before(function (done) {
        objSession.initSession(function (objSessionData) {
            testSession = objSessionData;
            setTimeout(done, 1500);
        })
    });

    after(function () {
        objSession.destroySession(testSession) 
    });

    it('Test Case - 1', function (done) {
        testSession.post('/ConfUploadConfigProgram')
            .send({
                "configProgramName": "HSUnitTestConfigProgram",
                "configProgramDetails": { "Energy": "Wh delivered", "Demand": "Max W delivered", "DemandIntervalLength": 15, "NumberofSubIntervals": 5, "ColdLoadPickupTime": 15, "PowerOutageRecognitionTime": 45, "TestModeDemandIntervalLength": "Quantity1", "NumberofTestModeSubintervals": "Quantity2", "TimetoremaininTestMode": 20, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity3": "Wh delivered", "Quantity4": "Wh delivered", "IntervalLength": 60, "OutageLength": 15, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 4, "PulseWeight1": 20, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "CTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "EnableVoltageMonitor": false, "PhaseSelection": "Phase B", "IntervalLengthVoltage": "5 minutes", "RMSVoltLoadThreshold": 20, "RMSVoltHighThreshold": 30, "LowVoltageThreshold": 40, "LowVoltageThresholdDeviation": 30, "HighVoltageThresholdDeviation": 40, "LinkFailure": true, "LinkMetric": true, "InterrogationSendSucceeded": false, "SendResponseFailed": true, "DeregistrationResult": true, "ReceivedMessageFrom": false, "DataVineHyperSproutChange": true, "DataVineSyncFatherChange": true, "ZigbeeSETunnelingMessage": true, "ZigbeeSimpleMeteringMessage": false, "TableSendRequestFailed": true },
                "Description": "Unit Testing",
                "Type": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.Status).to.equal("Group Added into the System");
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        //.expect(200, done);
        setTimeout(done, 1500);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/ConfUploadConfigProgram')
            .send({
                "configProgramName": "MeterUnitTestConfigProgram",
                "configProgramDetails": { "Energy1": "Wh delivered", "Energy2": "Wh delivered", "Energy3": "Wh delivered", "Energy4": "Wh delivered", "Demand": "Max VA received Arith", "LoadControlDisconnectThreshold": "Disabled", "ReconnectMethod": "Option3", "DemandIntervalLength": 15, "NumberofSubIntervals": 5, "ColdLoadPickupTimes": 30, "PowerOutageRecognitionTime": 45, "TestModeDemandIntervalLength": "Quantity1", "NumberofTestModeSubintervals": "Quantity2", "TimetoremaininTestMode": 20, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity": "Wh delivered", "Quantity4": "Wh delivered", "LoadProfileIntervalLength": 2, "OutageLength": 30, "IntervalLength": 60, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 40, "PulseWeight1": 20, "EnableVoltageMonitor": 1, "PhaseSelection": "Phase A", "VoltageMointorIntervalLength": "1 minute", "RMSVoltLoadThreshold": 230, "RMSVoltHighThreshold": 230, "LowVoltageThreshold": 230, "LowVoltageThresholdDeviation": 230, "HighVoltageThresholdDeviation": 230, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "OTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "LockoutLoginattemptsOptical": 1, "LockoutLogoutminutesOptical": 1, "LockoutLoginattemptsLAN": 1, "LockoutLogoutminutesLAN": 1, "ConsecutiveLAN": 1, "LanLinkMetric": 1 },
                "Description": "Unit Testing",
                "Type": "Meter"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.Status).to.equal("Group Added into the System");
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        //.expect(200, done);
        setTimeout(done, 1500);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/ConfigProgramsEdit')
            .send({ "configProgramName": "HSUnitTestConfigProgram", "Type": "HyperSprout" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.Docs).not.to.equal(null);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        //     .expect(200, done);
        // if (!module.parent) {
        //     app.listen(3001);
        // }
        setTimeout(done, 1500);
    });

    it('Test Case - 4', function (done) {
        testSession.post('/ConfigProgramsEdit')
            .send({ "configProgramName": "MeterUnitTestConfigProgram", "Type": "Meter" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.Docs).not.to.equal(null);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        //     .expect(200, done);
        // if (!module.parent) {
        //     app.listen(3001);
        // }
        setTimeout(done, 1500);
    });

    it('Test Case - 5', function (done) {
        testSession.post('/ConfigProgramsDelete')
            .send({ "configProgramName": "HSUnitTestConfigProgram", "Type": "HyperSprout" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.Result).to.be.equal("Config Program Deleted");
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        .expect(200);
        // if (!module.parent) {
        //     app.listen(3000);
        // }
        setTimeout(done, 1500);
    });

    it('Test Case - 6', function (done) {
        testSession.post('/ConfigProgramsDelete')
            .send({ "configProgramName": "MeterUnitTestConfigProgram", "Type": "Meter" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.Result).to.be.equal("Config Program Deleted");
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        .expect(200);
        // if (!module.parent) {
        //     app.listen(3001);
        // }
        setTimeout(done, 1500);
    });

    it('Test Case - 7', function (done) {
        testSession.post('/ConfigProgramsEdit')
            .send({ "configProgramName": "1232", "Type": "Transformers" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        .expect(200);
        setTimeout(done, 1500);
    });
});