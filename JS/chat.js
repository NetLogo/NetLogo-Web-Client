/*
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 6/22/12
 * Time: 4:50 PM
 */
window.onload = startup();
//window.onload = scrollOthers();
//$("#chatLog").scroll(scrollOthers());
var userName;
function startup(){
    userName = prompt("Please type your user name:");
    var query = $.post('/', { username: userName }, function(data, statusText, jqXHR){
        if (data !== userName) {
            document.location.href = data;
        }
    });
};
var socket = io.connect();
socket.on('connected', function(){
    socket.emit('name reply', userName);
});
socket.on('users changed', function (data) {
    var user, prefix;
    $("#usersOnline").text("");
    for (user in data) {
        prefix = $("#usersOnline").val() === "" ? "" : "\n";
        $("#usersOnline").append(prefix + user);
    };
});
socket.on('message', function (data) {
    var time = data.processed_time;
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
    $("#lastMessage").val(final_text);
    var prefix = $("#chatLog").val() === "" ? "" : "\n";
    var linesNeeded = getLines() - 1;
    var lineCorrection = "\n ".repeat(linesNeeded);
    $("#chatLog").append(prefix + final_text);
    $("#userLog").append(prefix + user + ":" + lineCorrection);
    $("#timeLog").append(prefix + time + lineCorrection);
    textScroll();
});
String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 0) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result;
};
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
    };
    List.prototype.clearCursor = function() {
        this.cursor = null;
    };
    List.prototype.append = function(newNode) {
        var oldTail;
        if (this.head != null) {
            newNode.older = this.head;
            this.head.newer = newNode;
        };
        this.head = newNode;
        if (this.tail === null) {
            this.tail = this.head;
        };
        if (this.len < this.maxLen) {
            this.len++;
        } else {
            oldTail = this.tail;
            this.tail = oldTail.newer;
            this.tail.older = null;
        };
    };
    return List;
})();
node = (function() {
    function node(data) {
        this.data = data;
        this.newer = null;
        this.older = null;
    };
    return node;
})();
var messageList = new List(20);
function keyCheck(inField, e){
    var charCode;
    if (e && e.which){
        charCode = e.which;
    }
    else if (window.event){
        e = window.event;
        charCode = e.which;
    };
    if (charCode === 9){
        e.preventDefault();
        changeShout();
    }
    else if (charCode === 13){
        if ($(inField).val() !== "") {
            send($(inField).val());
        };
    }
    else if ((charCode === 38) || (charCode === 40)){
        e.preventDefault();
        scroll(charCode);
    }
    else if (!e.ctrlKey) {
        $("#abc").focus();
    };
};
function changeShout(){
    var currentState = $("#shoutState").text();
    if (currentState === "Normal"){
        $("#shoutState").text("Shouting");
    } else {
        $("#shoutState").text("Normal");
    }
};
function scroll(key){
    if (key === 38) {
        if (messageList.cursor === null)
            messageList.cursor = messageList.head;
        else
            messageList.cursor = messageList.cursor.older != null ? messageList.cursor.older : messageList.cursor;
    }
    else if (key === 40) {
        messageList.cursor = messageList.cursor.newer;
    };
    var info = messageList.cursor != null ? messageList.cursor.data : "";
    $("#abc").val(info);
};
function storeMessage(text){
    var Message = new node(text);
    messageList.append(Message);
};
function getLines(){
//    var result = $.countLines($('#lastMessage'), {
//        recalculateCharWidth: false,
//        charsMode: 'random',
//        fontAttrs: ["font-family", "font-size", "text-decoration", "font-style", "font-weight"]
//    });
//    return result.visual;
    return $("#lastMessage").val().split(/\r?\n|\r/).length + 1
};
function animateScroll(obj, bottom, scrollAmount){
    obj.scrollTop(bottom - scrollAmount);
    obj.animate({'scrollTop': bottom}, 'fast');
};
$(function(){
    $('textarea[id$=chatLog]').scroll(function() {
        $('textarea[id$=userLog]')
            .scrollTop($('textarea[id$=chatLog]').scrollTop());
        $('textarea[id$=timeLog]')
            .scrollTop($('textarea[id$=chatLog]').scrollTop());
    });
});
//function scrollOthers(){
//    var master = $("#chatLog");
//    var dependent1 = $("#userLog");
//    var dependent2 = $("#timeLog");
//    dependent1.scrollTop = master.scrollTop;
//    dependent2.scrollTop = master.scrollTop;
//    setTimeout("scrolltheother()",10);
//};
function textScroll(){
    var box = $("#chatLog");
    var bottom = box[0].scrollHeight - box.height();
    var font = box.css('font-size');
    var size = parseInt(font.substr(0, font.length - 2));
    var lineCount = getLines();
    animateScroll(box, bottom, size*lineCount);
};
function send(message){
    var d = new Date();
    var time = d.toUTCString().split(" ")[4] + " GMT";
    var shout = $("#shoutState").text();
    var output = $("#outputState").prop("checked");
    var packet = { Time: time, Message: message, Shout: shout, Output: output };
    console.log("client sending: " + packet);
    socket.json.send(packet);
    storeMessage(message);
    messageList.clearCursor();
    $("#abc").val("");
    $("#abc").focus();
};
function a(){ $('#abc').focus() };
