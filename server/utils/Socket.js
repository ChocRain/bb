/**
 * A socket for the server side connection of one client to the server.
 */
define([
    "underscore",
    "shared/exceptions/IllegalStateException",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/ProtocolException"
], function (
    _,
    IllegalStateException,
    IllegalArgumentException,
    ProtocolException
) {
    "use strict";

    var Socket = function (socket) {
        this._socket = socket;
        this._disconnectHandler = null;
        this._messageHandler = null;

        socket.on("disconnect", this._handleDisconnect.bind(this));
        socket.on("message", this._handleMessage.bind(this));
    };

    Socket.prototype.disconnect = function () {
        this._socket.disconnect();
    };

    Socket.prototype.send = function (message) {
        this._socket.emit("message", JSON.stringify(message));
    };

    Socket.prototype._handleDisconnect = function () {
        if (!_.isFunction(this._disconnectHandler)) {
            throw new IllegalStateException("Disconnect handler isn't set!");
        }

        this._disconnectHandler();
    };

    Socket.prototype.setDisconnectHandler = function (disconnectHandler) {
        if (!_.isFunction(disconnectHandler)) {
            throw new IllegalArgumentException("Disconnect handler isn't a function: " + disconnectHandler);
        }

        this._disconnectHandler = disconnectHandler;
    };

    Socket.prototype._handleMessage = function (messageStr) {
        if (!_.isFunction(this._messageHandler)) {
            throw new IllegalStateException("Message handler isn't set!");
        }

        var message = JSON.parse(messageStr);

        if (!_.isObject(message)) {
            throw new ProtocolException("Malformed message received: " + messageStr);
        }

        this._messageHandler(message);
    };

    Socket.prototype.setMessageHandler = function (messageHandler) {
        if (!_.isFunction(messageHandler)) {
            throw new IllegalArgumentException("Message handler isn't a function: " + messageHandler);
        }

        this._messageHandler = messageHandler;
    };

    return Socket;
});

