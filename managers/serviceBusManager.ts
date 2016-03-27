/// <reference path="../interfaces/commsInterface.ts"/>
/// <reference path="../interfaces/supportMessage.ts"/>

import DbManager = require('../managers/dbManager');

export class ServiceBusManager implements Comms {
    azure: any;
    serviceBusService: any;
    queueName: string;
    topicName: string;
    subscriptionName: string;
    endPoint: string;
    dbManager: DbManager.DbManager;

    constructor() {
        this.azure = require('azure');
        this.endPoint = process.env.ServiceBusConnectionString || 'Endpoint=sb://prod-ct-al-driverapp.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=74Yd6uoPrvVH+MdkF/HeamK5vNjrDtht2M9W3bU0uqg=';
        this.topicName = process.env.ServiceBusReceiveTopicName || 't-notifydriver-1-0';
        this.subscriptionName = process.env.ServiceBusReceiveSubName || '0-SUPPORT';
        
        this.serviceBusService = this.azure.createServiceBusService(this.endPoint);
        
        this.createTopic();
    }

    private createQueue(): void {
        this.serviceBusService.createQueueIfNotExists(this.queueName, function(error){
            if(!error){
                console.log('Queue working successfully');
            }
            else {
                console.log('SETUP ERROR: %s', error);
            }
        });
    }

    private createTopic(): void {
        this.serviceBusService.createTopicIfNotExists(this.topicName,function(error){
            if(!error){
                // Topic was created or exists
                console.log('Topic created or exists.');
            }
            else {
                console.log('SETUP ERROR: %s', error);
            }
        });
    }
    
    sendAndCreateQueue(message): void {
        this.serviceBusService.createQueueIfNotExists(message.customProperties.channel, (err => this.sendQueueMessage(message, err)));
    }

    sendQueueMessage(message, err): void {
        if(!err) {
            this.serviceBusService.sendQueueMessage(message.customProperties.channel, message, function(error){
                if(!error){
                    console.log('Message sent: %s', JSON.stringify(message));
                }
                else {
                    console.log('SEND ERROR: %s', error);
                }
            });
        }
        else
            console.log('ERROR CREATING QUEUE: %s', err);
    }

    sendTopicMessage(message,  err): void {
        
        if(!err) {
            this.serviceBusService.sendTopicMessage(message.customProperties.channel, message, function(error){
                if(!error){
                    console.log('Message sent: %s', message.customProperties.id);
                }
                else {
                    console.log('SEND ERROR: %s', error);
                    console.log(message);
                }
            });
        }
        else{
            console.log('ERROR in sendTopicMessage: %s', err);
            console.log(message);
        }
    }

    receiveQueueMessage(): void {
        this.serviceBusService.receiveQueueMessage(this.queueName, (error, receivedMessage) => this.routeMessage(error, receivedMessage));
    }

    receiveSubscriptionMessage(): void {
        this.serviceBusService.receiveSubscriptionMessage(this.topicName, this.subscriptionName, {isPeekLock: false}, (error, receivedMessage) => this.routeMessage(error, receivedMessage));
    }

    routeMessage(error, receivedMessage): void {
        if(!error && receivedMessage !== null) {
            //console.log(JSON.stringify(receivedMessage));
            receivedMessage.body = JSON.parse(receivedMessage.body);
            console.log('Message ID: %s', receivedMessage.body.id);
            console.log('Message in reply to: %s', receivedMessage.body.content['reply-to-id']);

            switch(receivedMessage.body.content['@class']) {
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
                    this.dbManager.connectToDb(receivedMessage.body.content);
                    break;
            }
        }
        else
            console.log('No messages received');
    }
    
}
