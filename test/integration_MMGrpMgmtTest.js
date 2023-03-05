var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - MeterManagement/MMGrpMgmt', function () {
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
		testSession.get('/MMGrpMgmt')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.dataFromConfigGrps).not.to.equal(null);
						if (objDet.dataFromConfigGrps != null) {
							for (var i in objDet.dataFromConfigGrps) {
								expect(objDet.dataFromConfigGrps[i]._id).not.to.be.undefined;
								expect(objDet.dataFromConfigGrps[i]._id).not.to.be.null;
								expect(objDet.dataFromConfigGrps[i].ConfigName).not.to.be.undefined;
								expect(objDet.dataFromConfigGrps[i].ConfigName).not.to.be.null;
								expect(objDet.dataFromConfigGrps[i].Description).not.to.be.undefined;
								expect(objDet.dataFromConfigGrps[i].Description).not.to.be.null;
							}
						}
						expect(objDet.dataFromAppGrps).not.to.equal(null);
						if (objDet.dataFromAppGrps != null) {
							for (var i in objDet.dataFromAppGrps) {
								expect(objDet.dataFromAppGrps[i]._id).not.to.be.undefined;
								expect(objDet.dataFromAppGrps[i]._id).not.to.be.null;
								expect(objDet.dataFromAppGrps[i].GroupName).not.to.be.undefined;
								expect(objDet.dataFromAppGrps[i].GroupName).not.to.be.null;
								expect(objDet.dataFromAppGrps[i].Description).not.to.be.undefined;
								expect(objDet.dataFromAppGrps[i].Description).not.to.be.null;
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