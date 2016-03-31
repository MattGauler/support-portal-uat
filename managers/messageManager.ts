var Guid = require('guid');
var moment = require('moment');
    
export class MsgManager {
    
    commsType: string;
    baseMsg: any;
    
    
    constructor() {
        this.baseMsg = this.generateBaseMessage();   
    }
    
    generateBaseMessage(p_channel?:string): any {
        
        /*
        
        {
            "id": "c56bcaff-8e00-446c-8755-9c477b742db7", 
            "channel": "t-notifyshamrock-0", 
            "subchannel": "1234",
            "expiry": 1457607834463, 
            "date": 1457604234466,
            "notification": "", 
            "provider": "", 
            "content": {
                "@class": "ConnectivityRequest", 
                "data": {
                    "requestExpiry": 1457604299655
                }, 
                "driverId": "53224eb8-ce59-42a8-9391-e35d7a5b9eb5", 
                "id": "cff50718-c3eb-f2ed-45bc-fe662fd102f8", 
                "messageDate": "2016-03-10T10:03:19+00:00", 
                "subscriptionToken": "5-20501-6a996228-d73b-1add-baad-8c04bf8cbccb"
            }             
        }
        */
        
        var channel = p_channel || 't-notifyshamrock-0';
        
        var message = {
            id: Guid.raw(),
            channel: channel ,
            subchannel: '1234',
            expiry: moment().add(1,'m').valueOf(),
            date: moment().valueOf(),
            notification: '', 
            provider: '', 
            content: {
                '@class': ''
            }
        };

        return message;
    }
    
    generateConnectionRequest(topic:string, subToken:string,driverId:string): any{
        var base = this.generateBaseMessage();
        var customProperties = base;
        var content = {
            "@class": "ConnectivityRequest", 
            data: {
                "requestExpiry": moment().add(1,'m').valueOf()
            }, 
            driverId: driverId, 
            id: Guid.raw(), 
            messageDate: moment().toDate(), 
            subscriptionToken: subToken
        }
        customProperties.content = content;
        customProperties.topic = topic;
        customProperties.channel = 'driverapp';
        
        var message = {
            body: JSON.stringify(customProperties),
            customProperties: customProperties
        };

        return message;
    }
    
    generateDeviceSupportRequest(topic:string, subscription:string, supportMessageContent:any): any{
        var base = this.generateBaseMessage(topic);
        var customProperties = base;
        customProperties.content = supportMessageContent;
        customProperties.content.id = Guid.raw();
        customProperties.content.messageDate = moment().toDate();
        
        customProperties.target = subscription;
        customProperties.topic = topic;
        customProperties.channel = 'driverapp';
        
        var message = {
            body: JSON.stringify(customProperties),
            customProperties: customProperties
        };

        return message;
    }
    
    generateServerSupportRequest(topic:string, subscription:string,supportMessageContent:any): any{
        var base = this.generateBaseMessage(topic);
        var customProperties = base;
        
        customProperties.content = supportMessageContent;
        customProperties.content.id = Guid.raw();
        customProperties.content.messageDate = moment().toDate();
       
        customProperties.target = subscription;
        customProperties.topic = topic;
        customProperties.channel = topic;
        
        var message = {
            body: JSON.stringify(customProperties),
            customProperties: customProperties
        };

        return message;
    }
}
