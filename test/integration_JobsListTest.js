var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/Jobslist', function () {
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
		testSession.post('/JobsList')
			.send({
				"StartTime": "2017-06-20T06:42:00.334Z",
				"EndTime": "2017-07-25T06:42:00.000Z",
				"Type": "Meter"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.JobsArray).not.to.equal(null);
						if (objDet.JobsArray != null) {
							for (var i = 0; i < objDet.JobsArray.length; i++) {
								expect(objDet.JobsArray[i]._id).not.to.be.undefined;
								expect(objDet.JobsArray[i]._id).not.to.be.null;
								expect(objDet.JobsArray[i].JobID).not.to.be.undefined;
								expect(objDet.JobsArray[i].JobID).not.to.be.null;
							}
						}
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 2', function (done) {
		testSession.post('/JobsList')
			.send({
				"StartTime": "2017-06-20T06:42:00.334Z",
				"EndTime": "2017-07-25T06:42:00.000Z",
				"Type": "All"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.JobsArray).not.to.equal(null);
						if (objDet.JobsArray != null) {
							for (var i = 0; i < objDet.JobsArray.length; i++) {
								expect(objDet.JobsArray[i]._id).not.to.be.undefined;
								expect(objDet.JobsArray[i]._id).not.to.be.null;
								expect(objDet.JobsArray[i].JobID).not.to.be.undefined;
								expect(objDet.JobsArray[i].JobID).not.to.be.null;
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
		testSession.post('/JobsList')
			.send({
				"StartTime": "2017-06-20T06:42:00.334Z",
				"EndTime": "2017-07-25T06:42:00.000Z",
				"Type": "HS"
			})
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