var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/HSMConf', function () {
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
		testSession.get('/HSMConf')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.memberInfo).not.to.equal(null);
						expect(objDet.hyperSproutData).not.to.equal(null);
						if (objDet.hyperSproutData != null) {
							for (var i = 0; i < objDet.hyperSproutData.length; i++) {
								expect(objDet.hyperSproutData[i]._id).not.to.be.undefined;
								expect(objDet.hyperSproutData[i]._id).not.to.be.null;
								expect(objDet.hyperSproutData[i].ConfigID).not.to.be.undefined;
								expect(objDet.hyperSproutData[i].ConfigID).not.to.be.null;
								expect(objDet.hyperSproutData[i].ConfigName).not.to.be.undefined;
								expect(objDet.hyperSproutData[i].ConfigName).not.to.be.null;
								//expect(objDet.hyperSproutData[i].DeviceClass).not.to.be.undefined;
								//expect(objDet.hyperSproutData[i].DeviceClass).not.to.be.null;
								expect(objDet.hyperSproutData[i].ClassName).not.to.be.undefined;
								expect(objDet.hyperSproutData[i].ClassName).not.to.be.null;
								expect(objDet.hyperSproutData[i].Description).not.to.be.undefined;
								expect(objDet.hyperSproutData[i].Description).not.to.be.null;
								//expect(objDet.hyperSproutData[i].EditDate).not.to.be.undefined;
								//expect(objDet.hyperSproutData[i].EditDate).not.to.be.null;
								expect(objDet.hyperSproutData[i].EditTime).not.to.be.undefined;
								expect(objDet.hyperSproutData[i].EditTime).not.to.be.null;
							}
						}
						if (objDet.memberInfo != null) {
							for (var i = 0; i < objDet.memberInfo.length; i++) {
								expect(objDet.memberInfo[i].configID).not.to.be.undefined;
								expect(objDet.memberInfo[i].configID).not.to.be.null;
								expect(objDet.memberInfo[i].Members).not.to.be.undefined;
								expect(objDet.memberInfo[i].Members).not.to.be.null;
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
});