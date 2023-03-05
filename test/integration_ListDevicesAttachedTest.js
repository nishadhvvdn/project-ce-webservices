var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - HyperSproutManagement/ListDevicesAttached ', function () {
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
        testSession.post('/ListDevicesAttached')
            .send({ "GroupID": 1, "Type": "HyperSprout", "GroupType": "Configuration Group" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).not.to.be.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/ListDevicesAttached')
            .send({ "GroupID": 2, "Type": "Meter", "GroupType": "Configuration Group" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).not.to.be.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('vTest Case - 3', function (done) {
        testSession.post('/ListDevicesAttached')
            .send({ "GroupID": 5, "Type": "HyperSprout", "GroupType": "Application Group" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).not.to.be.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 4', function (done) {
        testSession.post('/ListDevicesAttached')
            .send({ "GroupID": 2, "Type": "Meter", "GroupType": "Application Group" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        //expect(objDet.type).to.be.equal(true);
                        expect(objDet.type).not.to.be.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 5', function (done) {
        testSession.post('/ListDevicesAttached')
            .send({ "GroupID": 2, "Type": "Server", "GroupType": "Application Group" })
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
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 6', function (done) {
        testSession.post('/ListDevicesAttached')
            .send({ "GroupID": 2, "Type": "Meter", "GroupType": "App Grp" })
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
                }, 1500);
            })
            .expect(200, done);
    });
    it('Test Case - 7', function (done) {
        testSession.post('/ListDevicesAttached')
            .send({ "GroupID": null, "Type": null, "GroupType": null })
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
                }, 1500);
            })
            .expect(200, done);
    });
});