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

interface GenericMessageBody {
    class: string;
    id: string;
    messageDate: Date;
}

interface ConnectivityMessageBody {
    id: string;
    code: number;
    messageDate: string;
}

interface SupportMessageBody {
    id: string;
    type: string;
    driverId: string;
    deviceId: string;
    timeStamp: string;

    instructionType?: string;
    result?: any;
    instructionValues?: string;
    requester?: string;
}
