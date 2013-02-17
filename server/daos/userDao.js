/**
 * DAO for handling user data.
 */
define([
    "server/daos/BaseDao",
    "server/models/User",
    "shared/models/roles"
], function (
    BaseDao,
    User,
    roles
) {
    "use strict";

    var UserDao = function () {
        // FIXME: Proper sequence of migration functions handling multiple collections.

        // email addresses must be unique
        this._ensureIndex({"email": 1}, {unique: true});

        // nicks must be unique
        this._ensureIndex({"canonicalNick": 1}, {unique: true});

        // add default roles
        this._updateAll({_version: {$exists: false}}, {$set: {role: roles.USER.toJSON()}}, function (err) {
            if (err) {
                throw err;
            }

            // increase version
            this._updateAll({_version: {$exists: false}}, {$set: {_version: 1}}, function (err) {
                if (err) {
                    throw err;
                }
            }.bind(this));
        }.bind(this));
    };

    UserDao.prototype = new BaseDao("user", User, 1);

    UserDao.prototype.create = function (email, nick, role, callback) {
        this._insert({
            email: email.toLowerCase(),
            nick: nick,
            canonicalNick: nick.toLowerCase(),
            role: role.toJSON()
        }, callback);
    };

    UserDao.prototype.findByNick = function (nick, callback) {
        this._findUnique({canonicalNick: nick.toLowerCase()}, callback);
    };

    UserDao.prototype.findByEmail = function (email, callback) {
        this._findUnique({email: email.toLowerCase()}, callback);
    };

    UserDao.prototype.updateBanned = function (nick, isBanned, callback) {
        this._findAndModify({canonicalNick: nick.toLowerCase()}, {$set: {isBanned: isBanned}}, callback);
    };


    return new UserDao();
});

