/**
 * Util for handling assets.
 */
define([
    "underscore",
    "fs",
    "glob",

    "server/config",

    "server/utils/crypto",
    "server/utils/parallel"
], function (
    _,
    fs,
    glob,

    config,

    crypto,
    parallel
) {
    "use strict";

    var asset = function (filename) {
        return filename + "?v=" + this[filename];
    };

    var getAssets = function (callback) {
        // TODO: Cache for production
        // TODO: Include /shared and /client for development
        glob(config.paths.htdocs + "/**/*", function (err, paths) {
            if (err) {
                return callback(err);
            }

            parallel.filter(
                paths,
                function (path, predicateCallback) {
                    fs.stat(path, function (err, stats) {
                        if (err) {
                            return predicateCallback(err);
                        }

                        predicateCallback(null, stats.isFile());
                    });
                },
                function (err, filenames) {
                    if (err) {
                        return callback(err);
                    }

                    parallel.map(
                        filenames,
                        function (filename, transformerCallback) {
                            crypto.md5FileSum(filename, function (err, sum) {
                                if (err) {
                                    return transformerCallback(err);
                                }

                                var result = {};
                                result[filename.substr(config.paths.htdocs.length)] = sum;

                                transformerCallback(null, result);
                            });
                        },
                        function (err, hashes) {
                            if (err) {
                                return callback(err);
                            }

                            callback(null, {
                                asset: asset,
                                hashes: _.defaults.apply(_, [{}].concat(hashes))
                            });
                        }
                    );
                }
            );
        });
    };

    return {
        getAssets: getAssets
    };
});

