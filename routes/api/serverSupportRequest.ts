/// <reference path="../../managers/dbManager.ts"/>

import Managers = require('../../managers/_managers');

var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

router.post('/', function(req, res, next) {
    
    var targetTopic = req.body.topic;
    var targetSubscription = req.body.target;
    var requestMessageContent = req.body.requestMessageContent;
    
    var managers = new Managers.Managers();
    
    var supportRequestMessage = managers.msgManager.generateServerSupportRequest(targetTopic,targetSubscription,requestMessageContent);
    
    var requestMessageId = supportRequestMessage.customProperties.content.id;
    var requestTimestamp = new Date(supportRequestMessage.customProperties.content.messageDate);
     
    console.log('PARAMS: %s, %s', requestMessageId, requestTimestamp);
    
    managers.commsManager.commsWorker.sendTopicMessage(function(result){
        res.setHeader('content-type', 'application/x-www-form-urlencoded');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(result);   
    },supportRequestMessage, false);

});

module.exports = router;
