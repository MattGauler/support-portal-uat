/// <reference path="../../managers/dbManager.ts"/>

import Managers = require('../../managers/_managers');

var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

router.post('/', function(req, res, next) {
    res.send('POST instruction received');
});

router.get('/', function(req, res, next) {
    var managers = new Managers.Managers();
    var userId = req.param('userId');
    var apiKey = req.param('apiKey');
    
    console.log(req);
    
    var connection = new Connection(managers.dbManager.generateTediousConfig());

    connection.on('connect', function(err) {
        // If no error, then good to proceed.
        if(err) {
            console.log('ERROR: %s', err);
            res.status(500).send();
        }
        else {
            console.log("Connected");
            executeStatement(res);
        }
    });

    connection.on('end', function() { console.log('Db Disconnected') });

    function executeStatement(res) {
        managers.dbManager.allowRequest(userId, apiKey, function(authorised) {
            if(!authorised) {
                res.status(500).send();
            }
            else {
                var result = [];

                var request = new Request(
                    `
                        Select
                            delaybandId as ID,
                            delayBandLabel as [Band],
                            0 as [Occurences]
                        from
                           responseDelayBands 
                    `,
                    function(err, rowCount) {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Error");
                        }
                        else {
                            console.log('Complete: %s row(s) returned', rowCount);
                            connection.close();
                            res.send(result);
                        }
                    }
                );

                request.on('row', function(columns) {
                    var row = {};

                    columns.forEach(function(column) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {
                            row[column.metadata.colName] = column.value;
                        }
                    });

                    result.push(row);
                });

                request.on('done', function(rowCount, more) {
                    console.log(rowCount + ' rows returned');
                });

                connection.execSql(request);
            }
        });
    }
});

module.exports = router;
