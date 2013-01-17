/**
 * Abstract base class for message dispatchers.
 */
define([
    "underscore",
    "util/Socket"
], function (
    _,
    Socket
) {
    "use strict";

    var AbstractMessageDispatcher = {
        _initialize: function () {
            // initialize socket
            this._socket = new Socket({
                connected: this.connected.bind(this),
                disconnected: this.disconnected.bind(this),
                message: this._handleMessage.bind(this)
           });
        },

        // sending messages

        _send: function (type, payload) {
            this._socket.send(type, payload);
        },

        // receiving messages

        connected: function () {
            throw new Error("Implement connected in concrete message dispatcher!");
        },

        disconnected: function () {
            throw new Error("Implement disconnected in concrete message dispatcher!");
        },

        _handleMessage: function (type, payload) {
            if (!_.isObject(this.messageHandlers)) {
                throw new Error("Add object messageHandlers in concrete message dispatcher!");
            }

            var handler = this.messageHandlers[type];

            if (!_.isFunction(handler)) {
                throw new Error("No or invalid handler for message type: " + type);
            }

            handler(payload);
        }
    };

    return AbstractMessageDispatcher;
});
