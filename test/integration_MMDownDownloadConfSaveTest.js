var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

var meterID

describe('Integration Test - MeterManagement/MMDownDownloadConfSave', function () {
	this.timeout(75000);
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
				"configProgramName": "MMUnitTestConfigProgram",
				"configProgramDetails": { "Energy1": "Wah delivered", "Demand": "Max Wh delivered", "DemandIntervalLength": 10, "LoadControlDisconnectThreshold": 10, "ReconnectMethod": 1, "NumberofSubIntervals": 5, "ColdLoadPickupTimes": 10, "PowerOutageRecognitionTime": 45, "TestModeDemandIntervalLength": 1, "NumberofTestModeSubintervals": 1, "LoadProfileIntervalLength": 1, "DailySelfRead": 1, "DailySelfReadTime": 1, "TimetoremaininTestMode": 20, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity3": "Wh delivered", "Quantity4": "Wh delivered", "IntervalLength": 10, "OutageLength": 15, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 4, "PulseWeight1": 20, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "CTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "EnableVoltageMonitor": false, "PhaseSelection": "Phase B", "IntervalLengthVoltage": "5 minutes", "RMSVoltLoadThreshold": 20, "RMSVoltHighThreshold": 30, "LowVoltageThreshold": 40, "LowVoltageThresholdDeviation": 30, "HighVoltageThresholdDeviation": 40, "LockoutLoginattemptsOptical": 10, "LockoutLogoutminutesOptical": 10, "LockoutLoginattemptsLAN": 10, "LockoutLogoutminutesLAN": 10, "ConsecutiveLAN": 10, "LinkFailure": true, "LanLinkMetric": 1, "InterrogationSendSucceeded": false, "SendResponseFailed": true, "DeregistrationResult": true, "ReceivedMessageFrom": false, "DataVineHyperSproutChange": true, "DataVineSyncFatherChange": true, "ZigbeeSETunnelingMessage": true, "ZigbeeSimpleMeteringMessage": false, "TableSendRequestFailed": true },
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

	it('Test Case - 2', function (done) {
		testSession.post('/ConfNewConfSave')
			.send({ "configName": "MMConfiguration", "ClassName": "ANSI", "configProgramName": "MMUnitTestConfigProgram", "Description": "UnitTesting", "Type": "Meter" })
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

	it('Test Case - 4', function (done) {
		testSession.post('/MMConfImportConfSave')
			.send({ "configName": "MMConfiguration", "listMeters": ["00000000000000000BWM 1002"], "Action": "Add" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("objDet", JSON.stringify(objDet) + err);
						expect(objDet.Status).to.equal("Successful");
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 5', function (done) {
		testSession.post('/MMDownDownloadConfSave')
			.send({ "configName": "MMConfiguration", "SerialNumber": ["00000000000000000BWM 1002"] })
			.end(function (err, res) {
				var objDet = res.body;
				//console.log(JSON.stringify(objDet));
				expect(objDet.type).not.to.equal(null);
				setTimeout(done, 1500);
			});
	});

	it('validate Download Response - 6', function (done) {
		request(app).post('/DownloadConfigurationResponse')
			.send({ "CellID": 14, "MeterID": 31, "Attribute": "METER_DOWNLOAD", "Data": [{ "Status": 1 }] })
			.end(function (err, res) {
				var objDet = res.body;
				console.log(JSON.stringify(objDet));
				expect(objDet).not.to.equal(undefined);
				setTimeout(done, 1500);
			});
	});

	it('Test Case - 7', function (done) {
		testSession.post('/MMConfImportConfSave')
			.send({ "configName": "MMConfiguration", "listMeters": ["00000000000000000BWM 1002"], "Action": "Remove" })
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

	it('Test Case - 8', function (done) {
		testSession.get('/MMConf')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						for (var i = 0; i < objDet.meterData.length; i++) {
							if (objDet.meterData[i].ConfigName == "MMConfiguration") {
								meterID = objDet.meterData[i].ConfigID;
							}
						}
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			});
	});

	it('Test Case - 9', function (done) {
		testSession.post('/HSGroupDelete')
			.send({
				"ID": meterID,
				"Type": "Configuration Group",
				"DeviceType": "Meter"
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

	it('Test Case - 10', function (done) {
		testSession.post('/ConfigProgramsDelete')
			.send({ "configProgramName": "MMUnitTestConfigProgram", "Type": "Meter" })
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
		// 	app.listen(3000);
		// }
	});

	it('Test Case - 11', function (done) {
		testSession.post('/ConfUploadConfigProgram')
			.send({
				"configProgramName": "MMUnitTestConfigProgram1",
				"configProgramDetails": { "Energy1": "WA delivered", "Demand": "Max W delivered", "DemandIntervalLength": 15, "LoadControlDisconnectThreshold": 1, "ReconnectMethod": 2, "NumberofSubIntervals": 1, "ColdLoadPickupTimes": 15, "PowerOutageRecognitionTime": 10, "TestModeDemandIntervalLength": 2, "NumberofTestModeSubintervals": 2, "LoadProfileIntervalLength": 2, "DailySelfRead": 1, "DailySelfReadTime": 2, "TimetoremaininTestMode": 20, "Quantity1": "Wh delivered", "Quantity2": "Wh delivered", "Quantity3": "Wh delivered", "Quantity4": "Wh delivered", "IntervalLength": 10, "OutageLength": 15, "PulseWeight2": 20, "PulseWeight3": 30, "PulseWeight4": 4, "PulseWeight1": 20, "AllEvents": true, "BillingDateCleard": false, "BillingScheduleExpiration": false, "DemandResetOccured": false, "HistoryLogCleared": true, "ConfigurationErrorDetected": true, "LoadProfileError": false, "LowBatteryDetected": true, "PrimaryPowerDown": false, "CTMultiplier": 20, "VTMultiplier": 30, "RegisterMultiplier": 30, "EnableVoltageMonitor": false, "PhaseSelection": "Phase B", "IntervalLengthVoltage": "5 minutes", "RMSVoltLoadThreshold": 20, "RMSVoltHighThreshold": 30, "LowVoltageThreshold": 40, "LowVoltageThresholdDeviation": 30, "HighVoltageThresholdDeviation": 40, "LockoutLoginattemptsOptical": 20, "LockoutLogoutminutesOptical": 20, "LockoutLoginattemptsLAN": 20, "LockoutLogoutminutesLAN": 20, "ConsecutiveLAN": 20, "LinkFailure": true, "LanLinkMetric": 1, "InterrogationSendSucceeded": false, "SendResponseFailed": true, "DeregistrationResult": true, "ReceivedMessageFrom": false, "DataVineHyperSproutChange": true, "DataVineSyncFatherChange": true, "ZigbeeSETunnelingMessage": true, "ZigbeeSimpleMeteringMessage": false, "TableSendRequestFailed": true },
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
						expect(objDet.type).not.to.equal(null);
						//expect(objDet.Status).to.equal("Group Added into the System");
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 12', function (done) {
		testSession.post('/ConfNewConfSave')
			.send({ "configName": "MMConfiguration1", "ClassName": "ANSI", "configProgramName": "MMUnitTestConfigProgram1", "Description": "UnitTesting", "Type": "Meter" })
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

	it('Test Case - 13', function (done) {
		testSession.post('/MMConfImportConfSave')
			.send({ "configName": "MMConfiguration1", "listMeters": ["00000000000000000BWM 1002"], "Action": "Add" })
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

	it('Test Case - 14', function (done) {
		testSession.post('/MMDownDownloadConfSave')
			.send({ "configName": "MMConfiguration1", "SerialNumber": ["00000000000000000BWM 1002"] })
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).not.to.equal(null);
				setTimeout(done, 1500);
			});
	});

	it('Test Case - 15', function (done) {
		request(app).post('/DownloadConfigurationResponse')
			.send({ "CellID": 14, "MeterID": 31, "Attribute": "METER_DOWNLOAD", "Data": [{ "Status": 1 }] })
			.end(function (err, res) {
				var objDet = res.body;
				//console.log(JSON.stringify(objDet));
				expect(objDet).not.to.equal(undefined);
				setTimeout(done, 1500);
			});
	});

	it('Test Case - 16', function (done) {
		testSession.post('/MMConfImportConfSave')
			.send({ "configName": "MMConfiguration1", "listMeters": ["00000000000000000BWM 1002"], "Action": "Remove" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						//console.log("objDet", objDet);
						expect(objDet.Status).to.equal("Successful");
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 17', function (done) {
		testSession.get('/MMConf')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						for (var i = 0; i < objDet.meterData.length; i++) {
							if (objDet.meterData[i].ConfigName == "MMConfiguration1") {
								meterID = objDet.meterData[i].ConfigID;
							}
						}
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			});
	});

	it('Test Case - 18', function (done) {
		testSession.post('/HSGroupDelete')
			.send({
				"ID": meterID,
				"Type": "Configuration Group",
				"DeviceType": "Meter"
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

	it('Test Case - 19', function (done) {
		testSession.post('/ConfigProgramsDelete')
			.send({ "configProgramName": "MMUnitTestConfigProgram1", "Type": "Meter" })
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
		// 	app.listen(3000);
		// }
	});

	it('Test Case - 20', function (done) {
		testSession.post('/MMDownDownloadConfSave')
			.send({ "configName": "Invalid", "SerialNumber": ["000000000MM000001"] })
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).to.equal(false);
				setTimeout(done, 1500);
			});
	});
	it('Test Case - 12', function (done) {
		testSession.post('/MMDownDownloadConfSave')
			.send({ "configName": null, "SerialNumber": null })
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).to.equal(false);
				setTimeout(done, 1500);
			});
	}); 
});