var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - DeviceStatus', function () {
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
        testSession.post('/DeviceStatus')
            .send(
            {
                "DeviceID": "HS-000000000000000000HSCELL6"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 2', function (done) {
        testSession.post('/DeviceStatus')
            .send({
                "DeviceID": "400000000000000000HSFWUPP"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(undefined);
               setTimeout(done, 1500);
            });
    });
    it('Test Case - 3', function (done) {
        testSession.post('/DeviceStatus')
            .send(
            {
                "DeviceID": null
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });
});