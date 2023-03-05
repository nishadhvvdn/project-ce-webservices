var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - /SystemManagement/NetworkStatisticsHS ', function () {
	this.timeout(60000);
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
		testSession.get('/NetworkStatisticsHS')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.nwStatsHS).not.to.equal(null);
						if (objDet.nwStatsHS != null) {
							for (var i in objDet.nwStatsHS) {
								expect(objDet.nwStatsHS[i].HypersproutID).not.to.be.undefined;
								expect(objDet.nwStatsHS[i].HypersproutID).not.to.be.null;
								expect(objDet.nwStatsHS[i].SerialNumber).not.to.be.undefined;
								expect(objDet.nwStatsHS[i].SerialNumber).not.to.be.null;
								expect(objDet.nwStatsHS[i].Name).not.to.be.undefined;
								expect(objDet.nwStatsHS[i].Name).not.to.be.null;
								expect(objDet.nwStatsHS[i].NoOfMetersConnected).not.to.be.undefined;
								expect(objDet.nwStatsHS[i].NoOfMetersConnected).not.to.be.null;
								expect(objDet.nwStatsHS[i].Load).not.to.be.undefined;
								expect(objDet.nwStatsHS[i].Load).not.to.be.null;
								expect(objDet.nwStatsHS[i].Status).not.to.be.undefined;
								expect(objDet.nwStatsHS[i].Status).not.to.be.null;
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