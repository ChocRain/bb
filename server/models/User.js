/**
 * A user.
 */
define([
    "underscore",
    "shared/models/roles",
    "shared/models/PublicUser",
    "shared/exceptions/UnsupportedOperationException",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    roles,
    PublicUser,
    UnsupportedOperationException,
    IllegalArgumentException
) {
    "use strict";

    var User = function (nick, role) {
        this._nick = nick;
        this._role = role;
    };

    User.fromJSON = function (json) {
        if (!_.isObject(json)) {
            throw new IllegalArgumentException("JSON object expected: " + json);
        }

        var nick = json.nick;

        if (!_.isString(nick)) {
            throw new IllegalArgumentException("Invalid or missing field nick: " + json);
        }

        var role = roles.fromString(json.role);

        return new User(nick, role);
    };

    User.prototype.toJSON = function () {
        throw new UnsupportedOperationException("Preventing to leak data. Use PublicUser instead.");
    };

    User.prototype.toPublicUser = function () {
        return PublicUser.fromJSON({
            nick: this._nick,
            role: this._role.toJSON()
        });
    };

    User.prototype.getNick = function () {
        return this._nick;
    };

    User.prototype.getRole = function () {
        return this._role;
    };

    return User;
});

