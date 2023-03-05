var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

describe('Integration Test - Insert & Delete of Circuit', function () {
	this.timeout(100000);
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
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": [""],
					"Longitude": ["111.99"],
					"Type": "Upload"
				}
			}
			)
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

	it('Test Case - 2', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": [""],
					"Type": "Upload"
				}
			}
			)
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
	it('Test Case - 3', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": [""],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Upload"
				}
			}
			)
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
	it('Test Case - 4', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["111.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 5', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["1111.99"],
					"Type": "Add"
				}
			}
			)
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
	//-----
	it('Test Case - 6', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026dfdfdfewrw453545trfgfhgnhnhbre4546465765745353fghg"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 7', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["11esfsdfd1"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 8', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["1sfdsfdfgnvhfr567trdtfghghjhgj45e5657767956gghj11"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 9', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["1dfvgvfhyuyjmmbndfesr4545657etgnbmg11"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 10', function (done) {
		testSession.post('/NewCircuitEntry')
			.send({
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["1sdfdskfsdsheiui874dgdrtr567568tygjjgfddsfsfdfgghghghjherer4546657fdfnndgidnknfnrfesmdlkwewwmmvmdmfkkdfkdkdfkfdjdfjkdjkfjfdjsekle;l;ls11"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
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
	it('Test Case - 11', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["fdgfgffhfdhfretr5r6yhjhhncfgdfsdvfcbgvhggnjghbngvgfcgdfdfdfgfgw4343111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 12', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["1adfkd89ea8sy8ahfdkfnvkfnnrnoaiwesmfaslvodniooeh4e8397866tfesgfhdnvdf11"],
					"City": ["111"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 13', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["111"],
					"ZipCode": ["112343243353453451"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	it('Test Case - 14', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026"],
					"KVARating": ["111"],
					"SubstationID": ["111"],
					"SubstationName": ["111"],
					"Address": ["111"],
					"Country": ["111"],
					"State": ["111"],
					"City": ["11sdfdffdidfkdfndkfewjojo9wue8w656DEWGFSJDNKADNFKDNJDDBFKSDN76eastfgdgufbdjbfjd1"],
					"ZipCode": ["111"],
					"Latitude": ["11.09"],
					"Longitude": ["111.99"],
					"Type": "Add"
				}
			}
			)
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
	//------------
	it('Test Case - 15', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": [111, "fhk123"],
					"KVARating": ["111", "111"],
					"SubstationID": ["111", "111"],
					"SubstationName": ["111", "111"],
					"Address": ["111", "111"],
					"Country": ["111", "111"],
					"State": ["111", "111"],
					"City": ["111", "111"],
					"ZipCode": ["111", "111"],
					"Latitude": ["11.09", "11.09"],
					"Longitude": ["111.99", "111.99"],
					"Type": "Upload"
				}
			}
			)
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

	it('Test Case - 16', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026", "fhk1234"],
					"KVARating": ["111", "111"],
					"SubstationID": ["111", "111"],
					"SubstationName": ["111", "111"],
					"Address": ["111", "111"],
					"Country": ["111", "111"],
					"State": ["111", "111"],
					"City": ["111", "111"],
					"ZipCode": ["111", "111"],
					"Latitude": ["11.09", "11.09"],
					"Longitude": ["111.99", "111.99"],
					"Type": "Upload"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 17', function (done) {
		testSession.post('/NewCircuitEntry')
			.send(
			{
				"insertNewCircuitDetails": {
					"CircuitID": ["fhk4026", "fhk123"],
					"KVARating": ["111", "111"],
					"SubstationID": ["111", "111"],
					"SubstationName": ["111", "111"],
					"Address": ["111", "111"],
					"Country": ["111", "111"],
					"State": ["111", "111"],
					"City": ["111", "111"],
					"ZipCode": ["111", "111"],
					"Latitude": ["11.09", "11.09"],
					"Longitude": ["111.99", "111.99"],
					"Type": "Upload"
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).not.to.equal(null);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});

	it('Test Case - 18', function (done) {
		testSession.post('/DeleteCircuitDetails')
			.send(
			{
				"deleteCircuitValues": {
					"CircuitID": ["fhk4026", "fhk123", "fhk1234"]
				}
			}
			)
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
	it('Test Case - 19', function (done) {
		testSession.post('/DeleteCircuitDetails')
			.send(
			{
				"deleteCircuitValues": {
					"CircuitID": null
				}
			}
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				setTimeout(function () {
					try {
						var objDet = res.body;
						expect(objDet.type).to.equal(false);
						done();
					} catch (exc) {
						done(exc);
					}
				}, 1500);
			})
	});
});