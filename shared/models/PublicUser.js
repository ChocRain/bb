/**
 * A public user that may be shared with the client.
 */
define([
    "underscore",
    "shared/models/roles",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    roles,
    IllegalArgumentException
) {
    "use strict";

    var PublicUser = function (nick, role) {
        this._nick = nick;
        this._role = role;
    };

    PublicUser.fromJSON = function (json) {
        if (!_.isObject(json)) {
            throw new IllegalArgumentException("JSON object expected: " + JSON.stringify(json));
        }

        var nick = json.nick;

        if (!_.isString(nick)) {
            throw new IllegalArgumentException("Invalid or missing field nick: " + JSON.stringify(json));
        }

        var role = roles.fromString(json.role);

        return new PublicUser(nick, role);
    };

    PublicUser.prototype.toJSON = function () {
        return {
            nick: this._nick,
            role: this._role.toJSON()
        };
    };

    PublicUser.prototype.getNick = function () {
        return this._nick;
    };

    PublicUser.prototype.getRole = function () {
        return this._role;
    };

    return PublicUser;
});

