/*
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 6/22/12
 * Time: 4:50 PM
 */

// Imports
var TextHolder = exports.TextHolder;
var DoubleList = exports.DoubleList;
var CircleMap  = exports.CircleMap;

const THROTTLE_DELAY = 100;

// Variables into which to cache jQuery selector results
var $inputBuffer;
var $usersOnline;
var $chatLog;
var $chatContainer;
var $copier;
var $textCopier;
var $agentType;
var $tickCounter;
var $interface;

var $buttonDialog;
var $buttonCommands;
var $buttonForever;
var $buttonDisplay;
var $buttonAgents;
var $buttonKey;
var $buttonDisable;
var $allButtonFields;

var $monitorDialog;
var $monitorReporter;
var $monitorDisplay;
var $monitorPrecision;
var $monitorFont;
var $allMonitorFields;

var $sliderDialog;
var $sliderVar;
var $sliderMin;
var $sliderStep;
var $sliderMax;
var $sliderInitVal;
var $sliderUnits;
var $sliderIsVertical;

var $switchDialog;
var $switchVar;

// Other globals
var userName;
var socket;
var state = 0;
var messageList = new DoubleList(20);
var agentTypeList = new CircleMap();
var logList = [];

// Onload
document.body.onload = function() {
    initSelectors();
    initJQueryUI();
    startup();
    initAgentList();
    initView();
    $agentType.text(agentTypeList.getCurrent());
    var throttledSend = throttle(send, THROTTLE_DELAY);

    socket = io.connect();

    socket.on('connected', function() {
        socket.emit('name reply', userName);
    });

    socket.on('users changed', function (data) {
        $usersOnline.text("");
        var user, row;
        for (user in data) {
            row = "<tr><td>" +
                "<input id='"+user+"' value='"+user+"' type='button' " +
                "onclick='copySetup(this.value)' " +
                "style='border:none; background-color: #FFFFFF; width: 100%; text-align: left'>" +
                "</td></tr>";
            $usersOnline.append(row);
        }
    });

    socket.on('message', function (data) {

        var d = new Date();
        var time = d.toTimeString().slice(0, 5);
        var user = data.user;
        var message = data.processed_message;
        var serverState = data.server_state;
        var final_text = "";

        switch (serverState) {
            case 0:
                final_text = message;
                break;
            case 1:
                final_text = message.reverse();
                break;
            case 2:
                final_text = message.wordReverse();
                break;
        }

        logList[state] = new TextHolder(final_text);
        var difference = $chatContainer[0].scrollHeight - $chatContainer.scrollTop();
        $chatLog.append(messageSwitcher(user, final_text, time));
        if ((difference === $chatContainer.innerHeight()) || (user === userName)) { textScroll(); }

    });

    socket.on('tick', function(data) {
        world.updateWorld(data);
        var globals = world.getGlobals();
        for (var reporter in globals) {
            $("#"+reporter+"-input").val(globals[reporter]);
        }
        $tickCounter.text(data.tick);
    });

    socket.on('new button', function(data) {
        createButton(data);
    });

    socket.on('new monitor', function(data) {
        createMonitor(data);
    });

    socket.on('new slider', function(data) {
        createSlider(data);
    });

    socket.on('slider change', function(data) {
        var sliderID = data.id;
        var newValue = data.value;
        $("#"+sliderID).slider("value", newValue);
    });

    socket.on('new switch', function(data) {
        createSwitch(data);
    });

    socket.on('switch change', function(data) {
        var switchID = data.id;
        var newValue = data.value;
        $("#"+switchID).slider('value', newValue);
    });

    var keyString =
            'abcdefghijklmnopqrstuvwxyz' +
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            '1234567890!@#$%^&*()' +
            '\<>-_=+[{]};:",.?\\|\'`~';
    var keyArray = keyString.split('');
    var notNumberRE = /\D/g;

    Mousetrap.bind('tab', function(e) {
        e.preventDefault();
        agentTypeList.next();
        setShout();
    }, 'keydown');

    Mousetrap.bind(keyArray, function() {
        focusInput();
    }, 'keydown');

    Mousetrap.bind('enter', function(e) {
        if ((e.target.id === 'inputBuffer') && (/\S/g.test($inputBuffer.val()))) {
            throttledSend($inputBuffer.val());
        }
    });

    Mousetrap.bind(['up', 'down'], function(e) {
        if (e.target.id === 'inputBuffer') {
            var charCode = extractCharCode(e);
            e.preventDefault();
            scroll(charCode);
        }
    });

    Mousetrap.bind('space', function(e) {
        if ((e.target.id === 'container') ||
            (e.target.id === 'copier')) {
            e.preventDefault();
            textScroll();
            focusInput();
        }
    });

    Mousetrap.bind(['ctrl+c', 'command+c'], function(e) {
        // If there are only digit characters in e.target.id...
        // This would mean that e.target is a table row in the chat output.
        if ((e.target.id === 'container') || (!notNumberRE.test(e.target.id))) {
            $textCopier.show();  // Show so we can select the text for copying
            $textCopier.focus();
            $textCopier.select();
            setTimeout(function() {
                $textCopier.hide();
                focusInput();
            }, 50);
        }
    }, 'keydown');

    Mousetrap.bind('pageup', function() {
        $chatContainer.focus();
    });

};


