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

    var User = function (id, nick, role, emailHash, isBanned) {
        this._id = id;
        this._nick = nick;
        this._role = role;
        this._emaiHash = emailHash;
        this._isBanned = !!isBanned;
    };

    User.fromJSON = function (json) {
        if (!_.isObject(json)) {
            throw new IllegalArgumentException("JSON object expected: " + JSON.stringify(json));
        }

        var id = json._id;

        if (!id) {
            throw new IllegalArgumentException("Invalid or missing user id: " + JSON.stringify(json));
        }

        var nick = json.nick;

        if (!_.isString(nick)) {
            throw new IllegalArgumentException("Invalid or missing field nick: " + JSON.stringify(json));
        }

        var role = roles.fromString(json.role);

        var emailHash = json.email;

        if (!_.isString(emailHash)) {
            throw new IllegalArgumentException("Invalid or missing field emailHash: " + JSON.stringify(json));
        }

        var isBanned = json.isBanned;

        return new User(id, nick, role, emailHash, isBanned);
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

    User.prototype.getId = function () {
        return this._id;
    };

    User.prototype.getNick = function () {
        return this._nick;
    };

    User.prototype.getRole = function () {
        return this._role;
    };

    User.prototype.getEmailHash = function () {
        return this._emaiHash;
    };

    User.prototype.isBanned = function () {
        return this._isBanned;
    };

    return User;
});

