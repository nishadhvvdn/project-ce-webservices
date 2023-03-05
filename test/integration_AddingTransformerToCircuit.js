var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var transformerID, hypersproutID;

describe('Integration Test - Grouping, Ungrouping & Response of Transformer and Circuit', function () {
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
					"CircuitID": ["fhkCircuit"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["12345"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						done(exc);
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
				setTimeout(function () {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					done();
				}, 1500);
			});
	});

	it('Test Case - 3', function (done) {
		testSession.get('/DisplayAllTransformerDetails')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						if (objDet.TransformerDetailSelected.length > 0) {
							for (var i = 0; i < objDet.TransformerDetailSelected.length; i++) {
								if (objDet.TransformerDetailSelected[i].TransformerSerialNumber == 'fhkTransformer')
									transformerID = objDet.TransformerDetailSelected[i].TransformerID;
							}
							if (objDet.HypersproutDetailsSelected.length > 0) {
								for (var j = 0; j < objDet.HypersproutDetailsSelected.length; j++) {
									if (objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "fhkHypersprout")
										hypersproutID = objDet.HypersproutDetailsSelected[j].HypersproutID;
								}
							}
						}

						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 4', function (done) {
		testSession.post('/AddingTransformerToCircuit')
			.send(
			{
				"addTransformerToCircuitValues": {
					"TransformerID": [transformerID, 1],
					"CircuitID": "fhkCircuit"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 5', function (done) {
		testSession.post('/RemovingTransformerFromCircuit')
			.send(
			{
				"removeTransformerFromCircuitValues": {
					"TransformerID": [transformerID],
					"CircuitID": "fhkCircuit"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet).not.to.equal(null);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	// it('Test Case - 6', function (done) {
	// 	testSession.post('/RemovingTransformerFromCircuit')
	// 		.send(
	// 		{
	// 			"removeTransformerFromCircuitValues": {
	// 				"TransformerID": [1],
	// 				"CircuitID": "fhkCircuit"
	// 			}
	// 		}
	// 		)
	// 		.set('Accept', 'application/json')
	// 		.expect('Content-Type', /json/)
	// 		.end(function (err, res) {
	// 			setTimeout(function () {
	// 				try {
	// 					var objDet = res.body;
	// 					expect(objDet).not.to.equal(null);
	// 					done();
	// 				} catch (exc) {
	// 					done(exc);
	// 				}
	// 			}, 1500);
	// 		})
	// });

	it('Test Case - 7', function (done) {
		testSession.post('/AddingTransformerToCircuit')
			.send(
			{
				"addTransformerToCircuitValues": {
					"TransformerID": null,
					"CircuitID": null
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});
	it('Test Case - 8', function (done) {
		testSession.post('/RemovingTransformerFromCircuit')
			.send(
			{
				"removeTransformerFromCircuitValues": {
					"TransformerID": null,
					"CircuitID": null
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 9', function (done) {
		request(app).post('/RemovingTransformerFromCircuitResponse')
			.send(
			{
				"CellID": 13,
				"Status": "Success"
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).to.equal(true);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});
	it('Test Case - 10', function (done) {
		request(app).post('/RemovingTransformerFromCircuitResponse')
			.send(
			{
				"CellID": 13,
				"Status": "Failure"
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.Type).to.equal(true);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});
	it('Test Case - 11', function (done) {
		testSession.post('/DeleteCircuitDetails')
			.send(
			{
				"deleteCircuitValues": {
					"CircuitID": ["fhkCircuit"]
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 12', function (done) {
		testSession.post('/DeleteTransformerHypersproutDetails')
			.send(
			{
				"deleteTransformerHypersproutValues": {
					"TransformerID": [transformerID],
					"HypersproutID": [hypersproutID]
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});
});