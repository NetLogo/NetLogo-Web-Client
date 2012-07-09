
/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , $      = require('jquery');

var app = module.exports = express.createServer(),
     io = require('socket.io').listen(app);

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/lib'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

function updateUserNames() {
    io.sockets.json.emit('users changed', userNames);
}

function addUser(name) {
    userNames[name] = true;
    updateUserNames();
}

function removeUser(name) {
    delete userNames[name];
    updateUserNames();
}

validName = function(name) {
    return !(name in userNames);
};

var userNames = {};

io.sockets.on('connection', function (socket) {

    var address = socket.handshake.address;
    console.log('Connection from ' + address.address + ':' + address.port);
    socket.emit('connected');

    var name = "";
    socket.on('name reply', function (data) {
        name = data;
        addUser(name);
    });

    socket.on('message', function (data) {

        var output = data.Output;
        var shout = data.Shout;
        var message = data.Message;
        var serverState = 0;
        var final_message = message;

        console.log("Server Receiving: " + data);


        $.post("http://abmplus.tech.northwestern.edu:9001/netlogo_data",
               { agentType: shout, cmd: message },
               function(data) {
                   var formatted = data.replace(/\n/g, "<br>");
                   var packet = { user: name, processed_message: formatted, server_state: 0 };
                   console.log("Server Sending: " + packet);
                   io.sockets.json.send(packet);
               }
        );

    });

    socket.on('disconnect', function() {
        removeUser(name);
    });

});

// Routes

app.get('/error', routes.error);

app.get('/', routes.index);

app.get('/thing', routes.thing);

app.post('/', routes.indexPost);

app.listen(3000, function() {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
