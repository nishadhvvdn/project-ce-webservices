var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - MeterManagement/MMSecurityAssignDeviceSecCodeSave', function () {
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
		testSession.post('/MMSecurityAssignDeviceSecCodeSave')
			.send(
			{
				"updateMMAssignDeviceSecCodeValues": {
					"DeviceClassID": "1",
					"SecurityCodeLevels": "3",
					"Primary": "234435",
					"Secondary": "44567",
					"Tertiary": "78940",
					"Quarternary": ""
				}
			}
			)
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
			.expect(200, done);
	});

	it('Test Case - 2', function (done) {
		testSession.post('/MMSecurityAssignDeviceSecCodeSave')
			.send(
			{
				"updateMMAssignDeviceSecCodeValues": {
					"DeviceClassID_invalid": "1",
					"SecurityCodeLevels": "4",
					"Primary": "4534567",
					"Secondary": "783490",
					"Tertiary": "12434",
					"Quarternary": "423467"
				}
			}
			)
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
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 3', function (done) {
		testSession.post('/MMSecurityAssignDeviceSecCodeSave')
			.send(
			{
				"updateMMAssignDeviceSecCodeValues": {
					"DeviceClassID_invalid": null,
					"SecurityCodeLevels": null,
					"Primary": null,
					"Secondary": null,
					"Tertiary": null,
					"Quarternary": null
				}
			}
			)
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
				}, 1500);
			})
			.expect(200, done);
	});
});