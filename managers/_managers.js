"use strict";
var AppManager = require('./appManager');
var DbManager = require('./dbManager');
var CommsManager = require('./commsManager');
var Managers = (function () {
    function Managers() {
        this.appManager = new AppManager.AppManager();
        this.dbManager = new DbManager.DbManager();
        this.commsManager = new CommsManager.CommsManager(this.appManager.commsType, this.dbManager);
    }
    return Managers;
}());
exports.Managers = Managers;
