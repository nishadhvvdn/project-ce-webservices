var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var transformerID = [];
var hypersproutID = [];
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - EditTransformerHypersproutDetails', function () {
	this.timeout(60000);
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
				setTimeout(done, 1500);;
			});
	});

	it('Test Case - 2', function (done) {
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
								if (objDet.TransformerDetailSelected[i].TransformerSerialNumber === "fhkTransformer") {
									transformerID.push(objDet.TransformerDetailSelected[i].TransformerID);
								}
							}
						}
						if (objDet.HypersproutDetailsSelected.length > 0) {
							for (var j = 0; j < objDet.HypersproutDetailsSelected.length; j++) {
								if (objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber === "fhkHypersprout") {
									hypersproutID.push(objDet.HypersproutDetailsSelected[j].HypersproutID);
								}
							}
						}
						expect(objDet.type).to.equal(true);
						done();
					} catch (exc) {s
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});

	it('Test Case - 3', function (done) {
		testSession.post('/EditTransformerHypersproutDetails')
			.send(
			{
				"updateTransformerHypersproutValues": {
					"TransformerID": transformerID,
					"HypersproutID": hypersproutID,
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
					"HSLatitude": [89.11],
					"HSLongitude": [179.1215],
					"ConnectedStreetlights": [true],
					"StreetlightsMetered": [true],
					"StreetlightUsage": ["12345678"],
					"NoOfConnectedStreetlights": ["12345"],
					"WireSize": ["1234"],
					"MaxOilTemp": ["123"],
					"MinOilTemp": ["123"],
					"CameraConnect": [false],
					"HSWifiPassFlag": "N"
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
	/*it('Test Case - 4', function (done) {
		testSession.post('/EditTransformerHypersproutDetails')
			.send(
			{
				"updateTransformerHypersproutValues": {
					"TransformerID": 1,
					"HypersproutID": 1,
					"TFMRSerialNumber": ["000000000000000CELL3_TEST"],
					"TFMRMake": ["a"],
					"TFMRRatingCapacity": ["a"],
					"TFMRHighLineVoltage": ["123456"],
					"TFMRLowLineVoltage": ["1234"],
					"TFMRHighLineCurrent": ["123456"],
					"TFMRLowLineCurrent": ["1234"],
					"TFMRType": ["Pad Mounted"],
					"HypersproutSerialNumber": ["000000000000000CELL3_TEST"],
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
					"HSWiFiAccessPointPassword": ["0125hgf1234"],
					"HSSimCardNumber": ["098765432109887"],
					"HSLatitude": [89.111],
					"HSLongitude": [179.115],
					"ConnectedStreetlights": [true],
					"StreetlightsMetered": [true],
					"StreetlightUsage": ["12345678"],
					"NoOfConnectedStreetlights": ["12345"],
					"WireSize": ["1234"],
					"MaxOilTemp": ["123"],
					"MinOilTemp": ["123"],
					"CameraConnect": [false],
					"HSWifiPassFlag": "Y"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
					} catch (exc) {
						setTimeout(1500,done);
					}
				}, 1500);
			})
			.expect(200, done);
	});*/
	it('Test Case - 5', function (done) {
		testSession.post('/EditTransformerHypersproutDetails')
			.send(
			{
				"updateTransformerHypersproutValues": {
					"TransformerID": null, "HypersproutID": null,
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
					"HSWifiPassFlag": "N"
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

	it('Test Case - 6', function (done) {
		testSession.post('/EditTransformerHypersproutWifiChangeResponse')
			.send(
			{
				"CellID": 14,
				"Data": [{
					"STATUSCODE": 1
				}]
			}
			)
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
	it('Test Case - 7', function (done) {
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
				 			setTimeout(done, 1500);;
			});
	});
});