var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - /Reports/SystemLogReport', function () {
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
        testSession.post('/SystemLogReport')
            .send({
                "StartTime": "2017-01-06T14:08:31.704Z",
                "EndTime": "2017-01-06T14:09:31.704Z"
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
        testSession.post('/SystemLogReport')
            .send({
                "StartTime": "2016-01-10T06:31:54.701Z",
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
});