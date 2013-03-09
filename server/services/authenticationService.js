/**
 * Service for user authentication.
 */
define([
    "server/session/sessionStore",
    "server/services/userService",
    "server/services/roomService",
    "server/utils/persona",
    "server/utils/nickFilter",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/ProtocolException",
    "server/config",
], function (
    sessionStore,
    userService,
    roomService,
    persona,
    nickFilter,
    FeedbackException,
    ProtocolException,
    config
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

                this._login(session, user, callback);
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
                        return callback(new FeedbackException("A user with that name already exists: " + nick));
                    }

                    if (!nickFilter.isAllowed(nick)) {
                        return callback(new FeedbackException("That nickname is not allowed: " + nick));
                    }

                    userService.create(email, nick, function (err, user) {
                        if (err) {
                            return callback(err);
                        }

                        this._login(session, user, callback);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    AuthenticationService.prototype._login = function (session, user, callback) {
        if (user.isBanned()) {
            return callback(new FeedbackException("You cannot login, because you have been banned."));
        }

        var nick = user.getNick();

        this.isLoggedIn(nick, function (err, nickIsLoggedIn, loggedInSession) {
            if (err) {
                return callback(err);
            }

            var doLogin = function () {
                if (session.isLoggedIn()) {
                    return callback(new ProtocolException("Cannot login twice."));
                }

                session.set({
                    user: user,
                    loggedIn: true
                });

                return callback(null, user);
            }.bind(this);

            if (nickIsLoggedIn) {
                if (config.session.replaceSessionOnRelogin) {
                    return this.logout(loggedInSession, function (err) {
                        if (err) {
                            return callback(err);
                        }

                        doLogin();
                    }.bind(this));
                }
                return callback(new FeedbackException("A user with that name is already logged in: " + nick));
            }

            return doLogin(null);
        }.bind(this));
    };

    AuthenticationService.prototype.logout = function (session, callback) {
        var socket = session.get("socket");

        var doLogout = function (err) {
            // always invalidate the session, even in case of an error
            session.invalidate();

            if (socket) {
                socket.disconnect();
            }

            return callback(err);
        }.bind(this);

        if (session.isLoggedIn()) {
            roomService.leaveAllRooms(session, doLogout);
        } else {
            doLogout(null);
        }
    };

    AuthenticationService.prototype.isLoggedIn = function (nick, callback) {
        sessionStore.findByNick(nick, function (err, session) {
            if (err) {
                return callback(err);
            }

            if (!session) {
                return callback(null, false);
            }

            var isLoggedIn = session.isLoggedIn();

            return callback(null, isLoggedIn, isLoggedIn ? session : null);
        }.bind(this));
    };

    return new AuthenticationService();
});

