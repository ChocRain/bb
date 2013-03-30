/**
 * DAO for handling user data.
 */
define([
    "underscore",
    "server/daos/BaseDao",
    "server/models/User",
    "shared/models/roles",
    "server/utils/parallel",
    "server/utils/emailHashingUtil"
], function (
    _,
    BaseDao,
    User,
    roles,
    parallel,
    emailHashingUtil
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

        var v1To2 = function (callback) {
            // hash all email addresses
            // no batching since at the current state there aren't many users
            this._findAll(
                {_version: 1},
                function (err, users) {
                    parallel.each(
                        users,
                        function (user, userCallback) {
                            emailHashingUtil.hashEmailAddress(user.getEmailHash(), function (err, hashedEmail) {
                                if (err) {
                                    return userCallback(err);
                                }

                                this._updateAll(
                                    {_id: user.getId()},
                                    {$set: {_version: 2, email: hashedEmail}},
                                    userCallback
                                );
                            }.bind(this));
                        }.bind(this),
                        callback
                    );
                }.bind(this)
            );
        }.bind(this);

        ensureIndices(
            _.partial(
                v1To2,
                _.partial(
                    initialVersion,
                    callback
                )
            )
        );
    };

    UserDao.prototype.create = function (emailHash, nick, role, callback) {
        this._insert({
            email: emailHash,
            nick: nick,
            canonicalNick: nick.toLowerCase(),
            role: role.toJSON()
        }, callback);
    };

    UserDao.prototype.findByNick = function (nick, callback) {
        this._findUnique({canonicalNick: nick.toLowerCase()}, callback);
    };

    UserDao.prototype.findByEmailHash = function (emailHash, callback) {
        this._findUnique({email: emailHash}, callback);
    };

    UserDao.prototype.updateBanned = function (nick, isBanned, callback) {
        this._findAndModify({canonicalNick: nick.toLowerCase()}, {$set: {isBanned: isBanned}}, callback);
    };

    return new UserDao();
});

