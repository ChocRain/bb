/**
 * Dispatcher for messaging via a socket.
 */
define([
    "underscore",
    "moment",
    "shared/utils/AbstractMessageDispatcher",
    "shared/exceptions/ProtocolException"
], function (
    _,
    moment,
    AbstractMessageDispatcher,
    ProtocolException
) {
    "use strict";

    var ServerMessageDispatcher = function (session, socket) {
        // kind of super constructor call
        this._initialize(false, socket);

        this._session = session;
    };

    _.extend(ServerMessageDispatcher.prototype, AbstractMessageDispatcher, {
        send: function (type, payload, opt_sessionId) {
            AbstractMessageDispatcher.send.call(
                this,
                type,
                payload,
                opt_sessionId,
                moment().valueOf()
            );
        },

        handleMessage: function (message) {
            var actualSessionId = message.sessionId;
            var expectedSessionId = this._session.getId();

            if (actualSessionId !== expectedSessionId) {
                console.error(
                    "Invalid session id: actual = " + actualSessionId + ", expected = " + expectedSessionId
                );
                // within message domain
                // do not leak expected session id to the client here
                throw new ProtocolException("Invalid session id: " + actualSessionId);
            }

            AbstractMessageDispatcher.handleMessage.call(this, message);
        }
    });

    return ServerMessageDispatcher;
});

