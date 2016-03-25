import Managers = require('./managers/_managers');

var express = require('express');
var path = require('path');
var cors = require('cors')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var azure = require('azure');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var routes = require('./routes/index');
var users = require('./routes/users');

// API ROUTES
var userLogin = require('./routes/api/userLogin');
var createUser = require('./routes/api/createUser');
var instruction = require('./routes/api/instruction');
var instructionResponse = require('./routes/api/instructionResponse');
var connectedDevices = require('./routes/api/connectedDevices');
var sendMessageTest = require('./routes/api/sendMessageTest');
var receivedMessageTest = require('./routes/api/receivedMessageTest');
var loginEvents = require('./routes/api/loginEvents');
var routeEvents = require('./routes/api/routeEvents');
var markPilot = require('./routes/api/markPilot');

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/api/userLogin', userLogin);
app.use('/api/createUser', createUser);
app.use('/api/instruction', instruction);
app.use('/api/instructionResponse', instructionResponse);
app.use('/api/connectedDevices', connectedDevices);
app.use('/api/sendMessageTest', sendMessageTest);
app.use('/api/receivedMessageTest', receivedMessageTest);
app.use('/api/loginEvents', loginEvents);
app.use('/api/routeEvents', routeEvents);
app.use('/api/markPilot', markPilot);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// CREATE APPLICATION MANAGERS
var managers = new Managers.Managers();

var Updater = require('./updater/updater');

var u = new Updater(10000);
u.init();
u.on('Event',function () {
   managers.commsManager.commsWorker.receiveQueueMessage();
});

module.exports = app;
