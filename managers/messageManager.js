"use strict";
var Guid = require('guid');
var MsgManager = (function () {
    function MsgManager() {
        this.baseMsg = this.generateBaseMessage();
    }
    MsgManager.prototype.generateBaseMessage = function () {
        /*
        {
            "channel": "t-notifyshamrock-0", 
            "content": {
                "@class": "ConnectivityRequest", 
                "data": {
                "requestExpiry": 1457604299655
                }, 
                "driverId": "53224eb8-ce59-42a8-9391-e35d7a5b9eb5", 
                "id": "cff50718-c3eb-f2ed-45bc-fe662fd102f8", 
                "messageDate": "2016-03-10T10:03:19+00:00", 
                "subscriptionToken": "5-20501-6a996228-d73b-1add-baad-8c04bf8cbccb"
            }, 
            "date": 1457604234466, 
            "expiry": 1457607834463, 
            "id": "c56bcaff-8e00-446c-8755-9c477b742db7", 
            "notification": "", 
            "provider": "", 
            "subchannel": "1234"
        }
        */
        
        var message = {
            id: Guid.raw(),
            channel: '899991',
            subchannel: '1',
            expiry: 0,
            date: 131007203230000000,
            content: {
                '@class': ''
            }
        };
        
        return message;
        
    };
    MsgManager.prototype.generateConnectionRequest = function (userId) {
        var base = this.generateBaseMessage();
        var msgData = {};
        msgData.requestExpiry = moment()
        
        var msg = base;
        msg.content['@class'] = 'ConnectivityRequest';
        msg.content.data = msgData;
        return msg;
    };
    return MsgManager;
}());
exports.MsgManager = MsgManager;
