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

    var RoomMember = function (publicUser, position, avatar) {
        if (!(publicUser instanceof PublicUser)) {
            throw new IllegalArgumentException("Not a PublicUser: " + JSON.stringify(publicUser));
        }

        if (!_.isObject(position)) {
            throw new IllegalArgumentException("Invalid position: " + JSON.stringify(position));
        }

        if (!_.isString(avatar) || avatar === "") {
            throw new IllegalArgumentException("Invalid avatar: " + JSON.stringify(avatar));
        }

        this._user = publicUser;
        this._position = position;
        this._avatar = avatar;
    };

    RoomMember.fromJSON = function (json) {
        if (!_.isObject(json)) {
            throw new IllegalArgumentException("JSON object expected: " + JSON.stringify(json));
        }

        var publicUser = PublicUser.fromJSON(json.user);
        var position = json.position;
        var avatar = json.avatar;

        return new RoomMember(publicUser, position, avatar);
    };

    RoomMember.prototype.toJSON = function () {
        return {
            user: this._user.toJSON(),
            position: this._position,
            avatar: this._avatar
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

    RoomMember.prototype.getAvatar = function () {
        return this._avatar;
    };

    return RoomMember;
});

