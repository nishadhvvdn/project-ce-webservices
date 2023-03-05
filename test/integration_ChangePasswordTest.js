var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');

var testSession = null;


describe('Integration Test - Tools/ChangePassword', function () {
    this.timeout(45000);
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
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "SbOIT",
                "NewPassword": "changepass@123"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 2', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@123",
                "NewPassword": "changepass@1234"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 3', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@1234",
                "NewPassword": "changepass@12345"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 4', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@12345",
                "NewPassword": "changepass@123456"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 5', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@123456",
                "NewPassword": "changepass@1234567"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 6', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@1234567",
                "NewPassword": "changepass@12345678"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 7', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@12345678",
                "NewPassword": "changepass@123456789"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 8', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@123456789",
                "NewPassword": "changepass@1234567890"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 9', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@1234567890",
                "NewPassword": "changedpass@1"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 10', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@1",
                "NewPassword": "changedpass@12"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 11', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@12",
                "NewPassword": "changedpass@123"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 12', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@123",
                "NewPassword": "changedpass@1234"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 13', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@1234",
                "NewPassword": "changedpass@12345"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 14', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@12345",
                "NewPassword": "changedpass@123456"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 15', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@123456",
                "NewPassword": "changedpass@1234567"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
       .expect(200, done);
    });

    it('Test Case - 16', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@1234567",
                "NewPassword": "changedpass@12345678"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 17', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@12345678",
                "NewPassword": "changedpass@123456789"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 18', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@123456789",
                "NewPassword": "changedpass@1234567890"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 19', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@1234567890",
                "NewPassword": "changedpass@01234567890"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 20', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changedpass@01234567890",
                "NewPassword": "changep@01234"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 21', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changep@01234",
                "NewPassword": "changepass@123"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 22', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "rkeyO2Jcb",
                "OldPassword": "changepass@123",
                "NewPassword": "changepass@123"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 23', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": "admin",
                "OldPassword": "admin@1234444",
                "NewPassword": "admin@12"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });

    it('Test Case - 24', function (done) {
        testSession.post('/ChangePassword')
            .send({
                "LoginID": null,
                "OldPassword": null,
                "NewPassword": null
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(false);
                    } catch (exc) {
                        setTimeout(done, 1500);
                    }
                }, 1500);
            })
        .expect(200, done);
    });
});