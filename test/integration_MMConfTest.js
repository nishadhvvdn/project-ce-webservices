var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - MeterManagement/MMConf ', function () {
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
    it('Test Case -1', function (done) {
        testSession.get('/MMConf')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        expect(objDet.memberInfo).not.to.equal(null);
                        expect(objDet.meterData).not.to.equal(null);
                        if (objDet.hyperSproutData != null) {
                            for (var i = 0; i < objDet.hyperSproutData.length; i++) {
                                expect(objDet.meterData[i]._id).not.to.be.undefined;
                                expect(objDet.meterData[i]._id).not.to.be.null;
                                expect(objDet.meterData[i].ConfigID).not.to.be.undefined;
                                expect(objDet.meterData[i].ConfigID).not.to.be.null;
                                expect(objDet.meterData[i].ConfigName).not.to.be.undefined;
                                expect(objDet.meterData[i].ConfigName).not.to.be.null;
                                //expect(objDet.meterData[i].DeviceClass).not.to.be.undefined;
                                //expect(objDet.meterData[i].DeviceClass).not.to.be.null;
                                expect(objDet.meterData[i].ClassName).not.to.be.undefined;
                                expect(objDet.meterData[i].ClassName).not.to.be.null;
                                expect(objDet.meterData[i].Description).not.to.be.undefined;
                                expect(objDet.meterData[i].Description).not.to.be.null;
                                expect(objDet.meterData[i].Version).not.to.be.undefined;
                                expect(objDet.meterData[i].Version).not.to.be.null;
                                //expect(objDet.hyperSproutData[i].EditDate).not.to.be.undefined;
                                //expect(objDet.hyperSproutData[i].EditDate).not.to.be.null;
                                expect(objDet.meterData[i].EditTime).not.to.be.undefined;
                                expect(objDet.meterData[i].EditTime).not.to.be.null;
                            }
                        }
                        if (objDet.memberInfo != null) {
                            for (var i = 0; i < objDet.memberInfo.length; i++) {
                                expect(objDet.memberInfo[i].configID).not.to.be.undefined;
                                expect(objDet.memberInfo[i].configID).not.to.be.null;
                                expect(objDet.memberInfo[i].Members).not.to.be.undefined;
                                expect(objDet.memberInfo[i].Members).not.to.be.undefined;
                            }
                        }
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            });
    });
});