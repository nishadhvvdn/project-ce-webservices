var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;
var hsmID;

describe('Integration Test - HyperSproutManagement/HSMGroupDownload ', function () {
    this.timeout(45000);
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
                "configProgramName": "HSUnitTestConfigProgram",
                "configProgramDetails": { "Energy": "Wh delivered", "Demand": "Max W delivered", "DemandIntervalLength": 1, "NumberofSubIntervals": 5, "ColdLoadPickupTimes": 1, "PowerOutageRecognitionTime": 20, "TestModeDemandIntervalLength": 1, "NumberofTestModeSubintervals": 2, "TimetoremaininTestMode": 20, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity3": "Wh delivered", "Quantity4": "Wh delivered", "IntervalLength": 10, "OutageLength": 15, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 4, "PulseWeight1": 20, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "CTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "EnableVoltageMonitor": false, "PhaseSelection": "Phase B", "IntervalLengthVoltage": "5 minutes", "RMSVoltLoadThreshold": 20, "RMSVoltHighThreshold": 30, "LowVoltageThreshold": 40, "LowVoltageThresholdDeviation": 30, "HighVoltageThresholdDeviation": 40, "LinkFailure": true, "LinkMetric": true, "InterrogationSendSucceeded": 0, "SendResponseFailed": 1, "DeregistrationResult": 1, "ReceivedMessageFrom": 0, "DataVineHyperSproutChange": 1, "DataVineSyncFatherChange": 1, "ZigbeeSETunnelingMessage": true, "ZigbeeSimpleMeteringMessage": false, "TableSendRequestFailed": true },
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
        testSession.post('/ConfNewConfSave')
            .send({ "configName": "HSConfiguration", "ClassName": "ANSI", "configProgramName": "HSUnitTestConfigProgram", "Description": "UnitTesting", "Type": "HyperSprout" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 3', function (done) {
        testSession.post('/HSMConfImportConfSave')
            .send({ "configName": "HSConfiguration", "listHS": ["000000000000000CELL3_TEST"], "Action": "Add" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log("objDet", objDet);
                        expect(objDet.Status).to.equal("Successful");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 4', function (done) {
        testSession.post('/HsmGroupDownload')
            .send({ "configName": "HSConfiguration" })
            .end(function (err, res) {
                var objDet = res.body;
                console.log(JSON.stringify(objDet));
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 5', function (done) {
        testSession.post('/DownloadConfigurationResponse')
            .send({ "CellID": 1, "MeterID": 0, "Attribute": "HS_DOWNLOAD", "Data": [{ "Status": 1 }] })
            .end(function (err, res) {
                var objDet = res.body;
                console.log(JSON.stringify(objDet));
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 6', function (done) {
        testSession.post('/HSMConfImportConfSave')
            .send({ "configName": "HSConfiguration", "listHS": ["000000000000000CELL3_TEST"], "Action": "Remove" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.Status).to.equal("Successful");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 7', function (done) {
        testSession.get('/HSMConf')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        for (var i = 0; i < objDet.hyperSproutData.length; i++) {
                            if (objDet.hyperSproutData[i].ConfigName == "HSConfiguration") {
                                hsmID = objDet.hyperSproutData[i].ConfigID;
                            }
                        }
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            });
    });

    it('Test Case - 8', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": hsmID,
                "Type": "Configuration Group",
                "DeviceType": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 9', function (done) {
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
        // if (!module.parent) {
        //     app.listen(3000);
        // }
    });

    it('Test Case - 10', function (done) {
        testSession.post('/ConfUploadConfigProgram')
            .send({
                "configProgramName": "HSUnitTestConfigProgram1",
                "configProgramDetails": { "Energy": "WhA delivered", "Demand": "Min W delivered", "DemandIntervalLength": 2, "NumberofSubIntervals": 1, "ColdLoadPickupTimes": 15, "PowerOutageRecognitionTime": 45, "TestModeDemandIntervalLength": 2, "NumberofTestModeSubintervals": 1, "TimetoremaininTestMode": 20, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity3": "Wh delivered", "Quantity4": "Wh delivered", "IntervalLength": 20, "OutageLength": 15, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 4, "PulseWeight1": 20, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "CTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "EnableVoltageMonitor": false, "PhaseSelection": "Phase B", "IntervalLengthVoltage": "5 minutes", "RMSVoltLoadThreshold": 20, "RMSVoltHighThreshold": 30, "LowVoltageThreshold": 40, "LowVoltageThresholdDeviation": 30, "HighVoltageThresholdDeviation": 40, "LinkFailure": true, "LinkMetric": true, "InterrogationSendSucceeded": 1, "SendResponseFailed": 1, "DeregistrationResult": 0, "ReceivedMessageFrom": 0, "DataVineHyperSproutChange": 0, "DataVineSyncFatherChange": 1, "ZigbeeSETunnelingMessage": true, "ZigbeeSimpleMeteringMessage": false, "TableSendRequestFailed": true },
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

    it('Test Case - 11', function (done) {
        testSession.post('/ConfNewConfSave')
            .send({ "configName": "HSConfiguration1", "ClassName": "ANSI", "configProgramName": "HSUnitTestConfigProgram1", "Description": "UnitTesting", "Type": "HyperSprout" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 12', function (done) {
        testSession.post('/HSMConfImportConfSave')
            .send({ "configName": "HSConfiguration1", "listHS": ["000000000000000CELL3_TEST"], "Action": "Add" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.Status).to.equal("Successful");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 13', function (done) {
        testSession.post('/HsmGroupDownload')
            .send({ "configName": "HSConfiguration1" })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 14', function (done) {
        testSession.post('/DownloadConfigurationResponse')
            .send({ "CellID": 1, "MeterID": 0, "Attribute": "HS_DOWNLOAD", "Data": [{ "Status": 1 }] })
            .end(function (err, res) {
                var objDet = res.body;
                console.log(JSON.stringify(objDet));
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 15', function (done) {
        testSession.post('/HSMConfImportConfSave')
            .send({ "configName": "HSConfiguration1", "listHS": ["000000000000000CELL3_TEST"], "Action": "Remove" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log("objDet", objDet);
                        expect(objDet.Status).to.equal("Successful");
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 16', function (done) {
        testSession.get('/HSMConf')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        for (var i = 0; i < objDet.hyperSproutData.length; i++) {
                            if (objDet.hyperSproutData[i].ConfigName == "HSConfiguration1") {
                                hsmID = objDet.hyperSproutData[i].ConfigID;
                            }
                        }
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            });
    });

    it('Test Case -17', function (done) {
        testSession.post('/HSGroupDelete')
            .send({
                "ID": hsmID,
                "Type": "Configuration Group",
                "DeviceType": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case -18', function (done) {
        testSession.post('/ConfigProgramsDelete')
            .send({ "configProgramName": "HSUnitTestConfigProgram1", "Type": "HyperSprout" })
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
        // if (!module.parent) {
        //     app.listen(3000);
        // }
    });

    it('Test Case - 19', function (done) {
        testSession.post('/HsmGroupDownload')
            .send({ "configName": "Invalid" })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 20', function (done) {
        testSession.post('/HsmGroupDownload')
            .send({ "configName": null })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });
});