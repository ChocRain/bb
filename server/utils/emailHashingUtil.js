/**
 * Util to hash email addresses to reduce the risk of exposing them in case
 * of a security breach.
 */
define([
    "underscore",
    "server/utils/crypto",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    crypto,
    IllegalArgumentException
) {
    "use strict";

    var hashPart = function (part, salt, callback) {
        var hash = crypto.sha512Sum(part + salt);
        var i;

        for (i = 0; i < 5000; i += 1) {
            hash = crypto.sha512Sum(hash + i);
        }

        _.defer(callback, null, hash);
    };

    var hashEmailAddress = function (emailAddress, callback) {
        if (!_.isString(emailAddress)) {
            throw new IllegalArgumentException("Email address must be a string: " + emailAddress);
        }

        var parts = emailAddress.split("@");

        if (parts.length !== 2) {
            throw new IllegalArgumentException("Given string is not an email address.");
        }

        var user = parts[0].toLowerCase();
        var host = parts[0].toLowerCase();

        hashPart(user, "", function (err, hashedUser) {
            if (err) {
                return callback(err);
            }

            hashPart(host, hashedUser, function (err, hashedHost) {
                if (err) {
                    return callback(err);
                }

                hashPart(hashedUser, hashedHost, function (err, rehashedUser) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, rehashedUser + hashedHost);
                });
            });
        });
    };

    return {
        hashEmailAddress: hashEmailAddress
    };
});

