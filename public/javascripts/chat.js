/*
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 6/22/12
 * Time: 4:50 PM
 */

// Initial page setup and verification

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

// Socket connection and event handlers

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

// Supplemental functions to the handlers above

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

// Additional classes and methods

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
    }
    List.prototype.clearCursor = function() {
        this.cursor = null;
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

// Functions triggered by events on the page

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
function keyCheck(inField, e){
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
    } else if ((charCode === 13) && ($(inField).val() !== "")) {
        send($(inField).val());
    } else if ((charCode === 38) || (charCode === 40)){
        e.preventDefault();
        scroll(charCode);
    } else if (!e.ctrlKey) {
        focusInput();
    } else if (e.ctrlKey && (charCode === 86)) {
        setTimeout(function(){
            var text = $(inField).val().replace(/\t/g, " ");
            $(inField).val(text);
        }, 1);
    }
}

// Helper functions to the trigger functions above

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
        if (messageList.cursor === null)
            messageList.cursor = messageList.head;
        else
            messageList.cursor = messageList.cursor.older != null ? messageList.cursor.older : messageList.cursor;
    } else if (key === 40) {
        messageList.cursor = messageList.cursor.newer;
    }
    var info = messageList.cursor != null ? messageList.cursor.data : "";
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