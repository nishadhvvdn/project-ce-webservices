var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - ListSecurityID', function () {
    this.timeout(35000);
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
        testSession.get('/ListSecurityID')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.output).not.to.equal(null);
                        if (objDet.output != null) {
                            for (var i = 0; i < objDet.output.length; i++) {
                                expect(objDet.output[i]).not.to.be.undefined;
                                expect(objDet.output[i]).not.to.be.null;
                            }
                        }
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200, done);
    });
});