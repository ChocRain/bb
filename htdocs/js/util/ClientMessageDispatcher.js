/**
 * Dispatcher for messaging via a socket.
 */
define([
    "util/Socket"
], function (
    Socket
) {
    "use strict";

    var ClientMessageDispatcher = function () {
        // initialize socket
        this._socket = new Socket({
            connected: function () {
                $('#incomingChatMessages').append($('<li>Connected</li>'));
            }.bind(this),

            disconnected: function() {
                $('#incomingChatMessages').append('<li>Disconnected</li>');
            }.bind(this),

            message: function (type, payload) {
                // TODO: Clean up
                var li = $('<li></li>');

                switch (type) {
                    case "server.user.entered":
                        var nick = payload.nick;
                        li.append($('<span class="nick"></span>').text("[" + nick + "]"));
                        li.append($('<span class="action"></span>').text("Entered the chat..."));
                        $('#incomingChatMessages').append(li);
                    break;
                    case "server.chat.message":
                        var nick = payload.nick;
                        var text = payload.text;

                        li.append($('<span class="nick"></span>').text("[" + nick + "]"));
                        li.append($('<span class="text"></span>').text(text));
                        $('#incomingChatMessages').append(li);
                    break;
                }
            }.bind(this)
        });
    };

    // sending messages

    ClientMessageDispatcher.prototype.sendUserEnter = function (nick) {
        this._socket.send("client.user.enter", {
            nick: nick
        });
    };

    ClientMessageDispatcher.prototype.sendChatMessage = function (text) {
        this._socket.send("client.chat.message", {
            text: text
        });
    };

    return ClientMessageDispatcher;
});

