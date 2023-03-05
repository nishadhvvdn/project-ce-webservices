var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var appID;
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - HyperSproutManagement/MMGrpMgmtAssignGrpMembershipAssignEndpoint', function () {
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
			.send({ "GroupName": "INTEGRATION", "Description": "Testing for group creation", "Type": "Meter" })
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
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "Add", "listMeters": ["00000000000000000BWM 1014"], "Type": "Meter" })
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

	it('Test Case - 3', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "Add", "listMeters": ["00000000000000000BWM 1014"], "Type": "Meter" })
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

	it('Test Case - 4', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "Remove", "listMeters": ["00000000000000000BWM 1014"], "Type": "Meter" })
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

	it('Test Case - 5', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "Remove", "listMeters": ["00000000000000000BWM 1014"], "Type": "Meter" })
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


	it('Test Case - 6', function (done) {
		testSession.get('/MMGrpMgmt')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.dataFromAppGrps).not.to.equal(null);
						if (objDet.dataFromAppGrps != null) {
							for (var i in objDet.dataFromAppGrps) {
								if (objDet.dataFromAppGrps[i].GroupName == "INTEGRATION") {
									appID = objDet.dataFromAppGrps[i].GroupID;
								}
							}
						}
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 7', function (done) {
		testSession.post('/HSGroupDelete')
			.send({
				"ID": appID,
				"Type": "Application Group",
				"DeviceType": "Meter"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						//expect(objDet.type).to.be.equal(true);
						expect(objDet.output).not.to.equal(null);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 8', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "Add", "listMeters": ["0000BWM 1012"], "Type": "Meter" })
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

	it('Test Case - 9', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "Remove", "listMeters": ["0000BWM 1012"], "Type": "Meter" })
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

	it('Test Case - 10', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "hfjksdhfjdhsd", "listMeters": ["0000BWM 1012"], "Type": "Meter" })
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

	it('Test Case - 11', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "invalidgrpname", "Action": "invalidaction", "listMeters": [30001], "Type": "Meter" })
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

	it('Test Case - 12', function (done) {
		testSession.post('/HSMGrpMgmtAssignGrpMembershipCreateAppGrp')
			.send({ "GroupName": null, "Description": null, "Type": "Meter" })
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

	it('Test Case - 13', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": null, "Action": null, "listMeters": null, "Type": "Meter" })
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

	it('Test Case - 14', function (done) {
		testSession.post('/MMGrpMgmtAssignGrpMembershipAssignEndpoint')
			.send({ "GroupName": "INTEGRATION", "Action": "Add", "listMeters": ["00000000000000000BWM 1014"], "Type": "Mtr" })
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
});