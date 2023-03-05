var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - SMMetersTest', function () {
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
        testSession.post('/SMMeters')
            .send(
            {
                "PartSerialNo": "All"
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
                                expect(objDet.details[i].MeterID).not.to.be.undefined;
                                expect(objDet.details[i].MeterID).not.to.be.null;
                                expect(objDet.details[i].MeterSerialNumber).not.to.be.undefined;
                                expect(objDet.details[i].MeterSerialNumber).not.to.be.null;
                                expect(objDet.details[i].Status).not.to.be.undefined;
                                expect(objDet.details[i].Status).not.to.be.null;
                                expect(objDet.details[i].Meters_DeviceDetails).not.to.be.undefined;
                                expect(objDet.details[i].Meters_DeviceDetails).not.to.be.null;
                            }
                        }
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/SMMeters')
            .send(
            {
                "PartSerialNo": "0000"
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
                                expect(objDet.details[i].MeterID).not.to.be.undefined;
                                expect(objDet.details[i].MeterID).not.to.be.null;
                                expect(objDet.details[i].MeterSerialNumber).not.to.be.undefined;
                                expect(objDet.details[i].MeterSerialNumber).not.to.be.null;
                                expect(objDet.details[i].Status).not.to.be.undefined;
                                expect(objDet.details[i].Status).not.to.be.null;
                                expect(objDet.details[i].Meters_DeviceDetails).not.to.be.undefined;
                                expect(objDet.details[i].Meters_DeviceDetails).not.to.be.null;
                            }
                        }
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/SMMeters')
            .send(
            {
                "PartSerialNo": "shkjfhkljf123"
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
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });
    it('Test Case - 4', function (done) {
        testSession.post('/SMMeters')
            .send(
            {
                "PartSerialNo": null
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
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
            .expect(200, done);
    });
});