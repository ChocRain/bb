/**
 * Helper for socket.io.
 */
define([
    "underscore",
    "socketio"
],
function (
    _,
    io
) {
    "use strict";

    var Socket = function (opts) {
        if (!opts || !opts.connected || !opts.disconnected || !opts.message) {
            throw new Error("Please configure the socket.");
        };

        this._socket = io.connect();
        this._sessionId = null;

        this._socket.on('connect', opts.connected);
        this._socket.on('disconnect', opts.disconnected);

        this._socket.on('message', function(messageStr) {
            var message = JSON.parse(messageStr);

            if (!_.isObject(message)) {
                throw new Error("Malformed message received: " + messageStr);
            }

            var type = message.type;
            var payload = message.payload;

            if (!_.isString(type)) {
                throw new Error("Malformed message type: " + messageStr);
            }

            if (!_.isObject(payload)) {
                throw new Error("Invalid payload: " + messageStr);
            }

            this._sessionId = message.sessionId || null;

            if (_.isNull(this._sessionId) || !_.isString(this._sessionId)) {
                throw new Error("Invalid sessionId: " + messageStr);
            }

            opts.message(type, payload);
        }.bind(this));
    };

    /**
     * Send a message.
     */
    Socket.prototype.send = function (type, payload) {
        var message = {
            type: type,
            payload: payload
        };

        if (this._sessionId) {
            message.sessionId = this._sessionId;
        }

        this._socket.emit("message", JSON.stringify(message));
    };

    return Socket;
});

