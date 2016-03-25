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
        this.endPoint = process.env.ServiceBusConnectionString || 'Endpoint=sb://arrowxl.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=pZ1Rq5WiC19IZOnNLyP9KWQyNxZlXQtYFIilwpNhWnU=';
        this.topicName = process.env.ServiceBusReceiveTopicName || 't-support';
        this.subscriptionName = process.env.ServiceBusReceiveSubName || 'support-server';
        this.serviceBusService = this.azure.createServiceBusService(this.endPoint);
        this.queueName = 'supportuat';

        this.createQueue();
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

    sendTopicMessage(message, err): void {
        if(!err) {
            this.serviceBusService.sendTopicMessage(message.customProperties.channel, message, function(error){
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

    receiveQueueMessage(): void {
        this.serviceBusService.receiveQueueMessage(this.queueName, (error, receivedMessage) => this.routeMessage(error, receivedMessage));
    }

    receiveSubscriptionMessage(): void {
        this.serviceBusService.receiveSubscriptionMessage(this.topicName, this.subscriptionName, {isPeekLock: true}, (error, receivedMessage) => this.routeMessage(error, receivedMessage));
    }

    routeMessage(error, receivedMessage): void {
        if(!error && receivedMessage !== null) {
            console.log(JSON.stringify(receivedMessage));
            receivedMessage.body = JSON.parse(receivedMessage.body);
            console.log('Message Action: %s', receivedMessage.body.notification);

            switch(receivedMessage.body.notification) {
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
    }
    
}
