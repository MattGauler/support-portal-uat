/// <reference path="tedious.d.ts" />
"use strict";
var tedious = require("tedious");
var config = {
    userName: "rogier",
    password: "rogiers password",
    server: "127.0.0.1",
    options: {
        database: "somedb",
        instanceName: "someinstance"
    }
};
var connection = new tedious.Connection(config);
connection.on("connect", function () {
    console.log("hurray");
});
connection.beginTransaction(function (error) { }, "some name");
connection.rollbackTransaction(function (error) { });
connection.commitTransaction(function (error) { });
var request = new tedious.Request("SELECT * FROM foo", function (error, rowCount) {
});
request.on("row", function (row) {
});
connection.execSql(request);
