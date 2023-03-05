var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;

describe('Integration Test - Administration/Security/EditSecurityGroups ', function () {
    this.timeout(30000);
    before(function (done) {
        objSession.initSession(function (objSessionData) {
            testSession = objSessionData;
            setTimeout(done, 1500)
        })
    });

    after(function () {
        objSession.destroySession(testSession, function (res) {
        });
    });

    it('Test Case - 1', function (done) {
        testSession.post('/EditSecurityGroups')
            .send({
                "SecurityID": "UnitTest1", "Description": "testing", "Functions": [{ "Tools": "false", "values": { "PerformInteractiveRead": "true", "ViewJobStatus": "true" } }, { "MeterManagement": "true", "values": { "ModifyConfigurations": "true", "ModifyFirmware": "true", "ModifyGroups": "true", "ModifySecurityCodes": "true", "ViewConfigurations": "true", "ViewFirmware": "true" } }, { "Administration": "true", "values": { "ModifySecurity": "true", "ModifySystemSettings": "true", "ModifyUsers": "true", "ViewSecurity": "true", "ViewUsers": "true" } }, { "Reports": "true", "values": { "ViewReports": "true" } }, { "SysytemManagement": "true", "values": { "CleanUpEndpoints": "true", "ModifyDevices": "true", "ViewDevices": "true" } }]
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
        testSession.post('/EditSecurityGroups')
            .send({
                "SecurityID": "Administrator", "Description": "User1", "Functions": [{ "Tools": "true", "values": { "PerformInteractiveRead": "true", "ViewJobStatus": "true" } }, { "MeterManagement": "true", "values": { "ModifyConfigurations": "true", "ModifyFirmware": "true", "ModifyGroups": "true", "ModifySecurityCodes": "true", "ViewConfigurations": "true", "ViewFirmware": "true" } }, { "Administration": "true", "values": { "ModifySecurity": "true", "ModifySystemSettings": "true", "ModifyUsers": "true", "ViewSecurity": "true", "ViewUsers": "true" } }, { "Reports": "true", "values": { "ViewReports": "true" } }, { "SysytemManagement": "true", "values": { "CleanUpEndpoints": "true", "ModifyDevices": "true", "ViewDevices": "true" } }]
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

    it('Test Case - 3', function (done) {
        testSession.post('/EditSecurityGroups')
            .send({
                "SecurityID": null, "Description": null, "functions": null
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