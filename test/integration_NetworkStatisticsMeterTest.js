var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');

describe('Integration Test - /NetworkStatisticsMeter/ NetworkStatisticsMeter', function () {
	this.timeout(15000);
	it('Test Case - 1', function (done) {
		request(app)
			.get('/NetworkStatisticsMeter')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.details).not.to.equal(null);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});
});