var expect = require("chai").expect;
var request = require('supertest');
var session = require('supertest-session');
var app = require('../server.js');

var testSession = null;


var authenticatedSession;

function initSession(callback) {
	testSession = session(app);
	testSession.post('/login')
		.send({ "email": "admin", "password": "aura@001" })
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function (err, res) {
			if (err) {
				console.log("cls :- " + err);
				return done(err);
			}
			authenticatedSession = testSession
			var objDet = res.body;
			if (objDet.type == false)
				console.log(JSON.stringify(objDet));
			expect(objDet.type).to.equal(true);
			expect(objDet.FirstName).not.to.be.null;
			expect(objDet.LastName).not.to.be.null;
			return callback(authenticatedSession);
		})
}

function refreshSession(objSession, callback) {
	objSession.get('/UserDetails')
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(function (res) {
			setTimeout(function () {
				try {
					var objDet = res.body;
					expect(objDet.type).to.equal(true);
				} catch (exc) {
					callback(exc);
				}
			}, 100);
		})
		.expect(200, callback);
}

function destroySession(objSession) {
	objSession.get('/Logout')
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(function (err,res) {
			setTimeout(function () {
				try {
					var objDet = res.body;
					expect(objDet.type).to.equal(true);
				} catch (exc) {
					console.log('Err ', exc);
				}
			}, 100);
		})
		.expect(200);
}

module.exports = {
	initSession: initSession,
	destroySession: destroySession,
	refreshSession: refreshSession
}