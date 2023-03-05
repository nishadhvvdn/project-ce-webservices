var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - Administration/Users/GetUsers', function () {
	this.timeout(15000);

	it('Test Case - 1', function (done) {
		request(app)
			.post('/login')
			.send({ "email": "admin", "password": "aura@001" })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200, done);
	});

	it('Test Case - 2', function (done) {
		request(app)
			.post('/login')
			.send({ "email": "dhruv", "password": "SrkzT" })
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

	it('Test Case - 3', function (done) {
		request(app)
			.post('/login')
			.send({ "email": "admin", "password": "SrkzT" })
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

	it('Test Case - 4', function (done) {
		request(app)
			.post('/login')
			.send({ "email": "adminssss", "password": "SrkzT" })
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

	it('Test Case - 5', function (done) {
		request(app)
			.post('/login')
			.send({ "email": null, "password": null })
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