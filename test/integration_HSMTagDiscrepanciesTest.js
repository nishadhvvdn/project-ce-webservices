var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - HyperSproutManagement/HSMTagDiscrepancies', function () {
	this.timeout(180000);

	before(function (done) {
		objSession.initSession(function (objSessionData) {
			testSession = objSessionData;
			setTimeout(done, 1500);
		})
	});

	after(function () {
        objSession.destroySession(testSession) 
	});
	
	it('Test Case - 1', function (done) {
		testSession.post('/HSMTagDiscrepancies')
			.send({
				"StartTime": "2017-08-01T14:08:48.800Z",
				"EndTime": "2017-08-08T03:38:53.990Z"
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(true);
						expect(objDet.TagDiscrepanciesSelected).not.to.equal(null);
						if (objDet.TagDiscrepanciesSelected != null) {
							for (var i in objDet.TagDiscrepanciesSelected) {
								expect(objDet.TagDiscrepanciesSelected[i]._id).not.to.be.undefined;
								expect(objDet.TagDiscrepanciesSelected[i]._id).not.to.be.null;
							}
						}
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
			.expect(200,done);
	});
});