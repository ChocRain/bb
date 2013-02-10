/**
 * DAO for handling user data.
 */
define([
    "server/daos/BaseDao",
    "server/models/User"
], function (
    BaseDao,
    User
) {
    "use strict";

    var UserDao = function () {
        // email addresses must be unique
        this._ensureIndex({"email": 1}, {unique: true});

        // nicks must be unique
        this._ensureIndex({"canonicalNick": 1}, {unique: true});
    };

    UserDao.prototype = new BaseDao("user", User);

    UserDao.prototype.create = function (email, nick, callback) {
        this._insert({
            email: email.toLowerCase(),
            nick: nick,
            canonicalNick: nick.toLowerCase()
        }, callback);
    };

    UserDao.prototype.findByNick = function (nick, callback) {
        this._findUnique({canonicalNick: nick.toLowerCase()}, callback);
    };

    UserDao.prototype.findByEmail = function (email, callback) {
        this._findUnique({email: email.toLowerCase()}, callback);
    };

    return new UserDao();
});

