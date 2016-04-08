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
    managers.dbManager.userLogin(userId, function (err, results) {
        var loginResult = {};
        if (err) {
            console.log(err);
            res.status(500).send("Error");
        }
        else {
            if (results.length === 0) {
                loginResult['authenticated'] = false;
                res.status(500).send();
            }
            else {
                loginResult = results[0];
                bcrypt.compare(password, loginResult['Password'], function (err, result) {
                    if (result) {
                        loginResult['authenticated'] = true;
                        delete loginResult['Password'];
                        delete loginResult['ServerKey'];
                        res.status(200).send(loginResult);
                    }
                    else
                        res.status(500).send();
                });
            }
        }
    });
});
router.get('/', function (req, res, next) {
});
module.exports = router;
