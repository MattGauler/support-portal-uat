var Guid = require('guid');
    
export class MsgManager {
    
    commsType: string;
    baseMsg: any;
    
    
    constructor() {
        this.baseMsg = this.generateBaseMessage();
        
    }
    
    generateBaseMessage(): any {
        
        var customProperties = {
            id: Guid.raw(),
            channel: '899991',
            subchannel: '1',
            expiry: 0,
            date: 131007203230000000,
            content: {
                '@class': ''
            }
        };

        var message = {
            body: JSON.stringify(customProperties),
            customProperties: customProperties
        };
        
        
        return message;
    }
    
    generateConnectionRequest(userId:string): any{
        var base = this.generateBaseMessage();
        var msg = base;
        return msg;
    }
    
}
