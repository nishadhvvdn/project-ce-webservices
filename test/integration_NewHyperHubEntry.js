var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var hypersproutID = [];

describe('Integration Test - Registration/NewHyperHubEntry', function () {
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
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": null,
                    "HubName": null,
                    "HardwareVersion": null,
                    "GprsMacID": null,
                    "WifiMacID": null,
                    "WifiIPAddress": null,
                    "WifiAccessPointPassword": null,
                    "Latitude": null,
                    "Longitude": null,
                    "SimCardNumber": null,
                    "Type": null
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
    it('Test Case - 2', function (done) {
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": [""],
                    "HubName": ["abcd"],
                    "HardwareVersion": ["abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd"],
                    "WifiAccessPointPassword": ["abcd"],
                    "Latitude": ["10.01"],
                    "Longitude": ["10.10"],
                    "SimCardNumber": ["abcd"],
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
    it('Test Case - 3', function (done) {
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": [''],
                    "HubName": ["abcd"],
                    "HardwareVersion": ["abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd"],
                    "WifiAccessPointPassword": ["abcd"],
                    "Latitude": ["10.01"],
                    "Longitude": ["10.10"],
                    "SimCardNumber": ["abcd"],
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
    it('Test Case - 4', function (done) {
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": [undefined],
                    "HubName": ["abcd"],
                    "HardwareVersion": ["abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd"],
                    "WifiAccessPointPassword": ["abcd"],
                    "Latitude": ["10.01"],
                    "Longitude": ["10.10"],
                    "SimCardNumber": ["abcd"],
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
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": ["fhkHyperHub"],
                    "HubName": ["abcd"],
                    "HardwareVersion": ["abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd"],
                    "WifiAccessPointPassword": ["abcd"],
                    "Latitude": ["10.01"],
                    "Longitude": ["10.10"],
                    "SimCardNumber": ["abcd"],
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
    it('Test Case - 6', function (done) {
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": ["fhkHyperHub"],
                    "HubName": ["abcd"],
                    "HardwareVersion": ["abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd"],
                    "WifiAccessPointPassword": ["abcd"],
                    "Latitude": ["10.01"],
                    "Longitude": ["10.10"],
                    "SimCardNumber": ["abcd"],
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
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": ["fhkHyperHub1"],
                    "HubName": ["abcd"],
                    "HardwareVersion": ["abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd"],
                    "WifiAccessPointPassword": ["abcd"],
                    "Latitude": ["10.01"],
                    "Longitude": ["10.10"],
                    "SimCardNumber": ["abcd"],
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
    it('Test Case - 8', function (done) {
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": ["fhkHyperHub1", "fhkHyperHub2"],
                    "HubName": ["abcd", "abcd"],
                    "HardwareVersion": ["abcd", "abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd", "abcd"],
                    "WifiAccessPointPassword": ["abcd", "abcd"],
                    "Latitude": ["abcd", "10.01"],
                    "Longitude": ["abcd", "10.10"],
                    "SimCardNumber": ["abcd", "abcd"],
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
    it('Test Case - 9', function (done) {
        testSession.post('/NewHyperHubEntry')
            .send(
            {
                "insertNewHyperHubDetails": {
                    "HubSerialNumber": ["fhkHyperHub1", "fhkHyperHub2"],
                    "HubName": ["abcd", "abcd"],
                    "HardwareVersion": ["abcd", "abcd"],
                    "GprsMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
                    "WifiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
                    "WifiIPAddress": ["abcd", "abcd"],
                    "WifiAccessPointPassword": ["abcd", "abcd"],
                    "Latitude": ["abcd", "10.01"],
                    "Longitude": ["abcd", "10.10"],
                    "SimCardNumber": ["abcd", "abcd"],
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

    // DisplayAllHyperHubDetails Test Cases:
    it('Test Case - 10', function (done) {
        testSession.post('/DisplayAllHyperHubDetails')
            .send(
            {
                "HyperHubDetails": {
                    "Type": null
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

    it('Test Case - 11', function (done) {
        testSession.post('/DisplayAllHyperHubDetails')
            .send(
            {
                "HyperHubDetails": {
                    "Type": "All"
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
                        //=================

                        if (objDet.HyperHubDetailSelected.length > 0) {
                            for (var i = 0; i < objDet.HyperHubDetailSelected.length; i++) {
                                if ((objDet.HyperHubDetailSelected[i].HypersproutSerialNumber == "fhkHyperHub") ||
                                    (objDet.HyperHubDetailSelected[i].HypersproutSerialNumber == "fhkHyperHub1") ||
                                    (objDet.HyperHubDetailSelected[i].HypersproutSerialNumber == "fhkHyperHub2")) {
                                    hypersproutID.push(objDet.HyperHubDetailSelected[i].HypersproutID);
                                }
                            }
                        }
                        done();
                        //=================
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });
    // DeleteHyperHubDetails Test Cases:
    it('Test Case - 12', function (done) {
        testSession.post('/DeleteHyperHubDetails')
            .send(
            {
                "deleteHyperHubValues": {
                    "HyperHubID": null
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

    it('Test Case - 13', function (done) {
        testSession.post('/DeleteHyperHubDetails')
            .send(
            {
                "deleteHyperHubValues": {
                    "HyperHubID": hypersproutID
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
});