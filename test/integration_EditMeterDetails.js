var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var meterID;
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - EditMeterDetails', function () {
	this.timeout(40000);
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
		testSession.post('/NewMeterEntry')
			.send(
			{
				"insertNewMeterDetails": {
					"MeterSerialNumber": ["fhkMeter"],
					"MeterVersion": ["1.0"],
					"MeterApptype": ["Residential"],
					"MeterInstallationLocation": ["In Door"],
					"MeterCTRatio": ["1"],
					"MeterPTRatio": ["1"],
					"MeterNumberOfPhases": ["1"],
					"MeterRatedFrequency": ["50"],
					"MeterRatedVoltage": ["110"],
					"MeterNominalCurrent": ["abcd"],
					"MeterMaximumCurrent": ["abcd"],
					"MeterAccuracy": ["111"],
					"MeterCompliantToStandards": ["1"],
					"MeterWiFiIpAddress": ["10.9.176.103"],
					"MeterWiFiAccessPointPassword": ["0000000000"],
					"MeterAdminPassword": ["00000000000000000000"],
					"MeterLatitude": [10.01],
					"MeterLongitude": [100.01],
					"MeterConsumerNumber": ["123"],
					"MeterConsumerName": ["abc"],
					"MeterConsumerAddress": ["abcd"],
					"MeterConsumerContactNumber": ["123456789101112"],
					"MeterBillingCycleDate": ["2"],
					"MeterBillingTime": ["abcd"],
					"MeterDemandResetDate": ["2"],
					"MeterMake": ["Vision"],
					"MeterDisconnector": ["Yes"],
					"MeterConsumerCountry": ["India"],
					"MeterConsumerState": ["Kar"],
					"MeterConsumerCity": ["abcd"],
					"MeterConsumerZipCode": ["560045"],
					"MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
					"ImpulseCountKWh": ["123"],
					"ImpulseCountKVARh": ["123"],
					"SealID": ["126"],
					"BiDirectional": [true],
					"EVMeter": [false],
					"SolarPanel": [true],
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
		testSession.post('/SMMeters')
			.send(
			{
				"PartSerialNo": "All"
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						if (objDet.details.length > 0) {
							for (var i = 0; i < objDet.details.length; i++) {
								if (objDet.details[i].MeterSerialNumber == "fhkMeter") {
									meterID.push(objDet.details[i].MeterID);
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
	it('Test Case - 3', function (done) {
		testSession.post('/EditMeterDetails')
			.send(
			{
				"updateMeterValues": {
					"MeterID": meterID,
					"MeterSerialNumber": "fhkMeter",
					"MeterVersion": "1.0",
					"MeterApptype": "Residential",
					"MeterInstallationLocation": "In Door",
					"MeterCTRatio": "1",
					"MeterPTRatio": "1",
					"MeterNumberOfPhases": "1",
					"MeterRatedFrequency": "50",
					"MeterRatedVoltage": "110",
					"MeterNominalCurrent": "abcd",
					"MeterMaximumCurrent": "abcd",
					"MeterAccuracy": "111",
					"MeterCompliantToStandards": "1",
					"MeterWiFiIpAddress": "10.9.176.103",
					"MeterWiFiAccessPointPassword": "0000000000",
					"MeterAdminPassword": "00000000000000000000",
					"MeterLatitude": 10.110,
					"MeterLongitude": 100.011,
					"MeterConsumerNumber": "123",
					"MeterConsumerName": "abc",
					"MeterConsumerAddress": "abcd",
					"MeterConsumerContactNumber": "123456789101112",
					"MeterBillingCycleDate": "2",
					"MeterBillingTime": "abcd",
					"MeterDemandResetDate": "2",
					"MeterMake": "Vision",
					"MeterDisconnector": "Yes",
					"MeterConsumerCountry": "India",
					"MeterConsumerState": "Kar",
					"MeterConsumerCity": "abcd",
					"MeterConsumerZipCode": "560045",
					"MeterWiFiMacID": "84:3A:4B:4F:DF:70",
					"ImpulseCountKWh": "123",
					"ImpulseCountKVARh": "123",
					"SealID": "126",
					"BiDirectional": true,
					"EVMeter": false,
					"SolarPanel": true,
					"MeterWiFiPassFlag": "N"
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
						setTimeout(1500, done);
					}
				}, 1500);
			})
	});
	it('Test Case - 4', function (done) {
		testSession.post('/EditMeterDetails')
			.send(
			{
				"updateMeterValues": {
					"MeterID": 46,
					"MeterSerialNumber": "3000000000000000000MS0001",
					"MeterVersion": "1.0",
					"MeterApptype": "Residential",
					"MeterInstallationLocation": "In Door",
					"MeterCTRatio": "1",
					"MeterPTRatio": "1",
					"MeterNumberOfPhases": "1",
					"MeterRatedFrequency": "50",
					"MeterRatedVoltage": "110",
					"MeterNominalCurrent": "abcd",
					"MeterMaximumCurrent": "abcd",
					"MeterAccuracy": "111",
					"MeterCompliantToStandards": "1",
					"MeterWiFiIpAddress": "10.9.176.103",
					"MeterWiFiAccessPointPassword": "0000000000",
					"MeterAdminPassword": "00000000000000000000",
					"MeterLatitude": 10.110,
					"MeterLongitude": 100.011,
					"MeterConsumerNumber": "123",
					"MeterConsumerName": "abc",
					"MeterConsumerAddress": "abcd",
					"MeterConsumerContactNumber": "123456789101112",
					"MeterBillingCycleDate": "2",
					"MeterBillingTime": "abcd",
					"MeterDemandResetDate": "2",
					"MeterMake": "Vision",
					"MeterDisconnector": "Yes",
					"MeterConsumerCountry": "India",
					"MeterConsumerState": "Kar",
					"MeterConsumerCity": "abcd",
					"MeterConsumerZipCode": "560045",
					"MeterWiFiMacID": "84:3A:4B:4F:DF:70",
					"ImpulseCountKWh": "123",
					"ImpulseCountKVARh": "123",
					"SealID": "126",
					"BiDirectional": true,
					"EVMeter": false,
					"SolarPanel": true,
					"MeterWiFiPassFlag": "Y"
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
						console.log('Case 4 ' + JSON.stringify(objDet))
						expect(objDet.type).not.to.equal(null);
						done();
					} catch (exc) {
						setTimeout(done, 1500);
					}
				}, 1500);
			})

	});
		
	it('Test Case -  5', function (done) {
		testSession.post('/EditMeterDetails')
			.send(
			{
				"updateMeterValues": {
					"MeterID": null,
					"MeterSerialNumber": null,
					"MeterVersion": "1.0",
					"MeterApptype": "Residential",
					"MeterInstallationLocation": "In Door",
					"MeterCTRatio": "1",
					"MeterPTRatio": "1",
					"MeterNumberOfPhases": "1",
					"MeterRatedFrequency": "50",
					"MeterRatedVoltage": "110",
					"MeterNominalCurrent": "abcd",
					"MeterMaximumCurrent": "abcd",
					"MeterAccuracy": "111",
					"MeterCompliantToStandards": "1",
					"MeterWiFiIpAddress": "10.9.176.103",
					"MeterWiFiAccessPointPassword": "0000000000",
					"MeterAdminPassword": "00000000000000000000",
					"MeterLatitude": 10.11,
					"MeterLongitude": 100.11,
					"MeterConsumerNumber": "123",
					"MeterConsumerName": "abc",
					"MeterConsumerAddress": "abcd",
					"MeterConsumerContactNumber": "123456789101112",
					"MeterBillingCycleDate": "2",
					"MeterBillingTime": "abcd",
					"MeterDemandResetDate": "2",
					"MeterMake": "Vision",
					"MeterDisconnector": "Yes",
					"MeterConsumerCountry": "India",
					"MeterConsumerState": "Kar",
					"MeterConsumerCity": "abcd",
					"MeterConsumerZipCode": "560045",
					"MeterWiFiMacID": "84:3A:4B:4F:DF:70",
					"ImpulseCountKWh": "123",
					"ImpulseCountKVARh": "123",
					"SealID": "126",
					"BiDirectional": true,
					"EVMeter": false,
					"SolarPanel": true,
					"MeterWiFiPassFlag": "N"
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
		testSession.post('/EditMeterWifiChangeResponse')
			.send(
			{
				"MeterID": 20,
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
		testSession.post('/DeleteMeterDetails')
			.send(
			{
				"deleteMeterValues": {
					"MeterID": meterID
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