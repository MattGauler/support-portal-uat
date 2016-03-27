"use strict";
var DbManager = (function () {
    function DbManager() {
        this.tedious = require('tedious');
        /*
                this.username = 'ct';
                this.password = 'ArrowXLDb123';
                this.server = 'hfayniug8w.database.windows.net';
                this.dbName = 'ArrowSupportServiceDev';
                this.encrypt = true;
        */
        this.username = 'supportadmin';
        this.password = 'CTmD351gn';
        this.server = 'support-uat-db.database.windows.net';
        this.dbName = 'support-uat-db';
        this.encrypt = true;
        this.config = this.generateTediousConfig();
    }
    DbManager.prototype.generateTediousConfig = function () {
        var config = {
            userName: this.username,
            password: this.password,
            server: this.server,
            options: {
                encrypt: this.encrypt,
                database: this.dbName
            }
        };
        return config;
    };
    DbManager.prototype.connectedToDb = function (error, message) {
        if (!error) {
            console.log('Db Connected');
            switch (message.type) {
                case 'register':
                    this.registerDeviceQuery(message);
                    break;
                case 'routeConfirm':
                    this.confirmRouteQuery(message);
                    break;
                case 'requestData':
                    this.requestResponseQuery(message);
                    break;
                case 'resendMessages':
                    this.requestResponseQuery(message);
                    break;
                case 'logout':
                    this.deviceLogoutQuery(message);
                    break;
            }
        }
        else
            console.log('Db Connection Error: %s', error);
    };
    DbManager.prototype.connectToDb = function (message) {
        var _this = this;
        console.log('Connecting to db...');
        this.connection = new this.tedious.Connection(this.config);
        this.connection.on('connect', (function (err) { return _this.connectedToDb(err, message); }));
        this.connection.on('end', function () { console.log('Db Disconnected'); });
    };
    DbManager.prototype.registerDeviceQuery = function (message) {
        var _this = this;
        var request = new this.tedious.Request('dbo.UpdateConnectedDevices', function (error, rowCount) { return _this.requestDone(error, rowCount); });
        var TYPES = this.tedious.TYPES;
        request.addParameter('DeviceId', TYPES.NVarChar, message.deviceId);
        request.addParameter('UserId', TYPES.NVarChar, message.userId);
        request.addParameter('RouteId', TYPES.NVarChar, message.routeId);
        request.addParameter('LastConnected', TYPES.DateTime, new Date(message.timeStamp));
        this.connection.callProcedure(request);
    };
    DbManager.prototype.confirmRouteQuery = function (message) {
        var _this = this;
        var request = new this.tedious.Request("\n                INSERT INTO [dbo].[RouteConfirm] (DeviceId, UserId, RouteId, ConfirmTime)\n                VALUES (@DeviceId, @UserId, @RouteId, @ConfirmTime)\n\n            ", function (error, rowCount) { return _this.requestDone(error, rowCount); });
        var TYPES = this.tedious.TYPES;
        request.addParameter('DeviceId', TYPES.NVarChar, message.deviceId);
        request.addParameter('UserId', TYPES.NVarChar, message.userId);
        request.addParameter('RouteId', TYPES.NVarChar, message.routeId);
        request.addParameter('ConfirmTime', TYPES.DateTime, new Date(message.timeStamp));
        this.connection.execSql(request);
    };
    DbManager.prototype.requestResponseQuery = function (message) {
        var _this = this;
        var request = new this.tedious.Request("\n                INSERT INTO [dbo].[InstructionResponse] (DeviceId, UserId, InstructionType, InstructionValues, RequestedTime, Requester)\n                VALUES (@DeviceId, @UserId, @InstructionType, @InstructionValues, @RequestedTime, @Requester)\n\n                DELETE FROM [dbo].[CurrentInstructions]\n                WHERE DeviceId = @DeviceId AND UserId = @UserId AND InstructionType = @InstructionType\n            ", function (error, rowCount) { return _this.requestDone(error, rowCount); });
        var TYPES = this.tedious.TYPES;
        request.addParameter('DeviceId', TYPES.NVarChar, message.deviceId);
        request.addParameter('UserId', TYPES.NVarChar, message.userId);
        request.addParameter('InstructionType', TYPES.NVarChar, message.type);
        request.addParameter('InstructionValues', TYPES.NVarChar, JSON.stringify(message.result));
        request.addParameter('RequestedTime', TYPES.DateTime, new Date());
        request.addParameter('Requester', TYPES.NVarChar, message.requester);
        this.connection.execSql(request);
    };
    DbManager.prototype.deleteCurrentRequests = function (deleteRequest, error, rowCount) {
        console.log('DELETING CURRENT REQUESTS:');
        this.connection.execSql(deleteRequest);
    };
    DbManager.prototype.requestDone = function (error, rowCount) {
        if (error)
            console.log(error);
        else
            console.log('Complete: %s row(s) returned', rowCount);
        this.connection.close();
    };
    DbManager.prototype.deviceLogoutQuery = function (message) {
        var _this = this;
        var request = new this.tedious.Request("\n                DELETE FROM [dbo].[ConnectedDevices]\n                WHERE DeviceId = @DeviceId AND UserId = @UserId AND RouteId = @RouteId\n            ", function (error, rowCount) { return _this.requestDone(error, rowCount); });
        var TYPES = this.tedious.TYPES;
        request.addParameter('DeviceId', TYPES.NVarChar, message.deviceId);
        request.addParameter('UserId', TYPES.NVarChar, message.userId);
        request.addParameter('RouteId', TYPES.NVarChar, message.routeId);
        this.connection.execSql(request);
    };
    DbManager.prototype.allowRequest = function (connection, userId, apiKey, callback) {
        var request = new this.tedious.Request("\n                SELECT * FROM [dbo].[Users] WHERE UserId = @UserId AND ApiKey = @ApiKey\n            ", function (error, rowCount) {
            if (rowCount === 0) {
                console.log('Unauthenticated error for user: %s', userId);
                callback(false);
            }
            else {
                console.log('User authorised');
                callback(true);
            }
        });
        var TYPES = this.tedious.TYPES;
        request.addParameter('UserId', TYPES.NVarChar, userId);
        request.addParameter('ApiKey', TYPES.NVarChar, apiKey);
        connection.execSql(request);
    };
    return DbManager;
}());
exports.DbManager = DbManager;
