/**
 * Service for handling user data.
 */
define([
    "underscore",
    "server/models/User",
    "server/daos/userDao",
    "shared/models/roles",
    "shared/exceptions/CommandException",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    User,
    userDao,
    roles,
    CommandException,
    IllegalArgumentException
) {
    "use strict";

    var UserService = function () {
    };

    UserService.prototype.findByEmail = function (email, callback) {
        userDao.findByEmail(email, callback);
    };

    UserService.prototype.findByNick = function (nick, callback) {
        userDao.findByNick(nick, callback);
    };

    UserService.prototype.create = function (email, nick, callback) {
        this.findByEmail(email, function (err, userByEmail) {
            if (err) {
                return callback(err);
            }

            if (userByEmail) {
                return callback(new IllegalArgumentException(
                    "User with email address already exists:" + email
                ));
            }

            this.findByNick(nick, function (err, userByNick) {
                if (err) {
                    return callback(err);
                }

                if (userByNick) {
                    return callback(new IllegalArgumentException(
                        "User with nick already exists:" + nick
                    ));
                }

                userDao.create(email, nick, roles.USER, callback);
            }.bind(this));
        }.bind(this));
    };

    UserService.prototype.ignoreUser = function (session, nick, callback) {
        if (nick.toLowerCase() === session.getUser().getNick().toLowerCase()) {
            return callback(new CommandException(
                "You cannot ignore yourself."
            ));
        }

        this.findByNick(nick, function (err, user) {
            if (err) {
                return callback(err);
            }

            if (!user) {
                return callback(new CommandException(
                    "Cannot ignore the user, because the user doesn't exist: " + nick
                ));
            }

            var nickToIgnore = user.getNick();

            if (session.isIgnored(nickToIgnore)) {
                return callback(new CommandException(
                    "You are ignoring the user already: " + nickToIgnore
                ));
            }
            session.ignore(nickToIgnore);

            callback(null, nickToIgnore);
        });
    };

    UserService.prototype.unignoreUser = function (session, nick, callback) {
        if (nick.toLowerCase() === session.getUser().getNick().toLowerCase()) {
            return callback(new CommandException(
                "You cannot ignore yourself."
            ));
        }

        this.findByNick(nick, function (err, user) {
            if (err) {
                return callback(err);
            }

            if (!user) {
                return callback(new CommandException(
                    "Cannot stop ignoring the user, because the user doesn't exist: " + nick
                ));
            }

            var nickToUnignore = user.getNick();

            if (!session.isIgnored(nickToUnignore)) {
                return callback(new CommandException("You aren't ignoring the user: " + nickToUnignore));
            }
            session.unignore(nickToUnignore);

            callback(null, nickToUnignore);
        });
    };

    return new UserService();
});

