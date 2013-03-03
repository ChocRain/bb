/**
 * Base class for DAOs.
 */
define([
    "underscore",
    "server/utils/db",
    "shared/exceptions/IllegalStateException"
], function (
    _,
    db,
    IllegalStateException
) {
    "use strict";

    var BaseDao = function (collectionName, EntityClass, version) {
        this._collectionName = collectionName;
        this._EntityClass = EntityClass;
        this._version = version;
    };

    BaseDao.prototype._withCollection = function (callback) {
        db.withCollection(this._collectionName, callback);
    };

    BaseDao.prototype._ensureIndex = function (keys, opts, callback) {
        this._withCollection(function (collection) {
            collection.ensureIndex(keys, opts, callback);
        }.bind(this));
    };

    BaseDao.prototype._insert = function (json, callback) {
        this._withCollection(function (collection) {
            collection.insert(_.defaults({_version: this._version}, json), function (err, result) {
                if (err) {
                    return callback(err);
                }

                return callback(null, this._EntityClass.fromJSON(json));
            }.bind(this));
        }.bind(this));
    };

    BaseDao.prototype._updateAll = function (query, update, callback) {
        this._withCollection(function (collection) {
            collection.update(query, update, {multi: true}, function (err, result) {
                if (err) {
                    return callback(err);
                }

                return callback(null);
            }.bind(this));
        }.bind(this));
    };

    BaseDao.prototype._findUnique = function (query, callback) {
        this._withCollection(function (collection) {
            var cursor = collection.find(query);
            cursor.count(function (err, numDocs) {
                if (err) {
                    return callback(err);
                }

                if (numDocs > 1) {
                    throw new IllegalStateException("Entry is not unique.");
                }

                if (numDocs === 1) {
                    return cursor.nextObject(function (err, obj) {
                        if (err) {
                            return callback(err);
                        }

                        return callback(null, this._EntityClass.fromJSON(obj));
                    }.bind(this));
                }

                return callback(null, null);
            }.bind(this));
        }.bind(this));
    };

    BaseDao.prototype._findAndModify = function (query, update, callback) {
        this._withCollection(function (collection) {
            var opts = {
                new: true
            };
            collection.findAndModify(query, {}, update, opts, function (err, obj) {
                if (err) {
                    return callback(err);
                }

                return callback(null, obj ? this._EntityClass.fromJSON(obj) : null);
            }.bind(this));
        }.bind(this));
    };

    return BaseDao;
});

