/**
 * Sink for sending messages via the socket.
 */
define([
], function (
) {
    "use strict";

    var ServerMessageSink = function (messageDispatcher) {
        this._messageDispatcher = messageDispatcher;
    };

    /**
     * Sends a general feedback in case of an error.
     */
    ServerMessageSink.prototype.sendFeedback = function (feedbackMessage) {
        this._messageDispatcher.send("server.error.feedback", {
            message: feedbackMessage
        });
    };

    /**
     * Sends a message notifying about a command error.
     */
    ServerMessageSink.prototype.sendCommandError = function (errorMessage) {
        this._messageDispatcher.send("server.error.command", {
            message: errorMessage
        });
    };

    /**
     * Sends a message notifying about a protocol error.
     */
    ServerMessageSink.prototype.sendProtocolError = function (errorMessage) {
        this._messageDispatcher.send("server.error.protocol", {
            message: errorMessage
        });
    };

    /**
     * Sends a message notifying about a validation error.
     */
    ServerMessageSink.prototype.sendValidationError = function (
        errorMessage,
        constraintsName,
        validationResult
    ) {
        this._messageDispatcher.send("server.error.validation", {
            message: errorMessage,
            constraintsName: constraintsName,
            validationResult: validationResult
        });
    };

    /**
     * Send a message to remind the user of the specified rule.
     */
    ServerMessageSink.prototype.sendRule = function (rule) {
        this._messageDispatcher.send("server.moderation.rule", {
            rule: rule
        });
    };

    /**
     * Send once the user has been reminded of the rules.
     */
    ServerMessageSink.prototype.sendRemindedOfRule = function (rule, nick) {
        this._messageDispatcher.send("server.moderation.remindedOfRule", {
            rule: rule,
            nick: nick
        });
    };

    /**
     * Send a message to remind the user of the rules.
     */
    ServerMessageSink.prototype.sendRules = function () {
        this._messageDispatcher.send("server.moderation.rules", {});
    };

    /**
     * Send once the user has been reminded of the rules.
     */
    ServerMessageSink.prototype.sendRemindedOfRules = function (nick) {
        this._messageDispatcher.send("server.moderation.remindedOfRules", {
            nick: nick
        });
    };

    /**
     * Send once a user has been kicked.
     */
    ServerMessageSink.prototype.sendKicked = function (nick) {
        this._messageDispatcher.send("server.moderation.kicked", {
            nick: nick
        });
    };

    /**
     * Send once a user has been banned.
     */
    ServerMessageSink.prototype.sendBanned = function (nick) {
        this._messageDispatcher.send("server.moderation.banned", {
            nick: nick
        });
    };

    /**
     * Send once a user has been unbanned.
     */
    ServerMessageSink.prototype.sendUnbanned = function (nick) {
        this._messageDispatcher.send("server.moderation.unbanned", {
            nick: nick
        });
    };

    /**
     * Send once after connection is established to give the session id to the
     * client.
     */
    ServerMessageSink.prototype.sendSessionInitialized = function (sessionId) {
        this._messageDispatcher.send("server.session.initialized", {}, sessionId);
    };

    /**
     * Send to acknowledge successfull login.
     */
    ServerMessageSink.prototype.sendLoggedIn = function (publicUser) {
        this._messageDispatcher.send("server.session.loggedIn", {
            user: publicUser
        });
    };

    /**
     * Sends a list of all currently available rooms.
     */
    ServerMessageSink.prototype.sendRoomList = function (rooms) {
        this._messageDispatcher.send("server.room.list", {
            rooms: rooms
        });
    };

    /**
     * Send a message to inform about a user having joined a room.
     */
    ServerMessageSink.prototype.sendUserJoinedRoom = function (roomName, roomMember) {
        this._messageDispatcher.send("server.room.joined", {
            room: roomName,
            member: roomMember
        });
    };

    /**
     * Send a message to inform about a user having left a room.
     */
    ServerMessageSink.prototype.sendUserLeftRoom = function (roomName, nick) {
        this._messageDispatcher.send("server.room.left", {
            room: roomName,
            nick: nick
        });
    };

    /**
     * Send information about a room.
     */
    ServerMessageSink.prototype.sendRoomInfo = function (roomName, roomMembers) {
        this._messageDispatcher.send("server.room.info", {
            room: roomName,
            members: roomMembers
        });
    };

    /**
     * Send a chat message to a member of the room.
     */
    ServerMessageSink.prototype.sendRoomMessage = function (roomName, nick, text) {
        this._messageDispatcher.send("server.room.message", {
            room: roomName,
            nick: nick,
            text: text
        });
    };

    /**
     * Send a new position of a member in a room.
     */
    ServerMessageSink.prototype.sendMoved = function (roomName, nick, position) {
        this._messageDispatcher.send("server.room.moved", {
            room: roomName,
            nick: nick,
            position: position
        });
    };

    /**
     * Send a new avatar of a member in a room.
     */
    ServerMessageSink.prototype.sendAvatarChanged = function (roomName, nick, avatar) {
        this._messageDispatcher.send("server.room.avatarChanged", {
            room: roomName,
            nick: nick,
            avatar: avatar
        });
    };

    /**
     * Send the acknowledgement that the user with the given nick is now being ignored.
     */
    ServerMessageSink.prototype.sendIgnored = function (nick) {
        this._messageDispatcher.send("server.user.ignored", {
            nick: nick
        });
    };

    /**
     * Send the acknowledgement that the user with the given nick is no longer being ignored.
     */
    ServerMessageSink.prototype.sendUnignored = function (nick) {
        this._messageDispatcher.send("server.user.unignored", {
            nick: nick
        });
    };

    /**
     * Send a message notifying about a status update of an user.
     */
    ServerMessageSink.prototype.sendStatusUpdate = function (nick, status) {
        this._messageDispatcher.send("server.user.status", {
            nick: nick,
            status: status
        });
    };

    return ServerMessageSink;
});

