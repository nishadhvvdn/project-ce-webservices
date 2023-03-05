var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - /Administration/SystemSettings/RestoreDefaultSettings ', function () {
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
        testSession.post('/RestoreDefaultSettings')
            .send({ "tabHeading": "Communications" })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(true);
                setTimeout(done, 1500);
            });
    });

    it('Test Case -2', function (done) {

        testSession.post('/RestoreDefaultSettings')
            .send({ "tabHeading": "Comms" })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });
});