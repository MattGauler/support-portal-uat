/// <reference path="../../managers/dbManager.ts"/>
"use strict";
var Managers = require('../../managers/_managers');
var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
router.post('/', function (req, res, next) {
    var userId = req.body.userId;
    var apiKey = req.body.apiKey;
    var period = req.body.period;
    period = 0 - parseInt(period);
    console.log('PARAMS: %s, %s, %s', userId, apiKey, period);
    var managers = new Managers.Managers();
    managers.dbManager.allowRequest(userId, apiKey, function (authorised) {
        if (!authorised) {
            res.status(500).send();
        }
        else {
            managers.dbManager.requestConnectionSummary(period, function (err, results) {
                if (err) {
                    console.log(err);
                    res.status(500).send("Error");
                }
                else {
                    res.setHeader('content-type', 'application/x-www-form-urlencoded');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.status(200).send(results);
                }
            });
        }
    });
});
router.post('/', function (req, res, next) {
    var userId = req.body.userId;
    var apiKey = req.body.apiKey;
    var requestMessageId = req.body.requestMessageId;
    console.log('PARAMS: %s, %s, %s', userId, apiKey, requestMessageId);
    var managers = new Managers.Managers();
    var connection = new Connection(managers.dbManager.generateTediousConfig());
    connection.on('connect', function (err) {
        // If no error, then good to proceed.
        if (err) {
            console.log('ERROR: %s', err);
            res.status(500).send();
        }
        else {
            console.log("Connected");
            executeStatement(res);
        }
    });
    connection.on('end', function () { console.log('Db Disconnected'); });
    function executeStatement(res) {
        managers.dbManager.allowRequest(userId, apiKey, function (authorised) {
            if (!authorised) {
                res.status(500).send();
            }
            else {
                var result = [];
                var request = new Request("\n                    Select\n                        *\n                    from\n                        SupportRequest\n                    where\n                        MessageID = @requestMessageId\n                    ", function (err, rowCount) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Error");
                    }
                    else {
                        console.log('Complete: %s row(s) returned', rowCount);
                        connection.close();
                        res.setHeader('content-type', 'application/x-www-form-urlencoded');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.status(200).send(result);
                    }
                });
                request.addParameter('requestMessageId', TYPES.NVarChar, requestMessageId);
                request.on('row', function (columns) {
                    var row = {};
                    columns.forEach(function (column) {
                        if (column.value === null) {
                            console.log('NULL');
                        }
                        else {
                            row[column.metadata.colName] = column.value;
                        }
                    });
                    result.push(row);
                });
                request.on('done', function (rowCount, more) {
                    console.log(rowCount + ' rows returned');
                });
                connection.execSql(request);
            }
        });
    }
});
module.exports = router;
