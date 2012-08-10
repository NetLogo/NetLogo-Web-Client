
/**
 * Module dependencies.
 */

var DirtyState = require('./public/javascripts/canvas/world.js');

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

        var shout = data.Shout;
        var message = data.Message;

        console.log("Server Receiving: " + data);

        $.post("http://abmplus.tech.northwestern.edu:9001/netlogo_data",
               { agentType: shout, cmd: message },
               function(data) {
                   var packet = { user: name, processed_message: data };
                   console.log("Server Sending: " + packet);
                   io.sockets.json.send(packet);
               }
        );

        var info;

        if (message === 'cp') {
            info = {
                tick: 1,
                creations: {
                    patches: {
                        0: {
                            id: 0,
                            pcolor: '#FF0000',
                            pxcor: -16,
                            pycor: -16,
                            isDirty: DirtyState.DIRTY
                        },
                        1: {
                            id: 1,
                            pcolor: '#00FF00',
                            pxcor: -16,
                            pycor: 16,
                            isDirty: DirtyState.DIRTY
                        },
                        2: {
                            id: 2,
                            pcolor: '#0000FF',
                            pxcor: 16,
                            pycor: -16,
                            isDirty: DirtyState.DIRTY
                        },
                        3: {
                            id: 3,
                            pcolor: '#FFFFFF',
                            pxcor: 16,
                            pycor: 16,
                            isDirty: DirtyState.DIRTY
                        }
                    }
                }
            };
        } else if (message === 'ct') {
            info = {
                tick: 1,
                creations: {
                   turtles: {
                        0: {
                            id: 0,
                            shape: 'Default',
                            color: '#FF0000',
                            heading: 0,
                            label: "",
                            labelColor: "",
                            isVisible: true,
                            xcor: 0,
                            ycor: 0,
                            isDirty: DirtyState.DIRTY
                        },
                        1: {
                            id: 1,
                            shape: 'Default',
                            color: '#00FF00',
                            heading: 0,
                            label: "",
                            isVisible: true,
                            xcor: -8,
                            ycor: 0,
                            isDirty: DirtyState.DIRTY
                        },
                        2: {
                            id: 2,
                            shape: 'Default',
                            color: '#0000FF',
                            heading: 0,
                            label: "",
                            isVisible: true,
                            xcor: 8,
                            ycor: 0,
                            isDirty: DirtyState.DIRTY
                        }
                    }
                }
            };
        } else if (message === 'fd') {
            info = {
                tick: 10,
                updates: {
                    turtles: {
                        0: {
                            ycor: 9
                        },
                        1: {
                            ycor: 9
                        },
                        2: {
                            ycor: 9
                        }
                    }
                }
            };
        } else if (message === 'kt') {
            info = {
                tick: 20,
                removals: {
                    turtles: {
                        0: {},
                        1: {},
                        2: {}
                    }
                }
            }
        } else if (message === "ut") {
            info = {
                tick: 9001,
                updates: {
                    turtles: {
                        0: {
                            color: "#FF0000",
                            heading: 180,
                            ycor: 3
                        }
                    }
                }
            }
        } else if (message === "rt") {
            info = {
                tick: 1,
                updates: {
                    turtles: {
                        0: {
                            color: "#FFFFFF",
                            heading: 0,
                            ycor: 0
                        }
                    }
                }
            }
        }

        socket.emit('tick',info);

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
