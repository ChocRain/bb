/**
 * Service for handling user data.
 */
define([
    "server/models/User",
    "shared/exceptions/IllegalArgumentException"
], function (
    User,
    IllegalArgumentException
) {
    "use strict";

    // TODO: Add persistant storage

    var UserService = function () {
        this._byEmail = {};
        this._byNick = {};
    };

    UserService.prototype.findByEmail = function (email) {
        var user = this._byEmail[email];
        return user || null;
    };

    UserService.prototype.findByNick = function (nick) {
        var user = this._byNick[nick];
        return user || null;
    };

    UserService.prototype.create = function (email, nick) {
        if (this.findByEmail(email)) {
            throw new IllegalArgumentException("User with email address already exists:", email);
        }

        if (this.findByNick(nick)) {
            throw new IllegalArgumentException("User with nick already exists:", nick);
        }

        var user = new User(nick);

        this._byEmail[email] = user;
        this._byNick[nick] = user;

        return user;
    };

    return new UserService();
});

