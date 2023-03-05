var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/ConfUploadConfigProgram ', function () {
    this.timeout(30000);
    before(function (done) {
        objSession.initSession(function (objSessionData) {
            testSession = objSessionData;
            setTimeout(done, 1500)
        })
    });

    after(function () {
        objSession.destroySession(testSession, function (res) {
        });
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
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.Status).to.equal("Group Added into the System");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });
    it('Test Case - 2', function (done) {
        testSession.post('/ConfUploadConfigProgram')
            .send({
                "configProgramName": "HSUnitTestConfigProgram",
                "configProgramDetails": { "Energy": "Wh delivered", "Demand": "Max W delivered", "DemandIntervalLength": 15, "NumberofSubIntervals": 5, "ColdLoadPickupTime": 15, "PowerOutageRecognitionTime": 45, "TestModeDemandIntervalLength": "Quantity1", "NumberofTestModeSubintervals": "Quantity2", "TimetoremaininTestMode": 20, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity3": "Wh delivered", "Quantity4": "Wh delivered", "IntervalLength": 60, "OutageLength": 15, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 4, "PulseWeight1": 20, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "CTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "EnableVoltageMonitor": false, "PhaseSelection": "Phase B", "IntervalLengthVoltage": "5 minutes", "RMSVoltLoadThreshold": 20, "RMSVoltHighThreshold": 30, "LowVoltageThreshold": 40, "LowVoltageThresholdDeviation": 30, "HighVoltageThresholdDeviation": 40, "LinkFailure": true, "LinkMetric": true, "InterrogationSendSucceeded": false, "SendResponseFailed": true, "DeregistrationResult": true, "ReceivedMessageFrom": false, "DataVineHyperSproutChange": true, "DataVineSyncFatherChange": true, "ZigbeeSETunnelingMessage": true, "ZigbeeSimpleMeteringMessage": false, "TableSendRequestFailed": true },
                "Description": "Unit Testing",
                "Type": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                        expect(objDet.Message).to.equal("Config Program with this name already available");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 3', function (done) {
        testSession.post('/ConfUploadConfigProgram')
            .send({
                "configProgramName": "MeterUnitTestConfigProgram",
                "configProgramDetails": { "Energy1": "Wh delivered", "Energy2": "Wh delivered", "Energy3": "Wh delivered", "Energy4": "Wh delivered", "Demand": "Max VA received Arith", "LoadControlDisconnectThreshold": "Disabled", "ReconnectMethod": "Option3", "DemandIntervalLength": 15, "NumberofSubIntervals": 5, "ColdLoadPickupTimes": 30, "PowerOutageRecognitionTime": 45, "TestModeDemandIntervalLength": "Quantity1", "NumberofTestModeSubintervals": "Quantity2", "TimetoremaininTestMode": 20, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity": "Wh delivered", "Quantity4": "Wh delivered", "LoadProfileIntervalLength": 2, "OutageLength": 30, "IntervalLength": 60, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 40, "PulseWeight1": 20, "EnableVoltageMonitor": 1, "PhaseSelection": "Phase A", "VoltageMointorIntervalLength": "1 minute", "RMSVoltLoadThreshold": 230, "RMSVoltHighThreshold": 230, "LowVoltageThreshold": 230, "LowVoltageThresholdDeviation": 230, "HighVoltageThresholdDeviation": 230, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "OTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "LockoutLoginattemptsOptical": 1, "LockoutLogoutminutesOptical": 1, "LockoutLoginattemptsLAN": 1, "LockoutLogoutminutesLAN": 1, "ConsecutiveLAN": 1, "LanLinkMetric": 1 },
                "Description": "Unit Testing",
                "Type": "Meter"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.Status).to.equal("Group Added into the System");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 4', function (done) {
        testSession.post('/ConfigProgramsDelete')
            .send({ "configProgramName": "HSUnitTestConfigProgram", "Type": "HyperSprout" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.Result).to.be.equal("Config Program Deleted");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 5', function (done) {
        testSession.post('/ConfigProgramsDelete')
            .send({ "configProgramName": "MeterUnitTestConfigProgram", "Type": "Meter" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.Result).to.be.equal("Config Program Deleted");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 6', function (done) {
        testSession.post('/ConfUploadConfigProgram')
            .send({
                "configProgramName": "UnitTestConfigProgram" + Date.now(),
                "configProgramDetails": { "Energy1": "Wh delivered", "Energy2": "Wh delivered", "Energy3": "Wh delivered", "Energy4": "Wh delivered", "Demand": "Max VA received Arith", "LoadControlDisconnectThreshold": "Disabled", "ReconnectMethod": "Option3", "DemandIntervalLength": 15, "NumberofSubIntervals": 5, "ColdLoadPickupTimes": 30, "PowerOutageRecognitionTime": 45, "TestModeDemandIntervalLength": "Quantity1", "NumberofTestModeSubintervals": "Quantity2", "TimetoremaininTestMode": 20, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity": "Wh delivered", "Quantity4": "Wh delivered", "LoadProfileIntervalLength": 2, "OutageLength": 30, "IntervalLength": 60, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 40, "PulseWeight1": 20, "EnableVoltageMonitor": 1, "PhaseSelection": "Phase A", "VoltageMointorIntervalLength": "1 minute", "RMSVoltLoadThreshold": 230, "RMSVoltHighThreshold": 230, "LowVoltageThreshold": 230, "LowVoltageThresholdDeviation": 230, "HighVoltageThresholdDeviation": 230, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "OTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "LockoutLoginattemptsOptical": 1, "LockoutLogoutminutesOptical": 1, "LockoutLoginattemptsLAN": 1, "LockoutLogoutminutesLAN": 1, "ConsecutiveLAN": 1, "LanLinkMetric": 1 },
                "Description": "Unit Testing",
                "Type": "Transformners"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 7', function (done) {
        testSession.post('/ConfUploadConfigProgram')
            .send({
                "configProgramName": null,
                "configProgramDetails": null,
                "Description": null,
                "Type": null
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });
});

