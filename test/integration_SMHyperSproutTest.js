var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - SMHyperSproutTest', function () {
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
        testSession.post('/SMHyperSprout')
            .send(
            {
                "PartSerialNo": "All",
                "Type": "HyperSprout"
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.details).not.to.equal(null);
                        if (objDet.details != null) {
                            for (var i = 0; i < objDet.details.length; i++) {
                                expect(objDet.details[i]._id).not.to.be.undefined;
                                expect(objDet.details[i]._id).not.to.be.null;
                                expect(objDet.details[i].HypersproutID).not.to.be.undefined;
                                expect(objDet.details[i].HypersproutID).not.to.be.null;
                                expect(objDet.details[i].HypersproutSerialNumber).not.to.be.undefined;
                                expect(objDet.details[i].HypersproutSerialNumber).not.to.be.null;
                                expect(objDet.details[i].Status).not.to.be.undefined;
                                expect(objDet.details[i].Status).not.to.be.null;
                                expect(objDet.details[i].Hypersprout_DeviceDetails).not.to.be.undefined;
                                expect(objDet.details[i].Hypersprout_DeviceDetails).not.to.be.null;
                            }
                        }
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200, done);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/SMHyperSprout')
            .send(
            {
                "PartSerialNo": "0000",
                "Type": "HyperSprout"
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.details).not.to.equal(null);
                        if (objDet.details != null) {
                            for (var i = 0; i < objDet.details.length; i++) {
                                expect(objDet.details[i].HypersproutID).not.to.be.undefined;
                                expect(objDet.details[i].HypersproutID).not.to.be.null;
                                expect(objDet.details[i].HypersproutSerialNumber).not.to.be.undefined;
                                expect(objDet.details[i].HypersproutSerialNumber).not.to.be.null;
                                expect(objDet.details[i].Status).not.to.be.undefined;
                                expect(objDet.details[i].Status).not.to.be.null;
                                expect(objDet.details[i].Hypersprout_DeviceDetails).not.to.be.undefined;
                                expect(objDet.details[i].Hypersprout_DeviceDetails).not.to.be.null;
                            }
                        }
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200, done);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/SMHyperSprout')
            .send(
            {
                "PartSerialNo": "shkjfhkljf123",
                "Type": "Hyperhub"
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
    it('Test Case - 4', function (done) {
        testSession.post('/SMHyperSprout')
            .send(
            {
                "PartSerialNo": null,
                "Type": null
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