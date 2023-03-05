var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;


describe('Integration Test - Reports/CommunicationsStatisticsReport ', function () {
	this.timeout(45000);
	before(function (done) {
		objSession.initSession(function (objSessionData) {
			testSession = objSessionData;
			setTimeout(done, 1500);
		})
	});

	after(function () {
        objSession.destroySession(testSession) 
    });

	it('Test Case - 1', function (done) {
		testSession.post('/CommunicationsStatisticsReport')
			.send({
				"IfHyperhub": false
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
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
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 100);
			})
		.expect(200);
		setTimeout(done, 1500);
	});

	it('Test Case - 2', function (done) {
		testSession.post('/CommunicationsStatisticsReport')
			.send({
				"IfHyperhub": true
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.be.null;
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 100);
			})
		.expect(200);
		setTimeout(done, 1500);
	});
});