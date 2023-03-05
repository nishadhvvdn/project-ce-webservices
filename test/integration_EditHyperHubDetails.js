var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var hypersproutID = [];

describe('Integration Test - Registration/EditHyperHubDetails', function () {
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
		testSession.post('/NewHyperHubEntry')
			.send(
			{
				"insertNewHyperHubDetails": {
					"HubSerialNumber": ["fhkHyperHub"],
					"HubName": ["abcd"],
					"HardwareVersion": ["abcd"],
					"GprsMacID": ["84:3A:4B:4F:DF:70"],
					"WifiMacID": ["84:3A:4B:4F:DF:70"],
					"WifiIPAddress": ["abcd"],
					"WifiAccessPointPassword": ["abcd"],
					"Latitude": ["10.01"],
					"Longitude": ["10.10"],
					"SimCardNumber": ["abcd"],
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
						setTimeout(done, 1500);;
					}
				}, 1500);
			})

	});
	it('Test Case - 2', function (done) {
		testSession.post('/NewHyperHubEntry')
			.send(
			{
				"insertNewHyperHubDetails": {
					"HubSerialNumber": ["fhkHyperHub1"],
					"HubName": ["abcd"],
					"HardwareVersion": ["abcd"],
					"GprsMacID": ["84:3A:4B:4F:DF:70"],
					"WifiMacID": ["84:3A:4B:4F:DF:70"],
					"WifiIPAddress": ["abcd"],
					"WifiAccessPointPassword": ["abcd"],
					"Latitude": ["10.01"],
					"Longitude": ["10.10"],
					"SimCardNumber": ["abcd"],
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
						setTimeout(1500, done);;
					}
				}, 1500);
			})

	});
	it('Test Case - 3', function (done) {
		testSession.post('/DisplayAllHyperHubDetails')
			.send(
			{
				"HyperHubDetails": {
					"Type": "All"
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
						if (objDet.HyperHubDetailSelected.length > 0) {
							for (var i = 0; i < objDet.HyperHubDetailSelected.length; i++) {
								if ((objDet.HyperHubDetailSelected[i].HypersproutSerialNumber == "fhkHyperHub")) {
									hypersproutID.push(objDet.HyperHubDetailSelected[i].HypersproutID);
								}
							}
						}
						done();
					} catch (exc) {
						setTimeout(done, 1500);;
					}
				}, 1500);
			})

	});
	it('Test Case - 4', function (done) {
		testSession.post('/EditHyperHubDetails')
			.send(
			{
				"updateHyperHubValues": {
					"HubSerialNumber": ["fhkHyperHub"],
					"HyperHubID": hypersproutID,
					"HubName": ["abcd1"],
					"HardwareVersion": ["abcd1"],
					"GprsMacID": ["84:3A:4B:4F:DF:70"],
					"WifiMacID": ["84:3A:4B:4F:DF:70"],
					"WifiIPAddress": ["abcd1"],
					"WifiAccessPointPassword": ["abcd1"],
					"Latitude": [10.01],
					"Longitude": [10.10],
					"SimCardNumber": ["abcd1"]
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
						setTimeout(done, 1500);;
					}
				}, 1500);
			})

	});
	it('Test Case - 5', function (done) {
		testSession.post('/EditHyperHubDetails')
			.send(
			{
				"updateHyperHubValues": {
					"HubSerialNumber": ["fhkHyperHub1"],
					"HyperHubID": hypersproutID,
					"HubName": ["abcd1"],
					"HardwareVersion": ["abcd1"],
					"GprsMacID": ["84:3A:4B:4F:DF:70"],
					"WifiMacID": ["84:3A:4B:4F:DF:70"],
					"WifiIPAddress": ["abcd1"],
					"WifiAccessPointPassword": ["abcd1"],
					"Latitude": [10.01],
					"Longitude": [10.10],
					"SimCardNumber": ["abcd1"]
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
						setTimeout(done, 1500);;
					}
				}, 1500);
			})

	});
	it('Test Case - 6', function (done) {
		testSession.post('/EditHyperHubDetails')
			.send(
			{
				"updateHyperHubValues": {
					"HubSerialNumber": ["fhkHyperHub"],
					"HyperHubID": [101],
					"HubName": ["abcd1"],
					"HardwareVersion": ["abcd1"],
					"GprsMacID": ["84:3A:4B:4F:DF:70"],
					"WifiMacID": ["84:3A:4B:4F:DF:70"],
					"WifiIPAddress": ["abcd1"],
					"WifiAccessPointPassword": ["abcd1"],
					"Latitude": [10.01],
					"Longitude": [10.10],
					"SimCardNumber": ["abcd1"]
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
						setTimeout(done, 1500);;
					}
				}, 1500);
			})

	});
	it('Test Case - 7', function (done) {
		testSession.post('/EditHyperHubDetails')
			.send(
			{
				"updateHyperHubValues": {
					"HubSerialNumber": null,
					"HyperHubID": null,
					"HubName": ["abcd1"],
					"HardwareVersion": ["abcd1"],
					"GprsMacID": ["84:3A:4B:4F:DF:70"],
					"WifiMacID": ["84:3A:4B:4F:DF:70"],
					"WifiIPAddress": ["abcd1"],
					"WifiAccessPointPassword": ["abcd1"],
					"Latitude": [10.01],
					"Longitude": [10.10],
					"SimCardNumber": ["abcd1"]
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
						setTimeout(done, 1500);;
					}
				}, 1500);
			})
	});
});