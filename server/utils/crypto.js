/**
 * Util providing cryptographic functions.
 */
define([
    "crypto",
    "fs"
], function (
    crypto,
    fs
) {
    "use strict";

    /**
     * Asynchronous calculation of the MD5 sum of the specified file.
     */
    var md5FileSum = function (filename, callback) {
        var md5HashObject = crypto.createHash("md5");

        var stream = fs.ReadStream(filename);

        stream.on("data", function (data) {
            md5HashObject.update(data);
        });

        stream.on("error", callback);

        stream.on("end", function () {
            return callback(null, md5HashObject.digest("hex"));
        });
    };

    /**
     * Synchronous calculation of the specified hash for the given string.
     */
    var syncHash = function (name, string) {
        var sha1HashObject = crypto.createHash(name);
        sha1HashObject.update(string);
        return sha1HashObject.digest("hex");
    };

    /**
     * Synchronous calculation of the SHA1 hash of the given string.
     */
    var sha1Sum = function (string) {
        return syncHash("sha1", string);
    };

    /**
     * Synchronous calculation of the SHA512 hash of the given string.
     */
    var sha512Sum = function (string) {
        return syncHash("sha512", string);
    };

    return {
        md5FileSum: md5FileSum,
        sha1Sum: sha1Sum,
        sha512Sum: sha512Sum
    };
});

