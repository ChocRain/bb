/**
 * Service for handling user data.
 */
define([
    "underscore",
    "server/models/User",
    "server/services/roomService",
    "server/daos/userDao",
    "server/utils/emailHashingUtil",
    "shared/models/roles",
    "json!shared/definitions/status.json",
    "shared/exceptions/CommandException",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    User,
    roomService,
    userDao,
    emailHashingUtil,
    roles,
    statusDefinitions,
    CommandException,
    IllegalArgumentException
) {
    "use strict";

    var UserService = function () {
    };

    UserService.prototype.findByEmailHash = function (emailHash, callback) {
        userDao.findByEmailHash(emailHash, callback);
    };

    UserService.prototype.findByNick = function (nick, callback) {
        userDao.findByNick(nick, callback);
    };

    UserService.prototype.create = function (emailHash, nick, callback) {
        this.findByEmailHash(emailHash, function (err, userByEmailHash) {
            if (err) {
                return callback(err);
            }

            if (userByEmailHash) {
                return callback(new IllegalArgumentException(
                    "User with email address already exists."
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

                userDao.create(emailHash, nick, roles.USER, callback);
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

    UserService.prototype.updateStatus = function (session, status, callback) {
        if (!statusDefinitions[status]) {
            return callback(new CommandException("Invalid status: " + status));
        }

        var currentStatus = session.getStatus();
        if (currentStatus === status) {
            return callback(new CommandException("You already have that status set: " + status));
        }

        session.setStatus(status);
        roomService.sendStatusUpdate(session, status, callback);
    };

    return new UserService();
});

