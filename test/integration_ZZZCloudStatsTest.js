var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - CloudStatistics/CloudStats ', function () {
	this.timeout(60000);
	beforeEach(function (done) {
        objSession.initSession(function (objSessionData) {
            testSession = objSessionData;
            done();
        })
    });

    afterEach(function (done) {
        objSession.destroySession(testSession, function (res) {
            done();
        });
    });
	it('Test Case - 1', function (done) {
		testSession.get('/CloudStats')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
					} catch (exc) {
						done(exc);
					}
				}, 100);
			})
			.expect(200, done);
	});
});