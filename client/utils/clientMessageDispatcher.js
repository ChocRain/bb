/**
 * Dispatcher for messaging via a socket. Singleton as we need exactly one.
 */
define([
    "underscore",
    "utils/AbstractMessageDispatcher"
], function (
    _,
    AbstractMessageDispatcher
) {
    "use strict";

    var ClientMessageDispatcher = function () {
        // initialize message dispatcher
        this._initialize();
    };

    _.extend(ClientMessageDispatcher.prototype, AbstractMessageDispatcher);

    return new ClientMessageDispatcher();
});

