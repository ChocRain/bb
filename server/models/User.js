/**
 * A user.
 */
define([
    "shared/exceptions/UnsupportedOperationException"
], function (
    UnsupportedOperationException
) {
    "use strict";

    var User = function (nick) {
        this._nick = nick;
    };

    User.prototype.toJson = function () {
        throw new UnsupportedOperationException("Preventing to leak data. Use PublicUser instead.");
    };

    User.prototype.getNick = function () {
        return this._nick;
    };

    return User;
});

