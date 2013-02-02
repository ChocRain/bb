/**
 * Service for user authentication.
 */
define([
    "server/session/sessionStore"
], function (
    sessionStore
) {
    "use strict";

    var AuthenticationService = function () {
    };

    AuthenticationService.prototype.login = function (session, nick) {
        // TODO: Check credentials.

        if (this.isLoggedIn(nick)) {
            throw new Error("A user with that name is already logged in.");
        }

        if (session.isLoggedIn()) {
            throw new Error("Cannot login twice.");
        }

        session.set({
            nick: nick,
            loggedIn: true
        });
    };

    AuthenticationService.prototype.logout = function (session) {
        session.invalidate();
    };

    AuthenticationService.prototype.isLoggedIn = function (nick) {
        var session = sessionStore.findByNick(nick);

        if (!session) {
            return false;
        }

        return session.isLoggedIn();
    };

    return new AuthenticationService();
});

