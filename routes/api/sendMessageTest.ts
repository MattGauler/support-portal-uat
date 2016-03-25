import Managers = require('../../managers/_managers');

var express = require('express');
var router = express.Router();
var Guid = require('guid');

router.post('/', function(req, res, next) {
    var managers = new Managers.Managers();

    var customProperties = {
        id: Guid.raw(),
        channel: '899991',
        subchannel: '1',
        expiry: 0,
        date: 131007203230000000,
        content: {
            test: 'test'
        }
    };

    var message = {
        body: JSON.stringify(customProperties),
        customProperties: customProperties
    };

    managers.commsManager.commsWorker.sendAndCreateQueue(message);

    res.send('success');
});


router.get('/', function(req, res, next) {
    var managers = new Managers.Managers();

    var customProperties = {
        id: Guid.raw(),
        channel: '899991',
        subchannel: '1',
        expiry: 0,
        date: 131007203230000000,
        content: {
            test: 'test'
        }
    };

    var message = {
        body: JSON.stringify(customProperties),
        customProperties: customProperties
    };

    managers.commsManager.commsWorker.sendAndCreateQueue(message);

    res.send('Message sent.');
});

module.exports = router;
