/// <reference path="../../managers/dbManager.ts"/>

import Managers = require('../../managers/_managers');

var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Guid = require('guid');
var bcrypt = require('bcrypt');

router.post('/', function(req, res) {
    var managers = new Managers.Managers();
    var userId = req.body.userId;
    var apiKey = req.body.apiKey;
    var username = req.body.username;
    var password = req.body.password;
    var depot = req.body.depot;
    var createUsers = req.body.createUsers;

    console.log('LOGIN PARAMS: %s, %s, %s, %s', username, password, depot);

    if(username == "")
        res.status(500).send();
    if(password == "")
        res.status(500).send();
    if(depot == "")
        res.status(500).send();

    var connection = new Connection(managers.dbManager.generateTediousConfig());

    connection.on('connect', function(err) {
        // If no error, then good to proceed.
        if(err) {
            console.log('ERROR: %s', err);
            res.status(500).send("Error");
        }
        else {
            console.log("Connected");
            executeStatement(res);
        }
    });

    function executeStatement(res) {
        managers.dbManager.allowRequest(userId, apiKey, function(authorised) {
            if(!authorised) {
                res.status(500).send();
            }
            else {
                bcrypt.hash(password, 8, function(err, hash) {
                    if(!err) {
                        var request = new Request(
                            '[dbo].[CreateNewUser]',
                            function(err, rowCount) {
                                console.log('RC: ' + rowCount)
                                if (err) {
                                    console.log(err);
                                    res.status(500).send();
                                }
                                else {
                                    connection.close();
                                    res.status(200).send();
                                }
                            }
                        )

                        request.addParameter('UserId', TYPES.NVarChar, username);
                        request.addParameter('Password', TYPES.NVarChar, hash);
                        request.addParameter('Depot', TYPES.NVarChar, depot);
                        request.addParameter('CreatedOn', TYPES.DateTime, new Date());
                        request.addParameter('ApiKey', TYPES.NVarChar, Guid.raw());
                        request.addParameter('ServerKey', TYPES.NVarChar, Guid.raw());
                        request.addParameter('CreateUsers', TYPES.Bit, createUsers)

                        connection.callProcedure(request);
                    }
                });
            }
        });
    }
});

router.get('/', function(req, res, next) {
});

module.exports = router;
