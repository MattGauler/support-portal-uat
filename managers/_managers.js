"use strict";
var AppManager = require('./appManager');
var DbManager = require('./dbManager');
var driverDBManager = require('./driverDBManager');
var CommsManager = require('./commsManager');
var MsgManager = require('./messageManager');
var Managers = (function () {
    function Managers() {
        this.appManager = new AppManager.AppManager();
        this.dbManager = new DbManager.DbManager();
        this.driverDBManager = new driverDBManager.driverDBManager();
        this.commsManager = new CommsManager.CommsManager(this.appManager.commsType, this.dbManager);
        this.msgManager = new MsgManager.MsgManager();
    }
    return Managers;
}());
exports.Managers = Managers;
