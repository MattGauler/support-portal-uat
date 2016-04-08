export class DbManager {
    
    tedious: any;
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
    result: Array<any>;

    
    constructor() {
        
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
        this.pool.on('error', function(err) {
            console.error(err);
        });
        console.log('DBManager connected');
    }

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

    registerSupportRequest(message: any) {
        
        var tedious = require('tedious');
        
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);

            var request = new tedious.Request('dbo.createSupportRequest',function(err, rowCount){
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

    registerSupportResponse(message: any) {
        
        var tedious = require('tedious');
        
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);

            var request = new tedious.Request('dbo.createSupportResponse',function(err, rowCount){
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


    registerConnectionRequest(message: any) {
        var tedious = require('tedious');
        
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);

            var request = new tedious.Request('dbo.createConnectionRequest',function(err, rowCount){
                connection.release();    
            });
               
            var TYPES = tedious.TYPES;

            request.addParameter('MessageID', TYPES.NVarChar, message.id);
            request.addParameter('RequestSent', TYPES.DateTime, new Date(message.date));
            
            connection.callProcedure(request);      
        });
        
        
    };

    registerConnectionResponse(message: any) {
        var tedious = require('tedious');
        
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);

            var request = new tedious.Request('dbo.createConnectionResponse',function(err, rowCount){
                connection.release();    
            });

            var TYPES = tedious.TYPES;

            request.addParameter('MessageID', TYPES.NVarChar, message.id);
            request.addParameter('RequestMessageID', TYPES.NVarChar, message.content['reply-to-id']);
            request.addParameter('ResponseReceived', TYPES.DateTime, new Date(message.date));
            
            connection.callProcedure(request);       
        });

    };

    allowRequest(userId: string, apiKey: string, callback: Function): void {
        var tedious = require('tedious');
        
        this.pool.acquire(function (err, connection) {
            if (err)
                console.error(err);

            var request = new tedious.Request(            
            `
                SELECT * FROM [dbo].[Users] WHERE UserId = @UserId AND ApiKey = @ApiKey
            `,function(err, rowCount){
                if(rowCount === 0) {
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

    userLogin(userId: string, callback:any) {
    
        var queryString =`
                SELECT * FROM [dbo].[Users] WHERE UserId = '`+ userId + `'
            `;
        
        this.executeSQL(queryString, callback);
    }    

    requestConnections(period: number, callback:any) {
    
        var queryString = `
            select * from vwConnectionResponses where request > dateadd(second,` + period + `,getdate());
        `;
        
        this.executeSQL(queryString, callback);
    } 
    
    requestUserSupportResponse(userId: string, period:number, callback:any) {
    
        var queryString =  `
            Select
                res.*
            from
                SupportResponses res inner join SupportRequests request
            ON
                res.RequestMessageID = req.MessageId
            where
                req.UserId = '` + userId + `'
        `;
        
        this.executeSQL(queryString, callback);
    }
    
    requestAllMySupportRequests(userId: string, period:number, callback:any) {
    
        var queryString =  `
            Select
                req.*, res.response
            from
                SupportResponses res right join SupportRequests request
            ON
                res.RequestMessageID = req.MessageId
            where
                req.UserId = '` + userId + `' AND
                req.request > dateadd(second,` + period + `,getdate())
        `;
        
        this.executeSQL(queryString, callback);
    }
    
    requestAllSupportRequests(period:number, callback:any) {
    
        var queryString =  `
            Select
                req.*, res.response
            from
                SupportResponses res right join SupportRequests request
            ON
                res.RequestMessageID = req.MessageId
            where
                req.request > dateadd(second,` + period + `,getdate())
        `;
        
        this.executeSQL(queryString, callback);
    }
    
    requestSafeSupportRequests(period:number, callback:any) {
    
        var queryString =  `
            Select
                req.*, res.response
            from
                SupportResponses res right join SupportRequests request
            ON
                res.RequestMessageID = req.MessageId
            where
                req.supportType <> 'Admin' AND
                req.request > dateadd(second,` + period + `,getdate())
        `;
        
        this.executeSQL(queryString, callback);
    }
    
    requestDriverSupportResponse(driverId: string, callback:any) {
    
        var queryString =  `
            Select
                res.*
            from
                SupportResponses res inner join SupportRequests request
            ON
                res.RequestMessageID = req.MessageId
            where
                req.DriverId = '` + driverId + `'
        `;
        
        this.executeSQL(queryString, callback);
    }
    
    requestSupportResponse(requestMessageId: string, callback:any) {
    
        var queryString =  `
            Select
                *
            from
                SupportResponse
            where
                RequestMessageID = '` + requestMessageId + `'
        `;
        
        this.executeSQL(queryString, callback);
    }

    requestConnectionSummary(period: number, callback:any) {
    
        var queryString = `
            select rb.*, IsNull(sub.Occurences,0) as Occurences from
                (Select
                    delaybandId as ID,
                    delayBandLabel as [Band],
                    Count(*) as [Occurences]
                from
                    responseDelayBands r join vwConnectionResponses v on v.delay between r.delayBandMin and r.delayBandMax
                where v.request > dateadd(second,` + period + `,getdate())
                group by delaybandid, delayBandLabel) sub right join dbo.ResponseDelayBands rb
                on sub.ID = rb.delayBandId
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

        
}
