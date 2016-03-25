/// <reference path="../../managers/dbManager.ts"/>

import Managers = require('../../managers/_managers');

var express = require('express');
var router = express.Router();
var tedious = require('tedious');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

router.get('/', function(req, res, next) {
    var managers = new Managers.Managers();
    var userId = req.get('userId');
    var apiKey = req.get('apiKey');
    var deviceUserId = req.get('deviceUserId');

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

    function executeStatement(res) {
        managers.dbManager.allowRequest(connection, userId, apiKey, function(authorised) {
            if(!authorised) {
                res.status(500).send();
            }
            else {
                var result = [];

                var request = new Request("SELECT * FROM dbo.RouteConfirm WHERE UserId = @UserId AND ConfirmTime > CAST(GETDATE() AS DATE) ORDER BY ConfirmTime DESC;", function(err, rowCount) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Error");
                    }
                    else {
                        console.log('Complete: %s row(s) returned', rowCount);
                        connection.close();
                        res.send(result);
                    }
                });

                request.addParameter('UserId', TYPES.NVarChar, deviceUserId);

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
