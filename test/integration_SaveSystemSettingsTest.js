var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - /Administration/SystemSettings/SaveSystemSettings', function() {
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
    it('Test Case - 1', function(done) {
        testSession.post('/SaveSystemSettings')
            .send({
                "tabHeading": "Registration",
                "saveSettings": { "AutonaticDeregistrationPeriod": 2, "RegistrationDelay": 55, "RegistrationPeriod": 2 }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                setTimeout(function() {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.output).not.to.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200, done);
    });

    it('Test Case - 2', function(done) {
        testSession.post('/SaveSystemSettings')
            .send({
                "tabHeading": "Registration",
                "saveSettings": { "AutonaticDeregistrationPeriod": 1, "RegistrationDelay": 55, "RegistrationPeriod": 2 }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                setTimeout(function() {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.output).not.to.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200, done);
    });

    it('Test Case - 3', function(done) {
        testSession.post('/SaveSystemSettings')
            .send({
                "tabHeading": "Registration",
                "saveSettings": { "AutonaticDeregistrationPeriod": 1, "RegistrationDelay": 55, "RegistrationPeriod": 2 }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                setTimeout(function() {
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

    it('Test Case - 4', function(done) {
        testSession.post('/SaveSystemSettings')
            .send({
                "tabHeading": "Reg",
                "saveSettings": { "AutonaticDeregistrationPeriod": 1, "RegistrationDelay": 55, "RegistrationPeriod": 2 }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                setTimeout(function() {
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
         it('Test Case - 5', function(done) {
        testSession.post('/SaveSystemSettings')
            .send({
                "tabHeading": null,
                "saveSettings": null
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                setTimeout(function() {
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