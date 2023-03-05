var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - /Administration/Security/SavePasswordSettings', function () {
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
        testSession.post('/SavePasswordSettings')
            .send({
                PasswordSettings: {
                    "EnablePasswordPolicy": true,
                    "LockoutDuration": 4,
                    "MaximumLogonFailuresbeforeLockout": 6,
                    "MaximumPasswordAge": 90,
                    "MinimumPasswordAge": 5,
                    "MinimumPasswordLength": 7,
                    "NumberofPasswordstoStore": 2
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(true);
                setTimeout(done, 1500);
                /*if (!module.parent) {
                    app.listen(3000);
                }*/
            });
    });
     it('Test Case - 2', function (done) {
         testSession.post('/SavePasswordSettings')
             .send({
                 PasswordSettings: {
                     "EnablePasswordPolicy": true,
                     "LockoutDuration": 4,
                     "MaximumLogonFailuresbeforeLockout": 6,
                     "MaximumPasswordAge": 90,
                     "MinimumPasswordAge": 5,
                     "MinimumPasswordLength": 5,
                     "NumberofPasswordstoStore": 2
                 }
             })
             .end(function (err, res) {
                 var objDet = res.body;
                 expect(objDet.type).to.equal(true);
                 setTimeout(done, 1500);
             });
     });
     it('Test Case - 3', function (done) {
         testSession.post('/SavePasswordSettings')
             .send({
                 PasswordSettings: {
                     "EnablePasswordPolicy": true,
                     "LockoutDuration": 4,
                     "MaximumLogonFailuresbeforeLockout": 6,
                     "MaximumPasswordAge": 90,
                     "MinimumPasswordAge": 5,
                     "MinimumPasswordLength": 5,
                     "NumberofPasswordstoStore": 2
                 }
             })
             .end(function (err, res) {
                 var objDet = res.body;
                 expect(objDet.type).to.equal(false);
                 setTimeout(done, 1500);
             });
     });
         it('Test Case - 4', function (done) {
         testSession.post('/SavePasswordSettings')
             .send({
                 PasswordSettings: {
                     "EnablePasswordPolicy": null,
                     "LockoutDuration": null,
                     "MaximumLogonFailuresbeforeLockout": null,
                     "MaximumPasswordAge": null,
                     "MinimumPasswordAge": null,
                     "MinimumPasswordLength": null,
                     "NumberofPasswordstoStore": null
                 }
             })
             .end(function (err, res) {
                 var objDet = res.body;
                 expect(objDet.type).to.equal(false);
                 setTimeout(done, 1500);
             });
     });
});