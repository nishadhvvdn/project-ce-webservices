var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - MeterBilling/MeterBillingUploadData', function () {
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
		testSession.post('/MeterBillingUploadData')
			.send({
				"Unit": 1423,
				"Account": 7618,
				"RC": 12,
				"Meter no": 2,
				"Physical mtr no": "00000000000000000BWM 1001",
				"Dials": 5,
				"Calcparm": "E",
				"Factor": 1,
				"Route": 80200001,
				"Old reading": 0,
				"Old date": "2017-03-15",
				"New reading": "",
				"New date": "2017-04-10",
				"Street": "BIRD",
				"Street no": "118",
				"Name": "DU PREEZ",
				"Initials": "CP",
				"Erf number": "0000/0000/00001457/00000/000",
				"Flat reference": "",
				"Meter location": "",
				"Average": "",
				"ErrorCode": "",
				"Latitude": "",
				"Longitude": ""
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
						done(exc);
					}
				}, 1500);
			})
	});

	/*it('MeterBillingUploadData - validate json body - 2', function (done) {
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
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
					} catch (exc) {
						done(exc);
					}
				}, 100);
			})
			.expect(200, done);
	});*/
});