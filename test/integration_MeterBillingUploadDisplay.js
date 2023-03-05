var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - MeterBilling/MeterBillingUploadDisplay ', function () {
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
		testSession.get('/MeterBillingUploadDisplay')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.meterBillingDetails).not.to.equal(null);
						if (objDet.meterBillingDetails != null) {
							for (var i in objDet.meterBillingDetails) {
								expect(objDet.meterBillingDetails[i].Unit).not.to.be.null;
								expect(objDet.meterBillingDetails[i].Account).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].Account).not.to.be.null;
								expect(objDet.meterBillingDetails[i].RC).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].RC).not.to.be.null;
								expect(objDet.meterBillingDetails[i].MeterNumber).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].MeterNumber).not.to.be.null;
								expect(objDet.meterBillingDetails[i].PhysicalMeterNumber).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].PhysicalMeterNumber).not.to.be.null;
								expect(objDet.meterBillingDetails[i].Dials).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].Dials).not.to.be.null;
								expect(objDet.meterBillingDetails[i].Calcparm).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].Calcparm).not.to.be.null;
								expect(objDet.meterBillingDetails[i].Factor).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].Factor).not.to.be.null;
								expect(objDet.meterBillingDetails[i].Route).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].Route).not.to.be.null;
								expect(objDet.meterBillingDetails[i].OldReading).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].OldReading).not.to.be.null;
								expect(objDet.meterBillingDetails[i].OldDate).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].OldDate).not.to.be.null;
								expect(objDet.meterBillingDetails[i].NewReading).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].NewReading).not.to.be.null;
								expect(objDet.meterBillingDetails[i].NewDate).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].NewDate).not.to.be.null;
								expect(objDet.meterBillingDetails[i].Street).not.to.be.undefined;
								expect(objDet.meterBillingDetails[i].Street).not.to.be.null;
							}
						}
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			});
	});
});