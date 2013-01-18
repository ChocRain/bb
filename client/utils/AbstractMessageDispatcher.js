/**
 * Abstract base class for message dispatchers.
 */
define([
    "underscore",
    "moment",
    "utils/Socket"
], function (
    _,
    moment,
    Socket
) {
    "use strict";

    var AbstractMessageDispatcher = {
        _initialize: function () {
            this._sessionId = null;

            this.messageHandlers = null;
            this.connectedHandler = null;
            this.disconnectedHandler = null;

            // initialize socket
            this._socket = new Socket({
                connected: this.connected.bind(this),
                disconnected: this.disconnected.bind(this),
                message: this._handleMessage.bind(this)
           });
        },

        // sending messages

        send: function (type, payload) {
            var message = {
                type: type,
                payload: payload
            };

            if (this._sessionId) {
                message.sessionId = this._sessionId;
            }

            this._socket.send(message);
        },

        // receiving messages

        connected: function () {
            if (!_.isFunction(this.connectedHandler)) {
                throw new Error("Set connected handler in concrete message dispatcher!");
            }

            this.connectedHandler();
        },

        disconnected: function () {
            if (!_.isFunction(this.disconnectedHandler)) {
                throw new Error("Set disconnected handler in concrete message dispatcher!");
            }

            this.disconnectedHandler();
        },

        _handleMessage: function (message) {
            var type = message.type;

            if (!_.isString(type)) {
                throw new Error("Malformed message type: " + JSON.stringify(message));
            }

            var payload = message.payload;

            if (!_.isObject(payload)) {
                throw new Error("Invalid payload: " + JSON.stringify(message));
            }

            var timestamp = message.timestamp;
            var date = moment(timestamp);

            if (!_.isNumber(timestamp) || !date.isValid()) {
                throw new Error("Invalid timestamp: "+ JSON.stringify(message));
            }

            var sessionId = message.sessionId || null;

            if (!(_.isNull(sessionId) || _.isString(sessionId))) {
                throw new Error("Invalid sessionId: " + JSON.stringify(message));
            }

            this._sessionId = sessionId;

            if (!_.isObject(this.messageHandlers)) {
                throw new Error("Add object messageHandlers in concrete message dispatcher!");
            }

            var handler = this.messageHandlers[type];

            if (!_.isFunction(handler)) {
                throw new Error("No or invalid handler for message type: " + type);
            }

            handler(payload, date);
        }
    };

    return AbstractMessageDispatcher;
});

