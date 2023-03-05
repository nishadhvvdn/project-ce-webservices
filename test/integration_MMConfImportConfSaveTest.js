var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var meterID;

describe('AIntegration Test - MeterManagement/MMConfImportConfSave', function () {
    this.timeout(15000);
    before(function (done) {
        objSession.initSession(function (objSessionData) {
            testSession = objSessionData;
            setTimeout(done, 1500);
        })
    });

    after(function () {
        objSession.destroySession(testSession, function (res) {
        });
    });

    it('Test Case - 1', function (done) {
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
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/ConfNewConfSave')
            .send({ "configName": "confgrp23", "ClassName": "ANSI", "configProgramName": "MeterUnitTestConfigProgram", "Description": "UnitTesting", "Type": "Meter" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
             .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/MMConfImportConfSave')
            .send({ "configName": "confgrp23", "listMeters": ["00000000000000000BWM 1014"], "Action": "Add" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.Status).to.equal("Successful");
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
             .expect(200);
            setTimeout(done, 1500);
    });
    it('Test Case - 4', function (done) {
        testSession.post('/MMConfImportConfSave')
            .send({ "configName": "confgrp23", "listMeters": ["00000000000000000BWM 1014"], "Action": "Remove" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.Status).to.equal("Successful");
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 5', function (done) {
        testSession.get('/MMConf')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;

                        for (var i = 0; i < objDet.meterData.length; i++) {
                            if (objDet.meterData[i].ConfigName == "confgrp23") {
                                meterID = objDet.meterData[i].ConfigID;
                            }
                        }
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
             .expect(200);
            setTimeout(done, 1500);

    });

    it('Test Case - 6', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": meterID,
                "Type": "Configuration Group",
                "DeviceType": "Meter"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
             .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 7', function (done) {
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
                        done(exc);
                    }
                }, 1500);
            })
             .expect(200);
            setTimeout(done, 1500);
       /* if (!module.parent) {
            app.listen(3001);
        } */
    });


    it('Test Case - 8', function (done) {
        testSession.post('/MMConfImportConfSave')
            .send({ "configName": "invalidgrpname", "listMeters": ["10001"], "Action": "Add" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log(objDet.type);
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 9', function (done) {
        testSession.post('/MMConfImportConfSave')
            .send({ "configName": null, "listMeters": null, "Action": null })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log(objDet.type);
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200);
            setTimeout(done, 1500);
    });
});