var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;
var meterID = [];

describe('Integration Test - Insert(with Validation) & Delete of Meter', function () {
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
    //Start - Validation for Meter
    it('Test Case - 1', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter123456789012345678980123456"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 2', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["1231234543456789012345678980123456"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["153454354435462343243245235454234214324252354353523432.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision12345678909865322233456743232234545667788997654343322222333344444455556666"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["12345"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["12345"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["113132424345435456546577867878798078677657453456"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1432325243546546565767865453454634665764645345435463"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["10a.9b.176c.103d4234343534554656567667887675654346356576867856746433"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103343453454354645654653234324243542353534546"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 11', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["000000000000000000000000000000000000000000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000000000000000000000000000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abcfxgfdghfgdgfdgfdfghgfhgfhgdfzdsdfdfgfhdgdfdbvcfvhnhbmghffdgdfgdfdsfdgfghfd"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123535345454645654457675686567546435454546455756783"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 15', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcfgfdggggghggbvvvvdxfdgfdfdfgdgfgfhdfdgfdhfgdsfsfgsdgdfgfdgdfbnsesrtytutyuitituuyytrewwdfghjkhgfdsfghjgfdsfgjhd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 16', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456453534643789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 17', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["Indiafsfsdgdfgfghfghgfdsfsfsfsfdsfggfjhfgjkfsdasdsretytryuuiyighjgfhbfbgfcxgfnvn"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 18', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Karfsfsdgdfgfghfghgfdsfsfsfsfdsfggfjhfgjkfsdasdsretytryuuiyighjgfhbfbgfcxgfnvn"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 19', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcdfsfsdgdfgfghfghgfdsfsfsfsfdsfggfjhfgjkfsdasdsretytryuuiyighjgfhbfbgfcxgfnvn"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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

    it('Test Case - 20', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [100.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 21', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [1000.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 22', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [NaN],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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

    }); it('Test Case - 23', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [NaN],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 24', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision1"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 25', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["9"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 26', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential1"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 27', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door1"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 28', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["115"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 29', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["505"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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

    it('Test Case - 30', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1111"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 31', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["111"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 32', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes1"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 33', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter1"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": ["10.9"],
                    "MeterLongitude": ["100.01"],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": ["TRUe12"],
                    "EVMeter": ["TRUE"],
                    "SolarPanel": ["TRUE"],
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
    it('Test Case - 34', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter1"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": ["10.9"],
                    "MeterLongitude": ["100.01"],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": ["TRUE"],
                    "EVMeter": ["TRUE123"],
                    "SolarPanel": ["TRUE"],
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
    it('Test Case - 35', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter1"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": ["10.9"],
                    "MeterLongitude": ["100.01"],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": ["TRUE"],
                    "EVMeter": ["TRUE"],
                    "SolarPanel": ["TRUE123"],
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
    it('Test Case - 36', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["25"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 37', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["29"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 38', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["12345678901234590"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["2"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["126"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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

    //======================End ===========
    it('Test Case - 0', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": [null],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["000000"],
                    "MeterAdminPassword": ["abcd"],
                    "MeterLatitude": [10.9],
                    "MeterLongitude": [100.9],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": [false],
                    "EVMeter": [true],
                    "SolarPanel": [true],
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
                        expect(objDet.type).not.to.equal(null);
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })

    });
    it('Test Case - 1', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
    it('Test Case - 2', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter1"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": ["10.9"],
                    "MeterLongitude": ["100.01"],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": ["TRUE"],
                    "EVMeter": ["TRUE"],
                    "SolarPanel": ["TRUE"],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter1"],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": ["10.9"],
                    "MeterLongitude": ["100.01"],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": ["false"],
                    "EVMeter": ["false"],
                    "SolarPanel": ["false"],
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
    it('Test Case - 5', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["fhkMeter1", "fhkMeter"],
                    "MeterVersion": ["1.0", "1.0"],
                    "MeterApptype": ["Residential", "Residential"],
                    "MeterInstallationLocation": ["In Door", "In Door"],
                    "MeterCTRatio": ["1", "1"],
                    "MeterPTRatio": ["1", "1"],
                    "MeterNumberOfPhases": ["1", "1"],
                    "MeterRatedFrequency": ["50", "50"],
                    "MeterRatedVoltage": ["110", "110"],
                    "MeterNominalCurrent": ["abcd", "abcd"],
                    "MeterMaximumCurrent": ["abcd", "abcd"],
                    "MeterAccuracy": ["1", "1"],
                    "MeterCompliantToStandards": ["1", "1"],
                    "MeterWiFiIpAddress": ["10.9.176.103", "10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000", "0000000000"],
                    "MeterAdminPassword": ["00000000000000000000", "00000000000000000000"],
                    "MeterLatitude": ["10.9", "10.9"],
                    "MeterLongitude": ["100.01", "100.01"],
                    "MeterConsumerNumber": ["123", "123"],
                    "MeterConsumerName": ["abc", "abc"],
                    "MeterConsumerAddress": ["abcd", "abcd"],
                    "MeterConsumerContactNumber": ["123456789101112", "123456789101112"],
                    "MeterBillingCycleDate": ["2", "2"],
                    "MeterBillingTime": ["abcd", "abcd"],
                    "MeterDemandResetDate": ["5", "5"],
                    "MeterMake": ["Vision", "Vision"],
                    "MeterDisconnector": ["Yes", "Yes"],
                    "MeterConsumerCountry": ["India", "India"],
                    "MeterConsumerState": ["Kar", "Kar"],
                    "MeterConsumerCity": ["abcd", "abcd"],
                    "MeterConsumerZipCode": ["560045", "560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70", "84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123", "123"],
                    "ImpulseCountKVARh": ["123", "123"],
                    "SealID": ["123", "123"],
                    "BiDirectional": ["TRUE", "TRUE"],
                    "EVMeter": ["TRUE", "TRUE"],
                    "SolarPanel": ["TRUE", "TRUE"],
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
    it('Test Case - 6', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": [""],
                    "MeterVersion": ["1.0"],
                    "MeterApptype": ["Residential"],
                    "MeterInstallationLocation": ["In Door"],
                    "MeterCTRatio": ["1"],
                    "MeterPTRatio": ["1"],
                    "MeterNumberOfPhases": ["1"],
                    "MeterRatedFrequency": ["50"],
                    "MeterRatedVoltage": ["110"],
                    "MeterNominalCurrent": ["abcd"],
                    "MeterMaximumCurrent": ["abcd"],
                    "MeterAccuracy": ["1"],
                    "MeterCompliantToStandards": ["1"],
                    "MeterWiFiIpAddress": ["10.9.176.103"],
                    "MeterWiFiAccessPointPassword": ["0000000000"],
                    "MeterAdminPassword": ["00000000000000000000"],
                    "MeterLatitude": [10.01],
                    "MeterLongitude": [100.01],
                    "MeterConsumerNumber": ["123"],
                    "MeterConsumerName": ["abc"],
                    "MeterConsumerAddress": ["abcd"],
                    "MeterConsumerContactNumber": ["123456789101112"],
                    "MeterBillingCycleDate": ["2"],
                    "MeterBillingTime": ["abcd"],
                    "MeterDemandResetDate": ["5"],
                    "MeterMake": ["Vision"],
                    "MeterDisconnector": ["Yes"],
                    "MeterConsumerCountry": ["India"],
                    "MeterConsumerState": ["Kar"],
                    "MeterConsumerCity": ["abcd"],
                    "MeterConsumerZipCode": ["560045"],
                    "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"],
                    "ImpulseCountKWh": ["123"],
                    "ImpulseCountKVARh": ["123"],
                    "SealID": ["123"],
                    "BiDirectional": [true],
                    "EVMeter": [false],
                    "SolarPanel": [true],
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
        testSession.post('/SMMeters')
            .send(
            {
                "PartSerialNo": "All"
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        if (objDet.details.length > 0) {
                            for (var i = 0; i < objDet.details.length; i++) {
                                if ((objDet.details[i].MeterSerialNumber == "fhkMeter") ||
                                    (objDet.details[i].MeterSerialNumber == "fhkMeter1")) {
                                    meterID.push(objDet.details[i].MeterID);
                                }
                            }
                        }
                        done();
                    } catch (exc) {
                        done(exc);
                    }
                }, 1500);
            })

    });
    it('Test Case - 8', function (done) {
        testSession.post('/DeleteMeterDetails')
            .send(
            {
                "deleteMeterValues": {
                    "MeterID": meterID
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
        testSession.post('/DeleteMeterDetails')
            .send(
            {
                "deleteMeterValues": {
                    "MeterID": null
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