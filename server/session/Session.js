/**
 * A session.
 */
define([
    "underscore",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/IllegalStateException"
], function (
    _,
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
        this._store = undefined;
        this._id = undefined;
    };

    Session.prototype.isLoggedIn = function () {
        return !!this._data.loggedIn;
    };

    Session.prototype.getNick = function () {
        var nick = this.get("nick");

        if (!_.isString(nick)) {
            throw new IllegalStateException("No nick set in current session.");
        }

        return nick;
    };

    Session.prototype.getMessageSink = function () {
        var messageSink = this.get("messageSink");

        if (!_.isObject(messageSink)) {
            throw new IllegalStateException("No message sink set in current session.");
        }

        return messageSink;
    };

    return Session;
});

