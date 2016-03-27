"use strict";
var Guid = require('guid');
var MsgManager = (function () {
    function MsgManager() {
        this.baseMsg = this.generateBaseMessage();
    }
    MsgManager.prototype.generateBaseMessage = function () {
        var uuid = Guid.v1();
        var msg = {
            id: uuid,
            data: {
                "@class": null
            }
        };
        return msg;
    };
    MsgManager.prototype.generateConnectionRequest = function (userId) {
        var base = this.generateBaseMessage();
        var msg = base;
        return msg;
    };
    return MsgManager;
}());
exports.MsgManager = MsgManager;
