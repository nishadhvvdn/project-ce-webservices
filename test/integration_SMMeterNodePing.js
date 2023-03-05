var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

var messageID;

describe('Integration Test  - SystemManagement/SMMeterNodePing', function () {
    this.timeout(50000);

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

    it('METER Node Ping -1', function (done) {
        testSession.post('/SMMeterNodePing')
            .send(
            {
                "MeterID": 1
            })
            .end(function (err, res) {
                var objDet = res.body;
                console.log('resp' + JSON.stringify(objDet));
                expect(objDet.type).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });


   it('Get MessageID from Jobs - validate json body', function (done) {
        var endDate = new Date();
        var previous30minutes = new Date(endDate - (30 * 60000));
        //previous30minutes.setDate(endDate.getMinutes() - 30);
        console.log("End Date :- " + endDate);
        console.log("Previous Date :- " + previous30minutes);
        var flag = false;
        testSession.post('/JobsList')
            .send({
                "StartTime": previous30minutes,
                "EndTime": endDate,
                "Type": "All"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log(JSON.stringify(objDet));
                        if (objDet.JobsArray.length > 0) {
                            for (var i = 0; i < objDet.JobsArray.length; i++) {
                                if ((objDet.JobsArray[i].JobName === "Node Ping")
                                    && (objDet.JobsArray[i].JobType === "Meter Node Ping")
                                    && (objDet.JobsArray[i].Status === "Pending")
                                    && (objDet.JobsArray[i].DeviceType === "Meter")) {
                                    messageID = objDet.JobsArray[i].MessageID;
                                    console.log("Message ID :- " + messageID);
                                    flag = true;
                                    if (flag)
                                        break;
                                }
                            }
                        }
                        expect(objDet.type).to.equal(true);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('METER Node Ping Status -15', function (done) {
        request(app).post('/SMMeterNodePingStatus')
            .send(
            {
                "MeterID": 1,
                "Status": "Success",
                "MessageID": messageID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('METER Node Ping -16', function (done) {
        testSession.post('/SMMeterNodePing')
            .send(
            {
                "MeterID": 1
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('Get MessageID from Jobs - validate json body 3', function (done) {
        var endDate = new Date();
        var previous30minutes = new Date(endDate - (30 * 60000));
        //previous30minutes.setDate(endDate.getMinutes() - 30);
        console.log("End Date :- " + endDate);
        console.log("Previous Date :- " + previous30minutes);
        var flag = false;
        testSession.post('/JobsList')
            .send({
                "StartTime": previous30minutes,
                "EndTime": endDate,
                "Type": "All"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log(JSON.stringify(objDet));
                        if (objDet.JobsArray.length > 0) {
                            for (var i = 0; i < objDet.JobsArray.length; i++) {
                                if ((objDet.JobsArray[i].JobName === "Node Ping")
                                    && (objDet.JobsArray[i].JobType === "Meter Node Ping")
                                    && (objDet.JobsArray[i].Status === "Pending")
                                    && (objDet.JobsArray[i].DeviceType === "Meter")) {
                                    messageID = objDet.JobsArray[i].MessageID;
                                    console.log("Message ID :- " + messageID);
                                    flag = true;
                                    if (flag)
                                        break;
                                }
                            }
                        }
                        expect(objDet.type).to.equal(true);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })
    });

    it('METER Node Ping Status -19', function (done) {
        request(app).post('/SMMeterNodePingStatus')
            .send(
            {
                "MeterID": 1,
                "Status": "Failure",
                "MessageID": messageID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 1500);
            });
    });

    it('METER Node Ping -17', function (done) {
        testSession.post('/SMMeterNodePing')
            .send(
            {
                "MeterID": null
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('METER Node Ping -17', function (done) {
        testSession.post('/SMMeterNodePing')
            .send(
            {
                "MeterID": 101
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('METER Node Ping -17', function (done) {
        testSession.post('/SMMeterNodePing')
            .send(
            {
                "MeterID": 12
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('METER Node Ping -18', function (done) {
        testSession.post('/SMMeterNodePing')
            .send(
            {
                "MeterID": undefined
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(false);
                setTimeout(done, 1500);
            });
    });

    it('METER Node Ping Status - 20', function (done) {
        request(app).post('/SMMeterNodePingStatus')
            .send(
            {
                "MeterID": null,
                "Status": null
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).to.equal(false);
                setTimeout(done, 1500);
            });
    });
});