var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/HSMSecurityCodeMgmt', function () {
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
		testSession.get('/HSMSecurityCodeMgmt')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.SecurityCodesHSMSelected).not.to.equal(null);
						if (objDet.SecurityCodesHSMSelected != null) {
							for (var i in objDet.SecurityCodesHSMSelected) {
								expect(objDet.SecurityCodesHSMSelected[i]._id).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i]._id).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].DeviceClassID).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].DeviceClassID).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].ClassName).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].ClassName).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].Primary).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].Primary).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].Secondary).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].Secondary).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].Tertiary).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].Tertiary).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].Quarternary).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].Quarternary).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionType1).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionType1).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKeyID1).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKeyID1).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKey1).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKey1).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionType2).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionType2).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKeyID2).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKeyID2).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKey2).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKey2).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionType3).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionType3).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKeyID3).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKeyID3).not.to.be.null;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKey3).not.to.be.undefined;
								expect(objDet.SecurityCodesHSMSelected[i].EncryptionKey3).not.to.be.null;
							}
						}
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});
});