var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - Registration/DisplayAllCircuitDetails ', function () {
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
        testSession.get('/DisplayAllCircuitDetails')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
			    setTimeout(function () {
			        try {
			            var objDet = res.body;
			            expect(objDet.type).to.equal(true);
			            expect(objDet.circuitDetailSelected).not.to.equal(null);
			            if (objDet.circuitDetailSelected != null) {
			                for (var i in objDet.circuitDetailSelected) {
			                    expect(objDet.circuitDetailSelected[i]._id).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].CircuitNumber).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].CircuitNumber).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].CircuitID).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].CircuitID).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].KVARating).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].KVARating).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].SubstationID).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].SubstationID).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].SubstationName).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].SubstationName).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].Address).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].Address).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].Country).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].Country).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].State).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].State).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].City).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].City).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].ZipCode).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].ZipCode).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].Latitude).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].Latitude).not.to.be.null;
			                    expect(objDet.circuitDetailSelected[i].Longitude).not.to.be.undefined;
			                    expect(objDet.circuitDetailSelected[i].Longitude).not.to.be.null;
			                }
			            }
			        } catch (exc) {
			            done(exc);
			        }
			    }, 100);
			})
			.expect(200);
			setTimeout(done, 1500);
    });
});