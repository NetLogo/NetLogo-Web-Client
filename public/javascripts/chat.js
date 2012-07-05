/*
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 6/22/12
 * Time: 4:50 PM
 */

/*
 * Additional classes and methods
 */

String.prototype.reverse = function(){
    return this.split("").reverse().join("");
};
String.prototype.wordReverse = function(){
    var word, _i, _len;
    var newMessageArray = [];
    var messageArray = this.split(" ");
    for (_i = 0, _len = messageArray.length; _i < _len; _i++) {
        word = messageArray[_i];
        newMessageArray[_i] = word.reverse();
    }
    return newMessageArray.join(" ");
};
var List, node;
List = (function() {
    function List(maxLen) {
        this.maxLen = maxLen;
        this.len = 0;
        this.head = null;
        this.tail = null;
        this.cursor = null;
        this.current = null;
    }
    List.prototype.clearCursor = function() {
        this.cursor = null;
        this.current = null;
    };
    List.prototype.addCurrent = function(){
        messageList.current = new node($("#inputBuffer").val());
    };
    List.prototype.append = function(newNode) {
        var oldTail;
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
            oldTail = this.tail;
            this.tail = oldTail.newer;
            this.tail.older = null;
        }
    };
    return List;
})();
node = (function() {
    function node(data) {
        this.data = data;
        this.newer = null;
        this.older = null;
    }
    return node;
})();
var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)	{
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            }
            else if (dataProp)
                return data[i].identity;
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        { 	string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        },
        {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        },
        {
            prop: window.opera,
            identity: "Opera",
            versionSearch: "Version"
        },
        {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        },
        {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        },
        {		// for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        },
        {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        },
        { 		// for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }
    ],
    dataOS : [
        {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        },
        {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        },
        {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
        },
        {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }
    ]

};

/*
 * Initial page setup and verification
 */

window.onload = startup();
var userName;
function startup(){
    userName = prompt("Please type your user name:");
    $.post('/', { username: userName }, function(data){
        if (data !== userName) {
            document.location.href = data;
        }
    });
}
BrowserDetect.init();
if (BrowserDetect.OS === "Mac"){
    var commandkey = false;
    var keyCode1, keyCode2;
    if (BrowserDetect.browser === "Opera") {
        keyCode1 = 17
    } else if (BrowserDetect.browser === "Firefox"){
        keyCode1 = 224
    } else {
        keyCode1 = 91;
        keyCode2 = 93;
    }
    function keyDown() {
        if ((event.keyCode == keyCode1) || (event.keyCode == keyCode2)) { commandkey = true }
        keyCheck(event);
    }
    function keyUp() {
        if ((event.keyCode == keyCode1) || (event.keyCode == keyCode2)) commandkey = false;
    }
    $("#container").onkeydown = keyDown;
    $("#inputBuffer").onkeydown = keyDown;
    $("#container").onkeyup = keyUp;
    $("#inputBuffer").onkeyup = keyUp;
}

/*
 * Socket connection and event handlers
 */

var socket = io.connect();
socket.on('connected', function(){
    socket.emit('name reply', userName);
});
socket.on('users changed', function (data) {
    var user, row;
    $("#usersOnline").text("");
    for (user in data) {
        row =
            "<tr><td>" +
                "<input id="+user+" value="+user+" type='button' " +
                "onkeydown='keyCheck(this, event)' onclick='copySetup(this.value)' " +
                "style='border:none; background-color: #FFFFFF; width: 100%; text-align: left'>" +
            "</td></tr>";
        $("#usersOnline").append(row);
    }
});
var state = 0;
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
    var entry = messageSwitcher(user, final_text, time);
    $("#chatLog").append(entry);
    textScroll();
});

/*
 * Supplemental functions to the handlers above
 */

function messageSwitcher(user, final_text, time){
    var color;
    if (state%2 === 0) {
        color = "#FFFFFF";
    } else {
        color = "#CCFFFF";
    }
    var row =
        "<tr style='vertical-align: middle; width: 100%; border-collapse: collapse;'>"+
            "<td style='color: #CC0000; width: 20%; background-color: " + color + "; border-color: " + color + "'>" +
                user + ":" +
            "</td>" +
            "<td style='width: 70%; word-wrap: break-word; background-color: " + color + "; border-color: " + color + "'>" +
                final_text +
            "</td>" +
            "<td style='color: #00CC00; width: 10%; text-align: right; background-color: " + color + "; border-color: " + color + "'>" +
                time +
            "</td>" +
        "</tr>";
    state++;
    return row;
}
function textScroll(){
    var box = $("#container");
    var bottom = box[0].scrollHeight - box.height();
    var font = box.css('font-size');
    var size = parseInt(font.substr(0, font.length - 2));
    box.scrollTop(bottom - size);
    box.animate({'scrollTop': bottom}, 'fast');
}

/*
 * Functions triggered by events on the page
 */

function clearChat(){
    $('#chatLog').text('');
    focusInput();
}
function nameSelect(id){
    var row = $("#"+id);
    row.css({backgroundColor: '#0033CC', color: '#FFFFFF', fontWeight: 'bold'});
}
function nameDeselect(id){
    var row = $('#'+id);
    row.css({backgroundColor: '#FFFFFF', color: '#000000', fontWeight: 'normal'});
}
function copySetup(text) {
    $('#copier').attr('name', text);
    $('#copier').val(text);
    $('#copier').focus();
    $('#copier').select();
}
function keyCheck(e){
    var charCode;
    if (e && e.which){
        charCode = e.which;
    } else if (window.event){
        e = window.event;
        charCode = e.which;
    }
    if (charCode === 9){
        e.preventDefault();
        changeShout();
    } else if ((charCode === 13) && ($("#inputBuffer").val() !== "")) {
        send($("#inputBuffer").val());
    } else if ((charCode === 38) || (charCode === 40)){
        e.preventDefault();
        scroll(charCode);
    } else if ((e.ctrlKey || commandkey) && (charCode === 67)) {
        $("#textCopier").focus();
        $("#textCopier").select();
        // setTimeout here makes sure that the focus isn't taken from the
        // textCopier area until after the text is copied to the clipboard.
        setTimeout(focusInput(), 5);
    } else {
        focusInput();
    }
}
// Credit to Jeff Anderson
// Source: http://www.codetoad.com/javascript_get_selected_text.asp
function getSelText(){
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
    $("#textCopier").val(finalText);
    $("#container").focus();
}

/*
 * Helper functions to the trigger functions above
 */

function changeShout(){
    var currentState = $("#shoutState").text();
    if (currentState === "Normal"){
        $("#shoutState").text("Shouting");
    } else {
        $("#shoutState").text("Normal");
    }
}
var messageList = new List(20);
function scroll(key){
    if (key === 38) {
        if (messageList.cursor === null) {
            messageList.cursor = messageList.head;
            messageList.addCurrent()
        } else
            messageList.cursor = messageList.cursor.older != null ? messageList.cursor.older : messageList.cursor;
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
    $("#inputBuffer").val(info);
}
function send(message){
    var shout = $("#shoutState").text();
    var output = $("#outputState").prop("checked");
    var packet = { Message: message, Shout: shout, Output: output };
    socket.json.send(packet);
    storeMessage(message);
    messageList.clearCursor();
    $("#inputBuffer").val("");
    focusInput();
}
function storeMessage(text){
    var Message = new node(text);
    messageList.append(Message);
}
function focusInput(){ $('#inputBuffer').focus() }