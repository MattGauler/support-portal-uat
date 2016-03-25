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
var bcrypt = require('bcrypt');
router.post('/', function (req, res) {
    var managers = new Managers.Managers();
    var userId = req.body.userId;
    var password = req.body.password;
    console.log('LOGIN PARAMS: %s, %s, %s, %s', userId, password);
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
        var loginResult = {};
        var request = new Request("\n                SELECT * FROM [dbo].[Users] WHERE UserId = @UserId\n            ", function (err, rowCount) {
            if (err) {
                console.log(err);
                res.status(500).send("Error");
            }
            else {
                connection.close();
                if (rowCount === 0) {
                    loginResult.authenticated = false;
                    res.status(500).send();
                }
                else {
                    bcrypt.compare(password, loginResult.Password, function (err, result) {
                        if (result) {
                            loginResult.authenticated = true;
                            delete loginResult.Password;
                            delete loginResult.ServerKey;
                            res.status(200).send(loginResult);
                        }
                        else
                            res.status(500).send();
                    });
                }
            }
        });
        request.on('row', function (columns) {
            columns.forEach(function (column) {
                //console.log(column.metadata.colName);
                loginResult[column.metadata.colName] = column.value;
            });
        });
        request.addParameter('UserId', TYPES.NVarChar, userId);
        connection.execSql(request);
    }
});
router.get('/', function (req, res, next) {
});
module.exports = router;
