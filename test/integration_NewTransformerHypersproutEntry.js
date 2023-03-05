var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var transformerID = [];
var hypersproutID = [];
var trans, hyper;
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - Insert,Display & Delete of TransformerHypersprout', function () {
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
	it('Test Case - 0', function (done) {
		testSession.post('/NewTransformerHypersproutEntry')
			.send(
			{
				"insertNewTransformerHypersproutDetails": {
					"TFMRSerialNumber": [null],
					"TFMRMake": ["a"],
					"TFMRRatingCapacity": ["a"],
					"TFMRHighLineVoltage": ["123456"],
					"TFMRLowLineVoltage": ["1234"],
					"TFMRHighLineCurrent": ["123456"],
					"TFMRLowLineCurrent": ["1234"],
					"TFMRType": ["Pad Mounted"],
					"HypersproutSerialNumber": [null],
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
				expect(objDet.type).not.to.equal(null);
				setTimeout(done, 1500);
			});
	});
	//======== CASE - I
	it('Test Case - 1', function (done) {
		testSession.post('/NewTransformerHypersproutEntry')
			.send(
			{
				"insertNewTransformerHypersproutDetails": {
					"TFMRSerialNumber": [""],
					"TFMRMake": ["a"],
					"TFMRRatingCapacity": ["a"],
					"TFMRHighLineVoltage": ["123456"],
					"TFMRLowLineVoltage": ["1234"],
					"TFMRHighLineCurrent": ["123456"],
					"TFMRLowLineCurrent": ["1234"],
					"TFMRType": ["Pad Mounted"],
					"HypersproutSerialNumber": [""],
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
		testSession.post('/NewTransformerHypersproutEntry')
			.send(
			{
				"insertNewTransformerHypersproutDetails": {
					"TFMRSerialNumber": ["fhkTransformer1"],
					"TFMRMake": ["a"],
					"TFMRRatingCapacity": ["a"],
					"TFMRHighLineVoltage": ["123456"],
					"TFMRLowLineVoltage": ["1234"],
					"TFMRHighLineCurrent": ["123456"],
					"TFMRLowLineCurrent": ["1234"],
					"TFMRType": ["Pad Mounted"],
					"HypersproutSerialNumber": ["fhkHypersprout1"],
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
					"HSLatitude": ["89.01"],
					"HSLongitude": ["179.0215"],
					"ConnectedStreetlights": ["true"],
					"StreetlightsMetered": ["true"],
					"StreetlightUsage": ["12345678"],
					"NoOfConnectedStreetlights": ["12345"],
					"WireSize": ["1234"],
					"MaxOilTemp": ["123"],
					"MinOilTemp": ["123"],
					"CameraConnect": ["false"],
					"Type": "Upload"
				}
			})
			.end(function (err, res) {
				var objDet = res.body;
				expect(objDet).not.to.equal(undefined);
				setTimeout(done, 1500);
			});
		it('Test Case - 4', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer1"],
						"TFMRMake": ["a"],
						"TFMRRatingCapacity": ["a"],
						"TFMRHighLineVoltage": ["123456"],
						"TFMRLowLineVoltage": ["1234"],
						"TFMRHighLineCurrent": ["123456"],
						"TFMRLowLineCurrent": ["1234"],
						"TFMRType": ["Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout1"],
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
						"HSLatitude": ["89.01"],
						"HSLongitude": ["179.0215"],
						"ConnectedStreetlights": ["true"],
						"StreetlightsMetered": ["true"],
						"StreetlightUsage": ["12345678"],
						"NoOfConnectedStreetlights": ["12345"],
						"WireSize": ["1234"],
						"MaxOilTemp": ["123"],
						"MinOilTemp": ["123"],
						"CameraConnect": ["false"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});
		//=========== CASE - II
		it('Test Case - 5', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer2"],
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
		it('Test Case - 6', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer2"],
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
						"HSLatitude": ["89.01"],
						"HSLongitude": ["179.0215"],
						"ConnectedStreetlights": ["true"],
						"StreetlightsMetered": ["true"],
						"StreetlightUsage": ["12345678"],
						"NoOfConnectedStreetlights": ["12345"],
						"WireSize": ["1234"],
						"MaxOilTemp": ["123"],
						"MinOilTemp": ["123"],
						"CameraConnect": ["false"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});

		it('Test Case - 7', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["", "fhkTransformer2"],
						"TFMRMake": ["a", "a"],
						"TFMRRatingCapacity": ["a", "a"],
						"TFMRHighLineVoltage": ["123456", "123456"],
						"TFMRLowLineVoltage": ["1234", "1234"],
						"TFMRHighLineCurrent": ["123456", "123456"],
						"TFMRLowLineCurrent": ["1234", "1234"],
						"TFMRType": ["Pad Mounted", "Pad Mounted"],
						"HypersproutSerialNumber": ["", "fhkHypersprout1"],
						"HypersproutVersion": ["1234567", "1234567"],
						"HypersproutMake": ["abc", "abc"],
						"HSCTRatio": ["12345678", "12345678"],
						"HSPTRatio": ["12345678", "12345678"],
						"HSRatedVoltage": ["110", "110"],
						"HSNumberOfPhases": ["1", "1"],
						"HSRatedFrequency": ["50", "50"],
						"HSAccuracy": ["0.5", "0.5"],
						"HSDemandResetDate": ["1", "1"],
						"HSCompliantToStandards": ["UL", "UL"],
						"HSMaxDemandWindow": ["Sliding", "Sliding"],
						"HSMaxDemandSlidingWindowInterval": ["15", "15"],
						"HSSensorDetails": ["abc12345", "abc12345"],
						"HSGPRSMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiIpAddress": ["10.9.176.103", "10.9.176.103"],
						"HSWiFiAccessPointPassword": ["0125hgfvbvc", "0125hgfvbvc"],
						"HSSimCardNumber": ["098765432109887", "098765432109887"],
						"HSLatitude": ["89.01", "89.01"],
						"HSLongitude": ["179.0215", "179.0215"],
						"ConnectedStreetlights": ["true", "true"],
						"StreetlightsMetered": ["true", "true"],
						"StreetlightUsage": ["12345678", "12345678"],
						"NoOfConnectedStreetlights": ["12345", "12345"],
						"WireSize": ["1234", "1234"],
						"MaxOilTemp": ["123", "123"],
						"MinOilTemp": ["123", "123"],
						"CameraConnect": ["false", "true"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});
		it('Test Case - 8', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer2", "fhkTransformer2"],
						"TFMRMake": ["a", "a"],
						"TFMRRatingCapacity": ["a", "a"],
						"TFMRHighLineVoltage": ["123456", "123456"],
						"TFMRLowLineVoltage": ["1234", "1234"],
						"TFMRHighLineCurrent": ["123456", "123456"],
						"TFMRLowLineCurrent": ["1234", "1234"],
						"TFMRType": ["Pad Mounted", "Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout2", "fhkHypersprout1"],
						"HypersproutVersion": ["1234567", "1234567"],
						"HypersproutMake": ["abc", "abc"],
						"HSCTRatio": ["12345678", "12345678"],
						"HSPTRatio": ["12345678", "12345678"],
						"HSRatedVoltage": ["110", "110"],
						"HSNumberOfPhases": ["1", "1"],
						"HSRatedFrequency": ["50", "50"],
						"HSAccuracy": ["0.5", "0.5"],
						"HSDemandResetDate": ["1", "1"],
						"HSCompliantToStandards": ["UL", "UL"],
						"HSMaxDemandWindow": ["Sliding", "Sliding"],
						"HSMaxDemandSlidingWindowInterval": ["15", "15"],
						"HSSensorDetails": ["abc12345", "abc12345"],
						"HSGPRSMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiIpAddress": ["10.9.176.103", "10.9.176.103"],
						"HSWiFiAccessPointPassword": ["0125hgfvbvc", "0125hgfvbvc"],
						"HSSimCardNumber": ["098765432109887", "098765432109887"],
						"HSLatitude": ["89.01", "89.01"],
						"HSLongitude": ["179.0215", "179.0215"],
						"ConnectedStreetlights": ["true", "true"],
						"StreetlightsMetered": ["true", "true"],
						"StreetlightUsage": ["12345678", "12345678"],
						"NoOfConnectedStreetlights": ["12345", "12345"],
						"WireSize": ["1234", "1234"],
						"MaxOilTemp": ["123", "123"],
						"MinOilTemp": ["123", "123"],
						"CameraConnect": ["false", "true"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});
		//=========== CASE - III
		it('Test Case - 9', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer2"],
						"TFMRMake": ["a"],
						"TFMRRatingCapacity": ["a"],
						"TFMRHighLineVoltage": ["123456"],
						"TFMRLowLineVoltage": ["1234"],
						"TFMRHighLineCurrent": ["123456"],
						"TFMRLowLineCurrent": ["1234"],
						"TFMRType": ["Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout3"],
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
		it('Test Case - 10', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer2"],
						"TFMRMake": ["a"],
						"TFMRRatingCapacity": ["a"],
						"TFMRHighLineVoltage": ["123456"],
						"TFMRLowLineVoltage": ["1234"],
						"TFMRHighLineCurrent": ["123456"],
						"TFMRLowLineCurrent": ["1234"],
						"TFMRType": ["Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout3"],
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
						"HSLatitude": ["89.01"],
						"HSLongitude": ["179.0215"],
						"ConnectedStreetlights": ["true"],
						"StreetlightsMetered": ["true"],
						"StreetlightUsage": ["12345678"],
						"NoOfConnectedStreetlights": ["12345"],
						"WireSize": ["1234"],
						"MaxOilTemp": ["123"],
						"MinOilTemp": ["123"],
						"CameraConnect": ["false"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});

		it('Test Case - 11', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer2", ""],
						"TFMRMake": ["a", "a"],
						"TFMRRatingCapacity": ["a", "a"],
						"TFMRHighLineVoltage": ["123456", "123456"],
						"TFMRLowLineVoltage": ["1234", "1234"],
						"TFMRHighLineCurrent": ["123456", "123456"],
						"TFMRLowLineCurrent": ["1234", "1234"],
						"TFMRType": ["Pad Mounted", "Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout3", ""],
						"HypersproutVersion": ["1234567", "1234567"],
						"HypersproutMake": ["abc", "abc"],
						"HSCTRatio": ["12345678", "12345678"],
						"HSPTRatio": ["12345678", "12345678"],
						"HSRatedVoltage": ["110", "110"],
						"HSNumberOfPhases": ["1", "1"],
						"HSRatedFrequency": ["50", "50"],
						"HSAccuracy": ["0.5", "0.5"],
						"HSDemandResetDate": ["1", "1"],
						"HSCompliantToStandards": ["UL", "UL"],
						"HSMaxDemandWindow": ["Sliding", "Sliding"],
						"HSMaxDemandSlidingWindowInterval": ["15", "15"],
						"HSSensorDetails": ["abc12345", "abc12345"],
						"HSGPRSMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiIpAddress": ["10.9.176.103", "10.9.176.103"],
						"HSWiFiAccessPointPassword": ["0125hgfvbvc", "0125hgfvbvc"],
						"HSSimCardNumber": ["098765432109887", "098765432109887"],
						"HSLatitude": ["89.01", "89.01"],
						"HSLongitude": ["179.0215", "179.0215"],
						"ConnectedStreetlights": ["true", "true"],
						"StreetlightsMetered": ["true", "true"],
						"StreetlightUsage": ["12345678", "12345678"],
						"NoOfConnectedStreetlights": ["12345", "12345"],
						"WireSize": ["1234", "1234"],
						"MaxOilTemp": ["123", "123"],
						"MinOilTemp": ["123", "123"],
						"CameraConnect": ["false", "true"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});
		it('Test Case - 12', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer2", "fhkTransformer3"],
						"TFMRMake": ["a", "a"],
						"TFMRRatingCapacity": ["a", "a"],
						"TFMRHighLineVoltage": ["123456", "123456"],
						"TFMRLowLineVoltage": ["1234", "1234"],
						"TFMRHighLineCurrent": ["123456", "123456"],
						"TFMRLowLineCurrent": ["1234", "1234"],
						"TFMRType": ["Pad Mounted", "Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout3", "fhkHypersprout3"],
						"HypersproutVersion": ["1234567", "1234567"],
						"HypersproutMake": ["abc", "abc"],
						"HSCTRatio": ["12345678", "12345678"],
						"HSPTRatio": ["12345678", "12345678"],
						"HSRatedVoltage": ["110", "110"],
						"HSNumberOfPhases": ["1", "1"],
						"HSRatedFrequency": ["50", "50"],
						"HSAccuracy": ["0.5", "0.5"],
						"HSDemandResetDate": ["1", "1"],
						"HSCompliantToStandards": ["UL", "UL"],
						"HSMaxDemandWindow": ["Sliding", "Sliding"],
						"HSMaxDemandSlidingWindowInterval": ["15", "15"],
						"HSSensorDetails": ["abc12345", "abc12345"],
						"HSGPRSMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiIpAddress": ["10.9.176.103", "10.9.176.103"],
						"HSWiFiAccessPointPassword": ["0125hgfvbvc", "0125hgfvbvc"],
						"HSSimCardNumber": ["098765432109887", "098765432109887"],
						"HSLatitude": ["89.01", "89.01"],
						"HSLongitude": ["179.0215", "179.0215"],
						"ConnectedStreetlights": ["true", "true"],
						"StreetlightsMetered": ["true", "true"],
						"StreetlightUsage": ["12345678", "12345678"],
						"NoOfConnectedStreetlights": ["12345", "12345"],
						"WireSize": ["1234", "1234"],
						"MaxOilTemp": ["123", "123"],
						"MinOilTemp": ["123", "123"],
						"CameraConnect": ["false", "true"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});
		//============  CASE - IV
		it('Test Case - 13', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer3", ""],
						"TFMRMake": ["a", "a"],
						"TFMRRatingCapacity": ["a", "a"],
						"TFMRHighLineVoltage": ["123456", "123456"],
						"TFMRLowLineVoltage": ["1234", "1234"],
						"TFMRHighLineCurrent": ["123456", "123456"],
						"TFMRLowLineCurrent": ["1234", "1234"],
						"TFMRType": ["Pad Mounted", "Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout3", ""],
						"HypersproutVersion": ["1234567", "1234567"],
						"HypersproutMake": ["abc", "abc"],
						"HSCTRatio": ["12345678", "12345678"],
						"HSPTRatio": ["12345678", "12345678"],
						"HSRatedVoltage": ["110", "110"],
						"HSNumberOfPhases": ["1", "1"],
						"HSRatedFrequency": ["50", "50"],
						"HSAccuracy": ["0.5", "0.5"],
						"HSDemandResetDate": ["1", "1"],
						"HSCompliantToStandards": ["UL", "UL"],
						"HSMaxDemandWindow": ["Sliding", "Sliding"],
						"HSMaxDemandSlidingWindowInterval": ["15", "15"],
						"HSSensorDetails": ["abc12345", "abc12345"],
						"HSGPRSMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiIpAddress": ["10.9.176.103", "10.9.176.103"],
						"HSWiFiAccessPointPassword": ["0125hgfvbvc", "0125hgfvbvc"],
						"HSSimCardNumber": ["098765432109887", "098765432109887"],
						"HSLatitude": ["89.01", "89.01"],
						"HSLongitude": ["179.0215", "179.0215"],
						"ConnectedStreetlights": ["true", "true"],
						"StreetlightsMetered": ["true", "true"],
						"StreetlightUsage": ["12345678", "12345678"],
						"NoOfConnectedStreetlights": ["12345", "12345"],
						"WireSize": ["1234", "1234"],
						"MaxOilTemp": ["123", "123"],
						"MinOilTemp": ["123", "123"],
						"CameraConnect": ["false", "true"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});

		it('Test Case - 14', function (done) {
			testSession.post('/NewTransformerHypersproutEntry')
				.send(
				{
					"insertNewTransformerHypersproutDetails": {
						"TFMRSerialNumber": ["fhkTransformer3", "fhkTransformer4"],
						"TFMRMake": ["a", "a"],
						"TFMRRatingCapacity": ["a", "a"],
						"TFMRHighLineVoltage": ["123456", "123456"],
						"TFMRLowLineVoltage": ["1234", "1234"],
						"TFMRHighLineCurrent": ["123456", "123456"],
						"TFMRLowLineCurrent": ["1234", "1234"],
						"TFMRType": ["Pad Mounted", "Pad Mounted"],
						"HypersproutSerialNumber": ["fhkHypersprout3", "fhkHypersprout4"],
						"HypersproutVersion": ["1234567", "1234567"],
						"HypersproutMake": ["abc", "abc"],
						"HSCTRatio": ["12345678", "12345678"],
						"HSPTRatio": ["12345678", "12345678"],
						"HSRatedVoltage": ["110", "110"],
						"HSNumberOfPhases": ["1", "1"],
						"HSRatedFrequency": ["50", "50"],
						"HSAccuracy": ["0.5", "0.5"],
						"HSDemandResetDate": ["1", "1"],
						"HSCompliantToStandards": ["UL", "UL"],
						"HSMaxDemandWindow": ["Sliding", "Sliding"],
						"HSMaxDemandSlidingWindowInterval": ["15", "15"],
						"HSSensorDetails": ["abc12345", "abc12345"],
						"HSGPRSMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
						"HSWiFiIpAddress": ["10.9.176.103", "10.9.176.103"],
						"HSWiFiAccessPointPassword": ["0125hgfvbvc", "0125hgfvbvc"],
						"HSSimCardNumber": ["098765432109887", "098765432109887"],
						"HSLatitude": ["89.01", "89.01"],
						"HSLongitude": ["179.0215", "179.0215"],
						"ConnectedStreetlights": ["true", "true"],
						"StreetlightsMetered": ["true", "true"],
						"StreetlightUsage": ["12345678", "12345678"],
						"NoOfConnectedStreetlights": ["12345", "12345"],
						"WireSize": ["1234", "1234"],
						"MaxOilTemp": ["123", "123"],
						"MinOilTemp": ["123", "123"],
						"CameraConnect": ["false", "true"],
						"Type": "Upload"
					}
				})
				.end(function (err, res) {
					var objDet = res.body;
					expect(objDet).not.to.equal(undefined);
					setTimeout(done, 1500);
				});
		});
		//======================
		it('Test Case - 15', function (done) {
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
									if ((objDet.TransformerDetailSelected[i].TransformerSerialNumber == "fhkTransformer") ||
										(objDet.TransformerDetailSelected[i].TransformerSerialNumber == "fhkTransformer1") ||
										(objDet.TransformerDetailSelected[i].TransformerSerialNumber == "fhkTransformer2") ||
										(objDet.TransformerDetailSelected[i].TransformerSerialNumber == "fhkTransformer3") ||
										(objDet.TransformerDetailSelected[i].TransformerSerialNumber == "fhkTransformer4")) {
										transformerID.push(objDet.TransformerDetailSelected[i].TransformerID);
									}
								}
							}
							if (objDet.HypersproutDetailsSelected.length > 0) {
								for (var j = 0; j < objDet.HypersproutDetailsSelected.length; j++) {
									if ((objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "fhkHypersprout") ||
										(objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "fhkHypersprout1") ||
										(objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "fhkHypersprout2") ||
										(objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "fhkHypersprout3") ||
										(objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "fhkHypersprout4")) {
										hypersproutID.push(objDet.HypersproutDetailsSelected[j].HypersproutID);
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

		it('Test Case - 16', function (done) {
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
		it('Test Case - 17', function (done) {
			testSession.post('/DeleteTransformerHypersproutDetails')
				.send(
				{
					"deleteTransformerHypersproutValues": {
						"TransformerID": null,
						"HypersproutID": null
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
							done(exc);
						}
					}, 1500);
				})
		});
	});
});