/**
 * Database access.
 */
define([
    "underscore",
    "mongodb",
    "server/config",
    "shared/exceptions/IllegalStateException"
], function (
    _,
    mongodb,
    config,
    IllegalStateException
) {
    "use strict";

    var MongoClient = mongodb.MongoClient;
    var Server = mongodb.Server;

    var _db = null;

    var queuedCallbacks = [];

    var init = function (callback) {
        console.log("Connecting to db.");
        MongoClient.connect(config.db.url, {native_parser: true, auto_reconnect: true}, function (err, db) {
            if (err) {
                return callback(err);
            }

            console.log("Connected to db.");

            _db = db;

            _.each(queuedCallbacks, function (queuedCallback) {
                queuedCallback();
            });

            return callback();
        });
    };

    var withCollection = function (name, callback) {
        var collectionCallback = function () {
            var collection = _db.collection(name);

            return callback(collection);
        };

        if (_db) {
            collectionCallback();
        } else {
            queuedCallbacks.push(collectionCallback);
        }
    };

    return {
        init: init,
        withCollection: withCollection
    };
});

