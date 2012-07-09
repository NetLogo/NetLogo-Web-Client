/*
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 6/22/12
 * Time: 4:50 PM
 */

/*
 * Variables into which to cache jQuery selector results
 */

var $inputBuffer;
var $usersOnline;
var $chatLog;
var $container;
var $copier;
var $textCopier;
var $shoutState ;
var $outputState;


/*
 * Other globals
 */

var ListNode = (function() {

    function ListNode(data) {
        this.data = data;
        this.newer = null;
        this.older = null;
    }

    return ListNode;

})();

var CircleList = (function() {

    function CircleList() {
        this.head = null;
        this.last = null;
        this.current = null;
    }

    CircleList.prototype.append = function(newNode) {
        if (this.head === null) {
            this.head = newNode;
            this.last = newNode;
            this.current = newNode;
        } else {
            this.last.newer = newNode;
            newNode.newer = this.head;
            this.last = newNode;
        }
    };

    CircleList.prototype.get = function() {
        return this.current.data;
    };

    CircleList.prototype.next = function() {
        this.current = this.current.newer;
    };

    return CircleList;

})();

var DoubleList = (function() {

    function DoubleList(maxLen) {
        this.maxLen = maxLen;
        this.len = 0;
        this.head = null;
        this.tail = null;
        this.cursor = null;
        this.current = null;
    }

    DoubleList.prototype.clearCursor = function() {
        this.cursor = null;
        this.current = null;
    };

    DoubleList.prototype.addCurrent = function() {
        this.current = new ListNode($inputBuffer.val());
    };

    DoubleList.prototype.append = function(newNode) {

        if (this.head != null) {
            newNode.older = this.head;
            this.head.newer = newNode;
        }

        this.head = newNode;

        if (this.tail === null) {
            this.tail = this.head;
        }

        if (this.len < this.maxLen) {
            this.len++;
        } else {
            this.tail = this.tail.newer;
            this.tail.older = null;
        }

    };

    return DoubleList;

})();

var userName;
var socket;
var state = 0;
var messageList = new DoubleList(20);
var agentTypeList = new CircleList;


/*
 * Onload-related instructions
 */

window.onload = startup();
document.body.onload = function() {
    initSelectors();
    initAgentList();
    $shoutState.text(agentTypeList.get());
};
socket = io.connect();

socket.on('connected', function() {
    socket.emit('name reply', userName);
});

