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

    constructor() {
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
    }

    connectedToDb(error: any, message: any): void {
        if(!error) {
            console.log('Db Connected');
            switch(message.content['@class']) {
                case 'requestData':
                    this.requestResponseQuery(message);
                    break;
                case 'resendMessages':
                    this.requestResponseQuery(message);
                    break;
                case 'logout':
                    this.deviceLogoutQuery(message);
                    break;
                case 'supportRequest':
                    this.registerSupportRequest(message);
                    break;    
            }
        }
        else
            console.log('Db Connection Error: %s', error);
    }

    connectToDb(message: any): void {
        console.log('Connecting to db...');
        this.connection = new this.tedious.Connection(this.config);
        this.connection.on('connect', (err => this.connectedToDb(err, message)));
        this.connection.on('end', function() { console.log('Db Disconnected') });
    }

    registerSupportRequest(message: any) {
        console.log('REGISTERING REQUEST IN DB');
        var request = new this.tedious.Request('dbo.createSupportRequest',
            (error, rowCount) => this.requestDone(error, rowCount)
        );

        var TYPES = this.tedious.TYPES;

        var supportDestination = message.channel == 't-notifyshamrock-0' ? 'Server' : 'Device'; 

        request.addParameter('MessageID', TYPES.NVarChar, message.id);
        request.addParameter('RequestTo', TYPES.NVarChar, supportDestination);
        request.addParameter('RequestSent', TYPES.DateTime, new Date(message.date));
        request.addParameter('RequestMessage', TYPES.NVarChar, JSON.stringify(message));
        
        this.connection.callProcedure(request);
    }

    registerConnectionRequest(message: any) {
        
        var request = new this.tedious.Request('dbo.createConnectionRequest',
            (error, rowCount) => this.requestDone(error, rowCount)
        );

        var TYPES = this.tedious.TYPES;

        request.addParameter('MessageID', TYPES.NVarChar, message.id);
        request.addParameter('RequestSent', TYPES.DateTime, new Date(message.date));
        
        this.connection.callProcedure(request);
    }

    registerConnectionResponse(message: any) {
        
        function retry() {
            if(this.connection!=undefined){
                console.log('Retrying....');
                if(this.connection.state == 'LoggedIn'){
                    clearInterval(tid);
                    this.connection.callProcedure(request);
                }
            }
        }
        
        var tid = undefined;
        
        var request = new this.tedious.Request('dbo.updateConnectionRequest',
            (error, rowCount) => this.requestDone(error, rowCount)
        );

        var TYPES = this.tedious.TYPES;

        request.addParameter('MessageID', TYPES.NVarChar, message.content['reply-to-id']);
        request.addParameter('ResponseReceived', TYPES.DateTime, new Date(message.date));
        //console.log('DB Connection State: ' + this.connection.state.name);
        if(this.connection.state.name == 'LoggedIn'){
            //console.log('Update DB....')
            this.connection.callProcedure(request);
        }
        else{
            console.log('DB Locked....');
            console.log('DB Connection State: ' + this.connection.state.name);
            tid = setInterval(retry, 100);
        }
    }

    requestResponseQuery(message: SupportMessageBody) {
        var request = new this.tedious.Request(
            `
                INSERT INTO [dbo].[InstructionResponse] (DeviceId, UserId, InstructionType, InstructionValues, RequestedTime, Requester)
                VALUES (@DeviceId, @UserId, @InstructionType, @InstructionValues, @RequestedTime, @Requester)

                DELETE FROM [dbo].[CurrentInstructions]
                WHERE DeviceId = @DeviceId AND UserId = @UserId AND InstructionType = @InstructionType
            `,
            (error, rowCount) => this.requestDone(error, rowCount)
        );

        var TYPES = this.tedious.TYPES;

        //request.addParameter('DeviceId', TYPES.NVarChar, message.deviceId);
        //request.addParameter('UserId', TYPES.NVarChar, message.userId);
        //request.addParameter('InstructionType', TYPES.NVarChar, message.type);
        //request.addParameter('InstructionValues', TYPES.NVarChar, JSON.stringify(message.result));
        //request.addParameter('RequestedTime', TYPES.DateTime, new Date());
        //request.addParameter('Requester', TYPES.NVarChar, message.requester);

        this.connection.execSql(request);
    }

    deleteCurrentRequests(deleteRequest, error, rowCount) {
        console.log('DELETING CURRENT REQUESTS:');
        this.connection.execSql(deleteRequest);
    }

    requestDone(error, rowCount) {
        if(error) console.log(error);
        //else
            //console.log('Complete: %s row(s) returned', rowCount);

        //this.connection.close();
    }

    deviceLogoutQuery(message: SupportMessageBody) {
        var request = new this.tedious.Request(
            `
                DELETE FROM [dbo].[ConnectedDevices]
                WHERE DeviceId = @DeviceId AND UserId = @UserId AND RouteId = @RouteId
            `,
            (error, rowCount) => this.requestDone(error, rowCount)
        );

        var TYPES = this.tedious.TYPES;

        request.addParameter('DeviceId', TYPES.NVarChar, message.deviceId);
        //request.addParameter('UserId', TYPES.NVarChar, message.userId);
        //request.addParameter('RouteId', TYPES.NVarChar, message.routeId);

        this.connection.execSql(request);
    }


    allowRequest(connection, userId: string, apiKey: string, callback: Function): void {
        var request = new this.tedious.Request(
            `
                SELECT * FROM [dbo].[Users] WHERE UserId = @UserId AND ApiKey = @ApiKey
            `,
            function(error, rowCount) {
                if(rowCount === 0) {
                    console.log('Unauthenticated error for user: %s', userId);
                    callback(false);
                }
                else {
                    console.log('User authorised');
                    callback(true);
                }
            }
        );

        var TYPES = this.tedious.TYPES;

        request.addParameter('UserId', TYPES.NVarChar, userId);
        request.addParameter('ApiKey', TYPES.NVarChar, apiKey);

        connection.execSql(request);
    }
}
