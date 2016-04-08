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
    res.send('POST instruction received');
});
router.get('/', function (req, res, next) {
    var userId = req.query.userId;
    var apiKey = req.query.apiKey;
    var period = req.query.period;
    period = 0 - parseInt(period);
    console.log('PARAMS: %s, %s, %s', userId, apiKey);
    var managers = new Managers.Managers();
    managers.dbManager.allowRequest(userId, apiKey, function (authorised) {
        if (!authorised) {
            res.status(500).send();
        }
        else {
            managers.driverDBManager.requestDriverList(period, function (err, results) {
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
module.exports = router;
