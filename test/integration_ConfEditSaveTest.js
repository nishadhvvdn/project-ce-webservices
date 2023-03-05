var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/HSMConfEditSave', function () {
    this.timeout(30000);
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
        testSession.post('/HSMConfEditSave')
            .send({
                "updatevalues": {
                    "ConfigID": 62,
                    "ConfigProgramName": 'TestingIntTest2',
                    "Type": 'HyperSprout'
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        .expect(200);
        setTimeout(done, 1500);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/HSMConfEditSave')
            .send({
                "updatevalues": {
                    "ConfigID": 62,
                    "ConfigProgramName": 'TestingIntTest',
                    "Type": 'HyperSprout'
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        .expect(200);
        setTimeout(done, 1500);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/HSMConfEditSave')
            .send({
                "updatevalues": {
                    "ConfigID": null,
                    "ConfigProgramName": 'TestingIntTest',
                    "Type": 'Transformer'
                }
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
                }, 100);
            })
        .expect(200);
        setTimeout(done, 1500);
    });

    it('Test Case - 4', function (done) {
        testSession.post('/HSMConfEditSave')
            .send({
                "updatevalues": {
                    "ConfigID": 3,
                    "ConfigProgramName": 'TestingIntTest',
                    "Type": 'Transformer'
                }
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
                }, 100);
            })
        .expect(200);
        setTimeout(done, 1500);
    });

    it('Test Case - 5', function (done) {
        testSession.post('/HSMConfEditSave')
            .send({
                "updatevalues": {
                    "ConfigID": 63,
                    "ConfigProgramName": 'MMIntTestProg2',
                    "Type": 'Meter'
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        .expect(200);
        setTimeout(done, 1500);
    });

    it('Test Case - 6', function (done) {
        testSession.post('/HSMConfEditSave')
            .send({
                "updatevalues": {
                    "ConfigID": 63,
                    "ConfigProgramName": 'MMIntTestProg',
                    "Type": 'Meter'
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 100);
            })
        .expect(200);
        setTimeout(done, 1500);
    });
});

