/**
 * Sink for sending messages via the socket.
 */
define([
    "utils/clientMessageDispatcher"
], function (
    messageDispatcher
) {
    "use strict";

    var clientMessageSink = {
        sendLogin: function (nick) {
            messageDispatcher.send("client.user.login", {
                nick: nick
            });
        },

        sendChatMessage: function (text) {
            messageDispatcher.send("client.chat.message", {
                text: text
            });
        }
    };

    return clientMessageSink;
});

