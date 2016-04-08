/// <reference path="../interfaces/commsInterface.ts"/>
/// <reference path="../interfaces/supportMessage.ts"/>
"use strict";
var ServiceBusManager = (function () {
    function ServiceBusManager() {
        this.azure = require('azure');
        this.endPoint = process.env.ServiceBusConnectionString || 'Endpoint=sb://prod-ct-al-driverapp.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=74Yd6uoPrvVH+MdkF/HeamK5vNjrDtht2M9W3bU0uqg=';
        //this.endPoint = process.env.ServiceBusConnectionString || 'Endpoint=sb://sit-ct-al-driverapp.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=0dgyeLLvDmGOTEJ+zDZGJT9huuOYgJfEZ/si7IWvjYI=';
        this.serverTopic = process.env.ServiceBusSendTopicName || 't-notifyshamrock-0';
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
    ServiceBusManager.prototype.sendTopicMessage = function (callback, message, err) {
        var targetTopic = this.serverTopic;
        if (!err) {
            if (message.customProperties.content['@class'] == 'ConnectivityRequest') {
                targetTopic = this.serverTopic;
                this.dbManager.registerConnectionRequest(message.customProperties);
            }
            if (message.customProperties.content['@class'] == 'supportRequest') {
                targetTopic = message.customProperties.topic;
                this.dbManager.registerSupportRequest(message.customProperties);
            }
            this.serviceBusService.sendTopicMessage(targetTopic, message, function (error) {
                if (!error) {
                    var result = ('MessageID: ' + message.customProperties.id + ' sent to Topic ' + targetTopic);
                    callback(result);
                }
                else {
                    var errorMsg = ('Error sending MessageID: %s to Topic %s: ERROR - ', message.customProperties.id, targetTopic, error);
                    console.log('SEND ERROR: %s', errorMsg);
                    console.log(message);
                    callback(errorMsg);
                }
            });
        }
        else {
            var errorMsg = 'ERROR in sendTopicMessage: %s', err;
            console.log(errorMsg);
            console.log(message);
            callback(errorMsg);
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
            console.log('Message ID: %s', receivedMessage.body.id);
            console.log('Message in reply to: %s', receivedMessage.body.content['reply-to-id']);
            switch (receivedMessage.body.content['@class']) {
                case 'ConnectivityResponse':
                    this.dbManager.registerConnectionResponse(receivedMessage.body);
                    break;
            }
        }
        else
            console.log('No messages received');
    };
    return ServiceBusManager;
}());
exports.ServiceBusManager = ServiceBusManager;