/*
 * Basic page functionality
 */

function initJQueryUI() {
    $(function() {

        $("#viewContainer")
            .droppable({
                tolerance: 'touch'
            }).
            draggable({
                containment: 'parent'
            });

        $("#addButton").button({icons: {secondary: 'ui-icon-plus'}})
            .click(function() {
                createWidget('button')();
            });
        $("#addMonitor").button({icons: {secondary: 'ui-icon-plus'}})
            .click(function() {
                createWidget('monitor')();
            });
        $("#addSlider").button({icons: {secondary: 'ui-icon-plus'}})
            .click(function() {
                createWidget('slider')();
            });
        $("#addSwitch").button({icons: {secondary: 'ui-icon-plus'}})
            .click(function() {
                createWidget('switch')();
            });

//      $('#add').button({icons: {secondary: 'ui-icon-plus'}})
//          .click(function() {
//              var type = prompt("What would you like to add?");
//              if (typeof type !== 'undefined') {
//                  var createFunction = createWidget(type);
//                  createFunction();
//              }
//          });

//      $('#addOptions').selectmenu();

        $buttonDialog.dialog({
            autoOpen: false,
            title: "Button",
            buttons: {
                Ok: alertButton,
                Cancel: function() { $buttonDialog.dialog('close') }
            },
            close: function() {
                $allButtonFields.val("");
                $buttonDisable.prop('checked', false);
                $buttonForever.prop('checked', false);
            }
        });

        $monitorDialog.dialog({
            autoOpen: false,
            title: "Monitor",
            buttons: {
                Ok: alertMonitor,
                Cancel: function() { $monitorDialog.dialog('close') }
            },
            close: function() {
                $allMonitorFields.val('');
                $monitorPrecision.val(17);
                $monitorFont.val(11);
            }
        });

        $sliderDialog.dialog({
            autoOpen: false,
            title: "Slider",
            width: 520,
            height: 285,
            buttons: {
                Ok: alertSlider,
                Cancel: function() { $sliderDialog.dialog('close') }
            },
            close: function() {
                $sliderMin.val(0);
                $sliderStep.val(1);
                $sliderMax.val(100);
                $sliderInitVal.val(50);
                $sliderVar.val('');
                $sliderUnits.val('');
                $sliderIsVertical.prop('checked', false);
            }
        });

        $switchDialog.dialog({
            autoOpen: false,
            title: 'Switch',
            buttons: {
                Ok: alertSwitch,
                Cancel: function() { $switchDialog.dialog('close') }
            },
            close: function() {
                $switchVar.val("");
            }
        });

    });
}

function startup() {
    userName = prompt("Please type your user name:");
    $.post('/', { username: userName }, function(data) {
        if (data === '/error') {
            document.location.href = data;
        }
        userName = data;
    });
}

