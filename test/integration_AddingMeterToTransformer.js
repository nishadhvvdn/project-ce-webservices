var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var transformerID = [];
var hypersproutID = [];
var meterID = [];

describe('Integration Test - AddingMeterToTransformer', function () {
	this.timeout(45000);
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
		testSession.post('/AddingMeterToTransformer')
			.send(
			{
				"addMeterToTransformerValues": {
					"MeterID": [46],
					"TransformerID": 13
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});

	it('Test Case - 2', function (done) {
		testSession.post('/AddingMeterToTransformer')
			.send(
			{
				"addMeterToTransformerValues": {
					"MeterID": null,
					"TransformerID": null
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});

	it('Test Case - 3', function (done) {
		testSession.post('/RemovingMeterFromTransformer')
			.send(
			{
				"removeMeterFromTransformerValues": {
					"MeterID": [46],
					"TransformerID": 13
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 4', function (done) {
		testSession.post('/RemovingMeterFromTransformer')
			.send(
			{
				"removeMeterFromTransformerValues": {
					"MeterID": [10],
					"TransformerID": 1
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 5', function (done) {
		testSession.post('/RemovingMeterFromTransformer')
			.send(
			{
				"removeMeterFromTransformerValues": {
					"MeterID": null,
					"TransformerID": null
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 6', function (done) {
		testSession.post('/RemovingMeterFromTransformerResponse')
			.send(
			{
				"NoOfMeter": 1,
				"CellID": 1,
				"meters": [{
					"DeviceID": 9,
					"Status": "Success"
				}]
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 7', function (done) {
		testSession.post('/RemovingMeterFromTransformerResponse')
			.send(
			{
				"NoOfMeter": 1,
				"CellID": 1,
				"meters": [{
					"DeviceID": 12,
					"Status": "Failure"
				}]
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 8', function (done) {
		testSession.post('/RemovingMeterFromTransformerResponse')
			.send(
			{
				"NoOfMeter": 2,
				"CellID": 1,
				"meters": [{
					"DeviceID": 12,
					"Status": "Failure"
				}, {
					"DeviceID": 9,
					"Status": "Success"
				}]
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done,1500);
					}
				}, 1500);
			})
	});
});