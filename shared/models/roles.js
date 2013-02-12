/**
 * Role definitions.
 */
define([
    "underscore",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    IllegalArgumentException
) {
    "use strict";

    var Role = function (name) {
        this._name = name;
    };

    Role.prototype.getName = function () {
        return this._name;
    };

    Role.fromString = function (roleName) {
        if (!_.isString(roleName)) {
            throw new IllegalArgumentException("Role name must be a String: " + roleName);
        }

        return new Role(roleName);
    };

    Role.prototype.toJSON = function () {
        return this._name; // for now the role is only a string
    };

    return {
        USER: new Role("user"),
        MODERATOR: new Role("moderator"),

        fromString: Role.fromString
    };
});

