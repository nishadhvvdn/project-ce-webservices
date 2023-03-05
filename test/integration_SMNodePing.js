var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - SystemManagement/SMNodePing', function () {
    this.timeout(30000);

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
        testSession.post('/SMNodePing')
            .send(
            {
                "SerialNumber": "000000000000000CELL3_TEST",
                "Type": "HyperSprout"
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        if (objDet.type == false)
                            //console.log("Error :- " + objDet.Message)
                            expect(objDet.type).not.to.equal(null);
                        expect(objDet.Output).not.to.equal(null);
                        //expect(objDet.Output).not.to.be.undefined;
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 2', function (done) {
        testSession.post('/SMNodePing')
            .send({
                "SerialNumber": "abc5689",
                "Type": "HyperSprout"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log("Resp :- " + JSON.stringify(objDet));
                        expect(objDet.type).to.equal(false);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 3', function (done) {
        testSession.post('/SMNodePing')
            .send(
            {
                "SerialNumber": "000000000000000000CELL002",
                "Type": "Meters"
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test Case - 4', function (done) {
        testSession.post('/SMNodePing')
            .send(
            {
                "SerialNumber": null,
                "Type": null
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });
});