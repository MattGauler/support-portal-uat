/// <reference path="../interfaces/commsInterface.ts"/>
/// <reference path="../interfaces/supportMessage.ts"/>
"use strict";
var ServiceBusManager = (function () {
    function ServiceBusManager() {
        this.azure = require('azure');
        this.endPoint = process.env.ServiceBusConnectionString || 'Endpoint=sb://prod-ct-al-driverapp.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=74Yd6uoPrvVH+MdkF/HeamK5vNjrDtht2M9W3bU0uqg=';
        this.topicName = process.env.ServiceBusReceiveTopicName || 't-notifydriver-1-0';
        this.subscriptionName = process.env.ServiceBusReceiveSubName || '0-SUPPORT';
        this.serviceBusService = this.azure.createServiceBusService(this.endPoint);
        this.createTopic();
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
    ServiceBusManager.prototype.createTopic = function () {
        this.serviceBusService.createTopicIfNotExists(this.topicName, function (error) {
            if (!error) {
                // Topic was created or exists
                console.log('Topic created or exists.');
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
        console.log('########################');
        console.log(message);
        console.log('########################');
        if (!err) {
            if (message.customProperties.content['@class'] == 'ConnectivityRequest') {
                if (this.dbManager.connection == undefined) {
                    this.dbManager.connectToDb(message.customProperties);
                }
                else {
                    if (this.dbManager.connection.loggedIn && !this.dbManager.connection.closed) {
                        this.dbManager.registerConnectionRequest(message.customProperties);
                    }
                    else {
                        this.dbManager.connectToDb(message.customProperties);
                    }
                }
            }
            if (message.customProperties.content['@class'] == 'supportRequest') {
                if (this.dbManager.connection == undefined) {
                    this.dbManager.connectToDb(message.customProperties);
                }
                else {
                    if (this.dbManager.connection.loggedIn && !this.dbManager.connection.closed) {
                        this.dbManager.registerSupportRequest(message.customProperties);
                    }
                    else {
                        this.dbManager.connectToDb(message.customProperties);
                    }
                }
            }
            this.serviceBusService.sendTopicMessage(message.customProperties.channel, message, function (error) {
                if (!error) {
                }
                else {
                    console.log('SEND ERROR: %s', error);
                    console.log(message);
                }
            });
        }
        else {
            console.log('ERROR in sendTopicMessage: %s', err);
            console.log(message);
        }
    };
    ServiceBusManager.prototype.receiveQueueMessage = function () {
        var _this = this;
        this.serviceBusService.receiveQueueMessage(this.queueName, function (error, receivedMessage) { return _this.routeMessage(error, receivedMessage); });
    };
    ServiceBusManager.prototype.receiveSubscriptionMessage = function () {
        var _this = this;
        this.serviceBusService.receiveSubscriptionMessage(this.topicName, this.subscriptionName, { isPeekLock: false }, function (error, receivedMessage) { return _this.routeMessage(error, receivedMessage); });
    };
    ServiceBusManager.prototype.routeMessage = function (error, receivedMessage) {
        if (!error && receivedMessage !== null) {
            receivedMessage.body = JSON.parse(receivedMessage.body);
            //console.log('Message ID: %s', receivedMessage.body.id);
            //console.log('Message in reply to: %s', receivedMessage.body.content['reply-to-id']);
            switch (receivedMessage.body.content['@class']) {
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
                case 'ConnectivityResponse':
                    if (this.dbManager.connection.loggedIn && !this.dbManager.connection.closed) {
                        this.dbManager.registerConnectionResponse(receivedMessage.body);
                    }
                    else {
                        this.dbManager.connectToDb(receivedMessage.body);
                    }
                    break;
            }
        }
        else
            console.log('No messages received');
    };
    return ServiceBusManager;
}());
exports.ServiceBusManager = ServiceBusManager;
