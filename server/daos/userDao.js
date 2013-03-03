/**
 * DAO for handling user data.
 */
define([
    "underscore",
    "server/daos/BaseDao",
    "server/models/User",
    "shared/models/roles"
], function (
    _,
    BaseDao,
    User,
    roles
) {
    "use strict";

    var UserDao = function () {
    };

    UserDao.prototype = new BaseDao("user", User, 1);

    UserDao.prototype.migrate = function (callback) {
        var ensureIndices = function (indicesCallback) {
            // email addresses must be unique
            this._ensureIndex({"email": 1}, {unique: true}, function (err) {
                if (err) {
                    return indicesCallback(err);
                }

                // nicks must be unique
                this._ensureIndex({"canonicalNick": 1}, {unique: true}, indicesCallback);
            }.bind(this));
        }.bind(this);

        var initialVersion = function (initialCallback) {
            // add default roles
            this._updateAll({_version: {$exists: false}}, {$set: {role: roles.USER.toJSON()}}, function (err) {
                if (err) {
                    return initialCallback(err);
                }

                // increase version
                this._updateAll({_version: {$exists: false}}, {$set: {_version: 1}}, function (err) {
                    if (err) {
                        return initialCallback(err);
                    }

                    initialCallback(null);
                }.bind(this));
            }.bind(this));
        }.bind(this);

        ensureIndices(
            _.partial(initialVersion, callback)
        );
    };

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

