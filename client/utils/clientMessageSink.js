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
         * Send a message to kick the specified user.
         */
        sendKick: function (nick) {
            messageDispatcher.send("client.moderation.kick", {
                nick: nick
            });
        },

        /**
         * Send a message to ban the specified user.
         */
        sendBan: function (nick) {
            messageDispatcher.send("client.moderation.ban", {
                nick: nick
            });
        },

        /**
         * Send a message to unban the specified user.
         */
        sendUnban: function (nick) {
            messageDispatcher.send("client.moderation.unban", {
                nick: nick
            });
        },

        /**
         * Send a message to request being logged in.
         */
        sendLogin: function (assertion) {
            messageDispatcher.send("client.user.login", {
                assertion: assertion
            });
        },

        /**
         * Send a message to request being registered.
         */
        sendRegister: function (nick, assertion) {
            messageDispatcher.send("client.user.register", {
                nick: nick,
                assertion: assertion
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

