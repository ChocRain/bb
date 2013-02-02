/**
 * Dispatcher for messaging via a socket.
 */
define([
    "underscore",
    "moment",
    "shared/utils/AbstractMessageDispatcher"
], function (
    _,
    moment,
    AbstractMessageDispatcher
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
                throw new Error(
                    "Invalid session id: actual = " + actualSessionId + ", expected = " + expectedSessionId
                );
            }

            AbstractMessageDispatcher.handleMessage.call(this, message);
        }
    });

    return ServerMessageDispatcher;
});

