var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - Administration/Security/GetSecurityGroups ', function () {
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
		testSession.get('/GetSecurityGroups')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.membersInfo).not.to.equal(null);
						expect(objDet.output).not.to.equal(null);
						if (objDet.output != null) {
							for (var i = 0; i < objDet.output.length; i++) {
								expect(objDet.output[i].Description).not.to.be.undefined;
								expect(objDet.output[i].Description).not.to.be.null;
							}
						}
						if (objDet.membersInfo != null) {
							for (var i = 0; i < objDet.membersInfo.length; i++) {
								expect(objDet.membersInfo[i].SecurityID).not.to.be.undefined;
								expect(objDet.membersInfo[i].SecurityID).not.to.be.null;
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