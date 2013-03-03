/**
 * Util for parallel execution.
 */
define([
    "underscore"
], function (
    _
) {
    "use strict";

    /**
     * Will executes the tasks in parallel and call callback afterwards
     * passing the results of the tasks as parameters. The parameters
     * for the callback will be in the same order as the tasks.
     */
    var parallel = function (tasks, callback, opt_context) {
        var tasksLeft = tasks.length;

        if (tasksLeft === 0) {
            return callback.call(opt_context || this, null);
        }

        var results = [];
        var errors = [];

        var toCallback = function (n) {
            return function (err, result) {
                tasksLeft -= 1;

                results[n] = result;

                if (err) {
                    errors[n] = err;
                }

                if (tasksLeft === 0) {
                    return callback.apply(
                        opt_context || this,
                        [errors.length === 0 ? null : errors].concat(results)
                    );
                }
            };
        };

        var n;
        for (n = 0; n < tasks.length; n += 1) {
            tasks[n](toCallback(n));
        }
    };

    /**
     * Calls callback with an array of transformed entries.
     *
     * transformer(entry, callback(err, transformedValue))
     * callback(err, transformedValues)
     *
     * The opt_context will be the context of transformer.
     */
    var map = function (list, transformer, callback, opt_context) {
        var tasks = _.map(list, function (value) {
            return function (taskCallback) {
                transformer.call(opt_context || this, value, taskCallback);
            };
        });

        var mapCallback = function (err) {
            if (err) {
                return callback(err);
            }

            var results = Array.prototype.slice.call(arguments, 1);

            return callback(null, results);
        };

        parallel(tasks, mapCallback);
    };

    /**
     * Like map, but the callback will be called with an array only containing
     * nonnull results of the transformer.
     */
    var mapFilter = function (list, transformer, callback, opt_context) {
        map(list, transformer, function (err, results) {
            if (err) {
                return callback(err);
            }

            var filteredResults = _.filter(results, function (result) {
                return !_.isNull(result);
            });

            callback(null, filteredResults);
        }, opt_context);
    };

    /**
     * Calls callback with an array containing the entries of list for
     * which predicate evaluates to true-ish.
     *
     * predicate(entry, callback(err, shallKeep))
     * callback(err, filteredValues)
     *
     * The opt_context will be the context of predicate.
     */
    var filter = function (list, predicate, callback, opt_context) {
        var filterCallback = function (err, predicateResults) {
            if (err) {
                return callback(err);
            }

            var results = [];

            _.each(list, function (value, i) {
                if (predicateResults[i]) {
                    results.push(value);
                }
            });

            return callback(null, results);
        };

        map(list, predicate, filterCallback, opt_context);
    };

    /**
     * Calls entryCallback for each entry of list. After all those have been
     * processed callback is called.
     *
     * entryCallback(entry, callback(err))
     * callback(err)
     *
     * The opt_context will be the context of transformer.
     */
    var each = function (list, entryCallback, callback, opt_context) {
        map(list, function (entry, next) {
            entryCallback.call(opt_context || this, entry, function (err) {
                // do not pass result
                next(err);
            });
        }, function (errs) {
            // do not pass results
            callback(errs);
        }, opt_context);
    };

    return {
        parallel: parallel,
        map: map,
        mapFilter: mapFilter,
        filter: filter,
        each: each
    };
});

