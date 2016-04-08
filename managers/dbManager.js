"use strict";
var DbManager = (function () {
    function DbManager() {
        this.tedious = require('tedious');
        this.connectionPool = require('tedious-connection-pool');
        this.username = 'supportadmin';
        this.password = 'CTmD351gn';
        this.server = 'support-uat-db.database.windows.net';
        this.dbName = 'support-uat-db';
        this.encrypt = true;
        this.config = this.generateTediousConfig();
        this.result = [];
        this.poolConfig = {
            min: 1,
            max: 1,
            log: true
        };
        //create the pool
        this.pool = new this.connectionPool(this.poolConfig, this.config);
        this.pool.on('error', function (err) {
            console.error(err);
        });
        console.log('DBManager connected');
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
    ;
    DbManager.prototype.registerSupportRequest = function (message) {
        var tedious = require('tedious');
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            var request = new tedious.Request('dbo.createSupportRequest', function (err, rowCount) {
                connection.release();
            });
            var TYPES = tedious.TYPES;
            var supportDestination = message.topic == 't-notifyshamrock-0' ? 'Server' : 'Device';
            request.addParameter('MessageID', TYPES.NVarChar, message.id);
            request.addParameter('RequestTo', TYPES.NVarChar, supportDestination);
            request.addParameter('RequestSent', TYPES.DateTime, new Date(message.date));
            request.addParameter('RequestMessage', TYPES.NVarChar, JSON.stringify(message));
            connection.callProcedure(request);
        });
    };
    ;
    DbManager.prototype.registerSupportResponse = function (message) {
        var tedious = require('tedious');
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            var request = new tedious.Request('dbo.createSupportResponse', function (err, rowCount) {
                connection.release();
            });
            var TYPES = tedious.TYPES;
            request.addParameter('MessageID', TYPES.NVarChar, message.id);
            request.addParameter('RequestMessageID', TYPES.NVarChar, message['reply-to-id']);
            request.addParameter('ResponseReceived', TYPES.DateTime, new Date(message.date));
            request.addParameter('ResponseMessage', TYPES.NVarChar, JSON.stringify(message));
            connection.callProcedure(request);
        });
    };
    ;
    DbManager.prototype.registerConnectionRequest = function (message) {
        var tedious = require('tedious');
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            var request = new tedious.Request('dbo.createConnectionRequest', function (err, rowCount) {
                connection.release();
            });
            var TYPES = tedious.TYPES;
            request.addParameter('MessageID', TYPES.NVarChar, message.id);
            request.addParameter('RequestSent', TYPES.DateTime, new Date(message.date));
            connection.callProcedure(request);
        });
    };
    ;
    DbManager.prototype.registerConnectionResponse = function (message) {
        var tedious = require('tedious');
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            var request = new tedious.Request('dbo.createConnectionResponse', function (err, rowCount) {
                connection.release();
            });
            var TYPES = tedious.TYPES;
            request.addParameter('MessageID', TYPES.NVarChar, message.id);
            request.addParameter('RequestMessageID', TYPES.NVarChar, message.content['reply-to-id']);
            request.addParameter('ResponseReceived', TYPES.DateTime, new Date(message.date));
            connection.callProcedure(request);
        });
    };
    ;
    DbManager.prototype.allowRequest = function (userId, apiKey, callback) {
        var tedious = require('tedious');
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            var request = new tedious.Request("\n                SELECT * FROM [dbo].[Users] WHERE UserId = @UserId AND ApiKey = @ApiKey\n            ", function (err, rowCount) {
                if (rowCount === 0) {
                    console.log('Unauthenticated error for user: %s', userId);
                    callback(false);
                }
                else {
                    console.log('User authorised');
                    callback(true);
                }
                connection.release();
            });
            var TYPES = tedious.TYPES;
            request.addParameter('UserId', TYPES.NVarChar, userId);
            request.addParameter('ApiKey', TYPES.NVarChar, apiKey);
            connection.execSql(request);
        });
    };
    ;
    DbManager.prototype.userLogin = function (userId, callback) {
        var queryString = "\n                SELECT * FROM [dbo].[Users] WHERE UserId = '" + userId + "'\n            ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestConnections = function (period, callback) {
        var queryString = "\n            select * from vwConnectionResponses where request > dateadd(second," + period + ",getdate());\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestUserSupportResponse = function (userId, period, callback) {
        var queryString = "\n            Select\n                res.*\n            from\n                SupportResponses res inner join SupportRequests request\n            ON\n                res.RequestMessageID = req.MessageId\n            where\n                req.UserId = '" + userId + "'\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestAllMySupportRequests = function (userId, period, callback) {
        var queryString = "\n            Select\n                req.*, res.response\n            from\n                SupportResponses res right join SupportRequests request\n            ON\n                res.RequestMessageID = req.MessageId\n            where\n                req.UserId = '" + userId + "' AND\n                req.request > dateadd(second," + period + ",getdate())\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestAllSupportRequests = function (period, callback) {
        var queryString = "\n            Select\n                req.*, res.response\n            from\n                SupportResponses res right join SupportRequests request\n            ON\n                res.RequestMessageID = req.MessageId\n            where\n                req.request > dateadd(second," + period + ",getdate())\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestSafeSupportRequests = function (period, callback) {
        var queryString = "\n            Select\n                req.*, res.response\n            from\n                SupportResponses res right join SupportRequests request\n            ON\n                res.RequestMessageID = req.MessageId\n            where\n                req.supportType <> 'Admin' AND\n                req.request > dateadd(second," + period + ",getdate())\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestDriverSupportResponse = function (driverId, callback) {
        var queryString = "\n            Select\n                res.*\n            from\n                SupportResponses res inner join SupportRequests request\n            ON\n                res.RequestMessageID = req.MessageId\n            where\n                req.DriverId = '" + driverId + "'\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestSupportResponse = function (requestMessageId, callback) {
        var queryString = "\n            Select\n                *\n            from\n                SupportResponse\n            where\n                RequestMessageID = '" + requestMessageId + "'\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.requestConnectionSummary = function (period, callback) {
        var queryString = "\n            select rb.*, IsNull(sub.Occurences,0) as Occurences from\n                (Select\n                    delaybandId as ID,\n                    delayBandLabel as [Band],\n                    Count(*) as [Occurences]\n                from\n                    responseDelayBands r join vwConnectionResponses v on v.delay between r.delayBandMin and r.delayBandMax\n                where v.request > dateadd(second," + period + ",getdate())\n                group by delaybandid, delayBandLabel) sub right join dbo.ResponseDelayBands rb\n                on sub.ID = rb.delayBandId\n        ";
        this.executeSQL(queryString, callback);
    };
    DbManager.prototype.executeSQL = function (queryString, callback) {
        var tedious = require('tedious');
        var result = [];
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            var request = new tedious.Request(queryString, function (err, rowCount) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(rowCount + ' results found');
                }
                callback(err, result);
                connection.release();
            });
            request.on('row', function (columns) {
                var row = {};
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    }
                    else {
                        row[column.metadata.colName] = column.value;
                    }
                });
                result.push(row);
            });
            var TYPES = tedious.TYPES;
            connection.execSql(request);
        });
    };
    return DbManager;
}());
exports.DbManager = DbManager;
