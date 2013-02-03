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
        /**
         * Send a message to request being logged in.
         */
        sendLogin: function (nick) {
            messageDispatcher.send("client.user.login", {
                nick: nick
            });
        },

        /**
         * Request the current list of rooms.
         */
        sendGetRooms: function () {
            messageDispatcher.send("client.room.list", {});
        },

        /**
         * Send a message requesting to join a room.
         */
        sendJoinRoom: function (roomName) {
            messageDispatcher.send("client.room.join", {
                room: roomName
            });
        },

        /**
         * Send a chat message to a room.
         */
        sendChatMessage: function (text) {
            messageDispatcher.send("client.room.message", {
                room: "ponyverse", // TODO: Proper room handling...
                text: text
            });
        }
    };

    return clientMessageSink;
});

