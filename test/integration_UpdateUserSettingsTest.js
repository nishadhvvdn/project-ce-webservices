var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - Tools/UpdateUserSettings ', function () {
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
        testSession.post('/UpdateUserSettings')
            .send(
            {
                "UserID": "admin",
                "LoginID": "SyzWRbOsl",
                "FirstName": "Delta",
                "LastName": "VINE",
                "EmailAddress": "chandrashekar.s@lnttechservices.com",
                "HomePage": "Home Screen",
                "TimeZone": "Asia/Kolkata",
                "Temprature": "Celsius",
                "Password": "aura@001"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(true);
                expect(objDet.output).not.to.equal(null);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 2', function (done) {
        testSession.post('/UpdateUserSettings')
            .send({
                "UserID": "User4",
                "FirstName": "test",
                "LastName": "unittest",
                "TimeZone": {
                    "countryModel": "IN",
                    "timezoneModel": "Asia/Kolkata"
                },
                "AccountLocked": "false"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });
    it('Test Case - 3', function (done) {
        testSession.post('/UpdateUserSettings')
            .send(
            {
                "UserID": "admin",
                "LoginID": "SyzWRbOsl",
                "FirstName": "Delta",
                "LastName": "VINE",
                "EmailAddress": "chandrashekar.s111es.com",
                "HomePage": "Home Screen",
                "TimeZone": "Asia/Kolkata",
                "Temprature": "Celsius",
                "Password": "aura@001"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });
});