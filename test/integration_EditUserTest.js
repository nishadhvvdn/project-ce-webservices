var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - Administration/Users/EditUser ', function () {
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
        testSession.post('/EditUser')
            .send(
            {
                "UserID": "shweta", "LoginID": "HJR8q9_8-", "FirstName": "Shwetha", "LastName": "Parida", "EmailAddress": "Shweta.Parida@Lnttechservices.com", "SecurityGroup": "Administrator", "HomePage": "Meter Management", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "true", "Temprature": "Celsius"
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log(JSON.stringify(objDet));
                expect(objDet.type).not.to.equal(null);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 2', function (done) {
        testSession.post('/EditUser')
            .send(
            {
                "UserID": "shwetha", "LoginID": "HJR8q9_8-", "FirstName": "Shwetha", "LastName": "Parida", "EmailAddress": "Shweta.Parida@Lnttechservices.com", "SecurityGroup": "Administrator", "HomePage": "Meter Management", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false", "Temprature": "Celsius"
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log(JSON.stringify(objDet));
                expect(objDet.type).not.to.equal(null);
                setTimeout(done, 1500);
            });
    });


    it('Test Case - 3', function (done) {
        testSession.post('/EditUser')
            .send(
            {
                "UserID": "shwetha", "LoginID": "HJR8q9_8-", "FirstName": "Shwetha", "LastName": "Parida", "EmailAddress": "Shweta.Parida", "SecurityGroup": "Administrator", "HomePage": "Meter Management", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false", "Temprature": "Celsius"
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log(JSON.stringify(objDet));
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 4', function (done) {
        testSession.post('/EditUser')
            .send(
            {
                "UserID": "shwetha", "LoginID": "HJR8_8-", "FirstName": "Shwetha", "LastName": "Parida", "EmailAddress": "Shweta.Parida", "SecurityGroup": "Administrator", "HomePage": "Meter Management", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false", "Temprature": "Celsius"
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log(JSON.stringify(objDet));
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 5', function (done) {
        testSession.post('/EditUser')
            .send(
            {
                "UserID": "bins", "LoginID": "HJR8q9_8-", "FirstName": "Shwetha", "LastName": "Parida", "EmailAddress": "Shweta.Parida", "SecurityGroup": "Administrator", "HomePage": "Meter Management", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false", "Temprature": "Celsius"
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log(JSON.stringify(objDet));
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 6', function (done) {
        testSession.post('/EditUser')
            .send(
            {
                "UserID": "shwetha", "LoginID": "HJR8q9_8-", "FirstName": "Shwetha", "LastName": "Parida", "EmailAddress": "anand.prakash@lnttechservices.com", "SecurityGroup": "Administrator", "HomePage": "Meter Management", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false", "Temprature": "Celsius"
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log(JSON.stringify(objDet));
                expect(objDet.type).to.equal(true);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 7', function (done) {
        testSession.post('/EditUser')
            .send(
            {
                "UserID": "shwetha", "LoginID": "HJR8q9_8-", "FirstName": "shwetha", "LastName": "parida", "EmailAddress": "Shweta.Parida@Lnttechservices.com", "SecurityGroup": "Administrator", "HomePage": "Meter Management", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false", "Temprature": "Celsius"
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log(JSON.stringify(objDet));
                expect(objDet.type).not.to.equal(null);
                setTimeout(done, 1500);
            });
    });

    it('Test Case - 8', function (done) {
        testSession.post('/EditUser')
            .send({
                "UserID": "vishnu", "FirstName": "test12", "LastName": "unittest2", "EmailAddress": "unittest@gmail.com", "SecurityGroup": "Administrator", "HomePage": "test", "TimeZone": { "countryModel": "IN", "timezoneModel": "Asia/Kolkata" }, "AccountLocked": "false"
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });
});