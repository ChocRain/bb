/**
 * Service for handling user data.
 */
define([
    "server/models/User",
    "server/daos/userDao",
    "shared/models/roles",
    "shared/exceptions/IllegalArgumentException"
], function (
    User,
    userDao,
    roles,
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
                throw new IllegalArgumentException("User with email address already exists:", email);
            }

            this.findByNick(nick, function (err, userByNick) {
                if (err) {
                    return callback(err);
                }

                if (userByNick) {
                    throw new IllegalArgumentException("User with nick already exists:", nick);
                }

                userDao.create(email, nick, roles.USER, callback);
            }.bind(this));
        }.bind(this));
    };

    return new UserService();
});

