import AppManager = require('./appManager');
import DbManager = require('./dbManager');
import CommsManager = require('./commsManager');
import MsgManager = require('./messageManager');


export class Managers {
    appManager: AppManager.AppManager;
    dbManager: DbManager.DbManager;
    commsManager: CommsManager.CommsManager
    msgManager: MsgManager.MsgManager 
    constructor() {
        this.appManager = new AppManager.AppManager();
        this.dbManager = new DbManager.DbManager();
        this.commsManager = new CommsManager.CommsManager(this.appManager.commsType, this.dbManager);
        this.msgManager = new MsgManager.MsgManager();
    }
}
