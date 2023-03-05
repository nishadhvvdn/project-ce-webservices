var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test -  OnDemand/MeterConnectDisconnectResponse', function () {
    this.timeout(30000);
	beforeEach(function (done) {
        objSession.initSession(function (objSessionData) {
            testSession = objSessionData;
            done();
        })
    });

    afterEach(function (done) {
        objSession.destroySession(testSession, function (res) {
            done();
        });
    });
    it('Test Case - 1', function (done) {
        testSession.post('/MeterConnectDisconnectResponse')
			.send(
			{
			    "Action":"ACTION_FOR_DEVICE",
				"Attribute": "METER_DISCONNECT",
				"MeterID": "53",
				"cellID":14,
				"Data":[{"STATUSCODE":0}]	
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
			    setTimeout(function () {
			        try {
			            var objDet = res.body;
			            expect(objDet.Type).to.equal(true);
			        } catch (exc) {
			            done(exc);
			        }
			    }, 100);
			})
			.expect(200, done);
    });
	it('Test Case - 2', function (done) {
        testSession.post('/MeterConnectDisconnectResponse')
			.send(
			{
			    "Action":"ACTION_FOR_DEVICE",
				"Attribute": "METER_DISCONNECT",
				"MeterID": "54",
				"cellID":14,
				"Data":[{"STATUSCODE":0}]	
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
			    setTimeout(function () {
			        try {
			            var objDet = res.body;
			            expect(objDet.Type).to.equal(true);
			        } catch (exc) {
			            done(exc);
			        }
			    }, 100);
			})
			.expect(200, done);
    });

	it('Test Case - 3', function (done) {
        testSession.post('/MeterConnectDisconnectResponse')
			.send(
			{
			    "Action":"ACTION_FOR_DEVICE",
				"Attribute": "METER_DISCONNECT",
				"MeterID": "54",
				"cellID":14,
				"Data":[{"STATUSCODE":1}]	
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
			    setTimeout(function () {
			        try {
			            var objDet = res.body;
			            expect(objDet.Type).to.equal(true);
			        } catch (exc) {
			            done(exc);
			        }
			    }, 100);
			})
			.expect(200, done);
    });

it('Test Case - 4', function (done) {
        testSession.post('/MeterConnectDisconnectResponse')
			.send(
			{
			    "Action":null,
				"Attribute": null,
				"MeterID": null,
				"cellID":null,
				"Data":[{"STATUSCODE":null}]	
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
    });
});