var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - Administration/Users/ResetPassword', function () {
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
        testSession.post('/AddUser')
            .send(
            {
                "UserID": "IntegrationTest", "FirstName": "test", "LastName": "unittest", "EmailAddress": "integrationtest@gmail.com",
                "SecurityGroup": "unittest", "HomePage": "test", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false"
            })
            .end(function (err, res) {
                var objDet = res.body;
                setTimeout(done, 1500);
            });
    });
    it('Test Case -2', function (done) {
        testSession.post('/ResetPassword')
            .send(
            {
                "UserID": "IntegrationTest"
            })
            .end(function (err, res) {
                var objDet = res.body;

                console.log("objDet : l", objDet);
                if (objDet.type == true) {
                    expect(objDet.type).to.equal(true);
                    done();
                } else {
                    expect(objDet.type).to.equal(false);
                    setTimeout(done, 1500);
                }
            });
    });

    it('Test Case - 3', function (done) {
        testSession.post('/DeleteUser')
            .send(
            {
                "UserID": "IntegrationTest"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(true);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 4', function (done) {

        testSession
            .post('/ResetPassword')
            .send({
                "UserID": "UserNotAvailable"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });
});