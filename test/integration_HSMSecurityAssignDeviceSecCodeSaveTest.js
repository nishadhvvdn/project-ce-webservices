var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/HSMSecurityAssignDeviceSecCodeSave', function () {
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
		testSession.post('/HSMSecurityAssignDeviceSecCodeSave')
			.send(
			{
				"updateHSMAssignDeviceSecCodeValues": {
					"DeviceClassID": "2",
					"SecurityCodeLevels": "3",
					"Primary": "2345",
					"Secondary": "4567",
					"Tertiary": "7890",
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
		testSession.post('/HSMSecurityAssignDeviceSecCodeSave')
			.send(
			{
				"updateHSMAssignDeviceSecCodeValues": {
					"DeviceClassID": null,
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