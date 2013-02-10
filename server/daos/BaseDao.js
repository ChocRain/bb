/**
 * Base class for DAOs.
 */
define([
    "server/utils/db",
    "shared/exceptions/IllegalStateException"
], function (
    db,
    IllegalStateException
) {
    "use strict";

    var BaseDao = function (collectionName, EntityClass) {
        this._collectionName = collectionName;
        this._EntityClass = EntityClass;
    };

    BaseDao.prototype._withCollection = function (callback) {
        db.withCollection(this._collectionName, callback);
    };

    BaseDao.prototype._ensureIndex = function (keys, opts) {
        this._withCollection(function (collection) {
            collection.ensureIndex(keys, opts, function (err) {
                if (err) {
                    throw err;
                }

                console.log(
                    "ensureIndex done: collection = " + this._collectionName +
                        ", keys = " + JSON.stringify(keys) +
                        ", opts = " + JSON.stringify(opts)
                );
            }.bind(this));
        }.bind(this));
    };

    BaseDao.prototype._insert = function (json, callback) {
        this._withCollection(function (collection) {
            collection.insert(json, function (err, result) {
                if (err) {
                    return callback(err);
                }

                return callback(null, this._EntityClass.fromJson(json));
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

                        return callback(null, this._EntityClass.fromJson(obj));
                    }.bind(this));
                }

                return callback(null, null);
            }.bind(this));
        }.bind(this));
    };

    return BaseDao;
});

