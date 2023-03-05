var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/ListDownloadJobs', function () {
	this.timeout(35000);
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
		testSession.post('/ListDownloadJobs')
			.send({
				"StartTime": "2016-08-03T14:08:48.800Z",
				"EndTime": "2017-08-04T03:38:53.990Z",
				"Type": "Meter"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 2', function (done) {
		testSession.post('/ListDownloadJobs')
			.send({
				"StartTime": "2016-08-03T14:08:48.800Z",
				"EndTime": "2017-08-04T03:38:53.990Z",
				"Type": "HyperSprout"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 2', function (done) {
		testSession.post('/ListDownloadJobs')
			.send({
				"StartTime": "2017-08-04T03:38:53.990Z",
				"EndTime": "2017-08-04T03:38:54.990Z",
				"Type": "HyperSprout"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 3', function (done) {
		testSession.post('/ListDownloadJobs')
			.send({
				"StartTime": "2017-06-20T06:42:00.334Z",
				"EndTime": "2017-07-20T06:42:00.000Z",
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
						setTimeout(done, 1500);
					}
				}, 1500);
			})
			.expect(200, done);
	});
});