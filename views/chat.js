/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 6/22/12
 * Time: 4:50 PM
 */
function runSockets(approvedName){
    var socket = io.connect('http://165.124.139.137');
    socket.emit('name reply', approvedName);
    socket.on('users changed', function (data) {
        var user, prefix;
        $("#users").text("");
        for (user in data) {
            prefix = $("#users").val() === "" ? "" : "\n";
            $("#users").append(prefix + user);
        };
    });
    socket.on('message', function (data) {
        String.prototype.reverse = function(){
            return this.split("").reverse().join("");
        };
        String.prototype.wordReverse = function(){
            var word, _i, _len;
            var newMessageArray = [];
            var messageArray = message.split(" ");
            for (_i = 0, _len = messageArray.length; _i < _len; _i++) {
                word = messageArray[_i];
                newMessageArray[_i] = word.reverse();
            }
            return newMessageArray.join(" ");
        };
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
        var prefix = $("#log").val() === "" ? "" : "\n";
        $("#log").append(prefix + time + "  " + user + ": " + final_text);
        textScroll();
    });
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
        else {
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
    function textScroll(){
        var box = $("#log");
        var bottom = box[0].scrollHeight - box.height();
        var font = box.css('font-size');
        var size = parseInt(font.substr(0, font.length - 2));
        box.scrollTop(bottom - size);
        box.animate({'scrollTop': bottom}, 'fast');
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
};
