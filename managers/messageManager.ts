var Guid = require('guid');
var moment = require('moment');
    
export class MsgManager {
    
    commsType: string;
    baseMsg: any;
    
    
    constructor() {
        this.baseMsg = this.generateBaseMessage();
        
    }
    
    generateBaseMessage(): any {
        
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
        
        var message = {
            id: Guid.raw(),
            channel: 't-notifyshamrock-0',
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
    
    generateConnectionRequest(userId:string): any{
        var base = this.generateBaseMessage();
        var msg = base;
        var content = {
            content: {
                "@class": "ConnectivityRequest", 
                data: {
                    "requestExpiry": moment().add(1,'m').valueOf()
                }, 
                driverId: "", 
                id: Guid.raw(), 
                messageDate: moment().toDate(), 
                subscriptionToken: "5-20501-6a996228-d73b-1add-baad-8c04bf8cbccb"
            }
        }
        msg.content = content;
        return msg;
    }
    
}
