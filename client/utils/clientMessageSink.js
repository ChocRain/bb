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
         * Send a message to remind the specified user of the specified rule.
         */
        sendRule: function (rule, nick) {
            messageDispatcher.send("client.moderation.rule", {
                rule: rule,
                nick: nick
            });
        },

        /**
         * Send a message to remind the specified user of the rules.
         */
        sendRules: function (nick) {
            messageDispatcher.send("client.moderation.rules", {
                nick: nick
            });
        },

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
         * Send a message to request being logged out.
         */
        sendLogout: function () {
            messageDispatcher.send("client.user.logout", {});
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
         * Send a message to add an user to the ignore list.
         */
        sendIgnore: function (nick) {
            messageDispatcher.send("client.user.ignore", {
                nick: nick
            });
        },

        /**
         * Send a message to remove an user from the ignore list.
         */
        sendUnignore: function (nick) {
            messageDispatcher.send("client.user.unignore", {
                nick: nick
            });
        },

        /**
         * Send a message to update the user status.
         */
        sendUpdateStatus: function (status) {
            messageDispatcher.send("client.user.status", {
                status: status
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
        },

        /**
         * Send a message to notify the server about movement of the user.
         */
        sendMoved: function (position) {
            messageDispatcher.send("client.room.move", {
                room: "ponyverse", // TODO: Proper room handling...
                position: position
            });
        },

        /**
         * Send a message to notify the server about an avatar change.
         */
        sendAvatarChanged: function (avatar) {
            messageDispatcher.send("client.room.avatarChange", {
                room: "ponyverse", // TODO: Proper room handling...
                avatar: avatar
            });
        }
    };

    return clientMessageSink;
});

