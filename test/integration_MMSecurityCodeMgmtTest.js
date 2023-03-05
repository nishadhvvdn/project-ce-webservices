var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - MeterManagement/MMSecurityCodeMgmt ', function () {
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
		testSession.get('/MMSecurityCodeMgmt')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.SecurityCodesMMSelected).not.to.equal(null);
						if (objDet.SecurityCodesMMSelected != null) {
							for (var i in objDet.SecurityCodesMMSelected) {
								expect(objDet.SecurityCodesMMSelected[i]._id).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i]._id).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].DeviceClassID).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].DeviceClassID).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].ClassName).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].ClassName).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].Primary).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].Primary).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].Secondary).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].Secondary).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].Tertiary).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].Tertiary).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].Quarternary).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].Quarternary).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionType1).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionType1).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKeyID1).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKeyID1).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKey1).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKey1).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionType2).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionType2).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKeyID2).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKeyID2).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKey2).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKey2).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionType3).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionType3).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKeyID3).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKeyID3).not.to.be.null;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKey3).not.to.be.undefined;
								expect(objDet.SecurityCodesMMSelected[i].EncryptionKey3).not.to.be.null;
							}
						}
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});
});