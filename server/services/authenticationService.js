/**
 * Service for user authentication.
 */
define([
    "server/session/sessionStore",
    "server/services/userService",
    "server/utils/persona",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/ProtocolException"
], function (
    sessionStore,
    userService,
    persona,
    FeedbackException,
    ProtocolException
) {
    "use strict";

    var AuthenticationService = function () {
    };

    AuthenticationService.prototype.login = function (session, assertion, callback) {
        persona.verify(assertion, function (email) {
            var user = userService.findByEmail(email);

            if (!user) {
                throw new FeedbackException("There is no user for your account. Please register one.");
            }

            this._doLogin(session, user, callback);
        }.bind(this));
    };

    AuthenticationService.prototype.register = function (session, assertion, nick, callback) {
        persona.verify(assertion, function (email) {
            if (userService.findByEmail(email)) {
                throw new FeedbackException("You already have registered an account.");
            }

            if (userService.findByNick(nick)) {
                throw new FeedbackException("A user with that name already exists.");
            }

            var user = userService.create(email, nick);

            this._doLogin(session, user, callback);
        }.bind(this));
    };

    AuthenticationService.prototype._doLogin = function (session, user, callback) {
        var nick = user.getNick();

        if (this.isLoggedIn(nick)) {
            throw new FeedbackException("A user with that name is already logged in.");
        }

        if (session.isLoggedIn()) {
            throw new ProtocolException("Cannot login twice.");
        }

        session.set({
            nick: nick,
            loggedIn: true
        });

        callback();
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

