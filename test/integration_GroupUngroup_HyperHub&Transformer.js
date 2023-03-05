var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var transformerID = [];
var hypersproutID = [];
var hyperhubID = [];

describe('Integration Test - Grouping & Ungrouping of HyperHub & Transformer', function () {
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
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});
	it('Test Case - 2', function (done) {
		testSession.post('/NewTransformerHypersproutEntry')
			.send(
			{
				"insertNewTransformerHypersproutDetails": {
					"TFMRSerialNumber": ["fhkTransformer"],
					"TFMRMake": ["a"],
					"TFMRRatingCapacity": ["a"],
					"TFMRHighLineVoltage": ["123456"],
					"TFMRLowLineVoltage": ["1234"],
					"TFMRHighLineCurrent": ["123456"],
					"TFMRLowLineCurrent": ["1234"],
					"TFMRType": ["Pad Mounted"],
					"HypersproutSerialNumber": ["fhkHypersprout"],
					"HypersproutVersion": ["1234567"],
					"HypersproutMake": ["abc"],
					"HSCTRatio": ["12345678"],
					"HSPTRatio": ["12345678"],
					"HSRatedVoltage": ["110"],
					"HSNumberOfPhases": ["1"],
					"HSRatedFrequency": ["50"],
					"HSAccuracy": ["0.5"],
					"HSDemandResetDate": ["1"],
					"HSCompliantToStandards": ["UL"],
					"HSMaxDemandWindow": ["Sliding"],
					"HSMaxDemandSlidingWindowInterval": ["15"],
					"HSSensorDetails": ["abc12345"],
					"HSGPRSMacID": ["84:3A:4B:4F:DF:70"],
					"HSWiFiMacID": ["84:3A:4B:4F:DF:70"],
					"HSWiFiIpAddress": ["10.9.176.103"],
					"HSWiFiAccessPointPassword": ["0125hgfvbvc"],
					"HSSimCardNumber": ["098765432109887"],
					"HSLatitude": [89.01],
					"HSLongitude": [179.0215],
					"ConnectedStreetlights": [true],
					"StreetlightsMetered": [true],
					"StreetlightUsage": ["12345678"],
					"NoOfConnectedStreetlights": ["12345"],
					"WireSize": ["1234"],
					"MaxOilTemp": ["123"],
					"MinOilTemp": ["123"],
					"CameraConnect": [false],
					"Type": "Add"
				}
			})
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet).not.to.equal(undefined);
				setTimeout(done, 1500);
			});
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
								if (objDet.HyperHubDetailSelected[i].HypersproutSerialNumber == "fhkHyperHub") {
									hyperhubID.push(objDet.HyperHubDetailSelected[i].HypersproutID);
								}
							}
						}
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})
	});

	it('Test Case - 4', function (done) {
		testSession.get('/DisplayAllTransformerDetails')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						if (objDet.TransformerDetailSelected.length > 0) {
							for (var i = 0; i < objDet.TransformerDetailSelected.length; i++) {
								if (objDet.TransformerDetailSelected[i].TransformerSerialNumber == "fhkTransformer") {
									transformerID.push(objDet.TransformerDetailSelected[i].TransformerID);
								}
							}
						}
						if (objDet.HypersproutDetailsSelected.length > 0) {
							for (var j = 0; j < objDet.HypersproutDetailsSelected.length; j++) {
								if (objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "fhkHypersprout") {
									hypersproutID.push(objDet.HypersproutDetailsSelected[j].HypersproutID);
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

	it('Test Case - 5', function (done) {
		testSession.post('/AddingHyperHubToTransformer')
			.send(
			{
				"addHyperHubToTransformerValues": {
					"HyperHubID": hyperhubID,
					"TransformerID": transformerID
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

	it('Test Case - 6', function (done) {
		testSession.post('/AddingHyperHubToTransformer')
			.send(
			{
				"addHyperHubToTransformerValues": {
					"HyperHubID": null,
					"TransformerID": null
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
		testSession.post('/GetAllHyperHubAttachedToTransformer')
			.send({
				"TransformerDetails": {
					"TransformerID": transformerID
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
	it('Test Case - 8', function (done) {
		testSession.post('/GetAllHyperHubAttachedToTransformer')
			.send(
			{
				"TransformerDetails": {
					"TransformerID": null
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

	it('Test Case - 9', function (done) {
		testSession.post('/RemovingHyperHubFromTransformer')
			.send(
			{
				"removeHyperHubFromTransformerValues": {
					"HyperHubID": hyperhubID,
					"TransformerID": transformerID
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
	it('Test Case - 10', function (done) {
		testSession.post('/RemovingHyperHubFromTransformer')
			.send(
			{
				"removeHyperHubFromTransformerValues": {
					"HyperHubID": null,
					"TransformerID": null
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

	it('Test Case - 11', function (done) {
		testSession.post('/DeleteTransformerHypersproutDetails')
			.send(
			{
				"deleteTransformerHypersproutValues": {
					"TransformerID": transformerID,
					"HypersproutID": hypersproutID
				}
			})
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet).not.to.equal(undefined);
				setTimeout(done, 1500);
			});
	});
	it('Test Case - 12', function (done) {
		testSession.post('/DeleteHyperHubDetails')
			.send(
			{
				"deleteHyperHubValues": {
					"HyperHubID": hyperhubID
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