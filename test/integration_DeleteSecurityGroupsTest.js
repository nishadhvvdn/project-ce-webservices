var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - Administration/Security/DeleteSecurityGroups', function () {
	this.timeout(30000);
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
		testSession.post('/AddSecurityGroups')
			.send(
			{
				"SecurityID": "IntegrationTest", "Description": "testing", "Functions": [{
					"Tools": "true", "values": {
						"PerformInteractiveRead": "true",
						"ViewJobStatus": "true"
					}
				},
				{
					"HypersproutManagement": "true", "values": {
						"ModifyHypersproutConfigurations": "true",
						"ModifyHypersproutFirmware": "true",
						"HypersproutSecurityCodeManagement": "true",
						"HypersproutFirmwareManagement": "true",
						"HypersproutJobStatus": "true",
					}
				},
				{
					"MeterManagement": "true", "values": {
						"ModifyMeterConfigurations": "true",
						"ModifyMeterFirmware": "true",
						"MeterSecurityCodeManagement": "true",
						"MeterFirmwareManagement": "true",
						"MeterJobStatus": "true",
					}
				},
				{
					"Administration": "true", "values": {
						"ModifySecurity": "true",
						"ModifySystemSettings": "true",
						"ModifyUsers": "true",
					}
				}, {
					"Reports": "true", "values": {
						"CommunicationStatistics": "true",
						"DataVINEHealth": "true",
						"SystemLog": "true",
						"BatteryLife": "true",
						"DeviceFirmwareVersions": "true",
						"SystemUpdates": "true",
						"DeviceRegistrationStatus": "true",
						"SystemAuditLog": "true",
					}
				}, {
					"SystemManagement": "true", "values": {
						"DeviceManagement": "true",
						"JobStatus": "true",
						"NetworkStatistics": "true",
						"Registration": "true",
						"Grouping": "true"
					}
				}]
			})
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).to.equal(true);
				setTimeout(done, 1500);
			})
	});

	it('Test Case - 2', function (done) {
		testSession.post('/DeleteSecurityGroups')
			.send({ "SecurityID": null })
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).to.equal(false);
				setTimeout(done, 1500);
			});
	});

	it('Test Case - 3', function (done) {
		testSession.post('/DeleteSecurityGroups')
			.send({ "SecurityID": "IntegrationTest" })
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).to.equal(true);
				setTimeout(done, 1500);
			});
	});

	it('Test Case - 4', function (done) {
		testSession.post('/DeleteSecurityGroups')
			.send({ "SecurityID": "Random" })
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).to.equal(false);
				setTimeout(done, 1500);
			});
	});

	it('Test Case - 5', function (done) {
		testSession.post('/DeleteSecurityGroups')
			.send({ "SecurityID": "Administrator" })
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet.type).to.equal(false);
				setTimeout(done, 1500);
			});
	});
});