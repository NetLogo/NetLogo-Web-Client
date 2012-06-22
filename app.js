
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer()
  , io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

function updateUserNames(){
    io.sockets.json.emit('users changed', userNames);
};

function addUser(name){
    userNames[name] = true;
    updateUserNames();
};

function removeUser(name){
    delete userNames[name];
    updateUserNames();
};

validName = function(name){
    return (name in userNames);
};

var userNames = {};

io.sockets.on('connection', function (socket) {
    var name = "";
    socket.on('name reply', function (data) {
        name = data;
        addUser(name);
    });
    socket.on('message', function (data) {
        var output = data.Output;
        var shout = data.Shout;
        var time = data.Time;
        var message = data.Message;
        console.log("Server Receiving: " + data);
        var serverState = 0;
        var final_message = message;
        if (shout === "Shouting") {
            final_message = message.toUpperCase().replace(/\./g, "!").replace(/\?/g, "!?");
        };
        if (output) {
            serverState = Math.floor(Math.random()*3);
        };
        var packet = { processed_time: time, user: name, processed_message: final_message, server_state: serverState };
        console.log("Server Sending: " + packet);
        io.sockets.json.send(packet);
    });
    socket.on('disconnect', function(){
        removeUser(name);
    });
});

// Routes

app.get('/error', routes.error);

app.get('/', routes.index);

app.get('/thing', routes.thing);

app.post('/', routes.indexPost);

app.post('/validate', routes.validatePost);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});