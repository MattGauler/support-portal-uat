export class MsgManager {
    commsType: string;
    baseMsg: any;

    constructor() {
        this.baseMsg = this.generateBaseMessage();
    }
    
    generateBaseMessage(): any{
        var msg = {
            id: this.username,
            password: this.password,
            server: this.server,
            options: {
                encrypt: this.encrypt,
                database: this.dbName
            }
        }

        return msg;
    }
    
    generateConnectionRequest(userId:string): any{
        var base = this.generateBaseMessage();
        
    }
    
}