// Caching jQuery selector results for easy access throughout the code
function initSelectors() {
    $inputBuffer      = $("#inputBuffer");
    $usersOnline      = $("#usersOnline");
    $chatLog          = $("#chatLog");
    $chatContainer    = $("#chatContainer");
    $copier           = $("#copier");
    $textCopier       = $("#textCopier");
    $agentType        = $("#agentType");
    $tickCounter      = $("#tickCounter");
    $interface        = $("#interface");

    $buttonDialog     = $("#buttonDialog");
    $buttonCommands   = $("#buttonCommands");
    $buttonForever    = $("#buttonForever");
    $buttonDisplay    = $("#buttonDisplay");
    $buttonAgents     = $("#buttonAgents");
    $buttonKey        = $("#buttonKey");
    $buttonDisable    = $("#buttonDisable");
    $allButtonFields  = $( [] ).add($buttonCommands).add($buttonDisplay).add($buttonKey);

    $monitorDialog    = $("#monitorDialog");
    $monitorReporter  = $("#monitorReporter");
    $monitorDisplay   = $("#monitorDisplay");
    $monitorPrecision = $("#monitorPrecision");
    $monitorFont      = $("#monitorFont");
    $allMonitorFields = $( [] ).add($monitorDisplay).add($monitorReporter);

    $sliderDialog     = $("#sliderDialog");
    $sliderVar        = $("#sliderVar");
    $sliderMin        = $("#sliderMin");
    $sliderStep       = $("#sliderStep");
    $sliderMax        = $("#sliderMax");
    $sliderInitVal    = $("#sliderInitVal");
    $sliderUnits      = $("#sliderUnits");
    $sliderIsVertical = $("#sliderIsVertical");

    $switchDialog     = $("#switchDialog");
    $switchVar        = $("#switchVar");
}

function initAgentList() {
    var agentTypes = ['observer', 'turtles', 'patches', 'links'];
    agentTypes.map(function(type) { agentTypeList.append(type) });
}

function initView() {

    var $ticks = $('#ticks');
    var $button = $('#button');

    var viewHeight = world.patchSize() * world.worldHeight(); // in pixels
    var viewWidth = world.patchSize() * world.worldWidth(); // in pixels
    paper.view.viewSize = new paper.Size(viewWidth, viewHeight);

    var tickWidthStr = $ticks.css('width');
    var buttonWidthStr = $button.css('width');
    var tickWidth = parseInt(tickWidthStr.substr(0, tickWidthStr.length - 2));
    var buttonWidth = parseInt(buttonWidthStr.substr(0, buttonWidthStr.length - 2));
    var tickCounterWidth = viewWidth - (tickWidth + buttonWidth);
    $tickCounter.css('width', tickCounterWidth);

}

function messageSwitcher(user, final_text, time) {

    var color;
    if (state % 2 === 0) {
        color = "#FFFFFF";
    } else {
        color = "#CCFFFF";
    }
    state++;

    return "<tr style='vertical-align: middle; outline: none; width: 100%; border-collapse: collapse;' onmouseup='handleTextRowOnMouseUp(this)' tabindex='1' id='"+(state-1)+"'>"+
               "<td style='color: #CC0000; width: 20%; background-color: " + color + "; border-color: " + color + "'>" +
                   user + ":" +
               "</td>" +
               "<td  class='middle' style='width: 70%; white-space: pre-wrap; word-wrap: break-word; background-color: " + color + "; border-color: " + color + "'>" +
                   final_text +
               "</td>" +
               "<td style='color: #00CC00; width: 10%; text-align: right; background-color: " + color + "; border-color: " + color + "'>" +
                   time +
               "</td>" +
           "</tr>";

}

function textScroll() {
    var bottom = $chatContainer[0].scrollHeight - $chatContainer.height();
    var font = $chatContainer.css('font-size');
    var size = parseInt(font.substr(0, font.length - 2));
    $chatContainer.scrollTop(bottom - size);
    $chatContainer.animate({'scrollTop': bottom}, 'fast');
}

