/// <reference path="../../managers/dbManager.ts"/>

import Managers = require('../../managers/_managers');

var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Guid = require('guid');

router.post('/', function(req, res) {
    var managers = new Managers.Managers();
    var userId = req.body.userId;
    var apiKey = req.body.apiKey;
    var deviceId = req.body.deviceId;
    var pilotValue = req.body.pilotValue;

    var connection = new Connection(managers.dbManager.generateTediousConfig());

    connection.on('connect', function(err) {
        // If no error, then good to proceed.
        if(err) {
            console.log('ERROR: %s', err);
            res.status(500).send("Error");
        }
        else {
            console.log("Connected");
            executeStatement(res, deviceId, pilotValue);
        }
    });

    function executeStatement(res, deviceId, pilotValue) {
        managers.dbManager.allowRequest(connection, userId, apiKey, function(authorised) {
            if(!authorised) {
                res.status(500).send();
            }
            else {
                var request = new Request('dbo.UpdatePilotDevices',
                    function(err, rowCount) {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Error");
                        }
                        else {
                            console.log('Complete: %s row(s) returned', rowCount);
                            connection.close();
                            res.send('Complete: ' + rowCount + ' row(s) returned');
                        }
                    }
                );

                request.addParameter('DeviceId', TYPES.NVarChar, deviceId);
                request.addParameter('IsPilot', TYPES.NVarChar, pilotValue);

                connection.callProcedure(request);
            }
        });
    }
});

router.get('/', function(req, res, next) {
});

module.exports = router;
