var express = require('express');
var router = express.Router();
var rest = require('restler');
var AuthenticationContext = require('adal-node').AuthenticationContext;
var tenantID = process.env.tenantID;
var applicationId = process.env.applicationId;
var resource = process.env.resource;
var authURL = process.env.authURL+ tenantID;
var secret = process.env.secret;
var context = new AuthenticationContext(authURL);
var async = require('async');
var today = new Date();
today.setHours(0, 0, 0, 0);
var URL = [];
router.get('/', function (req, res) {
    context.acquireTokenWithClientCredentials(resource, applicationId, secret, function (err, tokenResponse) {
        if (err) {
            res.json({ "type": false });
        } else {
            var authHeader = tokenResponse['accessToken'];
            var requestUsageAggregatesURL = process.env.requestUsageAggregatesURL;
            var subURL1, subURL3;
            var subURL2 = "&reportedEndTime=";
            var subURL4 = "&aggregationGranularity=Daily&showDetails=true";
            if (today.getDate() > 20) {
                if (today.getDate() === 21) {
                    subURL1 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + 20;
                    subURL3 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    URL.push(requestUsageAggregatesURL + subURL1 + subURL2 + subURL3 + subURL4);
                } else {
                    subURL1 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + 21;

                    calculateCompleteUrl(requestUsageAggregatesURL, subURL1, subURL2, subURL4);
                }

            } else {
                if (today.getMonth() === 0) {
                    subURL1 = today.getFullYear() - 1 + '-' + (today.getMonth() + 12) + '-' + 21;
                } else {
                    subURL1 = today.getFullYear() + '-' + today.getMonth() + '-' + 21;
                }
                calculateCompleteUrl(requestUsageAggregatesURL, subURL1, subURL2, subURL4);
            }
            var requestRateCardURL = process.env.requestRateCardURL;
            var arrayUsage = { Usage: [] };
            var env = process.env.CURRENT_ENV;
            var envResourceGroups = {
                devtest : ["delta_dev_test"],
                dev : ['Delta-DEV','DELTA-DEV','delta-dev'],
                qa : ['DELTAQA','DeltaQA','deltaqa'],
                qaload : ['Delta-QA-Load','DELTA-QA-LOAD','delta-qa-load'],
                kcec : ['KCEC','kcec'],
                prod : ['prod','PROD'] 
            }
            async.each(URL,
                function (URLArrayValue, callbackEach) {
                    let token = "Bearer " + authHeader;
                    rest.get(URLArrayValue, { headers: { Authorization: token } }).on('complete', function (resultUsage) {
                        var count = 0;
                        if (resultUsage.error) {
                            callbackEach()
                        } else {
                            for (var i = 0; i < resultUsage.value.length; i++) {
                                var Group;
                                var instanceData = resultUsage.value[i].properties.instanceData;
                                if (instanceData === undefined) {
                                    Group = " ";
                                } else {
                                    var insdata = JSON.parse(instanceData);
                                    var key = 'Microsoft.Resources';
                                    var resource = insdata[key].resourceUri.split("/");
                                    Group = resource[4];
                                }
                                if(envResourceGroups[env].includes(Group)) {
                                    var obj1 = { "MeterId": resultUsage.value[i].properties.meterId, "MeterName": resultUsage.value[i].properties.meterName, "MeterCategory": resultUsage.value[i].properties.meterCategory, "Unit": resultUsage.value[i].properties.unit, "Quantity": resultUsage.value[i].properties.quantity, "Group": Group };
                                    arrayUsage.Usage.push(obj1);
                                }
                                ++count;
                                if (count === resultUsage.value.length) {
                                    callbackEach(null, "Success");
                                }
                            }
                        }
                    });
                },
                function (err) {
                    if (err) {
                        res.json({ "type": false, "Message": err });
                    } else {
                        let authtoken = "Bearer " + authHeader;
                        rest.get(requestRateCardURL, { headers: { Authorization: authtoken } }).on('complete', function (resultRate) {
                            var arrayRate = { Rate: [] };
                            for (var i = 0; i < resultRate.Meters.length; i++) {
                                var obj2 = { "MeterId": resultRate.Meters[i].MeterId, "MeterName": resultRate.Meters[i].MeterName, "MeterCategory": resultRate.Meters[i].MeterCategory, "Unit": resultRate.Meters[i].Unit, "MeterRates": resultRate.Meters[i].MeterRates, "MeterStatus": resultRate.Meters[i].MeterStatus };
                                arrayRate.Rate.push(obj2);
                            }
                            var usageCost = { Cost: [] };
                            for (var m = 0; m < arrayRate.Rate.length; m++) {
                                for (var j = 0; j < arrayUsage.Usage.length; j++) {
                                    if ((arrayRate.Rate[m].MeterId === arrayUsage.Usage[j].MeterId) && (arrayRate.Rate[m].MeterName === arrayUsage.Usage[j].MeterName) && (arrayRate.Rate[m].MeterCategory === arrayUsage.Usage[j].MeterCategory) && (arrayRate.Rate[m].Unit === arrayUsage.Usage[j].Unit)) {
                                        var rate = arrayRate.Rate[m].MeterRates;
                                        var len = Object.keys(rate).length;
                                        var keys = Object.keys(rate);
                                        var quantity = arrayUsage.Usage[j].Quantity;
                                        var Status = arrayRate.Rate[m].MeterStatus;
                                        var pickedRate = 0;
                                        var k;
                                        for (k = 0; k < len; k++) {
                                            if (quantity >= keys[k]) {
                                                pickedRate = rate[keys[k]];
                                            }
                                        }
                                        var cost = pickedRate * quantity;
                                        var costObj = { "MeterId": arrayUsage.Usage[j].MeterId, "MeterName": arrayUsage.Usage[j].MeterName, "MeterCategory": arrayUsage.Usage[j].MeterCategory, "Unit": arrayUsage.Usage[j].Unit, "Quantity": arrayUsage.Usage[j].Quantity, "Rate": pickedRate, "Cost": cost, "MeterStatus": Status, "Group": arrayUsage.Usage[j].Group };
                                        usageCost.Cost.push(costObj);
                                    }
                                }
                            }
                            var TotalCost = 0;
                            for (var n = 0; n < usageCost.Cost.length; n++) {
                                TotalCost = TotalCost + usageCost.Cost[n].Cost;
                            }
                            var uniqueArray = [];
                            for (var p = 0; p < usageCost.Cost.length; p++) {
                                var value = { "MeterId": usageCost.Cost[p].MeterId, "MeterName": usageCost.Cost[p].MeterName, "MeterCategory": usageCost.Cost[p].MeterCategory, "MeterGroup": usageCost.Cost[p].Group, "MeterStatus": usageCost.Cost[p].MeterStatus };
                                uniqueArray.push(value);
                            }
                            var newObject = {};
                            for (var key in uniqueArray) {
                                if (uniqueArray.hasOwnProperty(key)) {
                                    var objMeterBillData = uniqueArray[key];
                                    newObject[objMeterBillData.MeterCategory] = objMeterBillData;
                                }
                            }
                            var newObj = [];
                            for (var key1 in newObject) {
                                if (newObject.hasOwnProperty(key1))
                                    newObj.push(newObject[key1]);
                            }
                            var CloudServices = {
                                "Services": [{ "Resources": "Virtual Machine", "Status": "Good" }, { "Resources": "Storage", "Status": "Good" }, { "Resources": "IoT Hub", "Status": "Good" }, { "Resources": "App Services", "Status": "Good" }]
                            };
                            res.json({ "type": true, "TotalCost": TotalCost, "ActiveServices": newObj, "CloudServices": CloudServices });

                        });
                    }
                });
        }
    });
});
function calculateDayDiff(diffDays) {
    if ((diffDays > 4) && ((diffDays % 4 > 1) || (diffDays % 4 === 0)) && (diffDays / 4 > 2))
        return 4;
    else if ((diffDays > 4) && ((diffDays % 4 === 1) || (diffDays / 4 < 2) || (diffDays % 2 === 0)))
        return 3;
    else
        return diffDays;
}
function calculateUrl3(startDate) {
    if (startDate.getMonth() === 0)
        return startDate.getFullYear() + '-' + (startDate.getMonth() + 12) + '-' + startDate.getDate();
    else
        return startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
}
function calculateUrl1(startDate) {
    var subURL1 = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    if (subURL1.getMonth() === 0) {
        return subURL1.getFullYear() - 1 + '-' + (subURL1.getMonth() + 12) + '-' + subURL1.getDate();
    } else {
        return subURL1.getFullYear() + '-' + (subURL1.getMonth() + 1) + '-' + subURL1.getDate();
    }
}
function calculateCompleteUrl(requestUsageAggregatesURL, subURL1, subURL2, subURL4) {
    var startDate = new Date(subURL1);
    var daysDiff;
    var subURL3;
    var count = 0;

    var timeDiff = Math.abs(today.getTime() - startDate.getTime());
    var diffDays = (Math.round(timeDiff / (1000 * 3600 * 24))) - 1;
    while (startDate <= today) {
        daysDiff = calculateDayDiff(diffDays);
        if (daysDiff < 0) {
            break;
        }
        startDate = new Date(startDate.getTime() + daysDiff * 24 * 60 * 60 * 1000);
        subURL3 = calculateUrl3(startDate);
        URL.push(requestUsageAggregatesURL + subURL1 + subURL2 + subURL3 + subURL4);
        subURL1 = calculateUrl1(startDate);
        diffDays = diffDays - (daysDiff + 1);
        startDate = new Date(subURL1);
    }
}
module.exports = router;
