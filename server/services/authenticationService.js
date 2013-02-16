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
        persona.verify(assertion, function (err, email) {
            if (err) {
                return callback(err);
            }

            userService.findByEmail(email, function (err, user) {
                if (err) {
                    return callback(err);
                }

                if (!user) {
                    return callback(new FeedbackException(
                        "There is no user for your account. Please register one."
                    ));
                }

                this._doLogin(session, user, callback);
            }.bind(this));
        }.bind(this));
    };

    AuthenticationService.prototype.register = function (session, assertion, nick, callback) {
        persona.verify(assertion, function (err, email) {
            if (err) {
                return callback(err);
            }

            userService.findByEmail(email, function (err, userByEmail) {
                if (err) {
                    return callback(err);
                }

                if (userByEmail) {
                    return callback(new FeedbackException("You already have registered an account."));
                }

                userService.findByNick(nick, function (err, userByNick) {
                    if (err) {
                        return callback(err);
                    }

                    if (userByNick) {
                        console.log(userByNick);
                        return callback(new FeedbackException("A user with that name already exists: " + nick));
                    }

                    userService.create(email, nick, function (err, user) {
                        if (err) {
                            return callback(err);
                        }

                        this._doLogin(session, user, callback);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    AuthenticationService.prototype._doLogin = function (session, user, callback) {
        var nick = user.getNick();

        this.isLoggedIn(nick, function (err, nickIsLoggedIn) {
            if (err) {
                return callback(err);
            }

            if (nickIsLoggedIn) {
                return callback(new FeedbackException("A user with that name is already logged in: " + nick));
            }

            if (session.isLoggedIn()) {
                return callback(new ProtocolException("Cannot login twice."));
            }

            session.set({
                user: user,
                loggedIn: true
            });

            return callback(null, user);
        }.bind(this));
    };

    AuthenticationService.prototype.logout = function (session, callback) {
        session.invalidate();
        return callback(null);
    };

    AuthenticationService.prototype.isLoggedIn = function (nick, callback) {
        var session = sessionStore.findByNick(nick);

        if (!session) {
            return callback(null, false);
        }

        return callback(null, session.isLoggedIn());
    };

    return new AuthenticationService();
});

