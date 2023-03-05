var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;
var hsmAppID;
describe('Integration Test - HyperSproutManagement/HSMGrpMgmtAssignGrpMembershipAssignEndpoint', function () {
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
			.send({ "GroupName": "Integrationtest", "Description": "Testing for group creation", "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).to.equal(true);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200);
			setTimeout(done, 1500);
	});
	it('Test Case - 2', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "Integrationtest", "listHS": ["000000000000000000HSCELL6"], "Action": "Add", "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).not.to.equal(null);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200);
			setTimeout(done, 1500);
	});

	it('Test Case - 3', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "Integrationtest", "listHS": ["000000000000000000HSCELL6"], "Action": "Remove", "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).not.to.equal(null);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 4', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "Integrationtest", "listHS": ["000000000000CELL002"], "Action": "Add", "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).to.equal(false);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 5', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "Integrationtest", "listHS": ["000000000000CELL002"], "Action": "Remove", "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).to.equal(false);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 6', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "bsdhflkfkwekl", "listHS": ["000000000000000000CELL002"], "Action": "Remove", "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).to.equal(false);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 7', function (done) {
		testSession.get('/HSMGrpMgmt')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).to.equal(true);
						if (objDet.dataFromAppGrps != null) {
							for (var i in objDet.dataFromAppGrps) {
								if (objDet.dataFromAppGrps[i].GroupName === "Integrationtest") {
									hsmAppID = objDet.dataFromAppGrps[i].GroupID;
								}
							}
							console.log("App ID :- " + hsmAppID);
						}
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 8', function (done) {
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
						console.log("ObjDet :- " + JSON.stringify(objDet));
						//expect(objDet.type).to.be.equal(true);
						expect(objDet.output).not.to.equal(null);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 9', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "Integrationtest", "Action": "invalidaction", "listHS": [10001], "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).to.equal(false);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 10', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": null, "Action": null, "listHS": null, "Type": "HyperSprout" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						console.log("ObjDet :- " + JSON.stringify(objDet));
						expect(objDet.type).to.equal(false);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});
});