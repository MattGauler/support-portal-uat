/// <reference path="../../managers/dbManager.ts"/>
"use strict";
var Managers = require('../../managers/_managers');
var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Guid = require('guid');
router.post('/', function (req, res) {
    var managers = new Managers.Managers();
    var userId = req.body.userId;
    var apiKey = req.body.apiKey;
    var deviceUserId = req.body.deviceUserId;
    var deviceId = req.body.deviceId;
    var instructionType = req.body.instructionType;
    var instructionValues = req.body.instructionValues;
    console.log('INSTRUCTION PARAMS: %s, %s, %s, %s', deviceUserId, deviceId, instructionType, JSON.stringify(instructionValues));
    var connection = new Connection(managers.dbManager.generateTediousConfig());
    connection.on('connect', function (err) {
        // If no error, then good to proceed.
        if (err) {
            console.log('ERROR: %s', err);
            res.status(500).send("Error");
        }
        else {
            console.log("Connected");
            executeStatement(res);
        }
    });
    function executeStatement(res) {
        managers.dbManager.allowRequest(connection, userId, apiKey, function (authorised) {
            if (!authorised) {
                res.status(500).send();
            }
            else {
                var request = new Request("\n                        INSERT INTO [dbo].[CurrentInstructions] (DeviceId, UserId, InstructionType, InstructionValues, RequestedTime, Requester)\n                        VALUES (@DeviceId, @UserId, @InstructionType, @InstructionValues, @RequestedTime, @Requester)\n                    ", function (err, rowCount) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Error");
                    }
                    else {
                        console.log('Complete: %s row(s) returned', rowCount);
                        connection.close();
                        res.send('Complete: ' + rowCount + ' row(s) returned');
                    }
                });
                request.addParameter('DeviceId', TYPES.NVarChar, deviceId);
                request.addParameter('UserId', TYPES.NVarChar, userId);
                request.addParameter('InstructionType', TYPES.NVarChar, instructionType);
                request.addParameter('InstructionValues', TYPES.NVarChar, JSON.stringify(instructionValues));
                request.addParameter('RequestedTime', TYPES.DateTime, new Date());
                request.addParameter('Requester', TYPES.NVarChar, 'Nick');
                connection.execSql(request);
                sendInstructionToDevice();
            }
        });
    }
    function sendInstructionToDevice() {
        var customProperties = {
            id: Guid.raw(),
            channel: deviceUserId.toString(),
            subchannel: '1',
            expiry: 0,
            date: 131007203230000000,
            content: {
                type: instructionType,
                requester: userId,
                instructionValues: instructionValues
            }
        };
        var message = {
            body: JSON.stringify(customProperties),
            customProperties: customProperties
        };
        managers.commsManager.commsWorker.sendAndCreateQueue(message);
    }
});
router.get('/', function (req, res, next) {
});
module.exports = router;