// Credit to Remy Sharp.
// http://remysharp.com/2010/07/21/throttling-function-calls/
function throttle(fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

function extractCharCode(e) {
    if (e && e.which) {
        return e.which;
    } else if (window.event) {
        return window.event.which;
    } else {
        return e;  // Should pretty much never happen
    }
}

function setShout() {
    var newState = agentTypeList.getCurrent();
    $agentType.text(newState);
}

function scroll(key) {

    if (key === 38) { // Up arrow
        if (messageList.cursor === null) {
            messageList.addCurrent($inputBuffer.val(), agentTypeList.getCurrent());
            messageList.cursor = messageList.head;
        } else {
            messageList.cursor = messageList.cursor.prev != null ? messageList.cursor.prev : messageList.cursor;
        }
    } else if (key === 40) { // Down arrow
        messageList.cursor = messageList.cursor.next;
    }

    var info, type;
    if (messageList.cursor !== null) {
        info = messageList.cursor.data;
        type = messageList.cursor.type;
    } else {
        info = messageList.current.data;
        type = messageList.current.type;
        messageList.clearCursor();
    }

    agentTypeList.setCurrent(type);
    setShout();
    $inputBuffer.val(info);

}

function send(message) {

    var shout = $agentType.text();
    var packet = { Message: message, Shout: shout };
    socket.json.send(packet);
    messageList.append(message, agentTypeList.getCurrent());
    messageList.clearCursor();
    $inputBuffer.val("");
    focusInput();

}

function focusInput() { $inputBuffer.focus() }

function createWidget(type) {
    var retfunc = function() { alert("That wasn't a valid NetLogo widget!") };
    switch (type) {
        case 'button':
            retfunc = function() {
                $buttonDialog.dialog('open');
            };
            break;
        case 'monitor':
            retfunc = function() {
                $monitorDialog.dialog('open');
            };
            break;
        case 'slider':
            retfunc = function() {
                $sliderDialog.dialog('open');
            };
            break;
        case 'switch':
            retfunc = function() {
                $switchDialog.dialog('open');
            };
            break;
    }
    return retfunc;
}

function alertButton() {
    var buttonID = $buttonDisplay.val() ? $buttonDisplay.val() : $buttonCommands.val();
    var buttonInfo = {
        id: buttonID,
        command: $buttonCommands.val(),
        isDisabled: $buttonDisable.prop('checked'),
        actionKey: $buttonKey.val(),
        isForever: $buttonForever.prop('checked'),
        agents: $buttonAgents.val()
    };
    socket.emit('button', buttonInfo);

    $buttonDialog.dialog('close');
}

function createButton(data) {
    var id = data.id;
    var command = data.command;
    var isDisabled = data.isDisabled;
    var agents = data.agents;
    var isForever = data.isForever;
    var actionKey = data.actionKey;
    var newButtonHTML = "<div><button id='" + id +
        "' name='" + isDisabled +
        "' accesskey='" + actionKey +
        "' value='" + JSON.stringify({Message: command, Shout: agents, Forever: isForever}) +
        //TODO make server account for possible 'Forever' (if (data.Forever) {...})
        "'>" +
        id +
        "</button></div>";
    $interface.append(newButtonHTML);

    var agentIcon = '',
        foreverIcon = '';
    if (isForever) { foreverIcon = 'ui-icon-refresh' }
    if (agents === 'turtles') {
        agentIcon = 'ui-icon-clipboard';
    } else if (agents === 'patches') {
        agentIcon = 'ui-icon-stop';
    } else if (agents === 'links') {
        agentIcon = 'ui-icon-link';
    }

    $('#'+id)
        .button({
            icons: { primary: agentIcon, secondary: foreverIcon },
            label: id
        })
        .click(function() {
            buttonSend(document.getElementById(id));
        });
    //TODO make these draggable
}

function buttonSend(button) {
    if ((button.name === 'false') || ($tickCounter.text() !== "")) {
        socket.json.send(JSON.parse(button.value));
    }
}

function alertMonitor() {
    var monitorID = $monitorDisplay.val() ? $monitorDisplay.val() : $monitorReporter.val();
    var monitorInfo = {
        id: monitorID,
        reporter: $monitorReporter.val(),
        precision: $monitorPrecision.val(),
        font: $monitorFont.val()
    };
    socket.emit('monitor', monitorInfo);

    $monitorDialog.dialog('close');
}

function createMonitor(data) {
    var monitorID = data.id;
    var reporter = data.reporter;
    var monitorFont = data.font;
    var newMonitorHTML = "<div style='background-color: #CC9966; display: inline-block; outline: 2px outset #CC9966;' id='" + monitorID + "'>"+
            "<label style='margin-left: 3px' for='" + reporter + "-input'>"+monitorID+"</label>"+
            "<br>"+
            "<input readonly='readonly' type='text' id='" + reporter + "-input'>"+
        "</div>";
    $interface.append(newMonitorHTML);
    $("#"+monitorID).draggable({
        containment: 'parent',
        revert: 'valid'
    });
}

function alertSlider() {
    var sliderInfo = {
        variable: $sliderVar.val(),
        min: $sliderMin.val(),
        step: $sliderStep.val(),
        max: $sliderMax.val(),
        initial: $sliderInitVal.val(),
        units: $sliderUnits.val(),
        isVertical: $sliderIsVertical.prop('checked')
    };
    socket.emit('slider', sliderInfo);

    $sliderDialog.dialog('close');
}

function createSlider(data) {
    var name = data.variable;
    var min = parseInt(data.min);
    var step = parseInt(data.step);
    var max = parseInt(data.max);
    var initial = parseInt(data.initial);
    var units = data.units;
    var isVertical = data.isVertical;
    var divStyle = 'background-color: #99CC99; display: inline-block; outline: 2px outset #99CC99; ' +
        'padding-top: 5px; padding-left: 8px; padding-right: 10px;';
    var orientation = 'horizontal';
    if (isVertical) {
        orientation = 'vertical';
        //TODO get table to rotate properly
    }
    var newSliderHTML =
        "<div style='"+divStyle+"' id='"+name+"-wrapper'>"+
            "<div id='"+name+"'></div>"+
            "<table width='150px' style='margin: 0px'>"+
                "<tr>"+
                    "<td>"+name+"</td>"+
                    "<td style='text-align: right;' id='"+name+"-value'>"+initial+" "+units+"</td>"+
                "</tr>"+
            "</table>"+
        "</div>";
    $interface.append(newSliderHTML);
    $("#"+name).slider({
        max: max,
        min: min,
        step: step,
        value: initial,
        orientation: orientation,
        slide: function(event, ui) {
            socket.emit('slider change', {id: name, value: ui.value});
            $("#"+name+"-value").text(ui.value + " " + units);
        },
        change: function(event, ui) {
            $("#"+name+"-value").text(ui.value + " " + units);
        }
    });
    $("#"+name+"-wrapper").draggable({
        containment: 'parent',
        revert: 'valid'
    });
}

function alertSwitch() {
    var switchInfo = { variable: $switchVar.val() };
    socket.emit('switch', switchInfo);
    $switchDialog.dialog('close');
}

function createSwitch(data) {
    var switchID = data.variable;
    var divID = switchID + "-wrapper";
    var divStyle = 'background-color: #99CC99; display: inline-block; outline: 2px outset #99CC99;' +
        'padding-right: 10px; vertical-align: middle';
    var newSwitchHTML =
        "<div style='"+divStyle+"' id='"+divID+"'>"+
            "<table>"+
                "<tr>"+
                    "<td><div style='height: 20px; margin: 7px;' id='"+switchID+"'></div></td>"+
                    "<td><div style='font-size: 8pt; margin-right: 10px;'>On<br>Off</div></td>"+
                    "<td>"+switchID+"</td>"+
                "</tr>"+
            "</table>"+
        "</div>";
    $interface.append(newSwitchHTML);
    $("#"+switchID).slider({
        max: 1,
        orientation: 'vertical',
        slide: function(event, ui) {
            socket.emit('switch change', {id: switchID, value: ui.value});
        }
    });
    $("#"+divID).draggable({
        containment: 'parent',
        revert:'valid'
    });
}
