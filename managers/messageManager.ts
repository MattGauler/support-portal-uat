var Guid = require('guid');
    
export class MsgManager {
    
    commsType: string;
    baseMsg: any;
    
    
    constructor() {
        this.baseMsg = this.generateBaseMessage();
        
    }
    
    generateBaseMessage(): any {
        var uuid = Guid.v1();
        var msg = {
            id: uuid,
            data: {
                "@class":null
            }
        }

        return msg;
    }
    
    generateConnectionRequest(userId:string): any{
        var base = this.generateBaseMessage();
        var msg = base;
        return msg;
    }
    
}
