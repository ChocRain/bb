/**
 * Helper for socket.io.
 */
define([
    "underscore",
    "socketio",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/ProtocolException"
], function (
    _,
    io,
    IllegalArgumentException,
    ProtocolException
) {
    "use strict";

    var Socket = function (opts) {
        if (!opts || !opts.connected || !opts.disconnected || !opts.message) {
            throw new IllegalArgumentException("Please configure the socket.");
        }

        this._socket = io.connect("", {reconnect: false});

        this._socket.on('connect', opts.connected);
        this._socket.on('disconnect', opts.disconnected);

        this._socket.on('message', function (messageStr) {
            var message = JSON.parse(messageStr);

            if (!_.isObject(message)) {
                throw new ProtocolException("Malformed message received: " + messageStr);
            }

            opts.message(message);
        }.bind(this));
    };

    /**
     * Send a message.
     */
    Socket.prototype.send = function (message) {
        this._socket.emit("message", JSON.stringify(message));
    };

    return Socket;
});

