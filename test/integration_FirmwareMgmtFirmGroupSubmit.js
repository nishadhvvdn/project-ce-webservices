var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - FirmwareManagement/FirmwareMgmtFirmGroupSubmit', function () {
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
		testSession.post('/FirmwareMgmtFirmGroupSubmit')
			.send(
			{
				"DeviceType": "Meter",
				"Firmware": "Firm1.0",
				"Group": "2"
			}
			)
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
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 2', function (done) {
		testSession.post('/FirmwareMgmtFirmGroupSubmit')
			.send(
			{
				"DeviceType": "HyperSprout",
				"Firmware": "Firm1.0",
				"Group": "2"
			}
			)
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
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 3', function (done) {
		testSession.post('/FirmwareMgmtFirmGroupSubmit')
			.send(
			{
				"DeviceType": "Transformer",
				"Firmware": "Firm1.0",
				"Group": "2"
			}
			)
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
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Test Case - 4', function (done) {
		testSession.post('/FirmwareMgmtFirmGroupSubmit')
			.send(
			{
				"DeviceType": null,
				"Firmware": null,
				"Group": null
			}
			)
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
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});
});