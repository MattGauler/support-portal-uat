interface Comms {
    dbManager: any;

    sendAndCreateQueue(message: any): void;
    sendQueueMessage(message: any, err: any): void;
    sendTopicMessage(callback:any, message: any, err: any): void;
    receiveQueueMessage(): void;
    receiveSubscriptionMessage(): void;
    routeMessage(error: any, message: any): void;
}
