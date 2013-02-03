/**
 * Dispatcher for messaging via a socket. Singleton as we need exactly one.
 */
define([
    "underscore",
    "shared/utils/AbstractMessageDispatcher",
    "utils/Socket",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/ProtocolException"
], function (
    _,
    AbstractMessageDispatcher,
    Socket,
    IllegalArgumentException,
    ProtocolException
) {
    "use strict";

    var ClientMessageDispatcher = function () {
        // initialize message dispatcher
        this._initialize(true);
    };

    _.extend(ClientMessageDispatcher.prototype, AbstractMessageDispatcher, {
        _sessionId: null,

        initSocket: function (handlers) {
            if (!_.isFunction(handlers.connected)
                    || !_.isFunction(handlers.disconnected)
                    || !_.isObject(handlers.messageHandlers)) {
                throw new IllegalArgumentException("Message handlers not initialize properly!");
            }

            this.setMessageHandlers(handlers.messageHandlers);

            // initialize socket
            this.setSocket(new Socket({
                connected: _.once(handlers.connected),
                disconnected: _.once(handlers.disconnected),
                message: this.handleMessage.bind(this)
            }));
        },

        handleMessage: function (message) {
            var sessionId = message.sessionId || null;

            if (!(_.isNull(sessionId) || _.isString(sessionId))) {
                throw new ProtocolException("Invalid sessionId: " + JSON.stringify(message));
            }

            this._sessionId = sessionId || this._sessionId;

            AbstractMessageDispatcher.handleMessage.call(this, message);
        },

        send: function (type, payload) {
            AbstractMessageDispatcher.send.call(this, type, payload, this._sessionId);
        }
    });

    return new ClientMessageDispatcher();
});

