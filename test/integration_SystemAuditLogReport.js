var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - Reports/SystemAuditLogReport', function () {
    this.timeout(45000);
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
        testSession.post('/SystemAuditLogReport')
            .send({
                "StartTime": "2017-08-03T14:08:48.800Z",
                "EndTime": "2017-08-04T03:38:53.990Z"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        //expect(objDet.type).to.be.equal(true);
                        expect(objDet.Details).not.to.equal(null);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/SystemAuditLogReport')
            .send({
                "StartTime": null,
                "EndTime": "2016-01-10T07:31:54.701Z"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/SystemAuditLogReport')
            .send({
                "StartTime": "2017-08-0314:08:48.800Z",
                "EndTime": "2016-01-1007:31:54.701Z"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });
});