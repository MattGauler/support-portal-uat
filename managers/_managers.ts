import AppManager = require('./appManager');
import DbManager = require('./dbManager');
import CommsManager = require('./commsManager');


export class Managers {
    appManager: AppManager.AppManager;
    dbManager: DbManager.DbManager;
    commsManager: CommsManager.CommsManager

    constructor() {
        this.appManager = new AppManager.AppManager();
        this.dbManager = new DbManager.DbManager();
        this.commsManager = new CommsManager.CommsManager(this.appManager.commsType, this.dbManager);
    }
}
