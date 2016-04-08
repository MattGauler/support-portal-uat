"use strict";
var driverDBManager = (function () {
    function driverDBManager() {
        this.connectionPool = require('tedious-connection-pool');
        this.username = 'mdesign@addisonlee-uat';
        this.password = 'CTmD351gn';
        this.server = 'addisonlee-uat.database.windows.net';
        this.dbName = 'addisonlee-db-uat';
        this.encrypt = true;
        this.config = this.generateTediousConfig();
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
    ;
    driverDBManager.prototype.generateTediousConfig = function () {
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
    driverDBManager.prototype.requestDriverCount = function (period, callback) {
        var queryString = "\n                select count(distinct driverlogin) as driverCount from userconfig\n                where dateinserted > dateadd(second," + period + ",getdate())\n        ";
        this.executeSQL(queryString, callback);
    };
    driverDBManager.prototype.requestDriverList = function (period, callback) {
        var queryString = "\n                select u.* from userconfig u inner join (select driverlogin, max(dateinserted) as lastLogin from userconfig\n                group by driverlogin) ufil\n                on u.driverLogin = ufil.driverlogin and u.dateinserted = ufil.lastLogin\n                where u.dateinserted > dateadd(second, " + period + ", getdate())\n                order by u.driverlogin\n            ";
        this.executeSQL(queryString, callback);
    };
    driverDBManager.prototype.executeSQL = function (queryString, callback) {
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
    driverDBManager.prototype.xrequestDriverList = function (period, callback) {
        var tedious = require('tedious');
        var result = [];
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            var queryString = "\n                select u.* from userconfig u inner join (select driverlogin, max(dateinserted) as lastLogin from userconfig\n                group by driverlogin) ufil\n                on u.driverLogin = ufil.driverlogin and u.dateinserted = ufil.lastLogin\n                where u.dateinserted > dateadd(second, " + period + ", getdate())\n                order by u.driverlogin\n            ";
            var request = new tedious.Request(queryString, function (err, rowCount) {
                if (err) {
                    console.error(err);
                    callback(err);
                }
                else {
                    console.log(rowCount + ' results found');
                    callback(result);
                }
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
    return driverDBManager;
}());
exports.driverDBManager = driverDBManager;
