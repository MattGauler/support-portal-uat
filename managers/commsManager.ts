/// <reference path="../interfaces/commsInterface.ts"/>

import ServiceBusManager = require('./serviceBusManager');
import DbManager = require('./dbManager');

export class CommsManager {
    commsType: string;
    commsWorker: Comms;

    constructor(commsType: string, dbManager: DbManager.DbManager) {
        this.commsType = commsType;
        this.registerCommsWorker(dbManager);
    }

    registerCommsWorker(dbManager: DbManager.DbManager): void {
        switch(this.commsType) {
            case 'azureservicebus':
                this.commsWorker = new ServiceBusManager.ServiceBusManager();
                this.commsWorker.dbManager = dbManager;
                break

            // Extend with additional comms workers
        }
    }
}
