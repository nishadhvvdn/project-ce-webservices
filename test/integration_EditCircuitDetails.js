var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var CID;

describe('Integration Test - Registration/EditCircuitDetails', function () {
	this.timeout(30000);
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
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhkEdit"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 2', function (done) {
		testSession.get('/DisplayAllCircuitDetails')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						for (var i in objDet.CircuitDetailSelected) {
							if (objDet.CircuitDetailSelected[i].CircuitID == 'fhkEdit') {
								CID = objDet.CircuitDetailSelected[i].CircuitNumber;
							}
						}
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});
	it('Test Case - 3', function (done) {
		testSession.post('/EditCircuitDetails')
			.send(
			{
				"updateCircuitValues": {
					"CircuitNumber": CID,
					"CircuitID": "fhkEdit",
					"KVARating": "ad1a",
					"SubstationID": "dsfs",
					"SubstationName": "dfd",
					"Address": "sdf",
					"Country": "sdf",
					"State": "sdf",
					"City": "sdf",
					"ZipCode": "sd",
					"Latitude": "10.10",
					"Longitude": "100.10"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});
	it('Test Case - 4', function (done) {
		testSession.post('/EditCircuitDetails')
			.send(
			{
				"updateCircuitValues": {
					"CircuitNumber": 1001,
					"CircuitID": "fhkEdit",
					"KVARating": "ad1a",
					"SubstationID": "dsfs",
					"SubstationName": "dfd",
					"Address": "sdf",
					"Country": "sdf",
					"State": "sdf",
					"City": "sdf",
					"ZipCode": "sd",
					"Latitude": "10.10",
					"Longitude": "100.10"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});

	it('Test Case - 5', function (done) {
		testSession.post('/EditCircuitDetails')
			.send(
			{
				"updateCircuitValues": {
					"CircuitNumber": CID,
					"CircuitID": "fhkEditSuccess",
					"KVARating": "ad1a",
					"SubstationID": "dsfs",
					"SubstationName": "dfd",
					"Address": "sdf",
					"Country": "sdf",
					"State": "sdf",
					"City": "sdf",
					"ZipCode": "sd",
					"Latitude": "10.10",
					"Longitude": "100.10"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});


	it('Test Case - 6', function (done) {
		testSession.post('/EditCircuitDetails')
			.send(
			{
				"updateCircuitValues": {
					"CircuitNumber": null,
					"CircuitID": null,
					"KVARating": "ad1a",
					"SubstationID": "dsfs",
					"SubstationName": "dfd",
					"Address": "sdf",
					"Country": "sdf",
					"State": "sdf",
					"City": "sdf",
					"ZipCode": "sd",
					"Latitude": "sdff",
					"Longitude": "sdff"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Test Case - 7', function (done) {
		testSession.post('/DeleteCircuitDetails')
			.send(
			{
				"deleteCircuitValues": {
					"CircuitID": ["fhkEditSuccess"]
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});
});