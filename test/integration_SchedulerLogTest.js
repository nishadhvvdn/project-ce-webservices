var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

var messageID;

describe('Integration Test - /TransctionalDataScheduler/SchedulerLog', function () {
    this.timeout(30000);

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

    it('Test Case - 0', function (done) {
        request(app)
            .post('/SchedulerLog')
            .send(
            {
                "DeviceID": "HS-00000000000000CELL18_TEST", "MessageID": 0, "Data": "IntegrationTest", "TimeStampRequest": new Date()
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).to.equal(true);
                setTimeout(done, 1500);
            });
    });

    it('Get MessageID from Jobs - validate json body 6', function (done) {
        var endDate = new Date();
        var previous30minutes = new Date(endDate - (30 * 60000));
        //previous30minutes.setDate(endDate.getMinutes() - 30);
        var flag = false;
        testSession.post('/JobsList')
            .send({
                "StartTime": previous30minutes,
                "EndTime": endDate,
                "Type": "All"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        if (objDet.JobsArray.length > 0) {
                            for (var i = 0; i < objDet.JobsArray.length; i++) {
                                if ((objDet.JobsArray[i].JobName === "Interval Read Job")
                                    && (objDet.JobsArray[i].JobType === "Transactional Polling Interval")
                                    && (objDet.JobsArray[i].Status === "Pending")
                                    && ((objDet.JobsArray[i].DeviceType === "HyperSprout")
                                        || (objDet.JobsArray[i].DeviceType === "Hyperhub"))) {
                                    messageID = objDet.JobsArray[i].MessageID;
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
                }, 3500);
            })
           // .expect(200, done);
    });

    it('Test Case - 1', function (done) {
        request(app)
            .post('/SchedulerLogUpdate')
            .send(
            {
                TransactionDataResponse: {
                    "CellID": 7,
                    "MessageID": messageID,
                    "Transformer": {
                        "NoOfConnectedMeter": 1
                    }
                },
                "TimeStampResponse": new Date()
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).to.equal(true);
                setTimeout(done, 1500);
            });
    });

       it('Test Case - 2', function (done) {
           request(app)
               .post('/SchedulerLogUpdate')
               .send(
               {
                   TransactionDataResponse: {
                       "CellID": null,
                       "MessageID": messageID,
                       "Transformer": {
                           "NoOfConnectedMeter": 1
                       }
                   },
                   TimeStampResponse: new Date()
               })
               .end(function (err, res) {
                   var objDet = res.body;
                   expect(objDet.Type).to.equal(false);
                   setTimeout(done, 1500);
               });
       });
   
       it('Test Case - 3', function (done) {
           request(app)
               .post('/SchedulerLogUpdate')
               .send(
               {
                   TransactionDataResponse: {
                       "CellID": "abc",
                       "MessageID": messageID,
                       "Transformer": {
                           "NoOfConnectedMeter": 1
                       }
                   },
                   TimeStampResponse: new Date()
               })
               .end(function (err, res) {
                   var objDet = res.body;
                   expect(objDet.Type).to.equal(false);
                   setTimeout(done, 1500);
               });
       });
   
       it('Test Case - 4', function (done) {
           request(app)
               .post('/SchedulerLogUpdate')
               .send(
               {
                   TransactionDataResponse: {
                       "CellID": 7,
                       "MessageID": messageID,
                       "Transformer": {
                           "NoOfConnectedMeter": 1
                       }
                   },
                   TimeStampResponse: new Date()
               })
               .end(function (err, res) {
                   var objDet = res.body;
                   expect(objDet.Type).to.equal(false);
                   setTimeout(done, 1500);
               });
       });
   
       it('Test Case - 5', function (done) {
           request(app)
               .post('/SchedulerLog')
               .send({
                   "DeviceID": "HS-4820000000000000000HS0001", "MessageID": 0, "Data": "IntegrationTest", "TimeStampRequest": new Date()
               })
               .end(function (err, res) {
                   var objDet = res.body;
                   expect(objDet.Type).to.equal(false);
                   setTimeout(done, 1500);
               });
       });
       it('Test Case - 6', function (done) {
           request(app)
               .post('/SchedulerLog')
               .send({
                   "DeviceID": null, "MessageID": null, "Data": null, "TimeStampRequest": null
               })
               .end(function (err, res) {
                   var objDet = res.body;
                   expect(objDet.Type).to.equal(false);
                   setTimeout(done, 1500);
               });
       }); 
});