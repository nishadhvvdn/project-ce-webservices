var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var moment = require('moment');
var objSession = require('./sessioninit.js');
var testSession = null;
var endpointID;
var messageID;

describe('Integration Test - Endpoints All Web Services', function () {
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
	it('Add Endpoint - validate json body 1', function (done) {
		testSession.post('/NewEndpointEntry')
			.send(
			{
				"insertNewEndpointDetails": {
					"Owner": ["Dhruv"],
					"MacID": ["12:65:ab:14:b6:a7"],
					"Description": ["Testing"],
					"CircuitID": "CRPOWAI",
					"Type": "Add"
				}

			})
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

	it('Add Endpoint - validate json body 2', function (done) {
		testSession.post('/NewEndpointEntry')
			.send(
			{
				"insertNewEndpointDetails": {
					"Owner": ["Dhruv"],
					"MacID": ["12:65:ab:14:b6:a7"],
					"Description": ["Testing"],
					"CircuitID": "CRPOWAI",
					"Type": "Add"
				}
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Message).to.equal("Failed to Add: Duplicate/Incorrect Endpoint Details!");
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Add Endpoint - validate json body 3', function (done) {
		testSession.post('/NewEndpointEntry')
			.send(
			{
				"insertNewEndpointDetails": {
					"Owner": ["Dhruv"],
					"MacID": ["12:65:ab:14:b6:a7"],
					"Description": ["Testing"],
					"CircuitID": "CRPOWAI",
					"Type": "Upload"
				}

			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Message).to.equal("Failed to Upload: Duplicate/Incorrect file!");
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});

	it('Add Endpoint - validate json body 4', function (done) {
		testSession.post('/NewEndpointEntry')
			.send(
			{
				"insertNewEndpointDetails": {
					"Owner": ["Dhruv"],
					"MacID": ["12:65:ab:14:b6:a7"],
					"Description": ["Testing"],
					"CircuitID": "CRPOWAI",
					"Type": "Adding"
				}

			})
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

	it('Get Endpoint ID - validate json body 5', function (done) {
		testSession.get('/DisplayAllEndpointDetails')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						if (objDet.EndpointDetails.length > 0) {
							for (var i = 0; i < objDet.EndpointDetails.length; i++) {
								if (objDet.EndpointDetails[i].MacID == "12:65:ab:14:b6:a7")
									endpointID = objDet.EndpointDetails[i].EndpointID;
							}
						}
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Get MessageID from Jobs - validate json body 6', function (done) {
		var endDate = new Date();
		var previous30minutes = new Date(endDate - (30 * 60000));
		//previous30minutes.setDate(endDate.getMinutes() - 30);
		var flag = false;
		testSession.post('/JobsList')
			.send({
				"StartTime": previous30minutes,
				"EndTime": endDate,
				"Type": "All"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						if (objDet.JobsArray.length > 0) {
							for (var i = 0; i < objDet.JobsArray.length; i++) {
								if ((objDet.JobsArray[i].JobName === "Registration Job")
									&& (objDet.JobsArray[i].JobType === "MacID Registraion")
									&& (objDet.JobsArray[i].Status === "Pending")
									&& (objDet.JobsArray[i].DeviceType === "Circuit")) {
									messageID = objDet.JobsArray[i].MessageID;
									flag = true;
									if (flag)
										break;
								}
							}
						}
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Endpoint Response - validate json body 7', function (done) {
		testSession.post('/EndpointResponse')
			.send(
			{
				"CellID": 1,
				"MessageID": messageID,
				"Action": "ENDPOINT_REGISTERATION",
				"MeterID": 0,
				"Data": [{
					"STATUSCODE": 3
				}]
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Endpoint Response - validate json body 8', function (done) {
		testSession.post('/EndpointResponse')
			.send(
			{
				"CellID": 1,
				"MessageID": messageID,
				"Action": "ENDPOINT_REGISTERATION",
				"MeterID": 0,
				"Data": [{
					"STATUSCODE": 2
				}]
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Endpoint Response - validate json body 9', function (done) {
		testSession.post('/EndpointResponse')
			.send(
			{
				"CellID": 1,
				"MessageID": messageID,
				"Action": "ENDPOINT_REGISTERATION",
				"MeterID": 0,
				"Data": [{
					"STATUSCODE": 1
				}]
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).to.equal(true);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Edit Endpoint - validate json body 10', function (done) {
		testSession.post('/EditEndpointDetails')
			.send(
			{
				"updateEndpointValues": {
					"EndpointID": endpointID,
					"Owner": "Dhruv Daga",
					"MacID": "ab:21:45:21:40:12",
					"Description": "Testing",
					"CircuitID": "11221",
				}
			})
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

	it('Edit Endpoint - validate json body 10', function (done) {
		testSession.post('/EditEndpointDetails')
			.send(
			{
				"updateEndpointValues": {
					"EndpointID": endpointID,
					"Owner": "Dhruv Daga",
					"MacID": "ab:21:45:21:40",
					"Description": "Testing",
					"CircuitID": "11221",
				}
			})
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

	it('Edit Endpoint - validate json body 11', function (done) {
		testSession.post('/EditEndpointDetails')
			.send(
			{
				"updateEndpointValues": {
					"EndpointID": endpointID,
					"Owner": "Dhruv Daga",
					"MacID": "12:65:ab:14:b6:a7",
					"Description": "Testing",
					"CircuitID": "11221",
				}
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done()
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('DeleteCircuitDetails - validate json body 12', function (done) {
		testSession.post('/DeleteEndpointDetails')
			.send(
			{
				"EndpointIDs": [endpointID]
			})
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

	it('DeleteCircuitDetails - validate json body 13', function (done) {
		testSession.post('/DeleteEndpointDetails')
			.send(
			{
				"EndpointIDs": null
			})
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

	it('Edit Endpoint - validate json body 14', function (done) {
		testSession.post('/EditEndpointDetails')
			.send(
			{
				"updateEndpointValues": {
					"EndpointID": "endpointID",
					"Owner": "Dhruv Daga",
					"MacID": "ab:21:45:21:40:12",
					"Description": "Testing",
					"CircuitID": "11221",
				}
			})
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

	it('Edit Endpoint - validate json body 15', function (done) {
		testSession.post('/EditEndpointDetails')
			.send(
			{
				"updateEndpointValues": {
					"EndpointID": null,
					"Owner": "Dhruv Daga",
					"MacID": "ab:21:45:21:40:12",
					"Description": "Testing",
					"CircuitID": "11221",
				}
			})
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

	it('Add Endpoint - validate json body 1', function (done) {
		testSession.post('/NewEndpointEntry')
			.send(
			{
				"insertNewEndpointDetails": {
					"Owner": null,
					"MacID": null,
					"Description": ["Testing"],
					"CircuitID": "CRPOWAI",
					"Type": "Add"
				}

			})
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

	it('Endpoint Response - validate json body 7', function (done) {
		testSession.post('/EndpointResponse')
			.send(
			{
				"CellID": 1,
				"MessageID": null,
				"Action": "ENDPOINT_REGISTERATION",
				"MeterID": 0,
				"Data": [{
					"STATUSCODE": 3
				}]
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).to.equal(false);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});
});