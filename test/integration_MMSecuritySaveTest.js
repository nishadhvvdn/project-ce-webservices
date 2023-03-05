var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - /MeterManagement/MMSecuritySave ', function () {
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
		testSession.post('/MMSecuritySave')
			.send(
			{
				"updateMMSecuritySaveValues": {
					"DeviceClassID": "1",
					"EncryptionType1": "DES (8 byte/16 HEX)",
					"EncryptionKeyID1": "KeyID1",
					"EncryptionKey1": "52039",
					"EncryptionType2": "DES (8 byte/16 HEX)",
					"EncryptionKeyID2": "KeyID2",
					"EncryptionKey2": "52039",
					"EncryptionType3": "DES (8 byte/16 HEX)",
					"EncryptionKeyID3": "KeyID3",
					"EncryptionKey3": "52039"
				}
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
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 2', function (done) {
		testSession.post('/MMSecuritySave')
			.send(
			{
				"updateMMSecuritySaveValues": {
					"DeviceClassID_invalid": "1",
					"EncryptionType1": "DES (8 byte/16 HEX)",
					"EncryptionKeyID1": "KeyID1",
					"EncryptionKey1": "52039",
					"EncryptionType2": "DES (8 byte/16 HEX)",
					"EncryptionKeyID2": "KeyID2",
					"EncryptionKey2": "52039",
					"EncryptionType3": "DES (8 byte/16 HEX)",
					"EncryptionKeyID3": "KeyID3",
					"EncryptionKey3": "52039"
				}
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
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 3', function (done) {
		testSession.post('/MMSecuritySave')
			.send(
			{
				"updateMMSecuritySaveValues": {
					"DeviceClassID": null,
					"EncryptionType1": null,
					"EncryptionKeyID1": null,
					"EncryptionKey1": null,
					"EncryptionType2": null,
					"EncryptionKeyID2": null,
					"EncryptionKey2": null,
					"EncryptionType3": null,
					"EncryptionKeyID3": null,
					"EncryptionKey3": null
				}
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
						done(exc);
					}
				}, 1500);
			});
	});
});