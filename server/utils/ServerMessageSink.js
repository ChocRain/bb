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

    ServerMessageSink.prototype.sendFeedback = function (feedbackMessage) {
        this._messageDispatcher.send("server.error.feedback", {
            message: feedbackMessage
        });
    };

    ServerMessageSink.prototype.sendProtocolError = function (errorMessage) {
        this._messageDispatcher.send("server.error.protocol", {
            message: errorMessage
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
    ServerMessageSink.prototype.sendLoggedIn = function () {
        this._messageDispatcher.send("server.session.loggedIn", {});
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
    ServerMessageSink.prototype.sendUserJoinedRoom = function (roomName, nick) {
        this._messageDispatcher.send("server.room.joined", {
            room: roomName,
            nick: nick
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
     * Send a chat message to a member of the room.
     */
    ServerMessageSink.prototype.sendRoomMessage = function (roomName, nick, text) {
        this._messageDispatcher.send("server.room.message", {
            room: roomName,
            nick: nick,
            text: text
        });
    };

    return ServerMessageSink;
});

