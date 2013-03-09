/**
 * A session.
 */
define([
    "underscore",
    "server/models/User",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/IllegalStateException"
], function (
    _,
    User,
    IllegalArgumentException,
    IllegalStateException
) {
    "use strict";

    var Session = function (id, store) {
        this._id = id;
        this._store = store;

        this._data = {};
    };

    Session.prototype.getId = function () {
        return this._id;
    };

    Session.prototype.set = function (key, value) {
        if (_.isString(key)) {
            this._data[key] = value;
        } else if (_.isObject(key) && !value) {
            _.each(key, function (v, k) {
                this._data[k] = v;
            }, this);
        } else {
            throw new IllegalArgumentException(
                "Invalid arguments for method 'set': key = " + key + ", value = " + value
            );
        }
    };

    Session.prototype.get = function (key, value) {
        return this._data[key];
    };

    Session.prototype.invalidate = function () {
        this._data = {};
        this._store.remove(this._id);
        this._id = undefined;
    };

    Session.prototype.isLoggedIn = function () {
        return !!this._data.loggedIn;
    };

    Session.prototype.getUser = function () {
        var user = this.get("user");

        if (!(user instanceof User)) {
            throw new IllegalStateException("No user set in current session.");
        }

        return user;
    };

    Session.prototype.getMessageSink = function () {
        var messageSink = this.get("messageSink");

        if (!_.isObject(messageSink)) {
            throw new IllegalStateException("No message sink set in current session.");
        }

        return messageSink;
    };

    Session.prototype.isIgnored = function (nick) {
        var ignoreList = this.get("ignoreList") || {};
        return !!ignoreList[nick];
    };

    Session.prototype.ignore = function (nick) {
        var ignoreList = this.get("ignoreList") || {};
        ignoreList[nick] = true;
        this.set("ignoreList", ignoreList);
    };

    Session.prototype.unignore = function (nick) {
        var ignoreList = this.get("ignoreList") || {};
        delete ignoreList[nick];
        this.set("ignoreList", ignoreList);
    };

    return Session;
});

