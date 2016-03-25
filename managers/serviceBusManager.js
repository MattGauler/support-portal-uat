/// <reference path="../interfaces/commsInterface.ts"/>
/// <reference path="../interfaces/supportMessage.ts"/>
"use strict";
var ServiceBusManager = (function () {
    function ServiceBusManager() {
        this.azure = require('azure');
        this.endPoint = process.env.ServiceBusConnectionString || 'Endpoint=sb://arrowxl.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=pZ1Rq5WiC19IZOnNLyP9KWQyNxZlXQtYFIilwpNhWnU=';
        this.topicName = process.env.ServiceBusReceiveTopicName || 't-support';
        this.subscriptionName = process.env.ServiceBusReceiveSubName || 'support-server';
        this.serviceBusService = this.azure.createServiceBusService(this.endPoint);
        this.queueName = 'supportuat';
        this.createQueue();
    }
    ServiceBusManager.prototype.createQueue = function () {
        this.serviceBusService.createQueueIfNotExists(this.queueName, function (error) {
            if (!error) {
                console.log('Queue working successfully');
            }
            else {
                console.log('SETUP ERROR: %s', error);
            }
        });
    };
    ServiceBusManager.prototype.sendAndCreateQueue = function (message) {
        var _this = this;
        this.serviceBusService.createQueueIfNotExists(message.customProperties.channel, (function (err) { return _this.sendQueueMessage(message, err); }));
    };
    ServiceBusManager.prototype.sendQueueMessage = function (message, err) {
        if (!err) {
            this.serviceBusService.sendQueueMessage(message.customProperties.channel, message, function (error) {
                if (!error) {
                    console.log('Message sent: %s', JSON.stringify(message));
                }
                else {
                    console.log('SEND ERROR: %s', error);
                }
            });
        }
        else
            console.log('ERROR CREATING QUEUE: %s', err);
    };
    ServiceBusManager.prototype.sendTopicMessage = function (message, err) {
        if (!err) {
            this.serviceBusService.sendTopicMessage(message.customProperties.channel, message, function (error) {
                if (!error) {
                    console.log('Message sent: %s', JSON.stringify(message));
                }
                else {
                    console.log('SEND ERROR: %s', error);
                }
            });
        }
        else
            console.log('ERROR CREATING QUEUE: %s', err);
    };
    ServiceBusManager.prototype.receiveQueueMessage = function () {
        var _this = this;
        this.serviceBusService.receiveQueueMessage(this.queueName, function (error, receivedMessage) { return _this.routeMessage(error, receivedMessage); });
    };
    ServiceBusManager.prototype.receiveSubscriptionMessage = function () {
        var _this = this;
        this.serviceBusService.receiveSubscriptionMessage(this.topicName, this.subscriptionName, { isPeekLock: true }, function (error, receivedMessage) { return _this.routeMessage(error, receivedMessage); });
    };
    ServiceBusManager.prototype.routeMessage = function (error, receivedMessage) {
        if (!error && receivedMessage !== null) {
            console.log(JSON.stringify(receivedMessage));
            receivedMessage.body = JSON.parse(receivedMessage.body);
            console.log('Message Action: %s', receivedMessage.body.notification);
            switch (receivedMessage.body.notification) {
                case 'register':
                    this.dbManager.connectToDb(receivedMessage.body.content);
                    break;
                case 'routeConfirm':
                    this.dbManager.connectToDb(receivedMessage.body.content);
                    break;
                case 'requestData':
                    this.dbManager.connectToDb(receivedMessage.body.content);
                    break;
                case 'resendMessages':
                    this.dbManager.connectToDb(receivedMessage.body.content);
                    break;
                case 'logout':
                    this.dbManager.connectToDb(receivedMessage.body.content);
                    break;
            }
        }
        else
            console.log('No messages received');
    };
    return ServiceBusManager;
}());
exports.ServiceBusManager = ServiceBusManager;
