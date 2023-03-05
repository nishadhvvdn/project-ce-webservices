var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - /Administration/Security/UpdatedPasswordSettings ', function () {
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
        testSession.get('/UpdatedPasswordSettings')
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
                                ;
                                //expect(objDet.output[i].Type.Settings.LockoutDuration).not.to.be.undefined;
                                expect(objDet.output[i].Type.Settings.LockoutDuration).not.to.be.null;
                                // expect(objDet.output[i].Type.Settings.MaximumLogonFailuresbeforeLockout).not.to.be.undefined;
                                expect(objDet.output[i].Type.Settings.MaximumLogonFailuresbeforeLockout).not.to.be.null;
                                //expect(objDet.output[i].Type.Settings.MaximumPasswordAge).not.to.be.undefined;
                                expect(objDet.output[i].Type.Settings.MaximumPasswordAge).not.to.be.null;
                                //expect(objDet.output[i].Type.Settings.MinimumPasswordAge).not.to.be.undefined;
                                expect(objDet.output[i].Type.Settings.MinimumPasswordAge).not.to.be.null;
                                //expect(objDet.output[i].Type.Settings.MinimumPasswordLength).not.to.be.undefined;
                                expect(objDet.output[i].Type.Settings.MinimumPasswordLength).not.to.be.null;
                                //expect(objDet.output[i].Type.Settings.NumberofPasswordstoStore).not.to.be.undefined;
                                expect(objDet.output[i].Type.Settings.NumberofPasswordstoStore).not.to.be.null;
                            }
                        }
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });
});