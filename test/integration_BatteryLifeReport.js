var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');

describe('GET /BatteryLifeReport', function () {
	this.timeout(30000);
	it('respond with json', function (done) {
		request(app)
			.get('/BatteryLifeReport')
			.set('Accept', 'application/json')
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err);
				var objDet = res.body;
				expect(objDet.type).to.equal(true);
				//done();
				setTimeout(done, 20000);
			});
	});
});