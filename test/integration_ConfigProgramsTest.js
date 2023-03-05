var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - HyperSproutManagement/ConfigPrograms', function () {
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
        testSession.post('/ConfigPrograms')
            .send({ "Type": "HyperSprout" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.configProgramData).not.to.equal(null);
                        expect(objDet.memberInfo).not.to.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
               }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/ConfigPrograms')
            .send({ "Type": "Meter" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.be.equal(true);
                        expect(objDet.configProgramData).not.to.equal(null);
                        expect(objDet.memberInfo).not.to.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200);
            setTimeout(done, 1500);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/ConfigPrograms')
            .send({ "Type": "Transformers" })
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