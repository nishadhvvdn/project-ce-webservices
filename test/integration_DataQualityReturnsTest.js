var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');

describe('Integration Test - DataQualityReport/DataQualityReturns', function () {
    this.timeout(30000);
    it('Test Case - 1', function (done) {
        request(app)
        .post('/DataQualityReturns')
            .send({
                "StartDate": "2017-02-22T12:35:55.155Z",
                "EndDate": "2017-05-22T12:35:55.155Z"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        //expect(objDet.type).to.be.equal(true);
                        expect(objDet.Details).not.to.equal(null);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200)
            setTimeout(done, 1500);
    });

    it('Test Case - 2', function (done) {
        request(app)
        .post('/DataQualityReturns')
            .send({
               "StartDate": "2015-02-22T12:35:55.155Z",
                "EndDate": "2015-05-22T12:35:55.155Z"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function (res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        expect(objDet.type).to.equal(true);
                    } catch (exc) {
                        done(exc);
                    }
                }, 100);
            })
            .expect(200)
            setTimeout(done, 1500);
    });
});