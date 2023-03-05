var expect = require("chai").expect;
var request = require('supertest');
var app = require('../server.js');
var objSession = require('./sessioninit.js');
var testSession = null;

var transformerID, hypersproutID, meterID;

describe('Integration Test - EndpointRegistration', function () {
    this.timeout(2000000); //

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

    it('Add sample Circuit -1', function (done) {
        testSession.post('/NewCircuitEntry')
            .send(
            {
                "insertNewCircuitDetails": { "CircuitID": ["IntegrationTest"], KVARating: [22], "SubstationID": [12], "SubstationName": ["UnitTestCircuit"], "Address": ["Manyata"], "Country": ["India"], "State": ["Karnataka"], "City": ["Bangalore"], "ZipCode": ["560045"], "Latitude": ["23.3"], "Longitude": ["23.3"], "Type": "Add" }
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(true);
                setTimeout(done, 4000);
            });
    });

    it('Add sample HS -2', function (done) {
        testSession.post('/NewTransformerHypersproutEntry')
            .send(
            {
                "insertNewTransformerHypersproutDetails": {
                    "TFMRSerialNumber": ["012345678900000UNIT1_TEST"], "TFMRMake": ["UnitTest"], "TFMRRatingCapacity": ["220"], "TFMRHighLineVoltage": ["230"], "TFMRLowLineVoltage": ["220"], "TFMRHighLineCurrent": ["60"], "TFMRLowLineCurrent": ["50"], "TFMRType": ["Pad Mounted"], "HypersproutSerialNumber": ["012345678900000UNIT1_TEST"], "HypersproutVersion": ["1"], "HypersproutMake": ["UnitTest"], "HSCTRatio": ["1"], "HSPTRatio": ["1"], "HSRatedVoltage": ["220"], "HSNumberOfPhases": ["1"], "HSRatedFrequency": ["50"], "HSAccuracy": ["1"], "HSDemandResetDate": ["1"], "HSCompliantToStandards": ["UL"], "HSMaxDemandWindow": ["Sliding"], "HSMaxDemandSlidingWindowInterval": ["15"], "HSSensorDetails": ["UnitTest"], "HSGPRSMacID": ["84:3A:4B:4F:DF:70"], "HSWiFiMacID": ["01:a3:b5:94:78:a1"], "HSWiFiIpAddress": ["12.13.2.1"], "HSWiFiAccessPointPassword": ["unittest"], "HSSimCardNumber": ["012345678900015"], "HSLatitude": ["10.9"], "HSLongitude": ["10.9"], "ConnectedStreetlights": [true], "StreetlightsMetered": [true], "StreetlightUsage": ["On"], "NoOfConnectedStreetlights": ["10"], "WireSize": ["10"], "MaxOilTemp": ["300"], "MinOilTemp": ["20"], "CameraConnect": [true], "Type": "Add"
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.type).to.equal(true);
                setTimeout(done, 4000);
            });
    });

    it('Add sample Meter -3', function (done) {
        testSession.post('/NewMeterEntry')
            .send(
            {
                "insertNewMeterDetails": {
                    "MeterSerialNumber": ["00000001234567890UNITTEST"], "MeterVersion": ["1.0"], "MeterApptype": ["Residential"], "MeterInstallationLocation": ["In Door"], "MeterCTRatio": ["1"], "MeterPTRatio": ["1"], "MeterNumberOfPhases": ["1"], "MeterRatedFrequency": ["50"], "MeterRatedVoltage": ["110"], "MeterNominalCurrent": ["24"], "MeterMaximumCurrent": ["60"], "MeterAccuracy": ["0.5"], "MeterCompliantToStandards": ["0.5"], "MeterWiFiIpAddress": ["12.13.2.1"], "MeterWiFiAccessPointPassword": ["unittest"], "MeterAdminPassword": ["00000000000000000000"], "MeterLatitude": [10.9], "MeterLongitude": [10.9], "MeterConsumerNumber": ["989334631354"], "MeterConsumerName": ["Talgo"], "MeterConsumerAddress": ["Virtual"], "MeterConsumerContactNumber": ["012345678912345"], "MeterBillingCycleDate": ["1"], "MeterBillingTime": ["1"], "MeterDemandResetDate": ["1"], "MeterMake": ["Vision"], "MeterDisconnector": ["Yes"], "MeterConsumerCountry": ["NA"], "MeterConsumerState": ["NA"], "MeterConsumerCity": ["NA"], "MeterConsumerZipCode": ["NA"], "MeterWiFiMacID": ["84:3A:4B:4F:DF:70"], "ImpulseCountKWh": ["180"], "ImpulseCountKVARh": ["180"], "SealID": ["12345"], "BiDirectional": [true], "EVMeter": [true], "SolarPanel": [true], "Type": "Add"
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log("ObjDet :- " + JSON.stringify(objDet));
                expect(objDet.type).to.equal(true);
                setTimeout(done, 4000);
            });
    });

    it('Get Transformer and Hypersprout ID -4', function (done) {
        testSession.get('/DisplayAllTransformerDetails')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err,res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        if (objDet.TransformerDetailSelected.length > 0) {
                            for (var i = 0; i < objDet.TransformerDetailSelected.length; i++) {
                                if (objDet.TransformerDetailSelected[i].TransformerSerialNumber == "012345678900000UNIT1_TEST")
                                    transformerID = objDet.TransformerDetailSelected[i].TransformerID;
                            }
                        }
                        if (objDet.HypersproutDetailsSelected.length > 0) {
                            for (var j = 0; j < objDet.HypersproutDetailsSelected.length; j++) {
                                if (objDet.HypersproutDetailsSelected[j].HypersproutSerialNumber == "012345678900000UNIT1_TEST")
                                    hypersproutID = objDet.HypersproutDetailsSelected[j].HypersproutID;
                            }
                        }
                        //console.log("TransformerID :- " + transformerID);
                        //console.log("HypersproutID :- " + hypersproutID);
                        expect(objDet.type).to.equal(true);
                        done();
                    } catch (exc) {
                        setTimeout(done, 4000);
                    }
                }, 4000);
            })
    });

    it('Get Meter ID -5', function (done) {
        testSession.post('/SMMeters')
            .send(
            {
                "PartSerialNo": "00000001234567890UNITTEST"
            })
            .end(function (err, res) {
                var objDet = res.body;
                if (objDet.details != null) {
                    meterID = objDet.details[0].MeterID
                }
                //console.log("MeterID :- " + meterID);
                expect(objDet.type).to.equal(true);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - REGISTRATION_PARA - Wrong Mapping -6', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "012345678900000UNIT1_TEST",
                    "MACID": "01:a3:b5:94:78:a1",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                //console.log("meterID REGISTRATION_PARA:- " + meterID);
                //console.log("HypersproutID REGISTRATION_PARA:- " + hypersproutID);
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('Transformer/HS to Circuit Grouping -7', function (done) {
        testSession.post('/AddingTransformerToCircuit')
            .send(
            {
                "addTransformerToCircuitValues": {
                    "TransformerID": [transformerID],
                    "CircuitID": "IntegrationTest"
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - REGISTRATION_PARA - Wrong Serial Number -9', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "10000001234567891UNITTEST",
                    "MACID": "01:a3:b5:94:78:a1",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                //console.log("ObjDet Wrong Serial:- " + JSON.stringify(objDet));
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - REGISTRATION_PARA - Wrong MACID -10', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "012345678900000UNIT1_TEST",
                    "MACID": "41:e3:b5:95:78:a1",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - REGISTRATION_PARA - Correct Data -11', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "012345678900000UNIT1_TEST",
                    "MACID": "01:a3:b5:94:78:a1",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('Meter to Transformer/HS Grouping -13', function (done) {
        testSession.post('/AddingMeterToTransformer')
            .send(
            {
                "addMeterToTransformerValues": {
                    "MeterID": [meterID],
                    "TransformerID": transformerID
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
               // console.log("ObjDet HS Grouping -13:- " + JSON.stringify(objDet));
                expect(objDet).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - DEVICE_DETAILS - Wrong Cell ID -14', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "Latitude": "32.3", "Longitude": "32.3", "SERIAL_NO": "012345678900000UNIT1_TEST", "Circuit_ID": 1, "CT_Ratio": "0.76", "PT_Ratio": "0.41", "CT_CalibrationData": "2.0", "PT_CalibrationData": "1.0", "HSID": "1", "TransformerRating": "1.3", "TransformerType": "TopType", "RatedVoltage": 220, "Phase": 1, "Frequency": 440, "CertificationNumber": 2, "UtilityID": 2, "ApplicableStandard": "fjsadf", "TransformerClass": "1st Class", "MAC_ID_GPRS": "10.9.15.45", "MAC_ID_WiFi": "01:a3:b5:94:78:a1", "IP_address_WiFi": "10.9.15.45", "SimCardNumber": "0123456", "ESN": "0123456", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "unittest", "AccessPointPassword": "unittest" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": "fjkdhfsdkl12",
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - DEVICE_DETAILS - Correct Data -18', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "Latitude": "32.3", "Longitude": "32.3", "SERIAL_NO": "012345678900000UNIT1_TEST", "Circuit_ID": 1, "CT_Ratio": "0.76", "PT_Ratio": "0.41", "CT_CalibrationData": "2.0", "PT_CalibrationData": "1.0", "HSID": "1", "TransformerRating": "1.3", "TransformerType": "TopType", "RatedVoltage": 220, "Phase": 1, "Frequency": 440, "CertificationNumber": 2, "UtilityID": 2, "ApplicableStandard": "fjsadf", "TransformerClass": "1st Class", "MAC_ID_GPRS": "10.9.15.45", "MAC_ID_WiFi": "01:a3:b5:94:78:a1", "IP_address_WiFi": "10.9.15.45", "SimCardNumber": "0123456", "ESN": "0123456", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "unittest", "AccessPointPassword": "unittest" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - DEVICE_DETAILS - Correct Data -19', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - HS_CONFIGURATION - Wrong Cell ID -20', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "HS_CONFIGURATION",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": "dfjkdhfsd321",
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - HS_CONFIGURATION - Correct Data -21', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "HS_CONFIGURATION",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - DEVICE_DETAILS - Before REGISTRATION_PARA -22', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - METER_CONFIGURATION - Before REGISTRATION_PARA -23', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "METER_CONFIGURATION",
                "Data": [
                    { "Energy": 1, "Demand": 3, "DemandIntervalLength": 3, "NumberofSubIntervals": 3, "ColdLoadPickupTimes": 1, "PowerOutageRecognitionTime": 1, "TestModeDemandIntervalLength": 1, "NumberofTestModeSubintervals": 1, "TimetoRemainInTestMode(mins)": 2, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": 2, "Quantity2": 2, "Quantity3": 2, "Quantity4": 2, "LoadProfileIntervalLength": 2, "OutageLength(Sec)": 2, "Pulseweight1": 1, "Pulseweight2": 2, "Pulseweight3": 3, "Pulseweight4": 4, "AllEvents": 1 }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - REGISTRATION_PARA - Wrong Serial Number -24', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "hkhsjfj540001234567897890",
                    "MACID": "01:a3:b5:94:78:a1",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - REGISTRATION_PARA - Wrong MACID -25', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "00000001234567890UNITTEST",
                    "MACID": "41:e3:b5:95:78:a1",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - REGISTRATION_PARA - Correct Data -26', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "00000001234567890UNITTEST",
                    "MACID": "7c:e1:79:fe:36:4d",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - DEVICE_DETAILS - Wrong Meter ID -27', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": "a2"
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - DEVICE_DETAILS - Correct Data -28', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - METER_CONFIGURATION - Wrong Meter ID -29', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "METER_CONFIGURATION",
                "Data": [
                    { "Energy": 1, "Demand": 3, "DemandIntervalLength": 3, "NumberofSubIntervals": 3, "ColdLoadPickupTimes": 1, "PowerOutageRecognitionTime": 1, "TestModeDemandIntervalLength": 1, "NumberofTestModeSubintervals": 1, "TimetoRemainInTestMode(mins)": 2, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": 2, "Quantity2": 2, "Quantity3": 2, "Quantity4": 2, "LoadProfileIntervalLength": 2, "OutageLength(Sec)": 2, "Pulseweight1": 1, "Pulseweight2": 2, "Pulseweight3": 3, "Pulseweight4": 4, "AllEvents": 1 }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": "b3"
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - METER_CONFIGURATION - Correct Data -30', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "METER_CONFIGURATION",
                "Data": [
                    { "Energy": 1, "Demand": 3, "DemandIntervalLength": 3, "NumberofSubIntervals": 3, "ColdLoadPickupTimes": 1, "PowerOutageRecognitionTime": 1, "TestModeDemandIntervalLength": 1, "NumberofTestModeSubintervals": 1, "TimetoRemainInTestMode(mins)": 2, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": 2, "Quantity2": 2, "Quantity3": 2, "Quantity4": 2, "LoadProfileIntervalLength": 2, "OutageLength(Sec)": 2, "Pulseweight1": 1, "Pulseweight2": 2, "Pulseweight3": 3, "Pulseweight4": 4, "AllEvents": 1 }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                var objDet = res.body;
                expect(objDet.Type).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - REGISTRATION_PARA - Already Registered -31', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "012345678900000UNIT1_TEST",
                    "MACID": "01:a3:b5:94:78:a1",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - DEVICE_DETAILS - Already Registered -32', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('COLLECTOR_REGISTERATION - HS_CONFIGURATION - Already Registered -33', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "HS_CONFIGURATION",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - REGISTRATION_PARA - Already Registered -34', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "REGISTRATION_PARA",
                "Data": [{
                    "SERIAL_NO": "00000001234567890UNITTEST",
                    "MACID": "7c:e1:79:fe:36:4d",
                    "DEVICEID": "HS-3000000000000000000HS0001"
                }],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - DEVICE_DETAILS - Already Registered -35', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "DEVICE_DETAILS",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('METER_REGISTERATION - METER_CONFIGURATION - Already Registered -36', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "METER_REGISTERATION",
                "Attribute": "METER_CONFIGURATION",
                "Data": [
                    { "Energy": 1, "Demand": 3, "DemandIntervalLength": 3, "NumberofSubIntervals": 3, "ColdLoadPickupTimes": 1, "PowerOutageRecognitionTime": 1, "TestModeDemandIntervalLength": 1, "NumberofTestModeSubintervals": 1, "TimetoRemainInTestMode(mins)": 2, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": 2, "Quantity2": 2, "Quantity3": 2, "Quantity4": 2, "LoadProfileIntervalLength": 2, "OutageLength(Sec)": 2, "Pulseweight1": 1, "Pulseweight2": 2, "Pulseweight3": 3, "Pulseweight4": 4, "AllEvents": 1 }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('Registration Default Error Cases -37', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "MTR_REGISTERATION",
                "Attribute": "METER_CONFIGURATION",
                "Data": [
                    { "Energy": 1, "Demand": 3, "DemandIntervalLength": 3, "NumberofSubIntervals": 3, "ColdLoadPickupTimes": 1, "PowerOutageRecognitionTime": 1, "TestModeDemandIntervalLength": 1, "NumberofTestModeSubintervals": 1, "TimetoRemainInTestMode(mins)": 2, "DailySelfRead": 1, "DailySelfReadTime": 1, "Quantity1": 2, "Quantity2": 2, "Quantity3": 2, "Quantity4": 2, "LoadProfileIntervalLength": 2, "OutageLength(Sec)": 2, "Pulseweight1": 1, "Pulseweight2": 2, "Pulseweight3": 3, "Pulseweight4": 4, "AllEvents": 1 }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('Registration Default Error Cases -33', function (done) {
        request(app).post('/EndpointRegistration')
            .send(
            {
                "Rev": 0,
                "Count": 0,
                "MessageID": 48,
                "Action": "COLLECTOR_REGISTERATION",
                "Attribute": "Collector_CONFIGURATION",
                "Data": [
                    { "CT_Ratio": 1000, "PT_Ratio": 1000, "RatedVoltage": 440, "Phase": 3, "Frequency": 50, "Accuracy": 1, "HSDemandResetDate": 2, "HSCompliantToStandards": "CE", "MaxDemandWindow": "Fixed", "MaxDemandSlidingWindowInterval": 30, "Sensor Details": "0", "HypersproutVersion": "2016", "HypersproutMake": "2016", "Circuit_ID": 0, "CT_CalibrationData": 0.36000001430511475, "PT_CalibrationData": 0.7319999933242798, "TransformerRating": 100, "CertificationNumber": 17, "UtilityID": 17, "ApplicableStandard": 1, "TransformerClass": 17, "ESN": "0123456789", "CountryCode": 0, "RegionCode": 0, "SSID_Name": "LNTID1" }
                ],
                "CountryCode": 0,
                "RegionCode": 0,
                "CellID": hypersproutID,
                "MeterID": meterID
            })
            .end(function (err, res) {
                expect(err).not.to.equal(undefined);
                setTimeout(done, 4000);
            });
    });

    it('Test Case - 3', function (done) {
        testSession.post('/RemovingMeterFromTransformer')
            .send(
            {
                "removeMeterFromTransformerValues": {
                    "MeterID": [meterID],
                    "TransformerID": transformerID
                }
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err,res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log("ObjDet :- " + JSON.stringify(objDet));
                        expect(objDet.type).to.equal(true);
                        done();
                    } catch (exc) {
                        setTimeout(done, 4000);
                    }
                }, 4000);
            })
    });

    it('Test Case - 6', function (done) {
        testSession.post('/RemovingMeterFromTransformerResponse')
            .send(
            {
                "NoOfMeter": 1,
                "CellID": hypersproutID,
                "meters": [{
                    "DeviceID": meterID,
                    "Status": "Success"
                }]
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err,res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log("ObjDet :- " + JSON.stringify(objDet));
                        expect(objDet.Type).not.to.equal(null);
                        done();
                    } catch (exc) {
                        setTimeout(done, 4000);
                    }
                }, 4000);
            })
    });

    it('Test Case - 5', function (done) {
        testSession.post('/RemovingTransformerFromCircuit')
            .send(
            {
                "removeTransformerFromCircuitValues": {
                    "TransformerID": [transformerID],
                    "CircuitID": "IntegrationTest"
                }
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err,res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log("ObjDet :- " + JSON.stringify(objDet));
                        expect(objDet).not.to.equal(null);
                        done();
                    } catch (exc) {
                        setTimeout(done, 4000);
                    }
                }, 4000);
            })
    });

    it('Test Case - 9', function (done) {
        request(app).post('/RemovingTransformerFromCircuitResponse')
            .send(
            {
                "CellID": hypersproutID,
                "Status": "Success"
            }
            )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err,res) {
                setTimeout(function () {
                    try {
                        var objDet = res.body;
                        console.log("ObjDet :- " + JSON.stringify(objDet));
                        console.log('ID ' + hypersproutID + TransformerID + meterID);
                        expect(objDet.Type).to.equal(true);
                        done();
                    } catch (exc) {
                        setTimeout(done, 4000);
                    }
                }, 4000);
            })
    });

    it('Delete Meter -37', function (done) {
        testSession.post('/DeleteMeterDetails')
            .send(
            {
                "deleteMeterValues": {
                    "MeterID": [meterID]
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
                console.log("ObjDet :- " + JSON.stringify(objDet));
                expect(objDet.type).to.equal(true);
                setTimeout(done, 4000);
            });
    }); 

    it('Delete HS/Transformer -38', function (done) {
        testSession.post('/DeleteTransformerHypersproutDetails')
            .send(
            {
                "deleteTransformerHypersproutValues": {
                    "TransformerID": [transformerID],
                    "HypersproutID": [hypersproutID]
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
                console.log("ObjDet :- " + JSON.stringify(objDet));
                expect(objDet.type).to.equal(true);
                setTimeout(done, 4000);
            });
    });

    it('Delete Circuit -39', function (done) {
        testSession.post('/DeleteCircuitDetails')
            .send(
            {
                "deleteCircuitValues": {
                    "CircuitID": ["IntegrationTest"]
                }
            })
            .end(function (err, res) {
                var objDet = res.body;
                console.log("ObjDet :- " + JSON.stringify(objDet));
                expect(objDet.type).to.equal(true);
                setTimeout(done, 4000);
            });
    });

    // it('validate error json body', function (done) {

    //     request(app)
    //         .post('/DeviceStatus')
    //         .send({
    //             "DeviceID": "HS-4000000000000000000HS0001"
    //         })
    //         .end(function (err, res) {
    //             var objDet = res.body;
    //             expect(objDet.type).to.equal(undefined);
    //             setTimeout(done, 1500);
    //         });
    // });
});