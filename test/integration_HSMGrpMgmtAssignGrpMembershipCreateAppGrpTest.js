var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;
var hsmAppID;

describe('Integration Test - HyperSproutManagement/HSMGrpMgmtAssignGrpMembershipCreateAppGrp', function () {
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
		testSession.post('/HSMGrpMgmtAssignGrpMembershipCreateAppGrp')
			.send({ "GroupName": "grpintegrationTest", "Description": "Testing for group creation", "Type": "HyperSprout" })
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
		testSession.get('/HSMGrpMgmt')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						if (objDet.dataFromAppGrps != null) {
							for (var i in objDet.dataFromAppGrps) {
								if (objDet.dataFromAppGrps.GroupName === "IntegrationAppGrptest") {
									hsmAppID = objDet.dataFromAppGrps.GroupID;
								}
							}
						}
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 3', function (done) {
		testSession.post('/HSGroupDelete')
			.send({
				"ID": hsmAppID,
				"Type": "Application Group",
				"DeviceType": "HyperSprout"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						//expect(objDet.type).to.be.equal(true);
						expect(objDet.output).not.to.equal(null);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 4', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipCreateAppGrp')
			.send({ "GroupName_false": "grpintegrationTest", "Description_false": "Testing for group creation" })
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