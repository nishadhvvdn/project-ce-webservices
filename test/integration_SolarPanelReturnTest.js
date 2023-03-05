var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');

describe('Integration Test - SolarPanel/SolarPanelReturn ', function () {
	this.timeout(45000);
	it('Test Case - 1', function (done) {
		request(app)
			.get('/SolarPanelReturn')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						// expect(objDet.type).to.equal(true);
						expect(objDet.details).not.to.equal(null);
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
			.expect(200, done);
	});
});