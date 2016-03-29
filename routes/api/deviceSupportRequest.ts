/// <reference path="../../managers/dbManager.ts"/>

import Managers = require('../../managers/_managers');

var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

router.post('/', function(req, res, next) {
    
    var requestMessage = req.body.requestMessage;
    var targetDeviceChannel = req.body.targetDevice;
    var requestMessageId = requestMessage.id;
    var requestTimestamp = new Date(requestMessage.date);
    
    var reqData = requestMessage.content.data;
    var reqResponse = requestMessage.content.response;
    
    console.log('PARAMS: %s, %s', requestMessageId, requestTimestamp);
    
    var managers = new Managers.Managers();
    
    var supportRequestMessage = managers.msgManager.generateDeviceSupportRequest(targetDeviceChannel,reqData,reqResponse);
    
    managers.commsManager.commsWorker.sendTopicMessage(supportRequestMessage, false);

});

module.exports = router;
