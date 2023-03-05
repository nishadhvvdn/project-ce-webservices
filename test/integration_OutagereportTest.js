var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');

describe('Integration Test - /OutageMap/Outagereport', function () {
    this.timeout(30000);
    it('Test Case - 1', function (done) {
        request(app)
            .post('/Outagereport')
            .send({
                "StartDate": "2017-02-22T12:35:55.155Z",
                "EndDate": "2017-05-22T12:35:55.155Z"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        //expect(objDet.type).to.be.equal(true);
                        expect(objDet.Details).not.to.equal(null);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('Test case - 2', function (done) {
        request(app)
            .post('/Outagereport')
            .send({
                "StartDate": "2015-02-22T12:35:55.155Z",
                "EndDate": "2015-05-22T12:35:55.155Z"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });
});