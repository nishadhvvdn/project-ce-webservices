var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;


describe('Integration Test - Reports/MeterCommunicationsStatisticsReport ', function () {
	this.timeout(15000);
	before(function (done) {
		objSession.initSession(function (objSessionData) {
			testSession = objSessionData;
			setTimeout(done,1500);
		})
	});

	after(function () {
		objSession.destroySession(testSession, function (res) {
		});
	});

	it('Test Case - 1', function (done) {
		testSession.get('/MeterCommunicationsStatisticsReport')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.details).not.to.equal(null);
						if (objDet.details != null) {
							for (var i in objDet.details) {
								expect(objDet.details[i].SerialNumber).not.to.be.undefined;
								expect(objDet.details[i].SerialNumber).not.to.be.null;
								expect(objDet.details[i].LastReadTime).not.to.be.undefined;
								expect(objDet.details[i].LastReadTime).not.to.be.null;
								expect(objDet.details[i].Status).not.to.be.undefined;
								expect(objDet.details[i].Status).not.to.be.null;
							}
						}
						done();
					} catch (exc) {
						done(exc);
					}
				}, 2500);
			})
	});
});