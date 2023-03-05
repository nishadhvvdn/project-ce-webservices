var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - ListUserID ', function() {
	this.timeout(15000);
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
	it('Test Case - 1', function(done) {
	testSession.get('/ListUserID')
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err,res){
			setTimeout( function () {
				try {
					var objDet = res.body;				
					expect(objDet.type).to.equal(true);
                    expect(objDet.output).not.to.equal(null);
					if(objDet.output != null) {
						for(var i = 0; i < objDet.output.length; i++) {
							expect(objDet.output[i]).not.to.be.undefined;
							expect(objDet.output[i]).not.to.be.null;
						}
					}
					done();
				} catch(exc) {
					done(exc);
				}
			}, 1500 );
		})  
	});
});