var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - InvalidPacketIntimation', function () {
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
        testSession.post('/InvalidPacketIntimation')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 0,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": 1,
                "MeterID": 0
            })
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    var objDet = res.body;
                    expect(objDet).not.to.equal(undefined);
                    done();
                }, 1500);
            });
    });

    it('Test Case - 2', function (done) {
        testSession.post('/InvalidPacketIntimation')
            .send({
                "Rev": 0,
                "Count": 0,
                "MessageID": 0,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": "abc",
                "MeterID": 0
            })
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    var objDet = res.body;
                    expect(objDet.Type).to.equal(false);
                    done();
                }, 1500);
            });
    });

    it('Test Case - 3', function (done) {
        testSession.post('/InvalidPacketIntimation')
            .send({
                "Rev": 0,
                "Count": 0,
                "MessageID": 0,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "CountryCode": 0,
                "CellID": 0,
                "MeterID": 0
            })
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    var objDet = res.body;
                    expect(objDet.Type).to.equal(false);
                    done();
                }, 1500);
            });
    });

    it('Test Case - 4', function (done) {
        testSession.post('/InvalidPacketIntimation')
            .send({
                "Rev": null,
                "MessageID": null,
                "Action": null,
                "Attribute": null,
                "CountryCode": null,
                "RegionCode": null,
                "CellID": null,
                "MeterID": null
            })
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    var objDet = res.body;
                    expect(objDet.type).to.equal(false);
                    done();
                }, 1500);
            });
    });
});