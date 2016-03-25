/// <reference path="../interfaces/commsInterface.ts"/>
"use strict";
var ServiceBusManager = require('./serviceBusManager');
var CommsManager = (function () {
    function CommsManager(commsType, dbManager) {
        this.commsType = commsType;
        this.registerCommsWorker(dbManager);
    }
    CommsManager.prototype.registerCommsWorker = function (dbManager) {
        switch (this.commsType) {
            case 'azureservicebus':
                this.commsWorker = new ServiceBusManager.ServiceBusManager();
                this.commsWorker.dbManager = dbManager;
                break;
        }
    };
    return CommsManager;
}());
exports.CommsManager = CommsManager;
