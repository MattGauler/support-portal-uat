export class driverDBManager {
    
    connectionString: string;
    username: string;
    password: string;
    server: string;
    dbName: string;
    encrypt: Boolean;
    
    config: any;
    connection: any;
    connectionPool: any;
    poolConfig: any;
    pool: any;
    

    constructor() {
        
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
        this.pool.on('error', function(err) {
            console.error(err);
        });
        console.log('DBManager connected');
    };

    generateTediousConfig(): any {
        var config = {
            userName: this.username,
            password: this.password,
            server: this.server,
            options: {
                encrypt: this.encrypt,
                database: this.dbName
            }
        }

        return config;
    };

    
    requestDriverCount(period: any, callback: any) {
    
        var queryString = `
                select count(distinct driverlogin) as driverCount from userconfig
                where dateinserted > dateadd(second,` + period + `,getdate())
        `;
        
        this.executeSQL(queryString, callback);        
        
    }

    requestDriverList(period: number, callback:any) {
    
        var queryString = `
                select u.* from userconfig u inner join (select driverlogin, max(dateinserted) as lastLogin from userconfig
                group by driverlogin) ufil
                on u.driverLogin = ufil.driverlogin and u.dateinserted = ufil.lastLogin
                where u.dateinserted > dateadd(second, ` + period + `, getdate())
                order by u.driverlogin
            `;
        
        this.executeSQL(queryString, callback);
    }    

    executeSQL(queryString: string, callback: any){
        var tedious = require('tedious');
        var result = [];
        
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
            
            var request = new tedious.Request(queryString, function(err, rowCount){
                if(err) {
                    console.error(err);
                }
                else {
                    console.log(rowCount + ' results found');    
                }
                callback(err,result);
                connection.release();    
            });
            
            request.on('row', function(columns){
                var row = {};
                    
                columns.forEach(function(column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        row[column.metadata.colName] = column.value;
                    }
                });

                result.push(row);
            });
            
            var TYPES = tedious.TYPES;

            connection.execSql(request);
            
        })    
    }

    xrequestDriverList(period: number, callback:any) {
        
        var tedious = require('tedious');
        var result = [];
        
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);
        
            var queryString = `
                select u.* from userconfig u inner join (select driverlogin, max(dateinserted) as lastLogin from userconfig
                group by driverlogin) ufil
                on u.driverLogin = ufil.driverlogin and u.dateinserted = ufil.lastLogin
                where u.dateinserted > dateadd(second, ` + period + `, getdate())
                order by u.driverlogin
            `;
            
            var request = new tedious.Request(queryString, function(err, rowCount){
                if(err) {
                    console.error(err);
                    callback(err);
                }
                else {
                    console.log(rowCount + ' results found');
                    callback(result);
                }
                connection.release();    
            });
            
            request.on('row', function(columns){
                var row = {};
                    
                columns.forEach(function(column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        row[column.metadata.colName] = column.value;
                    }
                });

                result.push(row);
            });
            
            var TYPES = tedious.TYPES;

            connection.execSql(request);
            
        })
    }
    
}
