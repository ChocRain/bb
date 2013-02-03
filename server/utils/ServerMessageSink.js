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

/*
    ServerMessageSink.prototype.sendChatMessage = function (text) {
        messageDispatcher.send("client.chat.message", {
            text: text
        });
    };
*/

    return ServerMessageSink;
});

