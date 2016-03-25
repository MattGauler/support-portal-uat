interface SupportMessage {
    body: {
        content: SupportMessageBody;
        id: string;
        channel: string;
        subchannel: string;
        notification: string;
        provider: string;
        date: number;
        expiry: number;
    };
    brokerProperties: {
        DeliveryCount: number;
        EnqueuedSequenceNumber: number;
        EnqueuedTimeUtc: string;
        MessageId: string;
        SequenceNumber: number;
        State: string;
        TimeToLive: number;
    };
    contentType: string;
    customProperties: {
        connection?: string;
    }
}


interface SupportMessageBody {
    type: string;
    userId: string;
    routeId: string;
    deviceId: string;
    timeStamp: string;

    instructionType?: string;
    result?: any;
    instructionValues?: string;
    requester?: string;
}
