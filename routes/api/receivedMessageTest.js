"use strict";
var Managers = require('../../managers/_managers');
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    var managers = new Managers.Managers();
    managers.commsManager.commsWorker.receiveQueueMessage();
});
module.exports = router;
