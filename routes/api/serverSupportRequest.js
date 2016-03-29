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
    var requestMessage = req.body.requestMessage;
    var requestMessageId = requestMessage.id;
    var requestTimestamp = new Date(requestMessage.date);
    console.log('PARAMS: %s, %s, %s', requestMessageId, requestTimestamp, requestMessage);
    var managers = new Managers.Managers();
    var supportRequest = req.body;
    var subToken = '';
    var driverId = '';
    var reqData = {};
    var requestMessage = managers.msgManager.generateServerSupportRequest(subToken, driverId, reqData);
    var message = {
        body: JSON.stringify(requestMessage),
        customProperties: requestMessage
    };
    managers.commsManager.commsWorker.sendTopicMessage(message, false);
});
module.exports = router;
