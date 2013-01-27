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
        return filename + "?v=" + this.hashes[filename];
    };

    var hashesCache = null;

    var getAssets = function (callback) {
        if (config.isProduction && hashesCache) {
            return callback(null, {
                asset: asset,
                hashes: hashesCache
            });
        }

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
                        function (err, hashPairs) {
                            if (err) {
                                return callback(err);
                            }

                            var hashes = _.defaults.apply(_, [{}].concat(hashPairs));


                            if (config.isProduction) {
                                hashesCache = hashes;
                            }

                            callback(null, {
                                asset: asset,
                                hashes: hashes
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

