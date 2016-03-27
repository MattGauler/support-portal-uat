"use strict";
var MsgManager = (function () {
    function MsgManager() {
        this.baseMsg = this.generateBaseMessage();
    }
    MsgManager.prototype.generateBaseMessage = function () {
        var msg = {
            id: this.username,
            password: this.password,
            server: this.server,
            options: {
                encrypt: this.encrypt,
                database: this.dbName
            }
        };
        return msg;
    };
    MsgManager.prototype.generateConnectionRequest = function (userId) {
        var base = this.generateBaseMessage();
    };
    return MsgManager;
}());
exports.MsgManager = MsgManager;
