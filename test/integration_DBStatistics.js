var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - DatabaseStatistics/DBStatistics', function () {
    this.timeout(100000);
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
        testSession.post('/DBStatistics')
			.send(
			{
			   "StartTime":"2017-02-20T09:16:29",
			   "EndTime":"2017-02-21T09:17:24"
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
			    setTimeout(function () {
			        try {
			            var objDet = res.body;
			            expect(objDet.type).to.equal(true);
			        } catch (exc) {
			            done(exc);
			        }
			    }, 100);
			})
			.expect(200);
			setTimeout(done, 1500);
    });  
	 it('Test Case - 2', function (done) {
        testSession.post('/DBStatistics')
			.send(
			{
			   "StartTime":null,
			   "EndTime":null
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
			.expect(200);
			setTimeout(done, 1500);
    });   
	it('Test Case - 3', function (done) {
        testSession.post('/DBStatistics')
			.send(
			{
			   "EndTime":"2017-02-20T09:16:29",
			   "StartTime":"2017-02-21T09:17:24"
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
			.expect(200);
			setTimeout(done, 1500);
    });
});