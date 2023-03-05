var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');

describe('Integration Test - DelayResponseReport/DelayResponseReport', function () {
    this.timeout(30000);
    it('Test Case - 1', function (done) {
        request(app)
            .get('/DelayResponseReport')
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
            .expect(200);
			setTimeout(done, 1500);
    });
});