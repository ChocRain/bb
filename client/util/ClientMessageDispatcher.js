/**
 * Dispatcher for messaging via a socket.
 */
define([
    "jquery",
    "util/AbstractMessageDispatcher"
], function (
    $,
    AbstractMessageDispatcher
) {
    "use strict";

    var ClientMessageDispatcher = function () {
        // initialize message dispatcher
        this._initialize();
   };

    ClientMessageDispatcher.prototype = AbstractMessageDispatcher;

    // sending messages

    ClientMessageDispatcher.prototype.sendUserEnter = function (nick) {
        this._send("client.user.enter", {
            nick: nick
        });
    };

    ClientMessageDispatcher.prototype.sendChatMessage = function (text) {
        this._send("client.chat.message", {
            text: text
        });
    };

    // receiving messages

    // override
    ClientMessageDispatcher.prototype.connected = function () {
        $("#incomingChatMessages").append($("<li>Connected</li>"));
    };

    // override
    ClientMessageDispatcher.prototype.disconnected = function() {
        $("#incomingChatMessages").append("<li>Disconnected</li>");
    };

    // implement
    ClientMessageDispatcher.prototype.messageHandlers = {
        "server.user.entered": function (payload) {
            var li = $("<li></li>");
            var nick = payload.nick;
            li.append($("<span class=\"nick\"></span>").text("[" + nick + "]"));
            li.append($("<span class=\"action\"></span>").text("Entered the chat..."));
            $("#incomingChatMessages").append(li);
        }.bind(this),

        "server.chat.message": function (payload) {
            var nick = payload.nick;
            var text = payload.text;

            var li = $("<li></li>");
            li.append($("<span class=\"nick\"></span>").text("[" + nick + "]"));
            li.append($("<span class=\"text\"></span>").text(text));
            $("#incomingChatMessages").append(li);
        }.bind(this)
    };

    return ClientMessageDispatcher;
});

