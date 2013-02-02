/**
 * Abstract base class for message dispatchers.
 */
define([
    "underscore",
    "moment"
], function (
    _,
    moment
) {
    "use strict";

    var AbstractMessageDispatcher = {
        _initialize: function (timestampRequired, opt_socket) {
            this._timestampRequired = timestampRequired;
            this._socket = opt_socket || null;
            this._messageHandlers = null;
        },

        setSocket: function (socket) {
            if (this._socket) {
                throw new Error("Already have a socket set.");
            }

            this._socket = socket;
        },

        getSocket: function () {
            return this._socket;
        },

        setMessageHandlers: function (messageHandlers) {
            if (this._messageHandlers) {
                throw new Error("Already have message handlers set.");
            }

            if (!_.isObject(messageHandlers)) {
                throw new Error("Not an object: messageHandlers.");
            }

            this._messageHandlers = messageHandlers;
        },

        // sending messages

        send: function (type, payload, opt_sessionId, opt_timestamp) {
            var message = {
                type: type,
                payload: payload
            };

            if (opt_sessionId) {
                message.sessionId = opt_sessionId;
            }

            if (opt_timestamp) {
                message.timestamp = opt_timestamp;
            }

            this._socket.send(message);
        },

        // receiving messages
        handleMessage: function (message) {
            var type = message.type;

            if (!_.isString(type)) {
                throw new Error("Malformed message type: type = " + type + ", message = " + JSON.stringify(message));
            }

            var payload = message.payload;

            if (!_.isObject(payload)) {
                throw new Error("Invalid payload: " + JSON.stringify(message));
            }

            var date = null;

            if (this._timestampRequired) {
                var timestamp = message.timestamp;
                date = moment(timestamp);

                if (!_.isNumber(timestamp) || !date.isValid()) {
                    throw new Error("Invalid timestamp: " + JSON.stringify(message));
                }
            }

            if (!_.isObject(this._messageHandlers)) {
                throw new Error("Add object messageHandlers in concrete message dispatcher!");
            }

            var handler = this._messageHandlers[type];

            if (!_.isFunction(handler)) {
                throw new Error("No or invalid handler for message type: " + type);
            }

            handler(payload, date);
        }
    };

    return AbstractMessageDispatcher;
});

