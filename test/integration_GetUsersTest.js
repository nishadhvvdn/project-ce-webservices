var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - Administration/Users/GetUsers', function () {
	this.timeout(15000);
	before(function (done) {
		objSession.initSession(function (objSessionData) {
			testSession = objSessionData;
			objSession.refreshSession(testSession, function (resp) {
				setTimeout(done, 1500);
			});
		})
	});

	after(function () {
		objSession.destroySession(testSession, function (res) {
		});
	});

	it('Test Case - 1', function (done) {
		testSession.get('/GetUsers')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.output).not.to.equal(null);
						if (objDet.output != null) {
							for (var i = 0; i < objDet.output.length; i++) {
								expect(objDet.output[i].UserID).not.to.be.undefined;
								expect(objDet.output[i].UserID).not.to.be.null;
								expect(objDet.output[i].FirstName).not.to.be.undefined;
								expect(objDet.output[i].FirstName).not.to.be.null;
								expect(objDet.output[i].LastName).not.to.be.undefined;
								expect(objDet.output[i].LastName).not.to.be.null;
								expect(objDet.output[i].EmailAddress).not.to.be.undefined;
								expect(objDet.output[i].EmailAddress).not.to.be.null;
								expect(objDet.output[i].SecurityGroup).not.to.be.undefined;
								expect(objDet.output[i].SecurityGroup).not.to.be.null;
								expect(objDet.output[i].HomePage).not.to.be.undefined;
								expect(objDet.output[i].HomePage).not.to.be.null;
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