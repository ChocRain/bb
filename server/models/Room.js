/**
 * A chat room.
 */
define([
    "underscore"
], function (
    _
) {
    "use strict";

    var Room = function (name, width, height) {
        this._name = name;
        this._width = width;
        this._height = height;
        this._members = {}; // map being true-ish for each member being in the room
    };

    Room.prototype.isMember = function (nick) {
        return !!this._members[nick];
    };

    Room.prototype.getName = function () {
        return this._name;
    };

    Room.prototype.getWidth = function () {
        return this._width;
    };

    Room.prototype.getHeight = function () {
        return this._height;
    };

    Room.prototype.join = function (nick) {
        this._members[nick] = true;
    };

    Room.prototype.leave = function (nick) {
        delete this._members[nick];
    };

    Room.prototype.getMembers = function () {
        return _.keys(this._members);
    };

    return Room;
});

