/**
 * A member of a room.
 */
define([
    "underscore",
    "shared/models/PublicUser",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    PublicUser,
    IllegalArgumentException
) {
    "use strict";

    var RoomMember = function (publicUser, position) {
        this._user = publicUser;
        this._position = position;
    };

    RoomMember.fromJSON = function (json) {
        if (!_.isObject(json)) {
            throw new IllegalArgumentException("JSON object expected: " + JSON.stringify(json));
        }

        var publicUser = PublicUser.fromJSON(json.user);
        var position = json.position;

        if (position && !_.isObject(position)) {
            throw new IllegalArgumentException("Invalid position: " + JSON.stringify(json));
        }

        return new RoomMember(publicUser, position);
    };

    RoomMember.prototype.toJSON = function () {
        return {
            user: this._user.toJSON(),
            position: this._position
        };
    };

    RoomMember.prototype.getUser = function () {
        return this._user;
    };

    RoomMember.prototype.getNick = function () {
        return this._user.getNick();
    };

    RoomMember.prototype.setPosition = function (position) {
        if (position && _.isObject(position)) {
            throw new IllegalArgumentException("Invalid position: " + JSON.stringify(position));
        }

        this._position = position;
    };

    RoomMember.prototype.getPosition = function () {
        return this._position;
    };

    return RoomMember;
});