socket.on('users changed', function (data) {
    $usersOnline.text("");
    var user, row;
    for (user in data) {
        row = "<tr><td>" +
                  "<input id="+user+" value="+user+" type='button' " +
                  "onkeydown='keyCheck(this, event)' onclick='copySetup(this.value)' " +
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

    $chatLog.append(messageSwitcher(user, final_text, time));
    textScroll();

});


/*
 * `String` enhancers
 */

String.prototype.reverse = function() {
    return this.split("").reverse().join("");
};

String.prototype.wordReverse = function() {
    var word, _i, _len;
    var newMessageArray = [];
    var messageArray = this.split(" ");
    for (_i = 0, _len = messageArray.length; _i < _len; _i++) {
        word = messageArray[_i];
        newMessageArray[_i] = word.reverse();
    }
    return newMessageArray.join(" ");
};


/*
 * Basic page functionality
 */

function startup() {
    userName = prompt("Please type your user name:");
    $.post('/', { username: userName }, function(data) {
        if (data !== userName) {
            document.location.href = data;
        }
    });
}

// Caching jQuery selector results for easy access throughout the code
function initSelectors() {
    $inputBuffer = $("#inputBuffer");
    $usersOnline = $("#usersOnline");
    $chatLog     = $("#chatLog");
    $container   = $("#container");
    $copier      = $("#copier");
    $textCopier  = $("#textCopier");
    $shoutState  = $("#shoutState");
    $outputState = $("#outputState");
}

function initAgentList() {
    agentTypeList.append(new ListNode('observer'));
    agentTypeList.append(new ListNode('turtles'));
    agentTypeList.append(new ListNode('patches'));
    agentTypeList.append(new ListNode('links'));
}

function messageSwitcher(user, final_text, time) {

    var color;
    if (state % 2 === 0) {
        color = "#FFFFFF";
    } else {
        color = "#CCFFFF";
    }
    state++;

    return "<tr style='vertical-align: middle; width: 100%; border-collapse: collapse;'>"+
               "<td style='color: #CC0000; width: 20%; background-color: " + color + "; border-color: " + color + "'>" +
                   user + ":" +
               "</td>" +
               "<td style='width: 70%; white-space: pre-wrap; word-wrap: break-word; background-color: " + color + "; border-color: " + color + "'>" +
                   final_text +
               "</td>" +
               "<td style='color: #00CC00; width: 10%; text-align: right; background-color: " + color + "; border-color: " + color + "'>" +
                   time +
               "</td>" +
           "</tr>";

}

function textScroll() {
    var bottom = $container[0].scrollHeight - $container.height();
    var font = $container.css('font-size');
    var size = parseInt(font.substr(0, font.length - 2));
    $container.scrollTop(bottom - size);
    $container.animate({'scrollTop': bottom}, 'fast');
}


/*
 * Functions triggered by events on the page
 */

function clearChat() {
    $chatLog.text('');
    focusInput();
}
function nameSelect(id) {
    var row = $("#"+id);
    row.css({backgroundColor: '#0033CC', color: '#FFFFFF', fontWeight: 'bold'});
}
function nameDeselect(id) {
    var row = $('#'+id);
    row.css({backgroundColor: '#FFFFFF', color: '#000000', fontWeight: 'normal'});
}
function copySetup(text) {
    $copier.attr('name', text);
    $copier.val(text);
    $copier.focus();
    $copier.select();
}

function keyCheck(inField, e) {

    // Find out what key is pressed.
    var charCode = extractCharCode(e);

    // Based on what key is pressed, do something.
    if (charCode === 9) {
        e.preventDefault();
        changeShout();
    } else if ((charCode === 13) && ($inputBuffer.val() !== "")) {
        send($inputBuffer.val());
    } else if ((charCode === 38) || (charCode === 40)) {
        e.preventDefault();
        scroll(charCode);
    } else if ((e.ctrlKey || e.metaKey) && (charCode === 67) && (inField.id !== "inputBuffer")) {
        $textCopier.show();  // Show so we can select the text for copying
        $textCopier.focus();
        $textCopier.select();
        setTimeout(function() {
            $textCopier.hide();
            focusInput();
        }, 5);
        // Delay for a short bit, so we can hide it after the default action (copy) is triggered
    } else if (!isModifier(e)) {
        focusInput();
    }

}

// Credit to Jeff Anderson
// Source: http://www.codetoad.com/javascript_get_selected_text.asp
function getSelText() {

    var txt = "";
    if (window.getSelection) {
        txt = window.getSelection();
    } else if (document.getSelection) {
        txt = document.getSelection();
    } else if (document.selection) {
        txt = document.selection.createRange().text;
    } else return;

    // The regular expression 'timestamp' matches time strings of the form hh:mm in 24-hour format.
    var timestamp = /\t((?:(?:[0-1][0-9])|(?:2[0-3])):[0-5][0-9])$/gm;
    var modText = txt.toString().replace(timestamp, "  [$1]");
    var finalText = modText.replace(/\t/g, " ");
    $textCopier.hide();  // Hide to avoid ghostly scrollbar issue on Chrome/Safari (on Mac OS)
    $textCopier.val(finalText);
    $container.focus();

}


/*
 * Helper functions to the trigger functions above
 */

function extractCharCode(e) {
    if (e && e.which) {
        return e.which;
    } else if (window.event) {
        return window.event.which;
    } else {
        return e;  // Should pretty much never happen
    }
}

// this is equivalent to the CoffeeScript:
//      charCode = extractCharCode(e)
//      return ( e.metaKey or charCode in [16..36] or charCode in [45, 46] or charCode in [112..123] )
// which means if the key pressed is not a modifier key, focus the input box.
// So, if you want to modify this code, it's suggestible that you just copy&paste the above CoffeeScript into a
// a CS => JS converter, and regenerate the code that way–for your own sanity, that is
function isModifier(e) {
    var charCode = extractCharCode(e);
    var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
    return (e.metaKey || (__indexOf.call([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], charCode) >= 0 || (charCode === 45 || charCode === 46) || __indexOf.call([112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123], charCode) >= 0));
}

function changeShout() {
    agentTypeList.next();
    var currentState = agentTypeList.get();
    $shoutState.text(currentState);
}

function scroll(key) {

    if (key === 38) {
        if (messageList.cursor === null) {
            messageList.cursor = messageList.head;
            messageList.addCurrent()
        } else {
            messageList.cursor = messageList.cursor.older != null ? messageList.cursor.older : messageList.cursor;
        }
    } else if (key === 40) {
        messageList.cursor = messageList.cursor.newer;
    }

    var info;
    if (messageList.cursor !== null) {
        info = messageList.cursor.data;
    } else {
        info = messageList.current.data;
        messageList.clearCursor();
    }

    $inputBuffer.val(info);

}

function send(message) {

    var shout = $shoutState.text();
    var output = $outputState.prop("checked");
    var packet = { Message: message, Shout: shout, Output: output };
    socket.json.send(packet);
    storeMessage(message);
    messageList.clearCursor();
    $inputBuffer.val("");
    focusInput();

}

function storeMessage(text) {
    var Message = new ListNode(text);
    messageList.append(Message);
}

function focusInput() { $inputBuffer.focus() }
