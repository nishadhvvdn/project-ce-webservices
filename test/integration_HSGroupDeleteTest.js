var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;
var hsmAppID, hsmConfID;

describe('Integration  Test - HyperSproutManagement/HSGroupDelete', function () {
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
                "configProgramName": "IntesgrationConfigprogram",
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
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });
    it('Test Case - 2', function (done) {
        testSession.post('/ConfNewConfSave')
            .send({ "configName": "IntegrationConfTest", "ClassName": "ANSI", "configProgramName": "IntesgrationConfigprogram", "Description": "integrationTesting", "Type": "HyperSprout" })
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
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 3', function (done) {
        testSession.get('/HSMConf')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.hyperSproutData).not.to.equal(null);
                        for (var i = 0; i < objDet.hyperSproutData.length; i++) {
                            if (objDet.hyperSproutData[i].ConfigName == "IntegrationConfTest") {
                                hsmConfID = objDet.hyperSproutData[i].ConfigID;
                            }
                        }
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 4', function (done) {
        testSession.post('/HSMGrpMgmtAssignGrpMembershipCreateAppGrp')
            .send({ "GroupName": "IntegrationAppGrptest", "Description": "Testing for group creation", "Type": "HyperSprout" })
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
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });
    it('Test Case - 5', function (done) {
        testSession.get('/HSMGrpMgmt')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        if (objDet.dataFromAppGrps != null) {
                            for (var i in objDet.dataFromAppGrps) {
                                if (objDet.dataFromAppGrps.GroupName === "IntegrationAppGrptest") {
                                    hsmAppID = objDet.dataFromAppGrps.GroupID;
                                }
                            }
                        }
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });
    it('Test Case - 6', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": hsmConfID,
                "Type": "Configuration Group",
                "DeviceType": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        //expect(objDet.type).to.be.equal(true);
                        expect(objDet.output).not.to.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 7', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": hsmAppID,
                "Type": "Application Group",
                "DeviceType": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        //expect(objDet.type).to.be.equal(true);
                        expect(objDet.output).not.to.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 8', function (done) {
        testSession.post('/ConfigProgramsDelete')
            .send({ "configProgramName": "IntesgrationConfigprogram", "Type": "HyperSprout" })
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
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
        /*if (!module.parent) {
            app.listen(3000);
        }*/
    });

    it('Test Case - 9', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": "sjg",
                "Type": "Configuration Group",
                "DeviceType": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 10', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": "sjg",
                "Type": "Application Group",
                "DeviceType": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 11', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": 7,
                "Type": "App Grp",
                "DeviceType": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 12', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": "sdsf",
                "Type": "Application Group",
                "DeviceType": "Meter"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);

                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });
});