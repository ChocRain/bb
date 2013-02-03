/**
 * A session.
 */
define([
    "underscore",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    IllegalArgumentException
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

    return Session;
});

