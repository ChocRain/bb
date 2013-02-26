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

    var PublicUser = function (nick, role, opt_position) {
        this._nick = nick;
        this._role = role;

        // TODO: Doesn't really belong into PublicUser. Perhaps PublicUser
        // should be PublicRoomMember instead.
        this._position = opt_position || {x: 400, y: 400, direction: "right"};
    };

    PublicUser.fromJSON = function (json) {
        if (!_.isObject(json)) {
            throw new IllegalArgumentException("JSON object expected: " + json);
        }

        var nick = json.nick;

        if (!_.isString(nick)) {
            throw new IllegalArgumentException("Invalid or missing field nick: " + json);
        }

        var role = roles.fromString(json.role);
        var position = json.position;

        return new PublicUser(nick, role, position);
    };

    PublicUser.prototype.toJSON = function () {
        return {
            nick: this._nick,
            role: this._role.toJSON(),
            position: this._position
        };
    };

    PublicUser.prototype.getNick = function () {
        return this._nick;
    };

    PublicUser.prototype.getRole = function () {
        return this._role;
    };

    PublicUser.prototype.setPosition = function (position) {
        this._position = position;
    };

    PublicUser.prototype.getPosition = function () {
        return this._position;
    };

    return PublicUser;
});

