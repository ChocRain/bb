/**
 * A user.
 */
define([
    "underscore",
    "shared/exceptions/UnsupportedOperationException",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    UnsupportedOperationException,
    IllegalArgumentException
) {
    "use strict";

    var User = function (nick) {
        this._nick = nick;
    };

    User.fromJson = function (json) {
        if (!_.isObject(json)) {
            throw new IllegalArgumentException("JSON object expected.");
        }

        var nick = json.nick;

        if (!_.isString(nick)) {
            throw new IllegalArgumentException("Invalid or missing filed nick: " + json);
        }

        return new User(nick);
    };

    User.prototype.toJson = function () {
        throw new UnsupportedOperationException("Preventing to leak data. Use PublicUser instead.");
    };

    User.prototype.getNick = function () {
        return this._nick;
    };

    return User;
});

