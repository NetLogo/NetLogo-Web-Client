
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

        var info;

        if (message === 'cp') { // test create patches
            info = {
                tick: 1,
                creations: {
                    patches: {
                        0: {
                            id: '0',
                            pcolor: '#FF0000',
                            pxcor: -16,
                            pycor: -16,
                            isDirty: DirtyState.DIRTY
                        },
                        1: {
                            id: '1',
                            pcolor: '#00FF00',
                            pxcor: -16,
                            pycor: 16,
                            isDirty: DirtyState.DIRTY
                        },
                        2: {
                            id: '2',
                            pcolor: '#0000FF',
                            pxcor: 16,
                            pycor: -16,
                            isDirty: DirtyState.DIRTY
                        },
                        3: {
                            id: '3',
                            pcolor: '#FFFFFF',
                            pxcor: 16,
                            pycor: 16,
                            isDirty: DirtyState.DIRTY
                        }
                    }
                }
            };
        } else if (message === 'ct') { // test create turtles
            info = {
                tick: 1,
                creations: {
                   turtles: {
                        0: {
                            id: '0',
                            shape: 'Default',
                            color: '#FF0000',
                            heading: 0,
                            label: "",
                            labelColor: "",
                            isVisible: true,
                            xcor: 0,
                            ycor: 0,
                            isDirty: DirtyState.BORN
                        },
                        1: {
                            id: '1',
                            shape: 'Default',
                            color: '#00FF00',
                            heading: 0,
                            label: "",
                            labelColor: "",
                            isVisible: true,
                            xcor: -16,
                            ycor: 0,
                            isDirty: DirtyState.BORN
                        },
                        2: {
                            id: '2',
                            shape: 'Default',
                            color: '#0000FF',
                            heading: 0,
                            label: "",
                            labelColor: "",
                            isVisible: true,
                            xcor: 16,
                            ycor: 0,
                            isDirty: DirtyState.BORN
                        },
                        3: {
                            id: '3',
                            shape: 'Circle',
                            color: '#FFFF00',
                            heading: 30,
                            label: '',
                            labelColor: '',
                            isVisible: true,
                            xcor: 8,
                            ycor: -4,
                            isDirty: DirtyState.BORN
                        },
                        4: {
                            id: '4',
                            shape: 'Triangle',
                            color: '#00FFFF',
                            heading: 330,
                            label: 'triangle',
                            labelColor: '#00FF00',
                            isVisible: true,
                            xcor: -8,
                            ycor: -4,
                            isDirty: DirtyState.BORN
                        }
                    }
                }
            };
        } else if (message === 'fd') { // test move ycor
            info = {
                tick: 10,
                updates: {
                    turtles: {
                        0: {
                            ycor: 2
                        },
                        1: {
                            ycor: 9
                        },
                        2: {
                            ycor: 16
                        }
                    }
                }
            };
        } else if (message === 'kt') { // test kill turtles
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
        } else if (message === "ut") { // test rotation, color change
            info = {
                tick: 9001,
                updates: {
                    turtles: {
                        0: {
                            color: "#FFFFFF",
                            heading: 180,
                            ycor: 6
                        }
                    }
                }
            }
        } else if (message === "rt") { // test rotation, color change
            info = {
                tick: 1,
                updates: {
                    turtles: {
                        0: {
                            color: "#FF0000",
                            heading: 0,
                            ycor: 0
                        }
                    }
                }
            }
        } else if (message === 'cs') { // test change shapes, labels, label color
            info = {
                tick: 234,
                updates: {
                    turtles: {
                        0: {
                            shape: "Star",
                            label: "This is a star",
                            labelColor: "#FF00FF"
                        }
                    }
                }
            }
        } else if (message === 'voff') { // test isVisible
            info = {
                tick: 789,
                updates: {
                    turtles: {
                        1: {
                            isVisible: false
                        }
                    }
                }
            }
        } else if (message === 'vc') { // test isVisible
            info = {
                tick: 790,
                updates: {
                    turtles: {
                        0: {
                            isVisible: false
                        },
                        1: {
                            isVisible: true
                        }
                    }
                }
            }
        } else if (message === 'von') { // test isVisible
            info = {
                tick: 791,
                updates: {
                    turtles: {
                        0: {
                            isVisible: true
                        }
                    }
                }
            }
        } else if (message === 'cl') {
            info = {
                tick: 56,
                creations: {
                    links: {
                        0: {
                            id: '0',
                            color: '#00FFFF',
                            end1xcor: 5,
                            end1ycor: 5,
                            end2xcor: 0,
                            end2ycor: 0,
                            isVisible: true,
                            thickness: 1,
                            label: '',
                            labelColor: '',
                            isDirty: DirtyState.BORN
                        },
                        1: {
                            id: '1',
                            color: '#FF0000',
                            end1xcor: 0,
                            end1ycor: 5,
                            end2xcor: -5,
                            end2ycor: 0,
                            isVisible: true,
                            thickness: 5,
                            label: 'links',
                            labelColor: '#FF0000',
                            isDirty: DirtyState.BORN
                        }
                    }
                }
            }
        } else if (message === 'ul') {
            info = {
                tick: 78,
                updates: {
                    links: {
                        0: {
                            end1xcor: 8,
                            thickness: 8,
                            label: 'second link',
                            labelColor: '#00FFFF'
                        },
                        1: {
                            end2ycor: -2,
                            color: '#FF00FF'
                        }
                    }
                }
            }
        } else if (message === 'kl') {
            info = {
                tick: 92,
                removals: {
                    links: {
                        0: {},
                        1: {}
                    }
                }
            }
        } else if (message === 'ct2') {
            info = {
                tick: 1,
                creations: {
                   turtles: {
                        0: {
                            id: '0',
                            shape: 'Default',
                            color: '#FFFF00',
                            heading: 0,
                            label: "",
                            labelColor: "",
                            isVisible: true,
                            xcor: 0,
                            ycor: 5,
                            isDirty: DirtyState.BORN
                        },
                        1: {
                            id: '1',
                            shape: 'Default',
                            color: '#00FFFF',
                            heading: 0,
                            label: "",
                            labelColor: "",
                            isVisible: true,
                            xcor: -16,
                            ycor: 5,
                            isDirty: DirtyState.BORN
                        },
                        2: {
                            id: '2',
                            shape: 'Default',
                            color: '#FF00FF',
                            heading: 0,
                            label: "",
                            labelColor: "",
                            isVisible: true,
                            xcor: 16,
                            ycor: 5,
                            isDirty: DirtyState.BORN
                        }
                    }
                }
            };
        } else if (message === "x=10") {
            info = {
                tick: 12,
                globals: {x: 10}
            };
        } else {
            $.post("http://abmplus.tech.northwestern.edu:9002/netlogo_data",
                { agentType: shout, cmd: message },
                function(data) {
                    var packet = { user: name, processed_message: data };
                    console.log("Server Sending: " + packet);
                    io.sockets.json.send(packet);
                }
            );
        }

        socket.emit('tick',info);

    });

    socket.on('button',function(data) {
        io.sockets.emit('new button', data);
    });

    socket.on('monitor', function(data) {
        var reporter = data.reporter;
        var precision = data.precision;
        var font = data.font;
        var name = data.id;
//        $.post("http://abmplus.tech.northwestern.edu:9001/netlogo_data",
//            {reporter: reporter, precision: precision}
//        );

        var newMonitorInfo = {id: name, font: font, reporter: reporter};
        io.sockets.emit('new monitor', newMonitorInfo);
    });

    socket.on('slider', function(data) {
        var global = data.variable;
        var initial = data.initial;
//        $.post("http://abmplus.tech.northwestern.edu:9001/netlogo_data",
//            {global: global, initial: initial}
//        );

        io.sockets.emit('new slider', data);
    });

    socket.on('slider change', function(data) {
//        $.post("http://abmplus.tech.northwestern.edu:9001/netlogo_data",
//            {global: data.id, value: data.value}
//        );
        socket.broadcast.emit('slider change', data);
    });

    socket.on('switch', function(data) {
//        $.post("http://abmplus.tech.northwestern.edu:9001/netlogo_data",
//            {global: data.variable}
//        );
        io.sockets.emit('new switch', data);
    });

    socket.on('switch change', function(data) {
//        $.post("http://abmplus.tech.northwestern.edu:9001/netlogo_data",
//            {global: data.id, value: data.value}
//        );
        socket.broadcast.emit('switch change', data);
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
